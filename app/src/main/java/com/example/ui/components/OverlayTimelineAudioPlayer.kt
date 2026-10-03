package com.example.ui.components

import android.os.Handler
import android.util.Log
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.Renderer
import androidx.media3.exoplayer.mediacodec.MediaCodecSelector
import androidx.media3.exoplayer.mediacodec.MediaCodecUtil
import androidx.media3.exoplayer.video.VideoRendererEventListener
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.example.MediaClip
import com.example.util.TimelineAudioExtractor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.util.ArrayList

private fun mixAttributes(): AudioAttributes {
  return AudioAttributes.Builder()
    .setUsage(C.USAGE_MEDIA)
    .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
    .build()
}

/**
 * Video preview whose volume is a real player property.
 * VideoView hides its MediaPlayer, so mute never reached the speaker.
 */
@OptIn(UnstableApi::class)
@Composable
fun TimelineVideoSurface(
  uri: String,
  isPlaying: Boolean,
  timelinePositionMs: Long,
  clipStartMs: Long,
  clipDurationMs: Long,
  isReversed: Boolean,
  volume: Float,
  speed: Float,
  modifier: Modifier = Modifier,
  onError: () -> Unit = {}
) {
  val appContext = LocalContext.current.applicationContext
  val player = remember(uri) {
    ExoPlayer.Builder(appContext).build().apply {
      setAudioAttributes(mixAttributes(), /* handleAudioFocus = */ false)
      setMediaItem(MediaItem.fromUri(uri))
      repeatMode = Player.REPEAT_MODE_OFF
      playWhenReady = false
      this.volume = volume.coerceIn(0f, 1f)
      prepare()
    }
  }
  DisposableEffect(player) {
    val listener = object : Player.Listener {
      override fun onPlayerError(error: PlaybackException) {
        Log.e("TimelineVideo", "playback failed: ${error.errorCodeName} ${error.message}")
      }
    }
    player.addListener(listener)
    onDispose {
      player.removeListener(listener)
      player.release()
    }
  }

  val playingState = rememberUpdatedState(isPlaying)
  val volumeState = rememberUpdatedState(volume.coerceIn(0f, 1f))
  val speedState = rememberUpdatedState(speed.coerceIn(0.25f, 3f))
  val posState = rememberUpdatedState(timelinePositionMs)
  val startState = rememberUpdatedState(clipStartMs)
  val durState = rememberUpdatedState(clipDurationMs)
  val revState = rememberUpdatedState(isReversed)

  LaunchedEffect(player) {
    while (true) {
      val raw = (posState.value - startState.value).coerceAtLeast(0L)
      val duration = durState.value.coerceAtLeast(0L)
      val expected = if (revState.value) (duration - raw).coerceIn(0L, duration) else raw
      player.volume = volumeState.value
      val speed = speedState.value
      if (player.playbackParameters.speed != speed) {
        player.setPlaybackSpeed(speed)
      }
      val drift = kotlin.math.abs(player.currentPosition - expected)
      val playing = playingState.value
      val inside = expected < duration - 120L
      val ended = player.playbackState == Player.STATE_ENDED || player.playbackState == Player.STATE_IDLE
      if (!playing && drift > 80L) {
        player.seekTo(expected.coerceAtMost(duration))
      } else if (playing && inside && (ended || drift > 700L)) {
        player.seekTo(expected)
      }
      player.playWhenReady = playing && inside
      delay(120)
    }
  }

  AndroidView(
    factory = { ctx ->
      val view = android.view.LayoutInflater.from(ctx)
        .inflate(com.example.R.layout.vfx_preview_player, null, false) as PlayerView
      view.resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
      view.player = player
      view
    },
    update = { view ->
      if (view.player !== player) view.player = player
      player.volume = volumeState.value
    },
    modifier = modifier
  )
}

/**
 * Plays timeline audio clips (songs and audio extracted from video) on their own player.
 * Does not take audio focus, so it can be heard while the muted video keeps showing frames.
 */
