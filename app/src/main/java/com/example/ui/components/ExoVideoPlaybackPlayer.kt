package com.example.ui.components

import android.net.Uri
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.FullscreenExit
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material.icons.filled.VolumeMute
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.example.ClipType
import com.example.MediaTrack
import com.example.ui.theme.OrangePrimary
import kotlinx.coroutines.delay
import java.util.Locale

/**
 * High-performance AndroidX ExoPlayer Video Playback Component.
 * Enables live video previewing before export with real-time audio sync,
 * scrub timeline controls, speed adjustment, and volume toggle.
 */
@OptIn(UnstableApi::class)
@Composable
fun ExoVideoPlaybackPlayer(
  videoUri: Uri?,
  modifier: Modifier = Modifier,
  autoPlay: Boolean = true,
  repeatMode: Int = Player.REPEAT_MODE_ALL,
  showControls: Boolean = true,
  onPlaybackStateChanged: (isPlaying: Boolean) -> Unit = {}
) {
  val context = LocalContext.current

  // State management
  var isPlaying by remember { mutableStateOf(autoPlay) }
  var isMuted by remember { mutableStateOf(false) }
  var currentPositionMs by remember { mutableLongStateOf(0L) }
  var totalDurationMs by remember { mutableLongStateOf(0L) }
  var isBuffering by remember { mutableStateOf(false) }
  var controlsVisible by remember { mutableStateOf(true) }

  // ExoPlayer instance lifecycle
  val exoPlayer = remember(context) {
    ExoPlayer.Builder(context).build().apply {
      this.repeatMode = repeatMode
      this.playWhenReady = autoPlay
    }
  }

  // Load URI when changed
  LaunchedEffect(videoUri) {
    if (videoUri != null) {
      val mediaItem = MediaItem.fromUri(videoUri)
      exoPlayer.setMediaItem(mediaItem)
      exoPlayer.prepare()
      if (autoPlay) {
        exoPlayer.play()
      }
    }
  }

  // Periodic position poller
  LaunchedEffect(exoPlayer, isPlaying) {
    while (true) {
      if (exoPlayer.isPlaying) {
        currentPositionMs = exoPlayer.currentPosition.coerceAtLeast(0L)
        val dur = exoPlayer.duration
        if (dur > 0L) {
          totalDurationMs = dur
        }
      }
      delay(200)
    }
  }

  // Player listener
  DisposableEffect(exoPlayer) {
    val listener = object : Player.Listener {
      override fun onIsPlayingChanged(playing: Boolean) {
        isPlaying = playing
        onPlaybackStateChanged(playing)
      }

      override fun onPlaybackStateChanged(playbackState: Int) {
        isBuffering = (playbackState == Player.STATE_BUFFERING)
        if (playbackState == Player.STATE_READY) {
          val dur = exoPlayer.duration
          if (dur > 0L) totalDurationMs = dur
        }
      }
    }
    exoPlayer.addListener(listener)

    onDispose {
      exoPlayer.removeListener(listener)
      exoPlayer.stop()
      exoPlayer.release()
    }
  }

  // Auto-hide controls after 3 seconds of inactivity
  LaunchedEffect(controlsVisible, isPlaying) {
    if (controlsVisible && isPlaying) {
      delay(3000)
      controlsVisible = false
    }
  }

  Box(
    modifier = modifier
      .background(Color.Black)
      .clip(RoundedCornerShape(12.dp))
      .clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = null
      ) {
        controlsVisible = !controlsVisible
      }
      .testTag("exo_player_container")
  ) {
    // AndroidView hosting the ExoPlayer PlayerView
    AndroidView(
      factory = { ctx ->
        PlayerView(ctx).apply {
          layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )
          useController = false // Custom Compose overlay controls for native styling
          resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
          player = exoPlayer
        }
      },
      update = { playerView ->
        playerView.player = exoPlayer
      },
      modifier = Modifier
        .fillMaxSize()
        .testTag("exo_player_view")
    )

    // Buffering indicator
    if (isBuffering) {
      Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
      ) {
        CircularProgressIndicator(
          color = OrangePrimary,
          modifier = Modifier.size(44.dp)
        )
      }
    }

    // Playback Controls Overlay
    AnimatedVisibility(
      visible = controlsVisible || !isPlaying,
      enter = fadeIn(),
      exit = fadeOut(),
      modifier = Modifier.fillMaxSize()
    ) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(
            Brush.verticalGradient(
              colors = listOf(
                Color.Black.copy(alpha = 0.5f),
                Color.Transparent,
                Color.Black.copy(alpha = 0.75f)
              )
            )
          )
      ) {
        // Center Quick Action (Play / Pause)
        Box(
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          IconButton(
            onClick = {
              if (exoPlayer.isPlaying) {
                exoPlayer.pause()
              } else {
                exoPlayer.play()
              }
            },
            modifier = Modifier
              .size(56.dp)
              .background(Color.Black.copy(alpha = 0.6f), CircleShape)
              .testTag("exo_btn_play_pause")
          ) {
            Icon(
              imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
              contentDescription = if (isPlaying) "Pause" else "Play",
              tint = Color.White,
              modifier = Modifier.size(32.dp)
            )
          }
        }

        // Top Bar: Mute Toggle + Badge
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .align(Alignment.TopCenter)
            .padding(horizontal = 12.dp, vertical = 8.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color.Black.copy(alpha = 0.6f)
          ) {
            Text(
              text = "ExoPlayer Engine",
              color = OrangePrimary,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }

          IconButton(
            onClick = {
              isMuted = !isMuted
              exoPlayer.volume = if (isMuted) 0f else 1f
            },
            modifier = Modifier
              .size(34.dp)
              .background(Color.Black.copy(alpha = 0.6f), CircleShape)
              .testTag("exo_btn_mute")
          ) {
            Icon(
              imageVector = if (isMuted) Icons.Default.VolumeMute else Icons.Default.VolumeUp,
              contentDescription = if (isMuted) "Unmute" else "Mute",
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
          }
        }

        // Bottom Bar: Scrubber + Time Code
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .align(Alignment.BottomCenter)
            .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
          // Time code labels
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text(
              text = formatTime(currentPositionMs),
              color = Color.White,
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium
            )
            Text(
              text = formatTime(totalDurationMs),
              color = Color.White.copy(alpha = 0.8f),
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium
            )
          }

          // Scrub slider
          val sliderPosition = if (totalDurationMs > 0) {
            (currentPositionMs.toFloat() / totalDurationMs).coerceIn(0f, 1f)
          } else 0f

          Slider(
            value = sliderPosition,
            onValueChange = { frac ->
              val targetMs = (frac * totalDurationMs).toLong()
              exoPlayer.seekTo(targetMs)
              currentPositionMs = targetMs
            },
            colors = SliderDefaults.colors(
              thumbColor = OrangePrimary,
              activeTrackColor = OrangePrimary,
              inactiveTrackColor = Color.White.copy(alpha = 0.3f)
            ),
            modifier = Modifier
              .fillMaxWidth()
              .height(24.dp)
              .testTag("exo_seek_bar")
          )
        }
      }
    }
  }
}

