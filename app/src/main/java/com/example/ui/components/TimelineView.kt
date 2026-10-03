package com.example.ui.components

import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.view.HapticFeedbackConstants
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
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material.icons.filled.ViewTimeline
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
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
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ClipType
import com.example.MediaClip
import com.example.MediaTrack
import com.example.PlaybackViewModel
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToInt

/**
 * Data model for an individual frame card on the horizontal timeline strip.
 */
data class TimelineFrameItem(
  val index: Int,
  val timeMs: Long,
  val timecodeFormatted: String,
  val isKeyframe: Boolean = false,
  val activeClipTitle: String? = null,
  val activeClipColor: Color? = null,
  val bitmap: Bitmap? = null
)

/**
 * Enhanced 'TimelineView' composable:
 * Supports smooth, micro-accurate frame-by-frame scrubbing:
 * - High-precision tactile Jog Wheel / Scrubber Dial with single-frame ticks & delta indicators
 * - Direct continuous drag on the filmstrip & playhead needle with smooth interpolation
 * - Floating Magnified Frame Loupe showing exact frame index, SMPTE milliseconds, and delta
 * - Step by 1 Frame (◀ / ▶) and Step by 10 Frames (⏮ / ⏭)
 * - Jump to Cut Boundaries (previous/next clip split) with optional magnetic snapping
 * - Selectable Project Frame Rates (24fps Cinema, 30fps Standard, 60fps High-Speed)
 */