@Composable
fun OverlayTimelineAudioPlayer(
  audioClips: List<MediaClip>,
  audioTracksMuted: Boolean,
  isPlaying: Boolean,
  currentPositionMs: Long,
  occupiedVideoUri: String? = null
) {
  val context = LocalContext.current
  val signature = audioClips.joinToString("|") { "${it.id}:${it.uri}:${it.startTimeMs}:${it.durationMs}" }
  val players = remember { mutableMapOf<String, ExoPlayer>() }

  DisposableEffect(Unit) {
    onDispose {
      players.values.forEach { player ->
        try { player.release() } catch (_: Exception) {}
      }
      players.clear()
    }
  }

  val positionState = rememberUpdatedState(currentPositionMs)
  val playingState = rememberUpdatedState(isPlaying)
  val clipsState = rememberUpdatedState(audioClips)
  val mutedState = rememberUpdatedState(audioTracksMuted)
  val occupiedState = rememberUpdatedState(occupiedVideoUri)

  LaunchedEffect(signature) {
    players.values.forEach { player ->
      try { player.release() } catch (_: Exception) {}
    }
    players.clear()

    val resolved = withContext(Dispatchers.IO) {
      clipsState.value.mapNotNull { clip ->
        val raw = clip.uri ?: return@mapNotNull null
        if (raw.isBlank() || raw.startsWith("asset://") || raw.startsWith("sfx://")) return@mapNotNull null
        if (raw == occupiedState.value) return@mapNotNull null
        val lower = raw.lowercase()
        if (listOf(".mp4", ".mov", ".mkv", ".webm", ".3gp").any { lower.contains(it) }) return@mapNotNull null
        val playable = TimelineAudioExtractor.materializeAudioFile(context, raw)
        if (playable == null) {
          Log.e("OverlayAudio", "No audio in ${clip.title}")
          null
        } else {
          Log.i("OverlayAudio", "Ready ${clip.title} -> $playable")
          clip.id to playable
        }
      }
    }

    val factory = AudioOnlyRenderersFactory(context)
    resolved.forEach { (id, uri) ->
      val player = ExoPlayer.Builder(context)
        .setRenderersFactory(factory)
        .build()
        .apply {
          setAudioAttributes(mixAttributes(), /* handleAudioFocus = */ false)
          trackSelectionParameters = trackSelectionParameters
            .buildUpon()
            .setTrackTypeDisabled(C.TRACK_TYPE_VIDEO, true)
            .build()
          setMediaItem(MediaItem.fromUri(uri))
          repeatMode = Player.REPEAT_MODE_OFF
          playWhenReady = false
          volume = 1f
          prepare()
        }
      player.addListener(object : Player.Listener {
        override fun onPlayerError(error: PlaybackException) {
          Log.e("OverlayAudio", "clip $id ${error.errorCodeName} ${error.message}")
        }
      })
      players[id] = player
    }

    while (true) {
      val pos = positionState.value
      val playing = playingState.value
      val muted = mutedState.value
      clipsState.value.forEach { clip ->
        val player = players[clip.id] ?: return@forEach
        val vol = if (muted || clip.isMuted || clip.volume <= 0f) 0f else clip.volume.coerceIn(0f, 1f)
        val inRange = pos >= clip.startTimeMs && pos < clip.startTimeMs + clip.durationMs
        val offset = (pos - clip.startTimeMs).coerceAtLeast(0L)
        try {
          player.volume = vol
          if (playing && inRange && vol > 0f) {
            if (kotlin.math.abs(player.currentPosition - offset) > 1500L) player.seekTo(offset)
            if (!player.playWhenReady) player.playWhenReady = true
          } else {
            if (player.playWhenReady) player.playWhenReady = false
          }
        } catch (e: Exception) {
          Log.w("OverlayAudio", "sync failed for ${clip.title}: ${e.message}")
        }
      }
      delay(80)
    }
  }
}

/**
 * Extracted audio must not take the hardware video or audio codec.
 * Those belong to the preview. A second hardware decoder is why the picture
 * plays for about two seconds and then freezes.
 */
@OptIn(UnstableApi::class)
private class AudioOnlyRenderersFactory(context: android.content.Context) : DefaultRenderersFactory(context) {
  init {
    setEnableDecoderFallback(true)
    setMediaCodecSelector(SOFTWARE_FIRST)
  }

  override fun buildVideoRenderers(
    context: android.content.Context,
    extensionRendererMode: Int,
    mediaCodecSelector: MediaCodecSelector,
    enableDecoderFallback: Boolean,
    eventHandler: Handler,
    eventListener: VideoRendererEventListener,
    allowedVideoJoiningTimeMs: Long,
    out: ArrayList<Renderer>
  ) = Unit

  companion object {
    private val SOFTWARE_FIRST = MediaCodecSelector { mime, secure, tunnel ->
      val all = MediaCodecUtil.getDecoderInfos(mime, secure, tunnel)
      val software = all.filter { !it.hardwareAccelerated }
      if (software.isNotEmpty()) software else all
    }
  }
}
