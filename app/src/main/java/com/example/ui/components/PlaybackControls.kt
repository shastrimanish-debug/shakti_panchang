package com.example.ui.components

import android.widget.Toast
import androidx.annotation.OptIn
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
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
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.Forward10
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.FullscreenExit
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material.icons.filled.RepeatOne
import androidx.compose.material.icons.filled.Replay10
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.VolumeDown
import androidx.compose.material.icons.filled.VolumeMute
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import kotlinx.coroutines.delay
import java.util.Locale
import kotlin.math.roundToInt

/**
 * PlaybackControls composable integrating directly with Media3 Player / ExoPlayer.
 *
 * Provides:
 * - Play / Pause button with real-time player state binding and buffering feedback
 * - Seek Backward and Seek Forward jump buttons (e.g. -10s, +10s)
 * - Previous / Next media and frame-accurate stepping controls (1 frame = 33ms)
 * - Interactive scrubber timeline with timecode display (current / duration)
 * - Volume control with mute toggle, responsive volume slider (0-100%), and level badge
 * - Playback speed selector (0.25x to 2.0x) and Repeat mode toggle
 */
@OptIn(UnstableApi::class)
@Composable
fun PlaybackControls(
  player: Player,
  modifier: Modifier = Modifier,
  seekStepMs: Long = 10_000L,
  showFrameSteps: Boolean = true,
  showSpeedControl: Boolean = true,
  showVolumeSlider: Boolean = true,
  compact: Boolean = false,
  onFullScreenToggle: (() -> Unit)? = null,
  isFullScreen: Boolean = false
) {
  var isPlaying by remember { mutableStateOf(player.isPlaying) }
  var currentPositionMs by remember { mutableLongStateOf(player.currentPosition.coerceAtLeast(0L)) }
  var totalDurationMs by remember { mutableLongStateOf(player.duration.takeIf { it > 0L } ?: 0L) }
  var isBuffering by remember { mutableStateOf(player.playbackState == Player.STATE_BUFFERING) }
  var volume by remember { mutableFloatStateOf(player.volume) }
  var isMuted by remember { mutableStateOf(player.volume == 0f) }
  var lastNonZeroVolume by remember { mutableFloatStateOf(if (player.volume > 0f) player.volume else 1.0f) }
  var playbackSpeed by remember { mutableFloatStateOf(player.playbackParameters.speed) }
  var repeatMode by remember { mutableIntStateOf(player.repeatMode) }

  // Periodic position poller during active playback
  LaunchedEffect(player, isPlaying) {
    while (true) {
      if (player.isPlaying) {
        currentPositionMs = player.currentPosition.coerceAtLeast(0L)
        val dur = player.duration
        if (dur > 0L) {
          totalDurationMs = dur
        }
      }
      delay(100)
    }
  }

  // Bind Media3 Player.Listener lifecycle
  DisposableEffect(player) {
    val listener = object : Player.Listener {
      override fun onIsPlayingChanged(playing: Boolean) {
        isPlaying = playing
      }

      override fun onPlaybackStateChanged(playbackState: Int) {
        isBuffering = (playbackState == Player.STATE_BUFFERING)
        if (playbackState == Player.STATE_READY) {
          val dur = player.duration
          if (dur > 0L) {
            totalDurationMs = dur
          }
        }
      }

      override fun onPositionDiscontinuity(
        oldPosition: Player.PositionInfo,
        newPosition: Player.PositionInfo,
        reason: Int
      ) {
        currentPositionMs = newPosition.positionMs.coerceAtLeast(0L)
      }

      override fun onVolumeChanged(newVolume: Float) {
        volume = newVolume
        isMuted = (newVolume == 0f)
        if (newVolume > 0f) {
          lastNonZeroVolume = newVolume
        }
      }

      override fun onPlaybackParametersChanged(playbackParameters: PlaybackParameters) {
        playbackSpeed = playbackParameters.speed
      }

      override fun onRepeatModeChanged(newRepeatMode: Int) {
        repeatMode = newRepeatMode
      }
    }

    player.addListener(listener)
    onDispose {
      player.removeListener(listener)
    }
  }

  PlaybackControls(
    isPlaying = isPlaying,
    currentPositionMs = currentPositionMs,
    totalDurationMs = totalDurationMs,
    volume = volume,
    isMuted = isMuted,
    modifier = modifier,
    isBuffering = isBuffering,
    playbackSpeed = playbackSpeed,
    repeatMode = repeatMode,
    seekStepMs = seekStepMs,
    showFrameSteps = showFrameSteps,
    showSpeedControl = showSpeedControl,
    showVolumeSlider = showVolumeSlider,
    compact = compact,
    onPlayPause = {
      if (player.isPlaying) {
        player.pause()
      } else {
        if (player.playbackState == Player.STATE_ENDED) {
          player.seekTo(0L)
        }
        player.play()
      }
    },
    onSeekTo = { targetMs ->
      val bounded = targetMs.coerceIn(0L, if (totalDurationMs > 0) totalDurationMs else Long.MAX_VALUE)
      currentPositionMs = bounded
      player.seekTo(bounded)
    },
    onSeekForward = { stepMs ->
      val cur = player.currentPosition
      val dur = if (totalDurationMs > 0) totalDurationMs else Long.MAX_VALUE
      val target = (cur + stepMs).coerceAtMost(dur)
      currentPositionMs = target
      player.seekTo(target)
    },
    onSeekBackward = { stepMs ->
      val cur = player.currentPosition
      val target = (cur - stepMs).coerceAtLeast(0L)
      currentPositionMs = target
      player.seekTo(target)
    },
    onPrevious = {
      if (player.hasPreviousMediaItem()) {
        player.seekToPreviousMediaItem()
      } else {
        player.seekTo(0L)
        currentPositionMs = 0L
      }
    },
    onNext = {
      if (player.hasNextMediaItem()) {
        player.seekToNextMediaItem()
      } else if (totalDurationMs > 0) {
        player.seekTo(totalDurationMs)
        currentPositionMs = totalDurationMs
      }
    },
    onFrameStep = { forward ->
      val frameMs = 33L // ~30 fps frame step
      val cur = player.currentPosition
      val dur = if (totalDurationMs > 0) totalDurationMs else Long.MAX_VALUE
      val target = if (forward) (cur + frameMs).coerceAtMost(dur) else (cur - frameMs).coerceAtLeast(0L)
      currentPositionMs = target
      player.seekTo(target)
    },
    onVolumeChange = { newVolume ->
      val clamped = newVolume.coerceIn(0f, 1f)
      player.volume = clamped
      volume = clamped
      isMuted = (clamped == 0f)
      if (clamped > 0f) {
        lastNonZeroVolume = clamped
      }
    },
    onToggleMute = {
      if (isMuted) {
        val restoreVol = if (lastNonZeroVolume > 0f) lastNonZeroVolume else 1.0f
        player.volume = restoreVol
        volume = restoreVol
        isMuted = false
      } else {
        lastNonZeroVolume = if (volume > 0f) volume else 1.0f
        player.volume = 0f
        volume = 0f
        isMuted = true
      }
    },
    onSpeedChange = { newSpeed ->
      player.playbackParameters = PlaybackParameters(newSpeed)
      playbackSpeed = newSpeed
    },
    onRepeatToggle = {
      val nextMode = when (repeatMode) {
        Player.REPEAT_MODE_OFF -> Player.REPEAT_MODE_ALL
        Player.REPEAT_MODE_ALL -> Player.REPEAT_MODE_ONE
        else -> Player.REPEAT_MODE_OFF
      }
      player.repeatMode = nextMode
      repeatMode = nextMode
    },
    onFullScreenToggle = onFullScreenToggle,
    isFullScreen = isFullScreen
  )
}