@Composable
fun TimelineView(
  modifier: Modifier = Modifier,
  currentPositionMs: Long = 0L,
  totalDurationMs: Long = 30000L,
  isPlaying: Boolean = false,
  videoUri: Uri? = null,
  tracks: List<MediaTrack> = emptyList(),
  fps: Int = 30,
  onSeekTo: (Long) -> Unit = {},
  onPlayPauseToggle: () -> Unit = {}
) {
  val context = LocalContext.current
  val density = LocalDensity.current
  val view = LocalView.current

  // Selectable frame rates
  var selectedFps by remember(fps) { mutableIntStateOf(fps.coerceIn(24, 60)) }
  val safeDurationMs = totalDurationMs.coerceAtLeast(1000L)
  val frameDurationMs = (1000.0 / selectedFps).toLong().coerceAtLeast(1L)
  val currentFrameNumber = (currentPositionMs / frameDurationMs).toInt()
  val totalFrames = (safeDurationMs / frameDurationMs).toInt().coerceAtLeast(1)

  // Zoom scale: number of frame thumbnails sampled along the timeline (12 to 36)
  var frameSampleCount by remember { mutableIntStateOf(16) }
  val frameCardWidth = 72.dp
  val frameCardHeight = 56.dp

  // Scrubbing state
  var isScrubbing by remember { mutableStateOf(false) }
  var scrubDeltaFrames by remember { mutableIntStateOf(0) }
  var scrubStartPosMs by remember { mutableLongStateOf(0L) }
  var enableSnapToCuts by remember { mutableStateOf(true) }

  // Clip cut / split boundary timestamps for magnetic snapping
  val cutPointsMs = remember(tracks) {
    tracks.flatMap { it.clips }
      .flatMap { listOf(it.startTimeMs, it.startTimeMs + it.durationMs) }
      .filter { it in 1 until safeDurationMs }
      .distinct()
      .sorted()
  }

  // Background frame thumbnail cache
  val thumbnailCache = remember(videoUri, safeDurationMs) { mutableStateMapOf<Int, Bitmap>() }
  var isExtractingFrames by remember(videoUri) { mutableStateOf(videoUri != null) }

  // Asynchronously extract filmstrip thumbnails from the primary video
  LaunchedEffect(videoUri, safeDurationMs, frameSampleCount) {
    if (videoUri == null) {
      thumbnailCache.clear()
      isExtractingFrames = false
      return@LaunchedEffect
    }

    withContext(Dispatchers.IO) {
      try {
        val retriever = MediaMetadataRetriever()
        if (videoUri.scheme == "content" || videoUri.scheme == "android.resource") {
          retriever.setDataSource(context, videoUri)
        } else {
          val path = videoUri.path ?: videoUri.toString().removePrefix("file://")
          retriever.setDataSource(path)
        }

        for (i in 0 until frameSampleCount) {
          val sampleTimeMs = (i * safeDurationMs) / frameSampleCount
          val timeUs = sampleTimeMs * 1000L
          val bmp = retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
            ?: retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST)
          if (bmp != null) {
            val scaled = Bitmap.createScaledBitmap(bmp, 140, 96, true)
            withContext(Dispatchers.Main) {
              thumbnailCache[i] = scaled
            }
          }
        }
        retriever.release()
      } catch (_: Exception) {
      } finally {
        withContext(Dispatchers.Main) {
          isExtractingFrames = false
        }
      }
    }
  }

  // Pre-calculate frame items
  val frameItems = remember(safeDurationMs, frameSampleCount, tracks, thumbnailCache.size) {
    List(frameSampleCount) { i ->
      val timeMs = (i * safeDurationMs) / frameSampleCount
      val activeClip = tracks.flatMap { it.clips }
        .filter { it.type == ClipType.VIDEO || it.type == ClipType.IMAGE || it.type == ClipType.VFX }
        .firstOrNull { timeMs >= it.startTimeMs && timeMs < (it.startTimeMs + it.durationMs) }

      val seconds = (timeMs / 1000) % 60
      val minutes = (timeMs / (1000 * 60)) % 60
      val millis = (timeMs % 1000) / 100
      val formattedTime = String.format(Locale.US, "%02d:%02d.%d", minutes, seconds, millis)

      TimelineFrameItem(
        index = i,
        timeMs = timeMs,
        timecodeFormatted = formattedTime,
        isKeyframe = i % 4 == 0,
        activeClipTitle = activeClip?.title,
        activeClipColor = activeClip?.color,
        bitmap = thumbnailCache[i]
      )
    }
  }

  // Visual strip width calculation
  val totalStripWidthPx = with(density) { (frameCardWidth * frameSampleCount).toPx() }
  val progress = (currentPositionMs.toFloat() / safeDurationMs.toFloat()).coerceIn(0f, 1f)
  val scrollState = rememberScrollState()

  // Helper for applying snap-to-cut when scrubbing
  fun resolveSnapping(rawTimeMs: Long): Long {
    if (!enableSnapToCuts || cutPointsMs.isEmpty()) return rawTimeMs.coerceIn(0L, safeDurationMs)
    val snapThresholdMs = (frameDurationMs * 3).coerceAtLeast(80L)
    val closestCut = cutPointsMs.minByOrNull { abs(it - rawTimeMs) }
    return if (closestCut != null && abs(closestCut - rawTimeMs) <= snapThresholdMs) {
      closestCut
    } else {
      rawTimeMs.coerceIn(0L, safeDurationMs)
    }
  }

  // Auto-scroll strip to follow playback if not actively dragging
  LaunchedEffect(currentPositionMs, isPlaying, isScrubbing) {
    if (isPlaying && !isScrubbing && totalStripWidthPx > 0) {
      val targetScroll = (progress * totalStripWidthPx - 200).coerceAtLeast(0f).toInt()
      scrollState.animateScrollTo(targetScroll)
    }
  }

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("timeline_view_root"),
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = Color(0xFF141210)),
    border = BorderStroke(1.dp, Color(0xFF2C2621)),
    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp)
    ) {
      // 1. Top Bar: Header, SMPTE Timecode & Playback Navigation Controls
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Left: Title & Progress Pill
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = OrangePrimary.copy(alpha = 0.2f),
            border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.4f)),
            modifier = Modifier.size(32.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.ViewTimeline,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(18.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(8.dp))
          Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = "Precision Timeline",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White
              )
              Spacer(modifier = Modifier.width(6.dp))
              // Frame Rate Badge (cycles between 24, 30, 60 fps)
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF26201B),
                border = BorderStroke(1.dp, Color(0xFF42372F)),
                modifier = Modifier
                  .clickable {
                    selectedFps = when (selectedFps) {
                      24 -> 30
                      30 -> 60
                      else -> 24
                    }
                  }
                  .testTag("btn_fps_selector")
              ) {
                Text(
                  text = "${selectedFps}fps",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = OrangePrimary,
                  modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                )
              }
            }
            Text(
              text = "${formatDurationMinutes(currentPositionMs)} / ${formatDurationMinutes(safeDurationMs)}",
              style = MaterialTheme.typography.labelSmall,
              color = Color(0xFFD4AF37),
              fontFamily = FontFamily.Monospace,
              modifier = Modifier.testTag("text_timeline_timecode")
            )
          }
        }

        // Center / Right Controls: Step Back, Play/Pause, Step Forward, Zoom
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(2.dp)
        ) {
          // Snap-to-cut toggle
          IconButton(
            onClick = { enableSnapToCuts = !enableSnapToCuts },
            modifier = Modifier
              .size(32.dp)
              .testTag("btn_toggle_snap")
          ) {
            Icon(
              imageVector = Icons.Default.Bookmark,
              contentDescription = if (enableSnapToCuts) "Snap to Cuts On" else "Snap to Cuts Off",
              tint = if (enableSnapToCuts) OrangePrimary else Color.Gray,
              modifier = Modifier.size(16.dp)
            )
          }

          // Jump to previous cut
          IconButton(
            onClick = {
              val prevCut = cutPointsMs.lastOrNull { it < currentPositionMs - 50 } ?: 0L
              onSeekTo(prevCut)
              try { view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP) } catch (_: Exception) {}
            },
            modifier = Modifier
              .size(32.dp)
              .testTag("btn_timeline_jump_prev_cut")
          ) {
            Icon(
              imageVector = Icons.Default.SkipPrevious,
              contentDescription = "Jump to Previous Cut",
              tint = Color.White,
              modifier = Modifier.size(16.dp)
            )
          }

          // Step 1 frame backwards
          IconButton(
            onClick = {
              val newPos = (currentPositionMs - frameDurationMs).coerceAtLeast(0L)
              onSeekTo(newPos)
              try { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) } catch (_: Exception) {}
            },
            modifier = Modifier
              .size(36.dp)
              .testTag("btn_timeline_step_prev")
          ) {
            Icon(
              imageVector = Icons.Default.FastRewind,
              contentDescription = "Previous Frame (-1)",
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
          }

          // Main Play / Pause Button
          Surface(
            shape = CircleShape,
            color = OrangePrimary,
            modifier = Modifier
              .size(38.dp)
              .clip(CircleShape)
              .clickable(onClick = onPlayPauseToggle)
              .testTag("btn_timeline_play_pause")
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                contentDescription = if (isPlaying) "Pause" else "Play",
                tint = Color.Black,
                modifier = Modifier.size(22.dp)
              )
            }
          }

          // Step 1 frame forwards
          IconButton(
            onClick = {
              val newPos = (currentPositionMs + frameDurationMs).coerceAtMost(safeDurationMs)
              onSeekTo(newPos)
              try { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) } catch (_: Exception) {}
            },
            modifier = Modifier
              .size(36.dp)
              .testTag("btn_timeline_step_next")
          ) {
            Icon(
              imageVector = Icons.Default.FastForward,
              contentDescription = "Next Frame (+1)",
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
          }

          // Jump to next cut
          IconButton(
            onClick = {
              val nextCut = cutPointsMs.firstOrNull { it > currentPositionMs + 50 } ?: safeDurationMs
              onSeekTo(nextCut)
              try { view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP) } catch (_: Exception) {}
            },
            modifier = Modifier
              .size(32.dp)
              .testTag("btn_timeline_jump_next_cut")
          ) {
            Icon(
              imageVector = Icons.Default.SkipNext,
              contentDescription = "Jump to Next Cut",
              tint = Color.White,
              modifier = Modifier.size(16.dp)
            )
          }

          // Zoom in / out
          IconButton(
            onClick = {
              if (frameSampleCount > 12) frameSampleCount -= 4
            },
            modifier = Modifier
              .size(30.dp)
              .testTag("btn_timeline_zoom_out")
          ) {
            Icon(
              imageVector = Icons.Default.ZoomOut,
              contentDescription = "Zoom Out Timeline",
              tint = if (frameSampleCount > 12) Color.White else Color.Gray,
              modifier = Modifier.size(16.dp)
            )
          }

          IconButton(
            onClick = {
              if (frameSampleCount < 32) frameSampleCount += 4
            },
            modifier = Modifier
              .size(30.dp)
              .testTag("btn_timeline_zoom_in")
          ) {
            Icon(
              imageVector = Icons.Default.ZoomIn,
              contentDescription = "Zoom In Timeline",
              tint = if (frameSampleCount < 32) Color.White else Color.Gray,
              modifier = Modifier.size(16.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // 2. Timeline Ruler Header (Time Ticks: 0s, 1s, 2s ...)
      BoxWithConstraints(
        modifier = Modifier
          .fillMaxWidth()
          .height(18.dp)
          .padding(horizontal = 4.dp)
          .pointerInput(safeDurationMs) {
            detectTapGestures { offset ->
              val ratio = (offset.x / size.width).coerceIn(0f, 1f)
              val targetMs = resolveSnapping((ratio * safeDurationMs).toLong())
              onSeekTo(targetMs)
            }
          }
      ) {
        Row(
          modifier = Modifier.fillMaxSize(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          val ticks = 6
          for (t in 0..ticks) {
            val markMs = (t * safeDurationMs) / ticks
            Text(
              text = formatDurationSeconds(markMs),
              style = MaterialTheme.typography.labelSmall,
              fontSize = 9.sp,
              color = Color(0xFF9E9284),
              fontFamily = FontFamily.Monospace
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(4.dp))

      // 3. Main Horizontal Scrollable Strip of Video Frames with Continuous Scrubbing
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(frameCardHeight + 20.dp)
          .clip(RoundedCornerShape(10.dp))
          .background(Color(0xFF0A0908))
          .border(
            width = if (isScrubbing) 1.5.dp else 1.dp,
            color = if (isScrubbing) OrangePrimary else Color(0xFF241F1A),
            shape = RoundedCornerShape(10.dp)
          )
          .testTag("timeline_frame_strip")
      ) {
        // Scrollable row holding the filmstrip
        Row(
          modifier = Modifier
            .fillMaxSize()
            .horizontalScroll(scrollState)
            .padding(vertical = 6.dp, horizontal = 12.dp)
            .pointerInput(safeDurationMs, frameSampleCount, totalStripWidthPx) {
              detectTapGestures { offset ->
                val ratio = (offset.x / totalStripWidthPx).coerceIn(0f, 1f)
                val targetMs = resolveSnapping((ratio * safeDurationMs).toLong())
                onSeekTo(targetMs)
              }
            },
          horizontalArrangement = Arrangement.spacedBy(4.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          frameItems.forEach { item ->
            TimelineFrameCard(
              item = item,
              cardWidth = frameCardWidth,
              cardHeight = frameCardHeight,
              isCurrentFrame = (currentPositionMs >= item.timeMs &&
                currentPositionMs < item.timeMs + (safeDurationMs / frameSampleCount)),
              onClick = { onSeekTo(item.timeMs) }
            )
          }
        }

        // 4. Overlaid Interactive Playhead Needle with Smooth Gesture Scrubbing
        BoxWithConstraints(
          modifier = Modifier
            .fillMaxSize()
            .padding(vertical = 2.dp)
        ) {
          val containerWidthPx = with(density) { maxWidth.toPx() }
          val playheadOffsetPx = (progress * (containerWidthPx - 20)).coerceAtLeast(0f)

          Box(
            modifier = Modifier
              .offset { IntOffset(playheadOffsetPx.roundToInt(), 0) }
              .width(28.dp)
              .fillMaxHeight()
              .pointerInput(safeDurationMs, containerWidthPx) {
                detectDragGestures(
                  onDragStart = {
                    isScrubbing = true
                    scrubStartPosMs = currentPositionMs
                    scrubDeltaFrames = 0
                    try { view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS) } catch (_: Exception) {}
                  },
                  onDrag = { change, dragAmount ->
                    change.consume()
                    val newX = (playheadOffsetPx + dragAmount.x).coerceIn(0f, containerWidthPx)
                    val newProgress = (newX / containerWidthPx).coerceIn(0f, 1f)
                    val rawTargetMs = (newProgress * safeDurationMs).toLong()
                    val targetMs = resolveSnapping(rawTargetMs)
                    scrubDeltaFrames = ((targetMs - scrubStartPosMs) / frameDurationMs).toInt()
                    onSeekTo(targetMs)
                    try { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) } catch (_: Exception) {}
                  },
                  onDragEnd = {
                    isScrubbing = false
                  },
                  onDragCancel = {
                    isScrubbing = false
                  }
                )
              }
              .testTag("timeline_playhead"),
            contentAlignment = Alignment.TopCenter
          ) {
            // Playhead diamond / knob
            Box(
              modifier = Modifier
                .size(14.dp)
                .background(OrangePrimary, RoundedCornerShape(3.dp))
                .shadow(6.dp, shape = CircleShape)
                .border(1.dp, Color.White.copy(alpha = 0.8f), RoundedCornerShape(3.dp))
            )
            // Vertical playhead line
            Box(
              modifier = Modifier
                .width(2.dp)
                .fillMaxHeight()
                .background(
                  Brush.verticalGradient(
                    colors = listOf(OrangePrimary, OrangePrimaryDark, Color(0xFFFFD54F))
                  )
                )
            )
          }

          // Floating Magnified Frame Loupe while scrubbing
          if (isScrubbing) {
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = Color(0xFF1E1A16).copy(alpha = 0.95f),
              border = BorderStroke(1.dp, OrangePrimary),
              shadowElevation = 8.dp,
              modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = (-4).dp)
                .testTag("floating_scrub_loupe")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Box(
                  modifier = Modifier
                    .size(6.dp)
                    .background(OrangePrimary, CircleShape)
                )
                Text(
                  text = "F#$currentFrameNumber",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  fontFamily = FontFamily.Monospace
                )
                Text(
                  text = formatDurationFull(currentPositionMs),
                  fontSize = 10.sp,
                  color = Color(0xFFFFD54F),
                  fontFamily = FontFamily.Monospace
                )
                if (scrubDeltaFrames != 0) {
                  Text(
                    text = if (scrubDeltaFrames > 0) "+${scrubDeltaFrames}f" else "${scrubDeltaFrames}f",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (scrubDeltaFrames > 0) Color(0xFF4ADE80) else Color(0xFFF87171)
                  )
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // 4. Precision Frame Jog Wheel & Micro-Scrubber Bar
      FrameScrubberJogWheel(
        currentPositionMs = currentPositionMs,
        safeDurationMs = safeDurationMs,
        frameDurationMs = frameDurationMs,
        fps = selectedFps,
        onSeekTo = onSeekTo,
        onScrubStateChange = { isDragging, deltaFrames ->
          isScrubbing = isDragging
          scrubDeltaFrames = deltaFrames
        }
      )

      Spacer(modifier = Modifier.height(6.dp))

      // 5. Quick Multi-Frame Step Ribbon (-10f, -1f, +1f, +10f)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
          // -10 frames
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF1E1A16),
            border = BorderStroke(1.dp, Color(0xFF332B24)),
            modifier = Modifier
              .clickable {
                val newPos = (currentPositionMs - frameDurationMs * 10).coerceAtLeast(0L)
                onSeekTo(newPos)
                try { view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP) } catch (_: Exception) {}
              }
              .testTag("btn_timeline_step_10_prev")
          ) {
            Text(
              text = "-10f",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFFD4AF37),
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
            )
          }

          // -1 frame
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF1E1A16),
            border = BorderStroke(1.dp, Color(0xFF332B24)),
            modifier = Modifier
              .clickable {
                val newPos = (currentPositionMs - frameDurationMs).coerceAtLeast(0L)
                onSeekTo(newPos)
                try { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) } catch (_: Exception) {}
              }
          ) {
            Text(
              text = "-1f",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White,
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
            )
          }
        }

        // Center active clip badge indicator
        val activeClip = tracks.flatMap { it.clips }
          .firstOrNull { currentPositionMs in it.startTimeMs..(it.startTimeMs + it.durationMs) }

        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(6.dp)
              .background(activeClip?.color ?: OrangePrimary, CircleShape)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = activeClip?.title ?: "Master Track",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium,
            color = Color(0xFFC4B8AA),
            maxLines = 1
          )
        }

        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
          // +1 frame
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF1E1A16),
            border = BorderStroke(1.dp, Color(0xFF332B24)),
            modifier = Modifier
              .clickable {
                val newPos = (currentPositionMs + frameDurationMs).coerceAtMost(safeDurationMs)
                onSeekTo(newPos)
                try { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) } catch (_: Exception) {}
              }
          ) {
            Text(
              text = "+1f",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White,
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
            )
          }

          // +10 frames
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF1E1A16),
            border = BorderStroke(1.dp, Color(0xFF332B24)),
            modifier = Modifier
              .clickable {
                val newPos = (currentPositionMs + frameDurationMs * 10).coerceAtMost(safeDurationMs)
                onSeekTo(newPos)
                try { view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP) } catch (_: Exception) {}
              }
              .testTag("btn_timeline_step_10_next")
          ) {
            Text(
              text = "+10f",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFFD4AF37),
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(4.dp))

      // 6. Bottom Status Strip: Total Frame Count & Exact SMPTE
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Frame $currentFrameNumber / $totalFrames",
          style = MaterialTheme.typography.labelSmall,
          fontSize = 10.sp,
          color = Color(0xFFD4AF37),
          fontFamily = FontFamily.Monospace
        )

        Text(
          text = "${formatDurationFull(currentPositionMs)} @ ${selectedFps}fps",
          style = MaterialTheme.typography.labelSmall,
          fontSize = 10.sp,
          color = Color(0xFF887D70),
          fontFamily = FontFamily.Monospace
        )
      }
    }
  }
}

