package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AspectRatio
import androidx.compose.material.icons.filled.BlurOn
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.Crop
import androidx.compose.material.icons.filled.Gradient
import androidx.compose.material.icons.filled.PhotoSizeSelectActual
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
 * Aspect Ratio option model.
 */
data class CanvasAspectRatioOption(
  val id: String,
  val label: String,
  val platform: String,
  val icon: ImageVector,
  val boxWidthDp: Int,
  val boxHeightDp: Int
)

/**
 * Step 14: Canvas & Format Bottom Sheet UI
 *
 * Requirements:
 * 1. Top Bar titled 'Canvas Format' with 'Close' icon button.
 * 2. Horizontally scrollable row of Aspect Ratio cards with icons:
 *    'Fit', '9:16 (Reels/TikTok)', '16:9 (YouTube)', '1:1 (Instagram)', '4:5'.
 * 3. Below the ratios, 'Background Style' section with three toggle chips:
 *    'Color', 'Gradient', and 'Blur'.
 * 4. Strictly UI layout only.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CanvasFormatBottomSheet(
  onDismiss: () -> Unit,
  onApplyFormat: (aspectRatio: String, bgStyle: String) -> Unit = { _, _ -> },
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = CreamSurface,
    contentColor = WarmEspresso,
    dragHandle = {
      Box(
        modifier = Modifier
          .padding(top = 10.dp, bottom = 4.dp)
          .size(width = 38.dp, height = 4.dp)
          .clip(CircleShape)
          .background(WarmMuted.copy(alpha = 0.4f))
      )
    },
    modifier = modifier.testTag("canvas_format_sheet")
  ) {
    CanvasFormatContent(
      onDismiss = onDismiss,
      onApplyFormat = { ratio, style ->
        onApplyFormat(ratio, style)
        onDismiss()
      }
    )
  }
}

@Composable
fun CanvasFormatContent(
  onDismiss: () -> Unit,
  onApplyFormat: (aspectRatio: String, bgStyle: String) -> Unit = { _, _ -> },
  modifier: Modifier = Modifier
) {
  var selectedRatioId by remember { mutableStateOf("9_16") }
  var selectedBgStyle by remember { mutableStateOf("Gradient") }
  var selectedColorIndex by remember { mutableStateOf(0) }
  var selectedGradientIndex by remember { mutableStateOf(0) }

  val ratioOptions = listOf(
    CanvasAspectRatioOption(
      id = "fit",
      label = "Fit",
      platform = "Original",
      icon = Icons.Default.AspectRatio,
      boxWidthDp = 24,
      boxHeightDp = 24
    ),
    CanvasAspectRatioOption(
      id = "9_16",
      label = "9:16",
      platform = "Reels / TikTok",
      icon = Icons.Default.Smartphone,
      boxWidthDp = 16,
      boxHeightDp = 28
    ),
    CanvasAspectRatioOption(
      id = "16_9",
      label = "16:9",
      platform = "YouTube / TV",
      icon = Icons.Default.Tv,
      boxWidthDp = 28,
      boxHeightDp = 16
    ),
    CanvasAspectRatioOption(
      id = "1_1",
      label = "1:1",
      platform = "Instagram Post",
      icon = Icons.Default.PhotoSizeSelectActual,
      boxWidthDp = 22,
      boxHeightDp = 22
    ),
    CanvasAspectRatioOption(
      id = "4_5",
      label = "4:5",
      platform = "Portrait Feed",
      icon = Icons.Default.Crop,
      boxWidthDp = 20,
      boxHeightDp = 25
    )
  )

  val bgStyles = listOf("Color", "Gradient", "Blur")

  val solidColors = listOf(
    Color(0xFFFFFFFF),
    Color(0xFFFFF3E0),
    Color(0xFFFFCC80),
    Color(0xFFFF8A65),
    Color(0xFF424242),
    Color(0xFF1E1E1E)
  )

  val gradients = listOf(
    listOf(Color(0xFFFF8A65), Color(0xFFFFB74D), Color(0xFFFFE082)),
    listOf(Color(0xFFFF5722), Color(0xFFFF9800), Color(0xFFFFC107)),
    listOf(Color(0xFFFFA726), Color(0xFFFF7043), Color(0xFFF4511E)),
    listOf(Color(0xFFFFD54F), Color(0xFFFFB74D), Color(0xFFFF8A65))
  )

  Column(
    modifier = modifier
      .fillMaxWidth()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 6.dp)
      .padding(bottom = 30.dp)
      .testTag("canvas_format_content")
  ) {
    // 1. Top Bar titled 'Canvas Format' with 'Close' icon button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("canvas_format_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = OrangeContainer,
          border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.4f)),
          modifier = Modifier.size(38.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.Crop,
              contentDescription = "Canvas Format Icon",
              tint = OrangePrimary,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "Canvas Format",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = WarmEspresso,
            modifier = Modifier.testTag("canvas_format_title")
          )
          Text(
            text = "Aspect Ratio & Social Media Export Canvas",
            fontSize = 11.sp,
            color = WarmMuted
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_canvas_format")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close Canvas Format",
          tint = WarmEspresso
        )
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 2. Horizontally scrollable row of Aspect Ratio cards
    Text(
      text = "ASPECT RATIO",
      fontSize = 10.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp,
      color = WarmMuted
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(
      modifier = Modifier
        .fillMaxWidth()
        .horizontalScroll(rememberScrollState())
        .testTag("aspect_ratio_row"),
      horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      ratioOptions.forEach { option ->
        val isSelected = selectedRatioId == option.id
        val cardTag = "ratio_card_${option.id}"

        Card(
          onClick = { selectedRatioId = option.id },
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(
            containerColor = if (isSelected) OrangeContainer else CreamSurfaceVariant
          ),
          border = BorderStroke(
            width = if (isSelected) 1.5.dp else 1.dp,
            color = if (isSelected) OrangePrimary else CreamBorder
          ),
          modifier = Modifier
            .width(115.dp)
            .testTag(cardTag)
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            // Visual wireframe box previewing the ratio proportion
            Box(
              modifier = Modifier
                .height(34.dp)
                .fillMaxWidth(),
              contentAlignment = Alignment.Center
            ) {
              Box(
                modifier = Modifier
                  .size(width = option.boxWidthDp.dp, height = option.boxHeightDp.dp)
                  .clip(RoundedCornerShape(3.dp))
                  .background(if (isSelected) OrangePrimary.copy(alpha = 0.25f) else CreamSurface)
                  .border(
                    BorderStroke(
                      1.5.dp,
                      if (isSelected) OrangePrimary else CreamBorder
                    ),
                    RoundedCornerShape(3.dp)
                  )
              )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
              text = option.label,
              fontSize = 13.sp,
              fontWeight = FontWeight.Bold,
              color = if (isSelected) OrangeOnContainer else WarmEspresso
            )

            Text(
              text = option.platform,
              fontSize = 9.sp,
              color = if (isSelected) OrangePrimaryDark else WarmMuted,
              maxLines = 1
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(20.dp))

    // 3. Background Style section with three toggle chips: 'Color', 'Gradient', 'Blur'
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "BACKGROUND STYLE",
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = WarmMuted
      )

      Text(
        text = "Pillarbox / Letterbox Fill",
        fontSize = 9.sp,
        fontFamily = FontFamily.Monospace,
        color = WarmMuted
      )
    }

    Spacer(modifier = Modifier.height(8.dp))

    // Row of 3 toggle chips: 'Color', 'Gradient', 'Blur'
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("bg_style_chips_row"),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      bgStyles.forEach { style ->
        val isSelected = selectedBgStyle == style
        val chipTag = "chip_bg_${style.lowercase()}"
        val icon = when (style) {
          "Color" -> Icons.Default.ColorLens
          "Gradient" -> Icons.Default.Gradient
          else -> Icons.Default.BlurOn
        }

        Surface(
          shape = RoundedCornerShape(8.dp),
          color = if (isSelected) OrangeContainer else CreamSurfaceVariant,
          border = BorderStroke(
            width = if (isSelected) 1.5.dp else 1.dp,
            color = if (isSelected) OrangePrimary else CreamBorder
          ),
          modifier = Modifier
            .weight(1f)
            .clickable { selectedBgStyle = style }
            .testTag(chipTag)
        ) {
          Row(
            modifier = Modifier.padding(vertical = 9.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = icon,
              contentDescription = style,
              tint = if (isSelected) OrangePrimary else WarmMuted,
              modifier = Modifier.size(15.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = style,
              fontSize = 12.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
              color = if (isSelected) OrangeOnContainer else WarmMuted
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(14.dp))

    // Dynamic swatch palette based on active background style
    Card(
      shape = RoundedCornerShape(12.dp),
      colors = CardDefaults.cardColors(containerColor = CreamSurfaceVariant),
      border = BorderStroke(1.dp, CreamBorder),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("bg_palette_card")
    ) {
      Column(modifier = Modifier.padding(14.dp)) {
        when (selectedBgStyle) {
          "Color" -> {
            Text(
              text = "SOLID MATTE PALETTE",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = WarmMuted
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              solidColors.forEachIndexed { index, color ->
                val isColorSelected = selectedColorIndex == index
                Box(
                  modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(color)
                    .border(
                      BorderStroke(
                        if (isColorSelected) 2.5.dp else 1.dp,
                        if (isColorSelected) OrangePrimary else CreamBorder
                      ),
                      CircleShape
                    )
                    .clickable { selectedColorIndex = index },
                  contentAlignment = Alignment.Center
                ) {
                  if (isColorSelected) {
                    Icon(
                      imageVector = Icons.Default.Check,
                      contentDescription = null,
                      tint = if (index < 2) WarmEspresso else Color.White,
                      modifier = Modifier.size(16.dp)
                    )
                  }
                }
              }
            }
          }
          "Gradient" -> {
            Text(
              text = "AMBIENT GRADIENT PRESETS",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = WarmMuted
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              gradients.forEachIndexed { index, gradColors ->
                val isGradSelected = selectedGradientIndex == index
                Box(
                  modifier = Modifier
                    .weight(1f)
                    .height(34.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Brush.horizontalGradient(gradColors))
                    .border(
                      BorderStroke(
                        if (isGradSelected) 2.5.dp else 1.dp,
                        if (isGradSelected) OrangePrimary else Color.Transparent
                      ),
                      RoundedCornerShape(8.dp)
                    )
                    .clickable { selectedGradientIndex = index },
                  contentAlignment = Alignment.Center
                ) {
                  if (isGradSelected) {
                    Icon(
                      imageVector = Icons.Default.Check,
                      contentDescription = null,
                      tint = Color.White,
                      modifier = Modifier.size(16.dp)
                    )
                  }
                }
              }
            }
          }
          "Blur" -> {
            Row(
              modifier = Modifier.fillMaxWidth(),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.BlurOn,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.width(10.dp))
              Column {
                Text(
                  text = "Gaussian Video Blur",
                  fontSize = 12.sp,
                  fontWeight = FontWeight.Bold,
                  color = WarmEspresso
                )
                Text(
                  text = "Mirrors background with real-time 40px diffusion",
                  fontSize = 10.sp,
                  color = WarmMuted
                )
              }
            }
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(18.dp))

    // Apply Button
    Button(
      onClick = {
        onApplyFormat(selectedRatioId, selectedBgStyle)
      },
      shape = RoundedCornerShape(10.dp),
      colors = ButtonDefaults.buttonColors(
        containerColor = OrangePrimary,
        contentColor = Color.White
      ),
      modifier = Modifier
        .fillMaxWidth()
        .height(44.dp)
        .testTag("btn_apply_canvas_format")
    ) {
      Icon(
        imageVector = Icons.Default.Check,
        contentDescription = null,
        modifier = Modifier.size(16.dp)
      )
      Spacer(modifier = Modifier.width(6.dp))
      Text(
        text = "Set Canvas Format",
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold
      )
    }
  }
}
