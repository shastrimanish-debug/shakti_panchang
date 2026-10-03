package com.example.ui.components

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.FirstPage
import androidx.compose.material.icons.filled.LastPage
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.ViewTimeline
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.media3.exoplayer.ExoPlayer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.math.roundToInt

data class FrameThumbnail(
  val index: Int,
  val timeMs: Long,
  val bitmap: Bitmap?
)

/**
 * Visual Frame Timeline Strip with Live ExoPlayer Navigation.
 * Displays extracted video thumbnails across the project duration,
 * with a sliding playhead for frame-accurate scrubbing, ±1 frame stepping,
 * timecode (HH:MM:SS:FF), and real-time ExoPlayer seek synchronization.
 */
@Composable
fun ExoFrameAccurateTimeline(
  videoUri: Uri?,
  exoPlayer: ExoPlayer,
  currentPositionMs: Long,
  totalDurationMs: Long,
  isPlaying: Boolean,
  modifier: Modifier = Modifier,
  fps: Int = 30,
  onSeekTo: (Long) -> Unit = {}
) {
  val context = LocalContext.current
  val safeDurationMs = totalDurationMs.coerceAtLeast(1000L)
  val frameDurationMs = (1000f / fps).toLong().coerceAtLeast(1L)
  val currentFrame = (currentPositionMs / frameDurationMs).toInt()
  val totalFrames = (safeDurationMs / frameDurationMs).toInt().coerceAtLeast(1)

  // Asynchronously extract filmstrip thumbnails across the video
  val thumbnailMap = remember(videoUri, safeDurationMs) { mutableStateMapOf<Int, Bitmap>() }
  var isLoadingThumbnails by remember(videoUri) { mutableStateOf(videoUri != null) }

  val sampleCount = 10
  LaunchedEffect(videoUri, safeDurationMs) {
    if (videoUri == null) {
      thumbnailMap.clear()
      isLoadingThumbnails = false
      return@LaunchedEffect
    }

    withContext(Dispatchers.IO) {
      try {
        val retriever = MediaMetadataRetriever()
        retriever.setDataSource(context, videoUri)
        for (i in 0 until sampleCount) {
          val sampleTimeMs = (i * safeDurationMs) / sampleCount
          val timeUs = sampleTimeMs * 1000L
          val bmp = retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
          if (bmp != null) {
            // Scale thumbnail to memory-efficient size
            val scaled = Bitmap.createScaledBitmap(bmp, 120, 80, true)
            withContext(Dispatchers.Main) {
              thumbnailMap[i] = scaled
            }
          }
        }
        retriever.release()
      } catch (_: Exception) {}
      withContext(Dispatchers.Main) {
        isLoadingThumbnails = false
      }
    }
  }

  Card(
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(containerColor = Color(0xFF141210)),
    border = BorderStroke(1.dp, Color(0xFF2E2721)),
    modifier = modifier
      .fillMaxWidth()
      .testTag("exo_frame_timeline_container")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 12.dp, vertical = 10.dp)
    ) {
      // 1. Header Bar: Precise Timecode & Frame Counter
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.ViewTimeline,
            contentDescription = null,
            tint = OrangePrimary,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Frame Timeline",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
        }

        // Frame and Timecode Badges
        Row(
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Timecode: 00:00:00:00
          Surface(
            color = Color(0xFF221E1A),
            shape = RoundedCornerShape(6.dp),
            border = BorderStroke(1.dp, Color(0xFF3D332A))
          ) {
            Text(
              text = formatTimecode(currentPositionMs, fps),
              fontFamily = FontFamily.Monospace,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White,
              modifier = Modifier
                .padding(horizontal = 8.dp, vertical = 3.dp)
                .testTag("text_exo_timecode")
            )
          }

          // Frame Counter: F: 45 / 300
          Surface(
            color = OrangePrimary.copy(alpha = 0.18f),
            shape = RoundedCornerShape(6.dp),
            border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.4f))
          ) {
            Text(
              text = "F: $currentFrame / $totalFrames",
              fontFamily = FontFamily.Monospace,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = OrangePrimary,
              modifier = Modifier
                .padding(horizontal = 8.dp, vertical = 3.dp)
                .testTag("text_exo_frame_counter")
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // 2. Filmstrip Track & Sliding Playhead
      BoxWithConstraints(
        modifier = Modifier
          .fillMaxWidth()
          .height(64.dp)
          .clip(RoundedCornerShape(8.dp))
          .background(Color(0xFF0A0908))
          .border(1.dp, Color(0xFF2A231C), RoundedCornerShape(8.dp))
          .testTag("exo_filmstrip_track")
      ) {
        val stripWidth = constraints.maxWidth.toFloat()
        val playheadFrac = (currentPositionMs.toFloat() / safeDurationMs).coerceIn(0f, 1f)
        val playheadOffsetPx = playheadFrac * stripWidth

        // Thumbnails Strip
        Row(
          modifier = Modifier
            .fillMaxSize()
            .pointerInput(safeDurationMs, stripWidth) {
              detectTapGestures { offset ->
                val frac = (offset.x / stripWidth).coerceIn(0f, 1f)
                val targetMs = (frac * safeDurationMs).toLong()
                exoPlayer.pause()
                exoPlayer.seekTo(targetMs)
                onSeekTo(targetMs)
              }
            }
            .pointerInput(safeDurationMs, stripWidth) {
              detectDragGestures { change, _ ->
                change.consume()
                val frac = (change.position.x / stripWidth).coerceIn(0f, 1f)
                val targetMs = (frac * safeDurationMs).toLong()
                exoPlayer.pause()
                exoPlayer.seekTo(targetMs)
                onSeekTo(targetMs)
              }
            }
        ) {
          for (i in 0 until sampleCount) {
            val bmp = thumbnailMap[i]
            Box(
              modifier = Modifier
                .weight(1f)
                .fillMaxHeight()
                .border(0.5.dp, Color(0xFF1E1914))
                .background(Color(0xFF181512))
            ) {
              if (bmp != null && !bmp.isRecycled) {
                Image(
                  bitmap = bmp.asImageBitmap(),
                  contentDescription = "Frame $i",
                  contentScale = ContentScale.Crop,
                  modifier = Modifier.fillMaxSize()
                )
              } else {
                // Fallback gradient cell with tick marks
                Canvas(modifier = Modifier.fillMaxSize()) {
                  val tickSpacing = size.width / 4f
                  for (t in 1..3) {
                    val x = t * tickSpacing
                    drawLine(
                      color = Color.White.copy(alpha = 0.15f),
                      start = Offset(x, size.height - 8f),
                      end = Offset(x, size.height),
                      strokeWidth = 1f
                    )
                  }
                }
              }

              // Top and bottom filmstrip perforations
              Canvas(
                modifier = Modifier
                  .fillMaxWidth()
                  .height(6.dp)
                  .align(Alignment.TopCenter)
              ) {
                drawCircle(Color.Black.copy(alpha = 0.85f), radius = 2.dp.toPx(), center = Offset(size.width / 2, size.height / 2))
              }
              Canvas(
                modifier = Modifier
                  .fillMaxWidth()
                  .height(6.dp)
                  .align(Alignment.BottomCenter)
              ) {
                drawCircle(Color.Black.copy(alpha = 0.85f), radius = 2.dp.toPx(), center = Offset(size.width / 2, size.height / 2))
              }
            }
          }
        }

        // Sliding Playhead Cursor (Needle with diamond handle)
        Box(
          modifier = Modifier
            .offset { IntOffset(playheadOffsetPx.roundToInt() - 8.dp.roundToPx(), 0) }
            .fillMaxHeight()
            .width(16.dp)
            .testTag("exo_sliding_playhead")
        ) {
          // Playhead Needle
          Box(
            modifier = Modifier
              .align(Alignment.Center)
              .fillMaxHeight()
              .width(2.dp)
              .background(OrangePrimary)
          )

          // Top Diamond Indicator
          Box(
            modifier = Modifier
              .align(Alignment.TopCenter)
              .size(10.dp)
              .shadow(4.dp, shape = CircleShape)
              .background(Color.White, CircleShape)
              .border(1.5.dp, OrangePrimaryDark, CircleShape)
          )

          // Bottom Diamond Indicator
          Box(
            modifier = Modifier
              .align(Alignment.BottomCenter)
              .size(8.dp)
              .background(OrangePrimary, CircleShape)
          )
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // 3. Precision Controls: Step Frame (-1/+1), Jump (-1s/+1s), Play/Pause
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Left Action: Jump to Start
        IconButton(
          onClick = {
            exoPlayer.seekTo(0L)
            onSeekTo(0L)
          },
          modifier = Modifier
            .size(36.dp)
            .background(Color(0xFF221E1A), RoundedCornerShape(8.dp))
            .testTag("btn_exo_jump_start")
        ) {
          Icon(
            imageVector = Icons.Default.FirstPage,
            contentDescription = "Jump to Start",
            tint = Color.White,
            modifier = Modifier.size(18.dp)
          )
        }

        // Steppers & Transport Controls
        Row(
          horizontalArrangement = Arrangement.spacedBy(6.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          // -1 Frame Button
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFF221E1A),
            border = BorderStroke(1.dp, Color(0xFF382F26)),
            modifier = Modifier
              .clickable {
                exoPlayer.pause()
                val targetMs = (currentPositionMs - frameDurationMs).coerceAtLeast(0L)
                exoPlayer.seekTo(targetMs)
                onSeekTo(targetMs)
              }
              .testTag("btn_exo_prev_frame")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("-1 Frame", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
          }

          // Play / Pause Master Button
          IconButton(
            onClick = {
              if (exoPlayer.isPlaying) {
                exoPlayer.pause()
              } else {
                exoPlayer.play()
              }
            },
            modifier = Modifier
              .size(40.dp)
              .background(
                Brush.horizontalGradient(listOf(OrangePrimary, OrangePrimaryDark)),
                CircleShape
              )
              .testTag("btn_exo_timeline_play_pause")
          ) {
            Icon(
              imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
              contentDescription = if (isPlaying) "Pause" else "Play",
              tint = Color.White,
              modifier = Modifier.size(22.dp)
            )
          }

          // +1 Frame Button
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFF221E1A),
            border = BorderStroke(1.dp, Color(0xFF382F26)),
            modifier = Modifier
              .clickable {
                exoPlayer.pause()
                val targetMs = (currentPositionMs + frameDurationMs).coerceAtMost(safeDurationMs)
                exoPlayer.seekTo(targetMs)
                onSeekTo(targetMs)
              }
              .testTag("btn_exo_next_frame")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("+1 Frame", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
          }
        }

        // Right Action: Jump to End
        IconButton(
          onClick = {
            exoPlayer.pause()
            exoPlayer.seekTo(safeDurationMs)
            onSeekTo(safeDurationMs)
          },
          modifier = Modifier
            .size(36.dp)
            .background(Color(0xFF221E1A), RoundedCornerShape(8.dp))
            .testTag("btn_exo_jump_end")
        ) {
          Icon(
            imageVector = Icons.Default.LastPage,
            contentDescription = "Jump to End",
            tint = Color.White,
            modifier = Modifier.size(18.dp)
          )
        }
      }
    }
  }
}

/**
 * Formats milliseconds into standard SMPTE timecode (HH:MM:SS:FF)
 */
private fun formatTimecode(millis: Long, fps: Int): String {
  val totalSeconds = (millis / 1000).coerceAtLeast(0)
  val hours = totalSeconds / 3600
  val minutes = (totalSeconds % 3600) / 60
  val seconds = totalSeconds % 60
  val frameDurationMs = (1000f / fps).toLong().coerceAtLeast(1L)
  val frameNumber = ((millis % 1000) / frameDurationMs).toInt().coerceIn(0, fps - 1)
  return String.format(Locale.US, "%02d:%02d:%02d:%02d", hours, minutes, seconds, frameNumber)
}