/**
 * Convenience overload accepting concrete [ExoPlayer] instance.
 */
@OptIn(UnstableApi::class)
@Composable
fun PlaybackControls(
  exoPlayer: ExoPlayer,
  modifier: Modifier = Modifier,
  seekStepMs: Long = 10_000L,
  showFrameSteps: Boolean = true,
  showSpeedControl: Boolean = true,
  showVolumeSlider: Boolean = true,
  compact: Boolean = false,
  onFullScreenToggle: (() -> Unit)? = null,
  isFullScreen: Boolean = false
) {
  PlaybackControls(
    player = exoPlayer as Player,
    modifier = modifier,
    seekStepMs = seekStepMs,
    showFrameSteps = showFrameSteps,
    showSpeedControl = showSpeedControl,
    showVolumeSlider = showVolumeSlider,
    compact = compact,
    onFullScreenToggle = onFullScreenToggle,
    isFullScreen = isFullScreen
  )
}

/**
 * Pure Composable implementation of PlaybackControls.
 * Decoupled from concrete Player APIs for effortless unit testing, previews, and custom controls.
 */
@Composable
fun PlaybackControls(
  isPlaying: Boolean,
  currentPositionMs: Long,
  totalDurationMs: Long,
  volume: Float,
  isMuted: Boolean,
  modifier: Modifier = Modifier,
  isBuffering: Boolean = false,
  playbackSpeed: Float = 1.0f,
  repeatMode: Int = 0,
  seekStepMs: Long = 10_000L,
  showFrameSteps: Boolean = true,
  showSpeedControl: Boolean = true,
  showVolumeSlider: Boolean = true,
  compact: Boolean = false,
  onPlayPause: () -> Unit,
  onSeekTo: (Long) -> Unit,
  onSeekForward: (Long) -> Unit = {},
  onSeekBackward: (Long) -> Unit = {},
  onPrevious: () -> Unit = {},
  onNext: () -> Unit = {},
  onFrameStep: (Boolean) -> Unit = {},
  onVolumeChange: (Float) -> Unit = {},
  onToggleMute: () -> Unit = {},
  onSpeedChange: (Float) -> Unit = {},
  onRepeatToggle: () -> Unit = {},
  onFullScreenToggle: (() -> Unit)? = null,
  isFullScreen: Boolean = false
) {
  var isScrubbing by remember { mutableStateOf(false) }
  var scrubPositionMs by remember { mutableLongStateOf(0L) }
  var speedMenuExpanded by remember { mutableStateOf(false) }

  val effectivePositionMs = if (isScrubbing) scrubPositionMs else currentPositionMs
  val progress = if (totalDurationMs > 0) {
    (effectivePositionMs.toFloat() / totalDurationMs.toFloat()).coerceIn(0f, 1f)
  } else 0f

  Surface(
    modifier = modifier
      .fillMaxWidth()
      .testTag("playback_controls_container"),
    shape = RoundedCornerShape(16.dp),
    color = Color(0xFF161616),
    border = BorderStroke(1.dp, Color(0xFF2A2A2A)),
    shadowElevation = 8.dp
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 14.dp, vertical = if (compact) 8.dp else 12.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // 1. Time Scrubber & Timecode Row
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 4.dp)
      ) {
        Slider(
          value = progress,
          onValueChange = { frac ->
            isScrubbing = true
            scrubPositionMs = (frac * totalDurationMs).toLong()
          },
          onValueChangeFinished = {
            isScrubbing = false
            onSeekTo(scrubPositionMs)
          },
          colors = SliderDefaults.colors(
            thumbColor = OrangePrimary,
            activeTrackColor = OrangePrimary,
            inactiveTrackColor = Color.White.copy(alpha = 0.2f)
          ),
          modifier = Modifier
            .fillMaxWidth()
            .height(28.dp)
            .testTag("playback_seek_slider")
        )

        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 2.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = formatPlaybackTime(effectivePositionMs),
            color = if (isScrubbing) OrangePrimary else Color.White,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.testTag("playback_current_time")
          )

          if (isScrubbing) {
            Surface(
              shape = RoundedCornerShape(4.dp),
              color = OrangePrimary.copy(alpha = 0.2f),
              border = BorderStroke(0.5.dp, OrangePrimary.copy(alpha = 0.5f))
            ) {
              Text(
                text = "Scrubbing",
                color = OrangePrimary,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
          }

          Text(
            text = formatPlaybackTime(totalDurationMs),
            color = Color.White.copy(alpha = 0.7f),
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.testTag("playback_total_time")
          )
        }
      }

      Spacer(modifier = Modifier.height(if (compact) 4.dp else 8.dp))

      // 2. Primary Transport Bar: Skip / Frame / Rewind / Play-Pause / Forward / Frame / Next
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Previous Clip / To Start
        IconButton(
          onClick = onPrevious,
          modifier = Modifier
            .size(40.dp)
            .minimumInteractiveComponentSize()
            .testTag("playback_previous_button")
        ) {
          Icon(
            imageVector = Icons.Default.SkipPrevious,
            contentDescription = "Previous Track or Start",
            tint = Color.White,
            modifier = Modifier.size(22.dp)
          )
        }

        // Frame Step Back (-33ms)
        if (showFrameSteps && !compact) {
          IconButton(
            onClick = { onFrameStep(false) },
            modifier = Modifier
              .size(36.dp)
              .minimumInteractiveComponentSize()
              .testTag("playback_frame_prev_button")
          ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
              Icon(
                imageVector = Icons.Default.ChevronLeft,
                contentDescription = "Step 1 Frame Back",
                tint = Color.White.copy(alpha = 0.85f),
                modifier = Modifier.size(20.dp)
              )
              Text(
                text = "-1F",
                fontSize = 8.sp,
                color = Color.White.copy(alpha = 0.7f),
                fontWeight = FontWeight.Bold
              )
            }
          }
        }

        // Seek Backward (Default -10s)
        IconButton(
          onClick = { onSeekBackward(seekStepMs) },
          modifier = Modifier
            .size(44.dp)
            .minimumInteractiveComponentSize()
            .testTag("playback_seek_back_button")
        ) {
          Icon(
            imageVector = Icons.Default.Replay10,
            contentDescription = "Seek Backward ${seekStepMs / 1000} seconds",
            tint = Color.White,
            modifier = Modifier.size(26.dp)
          )
        }

        // Center Hero Play/Pause Button
        val playButtonScale by animateFloatAsState(
          targetValue = if (isPlaying) 1.0f else 1.05f,
          label = "play_btn_scale"
        )
        Surface(
          onClick = onPlayPause,
          shape = CircleShape,
          color = OrangePrimary,
          shadowElevation = 6.dp,
          modifier = Modifier
            .size(if (compact) 48.dp else 54.dp)
            .scale(playButtonScale)
            .minimumInteractiveComponentSize()
            .testTag("playback_play_pause_button")
        ) {
          Box(
            modifier = Modifier.size(if (compact) 48.dp else 54.dp),
            contentAlignment = Alignment.Center
          ) {
            if (isBuffering) {
              CircularProgressIndicator(
                color = Color.White,
                strokeWidth = 3.dp,
                modifier = Modifier.size(26.dp)
              )
            } else {
              Icon(
                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                contentDescription = if (isPlaying) "Pause Playback" else "Start Playback",
                tint = Color.White,
                modifier = Modifier.size(if (compact) 28.dp else 32.dp)
              )
            }
          }
        }

        // Seek Forward (Default +10s)
        IconButton(
          onClick = { onSeekForward(seekStepMs) },
          modifier = Modifier
            .size(44.dp)
            .minimumInteractiveComponentSize()
            .testTag("playback_seek_forward_button")
        ) {
          Icon(
            imageVector = Icons.Default.Forward10,
            contentDescription = "Seek Forward ${seekStepMs / 1000} seconds",
            tint = Color.White,
            modifier = Modifier.size(26.dp)
          )
        }

        // Frame Step Forward (+33ms)
        if (showFrameSteps && !compact) {
          IconButton(
            onClick = { onFrameStep(true) },
            modifier = Modifier
              .size(36.dp)
              .minimumInteractiveComponentSize()
              .testTag("playback_frame_next_button")
          ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
              Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Step 1 Frame Forward",
                tint = Color.White.copy(alpha = 0.85f),
                modifier = Modifier.size(20.dp)
              )
              Text(
                text = "+1F",
                fontSize = 8.sp,
                color = Color.White.copy(alpha = 0.7f),
                fontWeight = FontWeight.Bold
              )
            }
          }
        }

        // Next Clip / To End
        IconButton(
          onClick = onNext,
          modifier = Modifier
            .size(40.dp)
            .minimumInteractiveComponentSize()
            .testTag("playback_next_button")
        ) {
          Icon(
            imageVector = Icons.Default.SkipNext,
            contentDescription = "Next Track or End",
            tint = Color.White,
            modifier = Modifier.size(22.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(if (compact) 4.dp else 8.dp))

      // 3. Secondary Bar: Volume slider with mute button, speed selector, repeat toggle
      Surface(
        shape = RoundedCornerShape(10.dp),
        color = Color(0xFF1E1E1E),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 10.dp, vertical = 4.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Volume Control Section
          Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically
          ) {
            // Mute / Unmute Button
            val volumeIcon = when {
              isMuted || volume == 0f -> Icons.Default.VolumeOff
              volume < 0.5f -> Icons.Default.VolumeDown
              else -> Icons.Default.VolumeUp
            }

            IconButton(
              onClick = onToggleMute,
              modifier = Modifier
                .size(38.dp)
                .minimumInteractiveComponentSize()
                .testTag("playback_volume_button")
            ) {
              Icon(
                imageVector = volumeIcon,
                contentDescription = if (isMuted) "Unmute Audio" else "Mute Audio",
                tint = if (isMuted) OrangePrimaryDark else Color.White,
                modifier = Modifier.size(20.dp)
              )
            }

            if (showVolumeSlider) {
              Slider(
                value = if (isMuted) 0f else volume,
                onValueChange = onVolumeChange,
                colors = SliderDefaults.colors(
                  thumbColor = OrangePrimary,
                  activeTrackColor = OrangePrimary,
                  inactiveTrackColor = Color.White.copy(alpha = 0.25f)
                ),
                modifier = Modifier
                  .weight(1f)
                  .height(24.dp)
                  .testTag("playback_volume_slider")
              )

              Spacer(modifier = Modifier.width(6.dp))

              Text(
                text = "${((if (isMuted) 0f else volume) * 100).roundToInt()}%",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                fontFamily = FontFamily.Monospace,
                color = Color.White.copy(alpha = 0.85f),
                modifier = Modifier
                  .widthIn(min = 34.dp)
                  .testTag("playback_volume_label")
              )
            }
          }

          Spacer(modifier = Modifier.width(8.dp))

          // Speed & Mode Controls Section
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
          ) {
            // Playback Speed Selector
            if (showSpeedControl) {
              Box {
                Surface(
                  onClick = { speedMenuExpanded = !speedMenuExpanded },
                  shape = RoundedCornerShape(6.dp),
                  color = Color(0xFF2B2B2B),
                  border = BorderStroke(0.5.dp, Color(0xFF3E3E3E)),
                  modifier = Modifier
                    .minimumInteractiveComponentSize()
                    .testTag("playback_speed_button")
                ) {
                  Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Icon(
                      imageVector = Icons.Default.Speed,
                      contentDescription = "Playback Speed",
                      tint = OrangePrimary,
                      modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                      text = "${playbackSpeed}x",
                      fontSize = 11.sp,
                      fontWeight = FontWeight.Bold,
                      color = Color.White
                    )
                  }
                }

                DropdownMenu(
                  expanded = speedMenuExpanded,
                  onDismissRequest = { speedMenuExpanded = false }
                ) {
                  listOf(0.25f, 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 2.0f).forEach { speed ->
                    DropdownMenuItem(
                      text = {
                        Text(
                          text = "${speed}x",
                          fontWeight = if (playbackSpeed == speed) FontWeight.Bold else FontWeight.Normal,
                          color = if (playbackSpeed == speed) OrangePrimary else Color.Unspecified
                        )
                      },
                      onClick = {
                        onSpeedChange(speed)
                        speedMenuExpanded = false
                      },
                      modifier = Modifier.testTag("playback_speed_option_${speed}")
                    )
                  }
                }
              }
            }

            // Repeat Mode Button
            IconButton(
              onClick = onRepeatToggle,
              modifier = Modifier
                .size(34.dp)
                .minimumInteractiveComponentSize()
                .testTag("playback_repeat_button")
            ) {
              val isRepeatActive = repeatMode != 0
              Icon(
                imageVector = if (repeatMode == 1) Icons.Default.RepeatOne else Icons.Default.Repeat,
                contentDescription = "Toggle Repeat Mode",
                tint = if (isRepeatActive) OrangePrimary else Color.White.copy(alpha = 0.6f),
                modifier = Modifier.size(18.dp)
              )
            }

            // Fullscreen Toggle
            if (onFullScreenToggle != null) {
              IconButton(
                onClick = onFullScreenToggle,
                modifier = Modifier
                  .size(34.dp)
                  .minimumInteractiveComponentSize()
                  .testTag("playback_fullscreen_button")
              ) {
                Icon(
                  imageVector = if (isFullScreen) Icons.Default.FullscreenExit else Icons.Default.Fullscreen,
                  contentDescription = if (isFullScreen) "Exit Fullscreen" else "Enter Fullscreen",
                  tint = Color.White,
                  modifier = Modifier.size(18.dp)
                )
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Format milliseconds into standard MM:SS or HH:MM:SS string.
 */
private fun formatPlaybackTime(millis: Long): String {
  val totalSeconds = (millis / 1000).coerceAtLeast(0)
  val hours = totalSeconds / 3600
  val minutes = (totalSeconds % 3600) / 60
  val seconds = totalSeconds % 60
  return if (hours > 0) {
    String.format(Locale.US, "%02d:%02d:%02d", hours, minutes, seconds)
  } else {
    String.format(Locale.US, "%02d:%02d", minutes, seconds)
  }
}
