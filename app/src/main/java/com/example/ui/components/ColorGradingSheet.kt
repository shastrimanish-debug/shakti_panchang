package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.Brightness6
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.Contrast
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import kotlin.math.roundToInt

/**
 * Step 5: Color Grading UI Panel
 * Lightweight Modal Bottom Sheet containing sliders for:
 * - Brightness
 * - Contrast
 * - Saturation
 * - Temperature
 * And a 'Reset All' button at the top.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ColorGradingBottomSheet(
  onDismiss: () -> Unit,
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
    modifier = modifier.testTag("color_grading_sheet")
  ) {
    ColorGradingContent(onDismiss = onDismiss)
  }
}

@Composable
fun ColorGradingContent(
  onDismiss: () -> Unit,
  modifier: Modifier = Modifier
) {
  // Slider states with neutral defaults (0)
  var brightness by remember { mutableFloatStateOf(0f) }
  var contrast by remember { mutableFloatStateOf(0f) }
  var saturation by remember { mutableFloatStateOf(0f) }
  var temperature by remember { mutableFloatStateOf(0f) }

  val resetAll = {
    brightness = 0f
    contrast = 0f
    saturation = 0f
    temperature = 0f
  }

  Column(
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 18.dp)
      .padding(bottom = 32.dp)
      .verticalScroll(rememberScrollState())
      .testTag("color_grading_content")
  ) {
    // Top Bar: Header with Icon, Title, and 'Reset All' text button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("color_grading_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.weight(1f)
      ) {
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = OrangeContainer,
          border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.5f)),
          modifier = Modifier.size(38.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.ColorLens,
              contentDescription = null,
              tint = OrangePrimary,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "Color Grading",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = WarmEspresso
          )
          Text(
            text = "Primary Color & Tone Balance",
            style = MaterialTheme.typography.bodySmall,
            color = WarmMuted
          )
        }
      }

      Row(verticalAlignment = Alignment.CenterVertically) {
        // 'Reset All' text button at the top of the sheet
        TextButton(
          onClick = resetAll,
          modifier = Modifier.testTag("btn_reset_color_grading")
        ) {
          Icon(
            imageVector = Icons.Default.RestartAlt,
            contentDescription = null,
            tint = OrangePrimaryDark,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = "Reset All",
            color = OrangePrimaryDark,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp
          )
        }

        IconButton(
          onClick = onDismiss,
          modifier = Modifier.testTag("btn_close_color_grading")
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close Color Grading",
            tint = WarmEspresso
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(18.dp))

    // 1. Brightness Slider
    ColorSliderRow(
      label = "Brightness",
      value = brightness,
      onValueChange = { brightness = it },
      range = -100f..100f,
      icon = Icons.Default.Brightness6,
      accentColor = OrangePrimary,
      sliderTestTag = "slider_brightness",
      valueFormat = { v -> if (v > 0) "+${v.roundToInt()}" else "${v.roundToInt()}" }
    )

    Spacer(modifier = Modifier.height(14.dp))

    // 2. Contrast Slider
    ColorSliderRow(
      label = "Contrast",
      value = contrast,
      onValueChange = { contrast = it },
      range = -100f..100f,
      icon = Icons.Default.Contrast,
      accentColor = Color(0xFFD97706),
      sliderTestTag = "slider_contrast",
      valueFormat = { v -> if (v > 0) "+${v.roundToInt()}" else "${v.roundToInt()}" }
    )

    Spacer(modifier = Modifier.height(14.dp))

    // 3. Saturation Slider
    ColorSliderRow(
      label = "Saturation",
      value = saturation,
      onValueChange = { saturation = it },
      range = -100f..100f,
      icon = Icons.Default.Palette,
      accentColor = Color(0xFFEA580C),
      sliderTestTag = "slider_saturation",
      valueFormat = { v -> if (v > 0) "+${v.roundToInt()}" else "${v.roundToInt()}" }
    )

    Spacer(modifier = Modifier.height(14.dp))

    // 4. Temperature Slider
    ColorSliderRow(
      label = "Temperature",
      value = temperature,
      onValueChange = { temperature = it },
      range = -100f..100f,
      icon = Icons.Default.Thermostat,
      accentColor = if (temperature >= 0) OrangePrimary else Color(0xFF0284C7),
      sliderTestTag = "slider_temperature",
      valueFormat = { v ->
        val rounded = v.roundToInt()
        when {
          rounded > 0 -> "Warm (+$rounded)"
          rounded < 0 -> "Cool ($rounded)"
          else -> "Neutral (0)"
        }
      }
    )

    Spacer(modifier = Modifier.height(24.dp))

    // Done / Close Action Button
    Button(
      onClick = onDismiss,
      colors = ButtonDefaults.buttonColors(
        containerColor = OrangePrimary,
        contentColor = Color.White
      ),
      shape = RoundedCornerShape(10.dp),
      modifier = Modifier
        .fillMaxWidth()
        .height(44.dp)
        .testTag("btn_done_color_grading")
    ) {
      Text(
        text = "Done",
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp
      )
    }
  }
}

/**
 * Individual Slider Row Component for Color Grading.
 */
@Composable
private fun ColorSliderRow(
  label: String,
  value: Float,
  onValueChange: (Float) -> Unit,
  range: ClosedFloatingPointRange<Float>,
  icon: ImageVector,
  accentColor: Color,
  sliderTestTag: String,
  valueFormat: (Float) -> String,
  modifier: Modifier = Modifier
) {
  Surface(
    shape = RoundedCornerShape(10.dp),
    color = CreamSurfaceVariant,
    border = BorderStroke(1.dp, CreamBorder),
    modifier = modifier.fillMaxWidth()
  ) {
    Column(modifier = Modifier.padding(12.dp)) {
      // Label and Current Value Display
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = icon,
            contentDescription = null,
            tint = accentColor,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = label,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = WarmEspresso
          )
        }

        Surface(
          shape = RoundedCornerShape(4.dp),
          color = CreamSurface,
          border = BorderStroke(0.5.dp, accentColor.copy(alpha = 0.4f))
        ) {
          Text(
            text = valueFormat(value),
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = accentColor,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(4.dp))

      // Slider Control
      Slider(
        value = value,
        onValueChange = onValueChange,
        valueRange = range,
        colors = SliderDefaults.colors(
          thumbColor = accentColor,
          activeTrackColor = accentColor,
          inactiveTrackColor = CreamBorder
        ),
        modifier = Modifier
          .fillMaxWidth()
          .testTag(sliderTestTag)
      )
    }
  }
}