/**
 * Tactile Jog Wheel & Micro-Scrubber Bar.
 * Allows smooth, continuous dragging with graduation ticks:
 * - 1 tick = 1 video frame
 * - Medium ticks every 5 frames
 * - Tall orange ticks every 1 second
 */
@Composable
private fun FrameScrubberJogWheel(
  currentPositionMs: Long,
  safeDurationMs: Long,
  frameDurationMs: Long,
  fps: Int,
  onSeekTo: (Long) -> Unit,
  onScrubStateChange: (Boolean, Int) -> Unit
) {
  val view = LocalView.current
  var dragAccumulatorPx by remember { mutableFloatStateOf(0f) }
  var initialDragPosMs by remember { mutableLongStateOf(0L) }
  val pixelsPerFrame = 9f // 9 pixels of horizontal drag = 1 exact frame change

  Box(
    modifier = Modifier
      .fillMaxWidth()
      .height(38.dp)
      .clip(RoundedCornerShape(8.dp))
      .background(Color(0xFF0F0E0C))
      .border(1.dp, Color(0xFF26201B), RoundedCornerShape(8.dp))
      .pointerInput(currentPositionMs, safeDurationMs, frameDurationMs) {
        detectDragGestures(
          onDragStart = {
            dragAccumulatorPx = 0f
            initialDragPosMs = currentPositionMs
            onScrubStateChange(true, 0)
            try { view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS) } catch (_: Exception) {}
          },
          onDrag = { change, dragAmount ->
            change.consume()
            dragAccumulatorPx += dragAmount.x
            val framesDelta = (dragAccumulatorPx / pixelsPerFrame).toInt()
            if (framesDelta != 0) {
              val targetMs = (initialDragPosMs + framesDelta * frameDurationMs).coerceIn(0L, safeDurationMs)
              onSeekTo(targetMs)
              onScrubStateChange(true, framesDelta)
              try { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) } catch (_: Exception) {}
            }
          },
          onDragEnd = {
            onScrubStateChange(false, 0)
          },
          onDragCancel = {
            onScrubStateChange(false, 0)
          }
        )
      }
      .testTag("jog_wheel_scrubber")
  ) {
    // Dynamic graduation tick marks drawn along the jog wheel
    Canvas(modifier = Modifier.fillMaxSize()) {
      val width = size.width
      val height = size.height
      val centerY = height / 2f
      val numTicks = (width / pixelsPerFrame).toInt() + 10
      val currentFrame = (currentPositionMs / frameDurationMs).toInt()

      for (i in -numTicks / 2..numTicks / 2) {
        val tickFrame = currentFrame + i
        if (tickFrame < 0) continue
        val x = width / 2f + (i * pixelsPerFrame) - (dragAccumulatorPx % pixelsPerFrame)

        if (x in 0f..width) {
          val isSecondTick = tickFrame % fps == 0
          val isFiveFrameTick = tickFrame % 5 == 0

          val tickHeight = when {
            isSecondTick -> height * 0.7f
            isFiveFrameTick -> height * 0.45f
            else -> height * 0.25f
          }

          val tickColor = when {
            isSecondTick -> Color(0xFFD4AF37)
            isFiveFrameTick -> Color(0xFF887D70)
            else -> Color(0xFF3A332B)
          }

          val strokeWidth = if (isSecondTick) 1.5f else 1f

          drawLine(
            color = tickColor,
            start = Offset(x, centerY - tickHeight / 2f),
            end = Offset(x, centerY + tickHeight / 2f),
            strokeWidth = strokeWidth
          )
        }
      }

      // Center Scrubber Indicator Needle
      drawLine(
        color = OrangePrimary,
        start = Offset(width / 2f, 2f),
        end = Offset(width / 2f, height - 2f),
        strokeWidth = 2.5f
      )
    }

    // Top subtle label
    Box(
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .padding(bottom = 2.dp)
    ) {
      Text(
        text = "◀ DRAG JOG WHEEL TO SCRUB FRAME-BY-FRAME ▶",
        fontSize = 7.5.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 0.5.sp,
        color = Color(0xFF6B5F52)
      )
    }
  }
}

