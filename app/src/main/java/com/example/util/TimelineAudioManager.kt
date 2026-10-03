package com.example.util

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import com.example.ClipType
import com.example.MediaClip
import com.example.MediaTrack
import com.example.TrackType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.sin

private const val TAG = "TimelineAudioManager"

/**
 * High-performance synchronized audio playback engine for VFX Pro timeline.
 * Coordinates multi-track audio playback during video preview:
 * - Plays extracted audio from video files (content:// or file://)
 * - Plays imported user songs / MP3 / WAV from storage
 * - Synthesizes melodic audio for preset royalty-free songs and meme sound effects
 * - Synchronizes with timeline position (playhead seek, pause, resume)
 * - Handles individual clip volume, muting, and pitch adjustments
 */
@Composable
fun TimelineAudioController(
  tracks: List<MediaTrack>,
  isPlaying: Boolean,
  currentPositionMs: Long
) {
  val context = LocalContext.current
  val coroutineScope = rememberCoroutineScope()

  // Collect all active audio tracks (not hidden/muted)
  val audioClips = remember(tracks) {
    tracks.filter { it.type == TrackType.AUDIO && !it.isMutedOrHidden }
      .flatMap { it.clips }
  }

  // Find the active audio clip at the current playhead position
  val activeAudioClip = remember(audioClips, currentPositionMs) {
    audioClips.firstOrNull { clip ->
      currentPositionMs in clip.startTimeMs until (clip.startTimeMs + clip.durationMs)
    }
  }

  // Real MediaPlayer instance for device audio & video-extracted audio
  var mediaPlayer by remember { mutableStateOf<MediaPlayer?>(null) }
  var loadedUri by remember { mutableStateOf<String?>(null) }
  var isPlayerPrepared by remember { mutableStateOf(false) }

  // Procedural Synth for royalty-free presets or SFX without real URI
  var synthJob by remember { mutableStateOf<Job?>(null) }
  var audioTrackInstance by remember { mutableStateOf<AudioTrack?>(null) }

  // Handle real URI playback with MediaPlayer
  LaunchedEffect(activeAudioClip?.id, activeAudioClip?.uri) {
    val clip = activeAudioClip
    val uri = clip?.uri

    val isRealUri = !uri.isNullOrEmpty() && (
      uri.startsWith("content://") ||
      uri.startsWith("file://") ||
      uri.startsWith("http://") ||
      uri.startsWith("https://") ||
      uri.startsWith("/storage") ||
      uri.startsWith("/data")
    )

    if (clip != null && isRealUri) {
      // If URI changed, recreate or reset MediaPlayer
      if (loadedUri != uri || mediaPlayer == null) {
        try {
          mediaPlayer?.stop()
          mediaPlayer?.release()
        } catch (_: Exception) {}
        mediaPlayer = null
        isPlayerPrepared = false
        loadedUri = uri

        try {
          // Resolve video/content URIs to dedicated standalone audio file to avoid VideoView file descriptor lock
          val playableUriString = kotlinx.coroutines.withContext(Dispatchers.IO) {
            try {
              if (clip.title.contains("Audio_") || uri.contains("video", ignoreCase = true) || uri.endsWith(".mp4", ignoreCase = true) || uri.endsWith(".mov", ignoreCase = true) || uri.startsWith("content://")) {
                TimelineAudioExtractor.materializeAudioFile(context, uri) ?: uri
              } else {
                uri
              }
            } catch (_: Exception) {
              uri
            }
          }

          val player = MediaPlayer().apply {
            setAudioAttributes(
              AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .build()
            )
            setDataSource(context, Uri.parse(playableUriString))
            val effectiveVol = if (clip.isMuted) 0f else clip.volume.coerceIn(0f, 2f)
            setVolume(effectiveVol, effectiveVol)
            setOnPreparedListener { mp ->
              isPlayerPrepared = true
              val offset = (currentPositionMs - clip.startTimeMs).coerceAtLeast(0L).toInt()
              if (offset in 0 until mp.duration) {
                mp.seekTo(offset)
              }
              if (isPlaying) {
                try { mp.start() } catch (_: Exception) {}
              }
            }
            setOnErrorListener { _, what, extra ->
              Log.w(TAG, "Audio MediaPlayer error what=$what extra=$extra")
              true
            }
            prepareAsync()
          }
          mediaPlayer = player
        } catch (e: Exception) {
          Log.e(TAG, "Failed to initialize MediaPlayer for uri=$uri: ${e.message}")
        }
      }
    } else {
      // No active real-uri clip: stop and release MediaPlayer
      if (mediaPlayer != null) {
        try {
          mediaPlayer?.stop()
          mediaPlayer?.release()
        } catch (_: Exception) {}
        mediaPlayer = null
        loadedUri = null
        isPlayerPrepared = false
      }
    }
  }

  // Handle Play/Pause state and volume updates for MediaPlayer
  LaunchedEffect(isPlaying, isPlayerPrepared, activeAudioClip?.volume, activeAudioClip?.isMuted) {
    val player = mediaPlayer ?: return@LaunchedEffect
    val clip = activeAudioClip ?: return@LaunchedEffect
    if (!isPlayerPrepared) return@LaunchedEffect

    val effectiveVol = if (clip.isMuted) 0f else clip.volume.coerceIn(0f, 2f)
    try {
      player.setVolume(effectiveVol, effectiveVol)
      if (isPlaying) {
        if (!player.isPlaying) {
          val offset = (currentPositionMs - clip.startTimeMs).coerceAtLeast(0L).toInt()
          if (offset in 0 until player.duration) {
            player.seekTo(offset)
          }
          player.start()
        }
      } else {
        if (player.isPlaying) {
          player.pause()
        }
      }
    } catch (e: Exception) {
      Log.w(TAG, "Error toggling MediaPlayer state: ${e.message}")
    }
  }

  // Synchronize playhead seeking for MediaPlayer when scrubbed
  LaunchedEffect(currentPositionMs, isPlaying) {
    val player = mediaPlayer ?: return@LaunchedEffect
    val clip = activeAudioClip ?: return@LaunchedEffect
    if (!isPlayerPrepared) return@LaunchedEffect

    try {
      val expectedOffset = (currentPositionMs - clip.startTimeMs).coerceAtLeast(0L).toInt()
      if (!isPlaying) {
        // User is scrubbing while paused: seek smoothly
        if (expectedOffset in 0 until player.duration) {
          player.seekTo(expectedOffset)
        }
      } else {
        // While playing, only correct if playhead jumped significantly (> 3000ms)
        val currentPos = player.currentPosition
        if (kotlin.math.abs(currentPos - expectedOffset) > 3000) {
          if (expectedOffset in 0 until player.duration) {
            player.seekTo(expectedOffset)
          }
        }
      }
    } catch (_: Exception) {}
  }

  // Procedural Synthesizer only for preset royalty-free tracks & SFX without real URI
  val isSyntheticClip = activeAudioClip != null && (
    activeAudioClip.uri.isNullOrEmpty() ||
    activeAudioClip.uri.startsWith("asset://") ||
    activeAudioClip.uri.startsWith("sfx://")
  )

  LaunchedEffect(isSyntheticClip, isPlaying, activeAudioClip?.id, activeAudioClip?.volume, activeAudioClip?.isMuted) {
    synthJob?.cancel()
    synthJob = null

    if (!isSyntheticClip || !isPlaying || activeAudioClip == null || activeAudioClip.isMuted || activeAudioClip.volume <= 0f) {
      try {
        audioTrackInstance?.pause()
        audioTrackInstance?.flush()
      } catch (_: Exception) {}
      return@LaunchedEffect
    }

    val clip = activeAudioClip
    val vol = clip.volume.coerceIn(0.1f, 1.0f)
    val title = clip.title.lowercase()

    // Determine musical genre / tempo from title
    val bpm = when {
      title.contains("chill") || title.contains("lo-fi") -> 75
      title.contains("synthwave") || title.contains("neon") -> 120
      title.contains("upbeat") || title.contains("pop") -> 128
      title.contains("phonk") || title.contains("drift") -> 140
      title.contains("acoustic") || title.contains("morning") -> 95
      else -> 110
    }

    val sampleRate = 22050
    val minBufSize = AudioTrack.getMinBufferSize(
      sampleRate,
      AudioFormat.CHANNEL_OUT_MONO,
      AudioFormat.ENCODING_PCM_16BIT
    ).coerceAtLeast(4096)

    try {
      if (audioTrackInstance == null) {
        audioTrackInstance = AudioTrack.Builder()
          .setAudioAttributes(
            AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_MEDIA)
              .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
              .build()
          )
          .setAudioFormat(
            AudioFormat.Builder()
              .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
              .setSampleRate(sampleRate)
              .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
              .build()
          )
          .setBufferSizeInBytes(minBufSize * 4)
          .setTransferMode(AudioTrack.MODE_STREAM)
          .build()
      }

      val at = audioTrackInstance!!
      at.setVolume(vol)
      at.play()

      synthJob = coroutineScope.launch(Dispatchers.Default) {
        val rootFreqs = doubleArrayOf(261.63, 329.63, 392.00, 440.00, 523.25) // C chord notes
        var sampleIndex = 0L
        val buffer = ShortArray(4096)
        val samplesPerBeat = (sampleRate * 60.0 / bpm).toInt()

        while (isActive && isPlaying) {
          for (i in buffer.indices) {
            val totalSample = sampleIndex + i
            val beatPhase = (totalSample % samplesPerBeat).toDouble() / samplesPerBeat
            val chordStep = ((totalSample / (samplesPerBeat * 2)) % rootFreqs.size).toInt()
            val freq = rootFreqs[chordStep]

            // Melodic sine tone with gentle rhythmic decay envelope
            val env = (1.0 - beatPhase).coerceIn(0.05, 1.0)
            val wave = sin(2.0 * Math.PI * freq * (totalSample.toDouble() / sampleRate))
            val beatThump = if (beatPhase < 0.15) sin(2.0 * Math.PI * 65.0 * (totalSample.toDouble() / sampleRate)) * 0.4 else 0.0

            val sample = ((wave * 0.35 * env + beatThump) * 32767.0 * vol).toInt().coerceIn(-32767, 32767)
            buffer[i] = sample.toShort()
          }
          at.write(buffer, 0, buffer.size)
          sampleIndex += buffer.size
        }
      }
    } catch (e: Exception) {
      Log.w(TAG, "Procedural audio track init error: ${e.message}")
    }
  }

  // Cleanup on disposal
  DisposableEffect(Unit) {
    onDispose {
      synthJob?.cancel()
      try {
        audioTrackInstance?.stop()
        audioTrackInstance?.release()
      } catch (_: Exception) {}
      audioTrackInstance = null

      try {
        mediaPlayer?.stop()
        mediaPlayer?.release()
      } catch (_: Exception) {}
      mediaPlayer = null
      loadedUri = null
      isPlayerPrepared = false
    }
  }
}
