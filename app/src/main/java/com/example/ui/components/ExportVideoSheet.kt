package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.HighQuality
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
import com.example.MediaTrack
import com.example.ui.components.ExoVideoProjectPreviewCard
import com.example.ui.components.ExoFullscreenPreviewDialog
import com.example.util.GalleryExporter
import com.example.util.ExportResult
import com.example.ui.theme.CreamBackground
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamSurface
import com.example.ui.theme.CreamSurfaceVariant
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangeOnContainer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.WarmMuted

/**
 * Resolution Option
 */
enum class ExportResolution(val label: String, val badge: String, val width: Int, val height: Int, val sizeMultiplier: Float) {
  HD_720P("720p", "HD • 1280x720", 1280, 720, 0.55f),
  FHD_1080P("1080p", "Full HD • 1920x1080", 1920, 1080, 1.0f),
  UHD_4K("4K", "Ultra HD • 3840x2160", 3840, 2160, 2.75f)
}

/**
 * Frame Rate Option
 */
enum class ExportFrameRate(val label: String, val description: String, val fps: Int, val sizeMultiplier: Float) {
  FPS_24("24fps", "Cinematic Motion", 24, 0.90f),
  FPS_30("30fps", "Standard Social", 30, 1.0f),
  FPS_60("60fps", "Ultra Smooth", 60, 1.35f)
}

/**
 * Bitrate Option
 */
enum class ExportBitrate(val label: String, val mbps: String, val desc: String, val sliderValue: Float, val baseSizeMb: Float) {
  LOW("Low", "~8 Mbps", "Compact & Fast Share", 0f, 22f),
  MEDIUM("Medium", "~22 Mbps", "Recommended Balance", 1f, 45f),
  HIGH("High", "~55 Mbps", "Master Production", 2f, 95f);

  companion object {
    fun fromSliderValue(value: Float): ExportBitrate {
      return when {
        value < 0.5f -> LOW
        value < 1.5f -> MEDIUM
        else -> HIGH
      }
    }
  }
}