/**
 * Individual Frame Thumbnail Card representing a video frame at a given timestamp.
 */
@Composable
private fun TimelineFrameCard(
  item: TimelineFrameItem,
  cardWidth: androidx.compose.ui.unit.Dp,
  cardHeight: androidx.compose.ui.unit.Dp,
  isCurrentFrame: Boolean,
  onClick: () -> Unit
) {
  Surface(
    modifier = Modifier
      .width(cardWidth)
      .height(cardHeight)
      .clip(RoundedCornerShape(6.dp))
      .clickable(onClick = onClick)
      .testTag("frame_thumb_${item.index}"),
    shape = RoundedCornerShape(6.dp),
    color = Color(0xFF1E1A16),
    border = BorderStroke(
      width = if (isCurrentFrame) 2.dp else 1.dp,
      color = if (isCurrentFrame) OrangePrimary else Color(0xFF332B24)
    )
  ) {
    Box(modifier = Modifier.fillMaxSize()) {
      if (item.bitmap != null && !item.bitmap.isRecycled) {
        // Extracted video frame bitmap
        Image(
          bitmap = item.bitmap.asImageBitmap(),
          contentDescription = "Video Frame at ${item.timecodeFormatted}",
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize()
        )
      } else {
        // Cinematic synthetic frame card visualization
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(
              Brush.linearGradient(
                colors = listOf(
                  item.activeClipColor?.copy(alpha = 0.45f) ?: Color(0xFF261D15),
                  Color(0xFF14100C),
                  Color(0xFF0F0C09)
                )
              )
            )
        ) {
          // Diagonal filmstrip perforation lines
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .height(4.dp)
              .align(Alignment.TopCenter)
              .background(Color.Black.copy(alpha = 0.5f)),
            horizontalArrangement = Arrangement.SpaceEvenly
          ) {
            repeat(4) {
              Box(
                modifier = Modifier
                  .size(2.dp)
                  .background(Color.White.copy(alpha = 0.6f))
              )
            }
          }
        }
      }

      // Overlaid timestamp badge at bottom
      Surface(
        color = Color.Black.copy(alpha = 0.75f),
        shape = RoundedCornerShape(topStart = 4.dp),
        modifier = Modifier.align(Alignment.BottomEnd)
      ) {
        Text(
          text = item.timecodeFormatted,
          fontSize = 8.sp,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          color = if (isCurrentFrame) OrangePrimary else Color.White,
          modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
        )
      }

      // Active clip badge indicator on top left
      if (item.activeClipColor != null) {
        Box(
          modifier = Modifier
            .padding(3.dp)
            .size(6.dp)
            .background(item.activeClipColor, CircleShape)
            .align(Alignment.TopStart)
        )
      }
    }
  }
}