/**
 * Preview Card designed to fit directly in the Export Sheet.
 * Lets users review their video composition with ExoPlayer before triggering export,
 * with optional frame-accurate timeline scrubbing.
 */
@Composable
fun ExoVideoProjectPreviewCard(
  tracks: List<MediaTrack>,
  modifier: Modifier = Modifier,
  onOpenFullscreen: () -> Unit = {}
) {
  val firstVideoUri = remember(tracks) {
    tracks.flatMap { it.clips }
      .firstOrNull { it.type == ClipType.VIDEO && !it.uri.isNullOrEmpty() }
      ?.uri?.let { Uri.parse(it) }
  }

  var showTimelineScrubber by remember { mutableStateOf(false) }

  Card(
    modifier = modifier.testTag("card_exo_preview"),
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1B18)),
    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
  ) {
    Column(modifier = Modifier.padding(10.dp)) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 4.dp, vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.PlayArrow,
            contentDescription = null,
            tint = OrangePrimary,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Video Preview (ExoPlayer)",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
          // Toggle Frame Scrubber
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = if (showTimelineScrubber) OrangePrimary.copy(alpha = 0.25f) else Color(0xFF2A231C),
            border = BorderStroke(1.dp, if (showTimelineScrubber) OrangePrimary else Color(0xFF3D332A)),
            modifier = Modifier
              .clickable { showTimelineScrubber = !showTimelineScrubber }
              .testTag("btn_toggle_frame_timeline")
          ) {
            Text(
              text = if (showTimelineScrubber) "Simple" else "Frames",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = if (showTimelineScrubber) OrangePrimary else Color.White,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }

          Spacer(modifier = Modifier.width(8.dp))

          IconButton(
            onClick = onOpenFullscreen,
            modifier = Modifier.size(28.dp).testTag("btn_exo_fullscreen")
          ) {
            Icon(
              imageVector = Icons.Default.Fullscreen,
              contentDescription = "Expand Fullscreen Preview",
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(6.dp))

      if (showTimelineScrubber) {
        ExoPreviewWithFrameTimeline(
          videoUri = firstVideoUri,
          modifier = Modifier.fillMaxWidth(),
          autoPlay = false
        )
      } else {
        ExoPlayerWithPlaybackControls(
          videoUri = firstVideoUri,
          modifier = Modifier.fillMaxWidth(),
          autoPlay = false,
          compact = true
        )
      }
    }
  }
}