/**
 * Step 25: Export & Render Settings Bottom Sheet
 *
 * Requirements:
 * 1. Jetpack Compose bottom sheet titled 'Export Video'.
 * 2. Selection chips for 'Resolution' (720p, 1080p, 4K) and 'Frame Rate' (24fps, 30fps, 60fps).
 * 3. 'Bitrate' slider (Low, Medium, High).
 * 4. Large, glowing 'Export to Gallery' action button at the bottom with mock estimated file size text (e.g. 'Est. Size: 45MB').
 * 5. STRICTLY UI layout only (no actual MediaCodec/FFmpeg rendering).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExportVideoBottomSheet(
  onDismiss: () -> Unit,
  tracks: List<MediaTrack> = emptyList(),
  onExportToGallery: (resolution: ExportResolution, frameRate: ExportFrameRate, bitrate: ExportBitrate, estSizeMb: Int) -> Unit = { _, _, _, _ -> },
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  val context = LocalContext.current
  val scope = rememberCoroutineScope()

  var selectedResolution by remember { mutableStateOf(ExportResolution.FHD_1080P) }
  var selectedFrameRate by remember { mutableStateOf(ExportFrameRate.FPS_30) }
  var bitrateSliderPosition by remember { mutableFloatStateOf(1.0f) }

  val currentTheme by com.example.ui.theme.AppThemeManager.currentTheme.collectAsState()
  val sheetBg = currentTheme.surfaceColor
  val sheetText = currentTheme.textColor
  val sheetMuted = currentTheme.textColor.copy(alpha = 0.65f)
  val sheetRaised = currentTheme.surfaceRaised
  val sheetAccent = currentTheme.primaryColor
  val sheetAccentDark = currentTheme.primaryDark
  val sheetBorder = currentTheme.sheetBorder

  var isExporting by remember { mutableStateOf(false) }
  var exportProgress by remember { mutableFloatStateOf(0f) }
  var exportStage by remember { mutableStateOf("Preparing export...") }
  var exportResult by remember { mutableStateOf<ExportResult?>(null) }
  var showFullscreenPreview by remember { mutableStateOf(false) }

  val currentBitrate = ExportBitrate.fromSliderValue(bitrateSliderPosition)

  // Dynamic estimated size calculation (produces exactly 45MB for 1080p + 30fps + Medium bitrate)
  val calculatedSizeMb = remember(selectedResolution, selectedFrameRate, currentBitrate) {
    val base = currentBitrate.baseSizeMb
    val resMultiplier = selectedResolution.sizeMultiplier
    val fpsMultiplier = selectedFrameRate.sizeMultiplier
    (base * resMultiplier * fpsMultiplier).toInt().coerceAtLeast(8)
  }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = sheetBg,
    contentColor = sheetText,
    tonalElevation = 6.dp,
    modifier = modifier.testTag("sheet_export_video")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 8.dp)
        .navigationBarsPadding()
    ) {
      // 1. Header Bar: Title + Close Button
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = sheetRaised,
            border = BorderStroke(1.dp, sheetAccent.copy(alpha = 0.4f)),
            modifier = Modifier.size(38.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.FileUpload,
                contentDescription = null,
                tint = sheetAccent,
                modifier = Modifier.size(22.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "Export Video",
              style = MaterialTheme.typography.titleLarge,
              fontWeight = FontWeight.Bold,
              color = sheetText,
              modifier = Modifier.testTag("text_export_title")
            )
            Text(
              text = "Render master timeline composition",
              style = MaterialTheme.typography.bodySmall,
              color = sheetMuted
            )
          }
        }

        IconButton(
          onClick = onDismiss,
          modifier = Modifier
            .background(sheetRaised, CircleShape)
            .size(32.dp)
            .testTag("btn_close_export_sheet")
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close Export Sheet",
            tint = sheetText,
            modifier = Modifier.size(18.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // ExoPlayer Live Video Preview Before Export
      ExoVideoProjectPreviewCard(
        tracks = tracks,
        modifier = Modifier
          .fillMaxWidth()
          .padding(bottom = 12.dp),
        onOpenFullscreen = { showFullscreenPreview = true }
      )

      if (showFullscreenPreview) {
        ExoFullscreenPreviewDialog(
          tracks = tracks,
          onDismiss = { showFullscreenPreview = false },
          onProceedToExport = { showFullscreenPreview = false }
        )
      }

      // Master Project Spec Chip Banner
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = sheetRaised,
        border = BorderStroke(1.dp, sheetBorder)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.Movie,
              contentDescription = null,
              tint = sheetAccent,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "Format: MP4 (H.264 / AAC Audio)",
              style = MaterialTheme.typography.labelMedium,
              fontWeight = FontWeight.SemiBold,
              color = sheetText
            )
          }
          Text(
            text = "Master",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = sheetAccent
          )
        }
      }

      Spacer(modifier = Modifier.height(24.dp))

      // 2. Resolution Selection
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
      ) {
        Icon(
          imageVector = Icons.Default.HighQuality,
          contentDescription = null,
          tint = sheetAccent,
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "Resolution",
          style = MaterialTheme.typography.titleMedium,
          fontWeight = FontWeight.Bold,
          color = sheetText
        )
        Spacer(modifier = Modifier.weight(1f))
        Text(
          text = selectedResolution.badge,
          style = MaterialTheme.typography.labelSmall,
          color = sheetAccent
        )
      }

      Spacer(modifier = Modifier.height(10.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        ExportResolution.entries.forEach { res ->
          val isSelected = selectedResolution == res
          Surface(
            modifier = Modifier
              .weight(1f)
              .clip(RoundedCornerShape(12.dp))
              .clickable { selectedResolution = res }
              .testTag("chip_res_${res.label}"),
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) sheetRaised else sheetBg,
            border = BorderStroke(
              width = if (isSelected) 1.5.dp else 1.dp,
              color = if (isSelected) sheetAccent else sheetBorder
            )
          ) {
            Column(
              modifier = Modifier.padding(vertical = 12.dp, horizontal = 8.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = res.label,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                color = if (isSelected) sheetAccent else sheetText
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "${res.width}x${res.height}",
                style = MaterialTheme.typography.labelSmall,
                fontSize = 9.sp,
                color = if (isSelected) sheetAccent else sheetMuted
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(24.dp))

      // 3. Frame Rate Selection
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
      ) {
        Icon(
          imageVector = Icons.Default.Speed,
          contentDescription = null,
          tint = sheetAccent,
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "Frame Rate",
          style = MaterialTheme.typography.titleMedium,
          fontWeight = FontWeight.Bold,
          color = sheetText
        )
        Spacer(modifier = Modifier.weight(1f))
        Text(
          text = selectedFrameRate.description,
          style = MaterialTheme.typography.labelSmall,
          color = sheetAccent
        )
      }

      Spacer(modifier = Modifier.height(10.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        ExportFrameRate.entries.forEach { fps ->
          val isSelected = selectedFrameRate == fps
          Surface(
            modifier = Modifier
              .weight(1f)
              .clip(RoundedCornerShape(12.dp))
              .clickable { selectedFrameRate = fps }
              .testTag("chip_fps_${fps.label}"),
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) sheetRaised else sheetBg,
            border = BorderStroke(
              width = if (isSelected) 1.5.dp else 1.dp,
              color = if (isSelected) sheetAccent else sheetBorder
            )
          ) {
            Column(
              modifier = Modifier.padding(vertical = 12.dp, horizontal = 8.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = fps.label,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                color = if (isSelected) sheetAccent else sheetText
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = if (fps == ExportFrameRate.FPS_24) "Cinema" else if (fps == ExportFrameRate.FPS_30) "Standard" else "Smooth",
                style = MaterialTheme.typography.labelSmall,
                fontSize = 9.sp,
                color = if (isSelected) sheetAccent else sheetMuted
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(24.dp))

      // 4. Bitrate Slider Section
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
      ) {
        Icon(
          imageVector = Icons.Default.Tune,
          contentDescription = null,
          tint = sheetAccent,
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "Bitrate",
          style = MaterialTheme.typography.titleMedium,
          fontWeight = FontWeight.Bold,
          color = sheetText
        )
        Spacer(modifier = Modifier.weight(1f))
        Text(
          text = "${currentBitrate.label} (${currentBitrate.mbps})",
          style = MaterialTheme.typography.labelMedium,
          fontWeight = FontWeight.Bold,
          color = sheetAccent
        )
      }

      Spacer(modifier = Modifier.height(6.dp))

      // Slider control
      Slider(
        value = bitrateSliderPosition,
        onValueChange = { bitrateSliderPosition = it },
        valueRange = 0f..2f,
        steps = 1,
        colors = SliderDefaults.colors(
          thumbColor = sheetAccent,
          activeTrackColor = sheetAccent,
          inactiveTrackColor = sheetBorder,
          activeTickColor = Color.White,
          inactiveTickColor = sheetMuted
        ),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("slider_bitrate")
      )

      // Bitrate Stop Labels
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        ExportBitrate.entries.forEach { level ->
          val isCurrent = currentBitrate == level
          Text(
            text = level.label,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
            color = if (isCurrent) sheetAccent else sheetMuted,
            modifier = Modifier.clickable {
              bitrateSliderPosition = level.sliderValue
            }
          )
        }
      }

      Spacer(modifier = Modifier.height(28.dp))

      // Estimated File Size Info Badge
      Surface(
        modifier = Modifier
          .fillMaxWidth()
          .testTag("card_estimated_size"),
        shape = RoundedCornerShape(12.dp),
        color = sheetRaised,
        border = BorderStroke(1.dp, sheetBorder)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Column {
            Text(
              text = "Estimated File Size",
              style = MaterialTheme.typography.labelSmall,
              color = sheetMuted
            )
            Text(
              text = "Est. Size: ${calculatedSizeMb}MB",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Black,
              color = sheetAccent,
              modifier = Modifier.testTag("text_estimated_file_size")
            )
          }

          Surface(
            shape = RoundedCornerShape(8.dp),
            color = sheetBg,
            modifier = Modifier.padding(start = 8.dp)
          ) {
            Text(
              text = "${selectedResolution.label} • ${selectedFrameRate.label}",
              style = MaterialTheme.typography.labelSmall,
              fontWeight = FontWeight.SemiBold,
              color = sheetText,
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Error message banner if any
      if (exportResult != null && !exportResult!!.success) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFFFEE2E2),
          border = BorderStroke(1.dp, Color(0xFFEF4444)),
          modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
        ) {
          Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = Color(0xFFDC2626))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = exportResult?.errorMessage ?: "Export failed. Please try again.",
              color = Color(0xFF991B1B),
              fontSize = 12.sp
            )
          }
        }
      }

      // 5. Active Exporting State / Success State / Export Action Button
      if (exportResult?.success == true) {
        // Success Card
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = Color(0xFFF0FDF4),
          border = BorderStroke(1.5.dp, Color(0xFF22C55E)),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("card_export_success")
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Icon(
              imageVector = Icons.Default.CheckCircle,
              contentDescription = null,
              tint = Color(0xFF16A34A),
              modifier = Modifier.size(44.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
              text = "Saved to Gallery!",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF14532D)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = "Saved to: ${exportResult?.displayPath}",
              style = MaterialTheme.typography.bodySmall,
              color = Color(0xFF166534),
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(14.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              // Open in Gallery Button
              Button(
                onClick = {
                  exportResult?.uri?.let { uri ->
                    GalleryExporter.openVideoInGallery(context, uri)
                  }
                },
                modifier = Modifier
                  .weight(1f)
                  .testTag("btn_open_gallery"),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A)),
                shape = RoundedCornerShape(10.dp)
              ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Open Video", fontSize = 12.sp, fontWeight = FontWeight.Bold)
              }

              // Share Video Button
              Button(
                onClick = {
                  exportResult?.uri?.let { uri ->
                    GalleryExporter.shareVideo(context, uri)
                  }
                },
                modifier = Modifier
                  .weight(1f)
                  .testTag("btn_share_exported_video"),
                colors = ButtonDefaults.buttonColors(containerColor = sheetAccent),
                shape = RoundedCornerShape(10.dp)
              ) {
                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.Black)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Share", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Black)
              }

              // Done Button
              Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = sheetRaised),
                shape = RoundedCornerShape(10.dp)
              ) {
                Text("Done", fontSize = 12.sp, color = sheetText, fontWeight = FontWeight.SemiBold)
              }
            }
          }
        }
      } else if (isExporting) {
        // Active Exporting Progress Card
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = sheetRaised,
          border = BorderStroke(1.dp, sheetAccent.copy(alpha = 0.5f)),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("card_export_progress")
        ) {
          Column(modifier = Modifier.padding(16.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                CircularProgressIndicator(
                  modifier = Modifier.size(18.dp),
                  color = sheetAccent,
                  strokeWidth = 2.5.dp
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                  text = "Exporting to Gallery...",
                  style = MaterialTheme.typography.titleSmall,
                  fontWeight = FontWeight.Bold,
                  color = sheetText
                )
              }
              Text(
                text = "${(exportProgress * 100).toInt()}%",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Black,
                color = sheetAccent
              )
            }

            Spacer(modifier = Modifier.height(10.dp))

            LinearProgressIndicator(
              progress = { exportProgress },
              modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp)),
              color = sheetAccent,
              trackColor = sheetBorder
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
              text = exportStage,
              style = MaterialTheme.typography.labelSmall,
              color = sheetMuted
            )
          }
        }
      } else {
        // Standard Glowing 'Export to Gallery' Button
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(
              Brush.horizontalGradient(
                colors = listOf(
                  sheetAccent,
                  sheetAccentDark
                )
              )
            )
            .clickable {
              isExporting = true
              exportResult = null
              scope.launch {
                val res = GalleryExporter.saveVideoToGallery(
                  context = context,
                  tracks = tracks,
                  resolution = selectedResolution,
                  frameRate = selectedFrameRate,
                  bitrate = currentBitrate,
                  onProgress = { p ->
                    exportProgress = p
                    exportStage = when {
                      p < 0.25f -> "Processing visual & audio clips..."
                      p < 0.65f -> "Encoding video frames (${(p * 100).toInt()}%)..."
                      p < 0.90f -> "Saving to Movies/VFXPro in Gallery..."
                      else -> "Finalizing media scan in Gallery..."
                    }
                  }
                )
                isExporting = false
                exportResult = res
                onExportToGallery(
                  selectedResolution,
                  selectedFrameRate,
                  currentBitrate,
                  calculatedSizeMb
                )
              }
            }
            .testTag("btn_export_to_gallery"),
          contentAlignment = Alignment.Center
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
          ) {
            Icon(
              imageVector = Icons.Default.PhotoLibrary,
              contentDescription = null,
              tint = Color.Black,
              modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
              text = "Export to Gallery",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Black,
              letterSpacing = 0.5.sp,
              color = Color.Black
            )
            Spacer(modifier = Modifier.width(8.dp))
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = Color.Black.copy(alpha = 0.2f)
            ) {
              Text(
                text = "${calculatedSizeMb}MB",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}