/**
 * Convenience overload that binds directly to the project's [PlaybackViewModel].
 */
@Composable
fun TimelineView(
  modifier: Modifier = Modifier,
  playbackViewModel: PlaybackViewModel,
  onSeekTo: (Long) -> Unit = {}
) {
  val currentPos by playbackViewModel.currentPositionMs.collectAsState()
  val totalDur by playbackViewModel.totalDurationMs.collectAsState()
  val isPlaying by playbackViewModel.isPlaying.collectAsState()
  val tracks by playbackViewModel.tracks.collectAsState()
  val videoUri = remember(tracks) {
    tracks.flatMap { it.clips }
      .firstOrNull { it.type == ClipType.VIDEO && !it.uri.isNullOrEmpty() }
      ?.uri?.let { Uri.parse(it) }
  }

  TimelineView(
    modifier = modifier,
    currentPositionMs = currentPos,
    totalDurationMs = totalDur,
    isPlaying = isPlaying,
    videoUri = videoUri,
    tracks = tracks,
    onSeekTo = { seekMs ->
      playbackViewModel.seekTo(seekMs)
      onSeekTo(seekMs)
    },
    onPlayPauseToggle = {
      playbackViewModel.togglePlayPause()
    }
  )
}

private fun formatDurationMinutes(ms: Long): String {
  val totalSeconds = (ms / 1000).coerceAtLeast(0L)
  val minutes = totalSeconds / 60
  val seconds = totalSeconds % 60
  val tenths = (ms % 1000) / 100
  return String.format(Locale.US, "%02d:%02d.%d", minutes, seconds, tenths)
}

private fun formatDurationSeconds(ms: Long): String {
  val seconds = ms / 1000f
  return String.format(Locale.US, "%.1fs", seconds)
}

private fun formatDurationFull(ms: Long): String {
  val totalSeconds = (ms / 1000).coerceAtLeast(0L)
  val minutes = totalSeconds / 60
  val seconds = totalSeconds % 60
  val millis = (ms % 1000).coerceAtLeast(0L)
  return String.format(Locale.US, "%02d:%02d.%03d", minutes, seconds, millis)
}