/**
 * Complete video playback solution combining AndroidX Media3 ExoPlayer with
 * the rich, responsive [PlaybackControls] composable.
 */
@OptIn(UnstableApi::class)
@Composable
fun ExoPlayerWithPlaybackControls(
  videoUri: Uri?,
  modifier: Modifier = Modifier,
  autoPlay: Boolean = false,
  showFrameSteps: Boolean = true,
  showSpeedControl: Boolean = true,
  showVolumeSlider: Boolean = true,
  compact: Boolean = false,
  onPlaybackStateChanged: (isPlaying: Boolean) -> Unit = {}
) {
  val context = LocalContext.current
  var isBuffering by remember { mutableStateOf(false) }

  val exoPlayer = remember(context) {
    ExoPlayer.Builder(context).build().apply {
      repeatMode = Player.REPEAT_MODE_ALL
      playWhenReady = autoPlay
    }
  }

  LaunchedEffect(videoUri) {
    if (videoUri != null) {
      val mediaItem = MediaItem.fromUri(videoUri)
      exoPlayer.setMediaItem(mediaItem)
      exoPlayer.prepare()
      if (autoPlay) {
        exoPlayer.play()
      }
    }
  }

  DisposableEffect(exoPlayer) {
    val listener = object : Player.Listener {
      override fun onIsPlayingChanged(playing: Boolean) {
        onPlaybackStateChanged(playing)
      }

      override fun onPlaybackStateChanged(playbackState: Int) {
        isBuffering = (playbackState == Player.STATE_BUFFERING)
      }
    }
    exoPlayer.addListener(listener)
    onDispose {
      exoPlayer.removeListener(listener)
      exoPlayer.stop()
      exoPlayer.release()
    }
  }

  Column(
    modifier = modifier.testTag("exo_player_with_playback_controls")
  ) {
    // 16:9 Video Player Viewport
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .aspectRatio(16f / 9f)
        .clip(RoundedCornerShape(12.dp))
        .background(Color.Black)
    ) {
      AndroidView(
        factory = { ctx ->
          PlayerView(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT
            )
            useController = false
            resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
            player = exoPlayer
          }
        },
        update = { playerView ->
          playerView.player = exoPlayer
        },
        modifier = Modifier.fillMaxSize()
      )

      if (isBuffering) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          CircularProgressIndicator(color = OrangePrimary, modifier = Modifier.size(40.dp))
        }
      }
    }

    Spacer(modifier = Modifier.height(8.dp))

    // Media3 ExoPlayer Integrated PlaybackControls
    PlaybackControls(
      player = exoPlayer,
      modifier = Modifier.fillMaxWidth(),
      showFrameSteps = showFrameSteps,
      showSpeedControl = showSpeedControl,
      showVolumeSlider = showVolumeSlider,
      compact = compact
    )
  }
}

/**
 * Combined ExoPlayer Viewport with Frame-Accurate Timeline Strip.
 * Enables live video previewing with frame sliding, thumbnails, and stepping controls.
 */
@OptIn(UnstableApi::class)
@Composable
fun ExoPreviewWithFrameTimeline(
  videoUri: Uri?,
  modifier: Modifier = Modifier,
  autoPlay: Boolean = false,
  onPlaybackStateChanged: (isPlaying: Boolean) -> Unit = {}
) {
  val context = LocalContext.current
  var isPlaying by remember { mutableStateOf(autoPlay) }
  var currentPositionMs by remember { mutableLongStateOf(0L) }
  var totalDurationMs by remember { mutableLongStateOf(0L) }
  var isBuffering by remember { mutableStateOf(false) }

  val exoPlayer = remember(context) {
    ExoPlayer.Builder(context).build().apply {
      this.repeatMode = Player.REPEAT_MODE_ALL
      this.playWhenReady = autoPlay
    }
  }

  LaunchedEffect(videoUri) {
    if (videoUri != null) {
      val mediaItem = MediaItem.fromUri(videoUri)
      exoPlayer.setMediaItem(mediaItem)
      exoPlayer.prepare()
      if (autoPlay) {
        exoPlayer.play()
      }
    }
  }

  LaunchedEffect(exoPlayer, isPlaying) {
    while (true) {
      if (exoPlayer.isPlaying) {
        currentPositionMs = exoPlayer.currentPosition.coerceAtLeast(0L)
        val dur = exoPlayer.duration
        if (dur > 0L) totalDurationMs = dur
      }
      delay(100)
    }
  }

  DisposableEffect(exoPlayer) {
    val listener = object : Player.Listener {
      override fun onIsPlayingChanged(playing: Boolean) {
        isPlaying = playing
        onPlaybackStateChanged(playing)
      }
      override fun onPlaybackStateChanged(playbackState: Int) {
        isBuffering = (playbackState == Player.STATE_BUFFERING)
        if (playbackState == Player.STATE_READY) {
          val dur = exoPlayer.duration
          if (dur > 0L) totalDurationMs = dur
        }
      }
    }
    exoPlayer.addListener(listener)
    onDispose {
      exoPlayer.removeListener(listener)
      exoPlayer.stop()
      exoPlayer.release()
    }
  }

  Column(modifier = modifier.testTag("exo_preview_with_timeline")) {
    // Video surface viewport
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .aspectRatio(16f / 9f)
        .clip(RoundedCornerShape(12.dp))
        .background(Color.Black)
    ) {
      AndroidView(
        factory = { ctx ->
          PlayerView(ctx).apply {
            layoutParams = FrameLayout.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT
            )
            useController = false
            resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
            player = exoPlayer
          }
        },
        update = { playerView -> playerView.player = exoPlayer },
        modifier = Modifier.fillMaxSize()
      )

      if (isBuffering) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          CircularProgressIndicator(color = OrangePrimary, modifier = Modifier.size(36.dp))
        }
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Visual Frame Timeline View
    TimelineView(
      currentPositionMs = currentPositionMs,
      totalDurationMs = totalDurationMs,
      isPlaying = isPlaying,
      videoUri = videoUri,
      onSeekTo = { pos ->
        currentPositionMs = pos
        exoPlayer.seekTo(pos)
      },
      onPlayPauseToggle = {
        if (exoPlayer.isPlaying) exoPlayer.pause() else exoPlayer.play()
      }
    )
  }
}

/**
 * Fullscreen Interactive Video Preview Dialog powered by ExoPlayer and Frame Timeline.
 */
@Composable
fun ExoFullscreenPreviewDialog(
  tracks: List<MediaTrack>,
  onDismiss: () -> Unit,
  onProceedToExport: () -> Unit = {}
) {
  val firstVideoUri = remember(tracks) {
    tracks.flatMap { it.clips }
      .firstOrNull { it.type == ClipType.VIDEO && !it.uri.isNullOrEmpty() }
      ?.uri?.let { Uri.parse(it) }
  }

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(Color.Black)
        .testTag("dialog_exo_fullscreen_preview")
    ) {
      // Main Center Viewport with Visual Frame Timeline
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .align(Alignment.Center)
          .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        ExoPreviewWithFrameTimeline(
          videoUri = firstVideoUri,
          modifier = Modifier.fillMaxWidth(),
          autoPlay = false
        )
      }

      // Top Exit Fullscreen Button
      IconButton(
        onClick = onDismiss,
        modifier = Modifier
          .align(Alignment.TopEnd)
          .padding(16.dp)
          .size(40.dp)
          .background(Color.Black.copy(alpha = 0.6f), CircleShape)
          .testTag("btn_close_exo_fullscreen")
      ) {
        Icon(
          imageVector = Icons.Default.FullscreenExit,
          contentDescription = "Exit Fullscreen",
          tint = Color.White,
          modifier = Modifier.size(24.dp)
        )
      }

      // Bottom Export Action
      Surface(
        color = Color(0xFF1E1B18).copy(alpha = 0.95f),
        modifier = Modifier
          .fillMaxWidth()
          .align(Alignment.BottomCenter)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(
              text = "Frame Verified",
              style = MaterialTheme.typography.titleSmall,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
            Text(
              text = "Ready to Render with MediaCodec",
              style = MaterialTheme.typography.bodySmall,
              color = Color.White.copy(alpha = 0.7f)
            )
          }

          androidx.compose.material3.Button(
            onClick = {
              onDismiss()
              onProceedToExport()
            },
            colors = androidx.compose.material3.ButtonDefaults.buttonColors(
              containerColor = OrangePrimary
            ),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.testTag("btn_proceed_to_export")
          ) {
            Text(
              text = "Export Project",
              fontWeight = FontWeight.Bold,
              fontSize = 13.sp
            )
          }
        }
      }
    }
  }
}

private fun formatTime(millis: Long): String {
  val totalSeconds = (millis / 1000).coerceAtLeast(0)
  val minutes = totalSeconds / 60
  val seconds = totalSeconds % 60
  return String.format(Locale.US, "%02d:%02d", minutes, seconds)
}
