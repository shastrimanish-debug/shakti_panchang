package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoGraph
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Step 11: Bezier Graph Editor UI Component
 *
 * Requirements:
 * 1. A header titled 'Graph Editor (Velocity)' with a 'Close' icon.
 * 2. A mock visual representation of a Bezier curve drawn with a Compose Canvas
 *    (Ease In-Out motion curve inside a dark grid background).
 * 3. Two UI slider controls below the graph to represent 'X' and 'Y' coordinate values
 *    of the bezier handles.
 * 4. A row of preset chips/buttons at the bottom: 'Linear', 'Ease In', 'Ease Out', and 'Custom'.
 * 5. Strictly UI layout only.
 */
@Composable
fun BezierGraphEditorSection(
  onClose: () -> Unit,
  modifier: Modifier = Modifier
) {
  var handleX by remember { mutableFloatStateOf(0.42f) }
  var handleY by remember { mutableFloatStateOf(0.85f) }
  var selectedPreset by remember { mutableStateOf("Ease In-Out") }

  val presets = listOf("Linear", "Ease In", "Ease Out", "Custom")

  Card(
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(
      containerColor = Color(0xFF0C101A)
    ),
    border = BorderStroke(1.dp, Color(0xFF243048)),
    modifier = modifier
      .fillMaxWidth()
      .testTag("graph_editor_section")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(14.dp)
    ) {
      // 1. Header titled 'Graph Editor (Velocity)' with 'Close' icon
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .testTag("graph_editor_header"),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = VfxCyan.copy(alpha = 0.15f),
            border = BorderStroke(1.dp, VfxCyan.copy(alpha = 0.5f)),
            modifier = Modifier.size(30.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.ShowChart,
                contentDescription = "Graph Editor Icon",
                tint = VfxCyan,
                modifier = Modifier.size(18.dp)
              )
            }
          }

          Spacer(modifier = Modifier.width(8.dp))

          Column {
            Text(
              text = "Graph Editor (Velocity)",
              fontSize = 13.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White,
              modifier = Modifier.testTag("graph_editor_title")
            )
            Text(
              text = "Cubic Bezier Keyframe Interpolation",
              fontSize = 10.sp,
              color = Color(0xFF94A3B8)
            )
          }
        }

        IconButton(
          onClick = onClose,
          modifier = Modifier
            .size(28.dp)
            .testTag("btn_close_graph_editor")
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close Graph Editor",
            tint = Color(0xFF94A3B8),
            modifier = Modifier.size(18.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // 2. Mock visual representation of Bezier curve inside a dark grid background
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(160.dp)
          .clip(RoundedCornerShape(10.dp))
          .background(Color(0xFF070A10))
          .border(BorderStroke(1.dp, Color(0xFF1E293B)), RoundedCornerShape(10.dp))
          .testTag("bezier_curve_container")
      ) {
        BezierCurveCanvas(
          handleX = handleX,
          handleY = handleY,
          modifier = Modifier
            .fillMaxWidth()
            .height(160.dp)
            .testTag("bezier_curve_canvas")
        )

        // Subtle axis labels
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 6.dp)
            .align(Alignment.BottomCenter),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Text(text = "0.0s (Start)", fontSize = 8.sp, color = Color(0xFF475569), fontFamily = FontFamily.Monospace)
          Text(text = "Interpolation Curve", fontSize = 8.sp, color = VfxCyan.copy(alpha = 0.6f))
          Text(text = "1.0s (End)", fontSize = 8.sp, color = Color(0xFF475569), fontFamily = FontFamily.Monospace)
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 3. Two UI Slider controls for Handle 'X' and 'Y' coordinate values
      Text(
        text = "BEZIER TANGENT HANDLES",
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = Color(0xFF64748B)
      )

      Spacer(modifier = Modifier.height(6.dp))

      // Slider X: Timing / In-Tangent
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = CircleShape,
            color = VfxCyan,
            modifier = Modifier.size(8.dp)
          ) {}
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Handle X (Timing)",
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color.White
          )
        }
        Text(
          text = String.format(java.util.Locale.US, "%.2f", handleX),
          fontSize = 11.sp,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          color = VfxCyan,
          modifier = Modifier.testTag("text_handle_x_val")
        )
      }

      Slider(
        value = handleX,
        onValueChange = {
          handleX = it
          selectedPreset = "Custom"
        },
        valueRange = 0.0f..1.0f,
        colors = SliderDefaults.colors(
          thumbColor = VfxCyan,
          activeTrackColor = VfxCyan,
          inactiveTrackColor = Color(0xFF1E293B)
        ),
        modifier = Modifier
          .fillMaxWidth()
          .height(28.dp)
          .testTag("slider_bezier_handle_x")
      )

      Spacer(modifier = Modifier.height(6.dp))

      // Slider Y: Velocity / Influence
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = CircleShape,
            color = VfxMagenta,
            modifier = Modifier.size(8.dp)
          ) {}
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Handle Y (Velocity)",
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color.White
          )
        }
        Text(
          text = String.format(java.util.Locale.US, "%.2f", handleY),
          fontSize = 11.sp,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          color = VfxMagenta,
          modifier = Modifier.testTag("text_handle_y_val")
        )
      }

      Slider(
        value = handleY,
        onValueChange = {
          handleY = it
          selectedPreset = "Custom"
        },
        valueRange = 0.0f..1.0f,
        colors = SliderDefaults.colors(
          thumbColor = VfxMagenta,
          activeTrackColor = VfxMagenta,
          inactiveTrackColor = Color(0xFF1E293B)
        ),
        modifier = Modifier
          .fillMaxWidth()
          .height(28.dp)
          .testTag("slider_bezier_handle_y")
      )

      Spacer(modifier = Modifier.height(12.dp))

      // 4. Row of preset chips/buttons: 'Linear', 'Ease In', 'Ease Out', and 'Custom'
      Text(
        text = "CURVE PRESETS",
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = Color(0xFF64748B)
      )

      Spacer(modifier = Modifier.height(8.dp))

      Row(
        modifier = Modifier
          .fillMaxWidth()
          .horizontalScroll(rememberScrollState())
          .testTag("preset_chips_row"),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        presets.forEach { preset ->
          val isSelected = selectedPreset == preset
          val tag = "preset_chip_${preset.lowercase().replace(" ", "_")}"

          Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isSelected) Color(0xFF1E293B) else Color(0xFF0F141E),
            border = BorderStroke(
              width = if (isSelected) 1.5.dp else 1.dp,
              color = if (isSelected) VfxCyan else Color(0xFF243048)
            ),
            modifier = Modifier
              .clickable {
                selectedPreset = preset
                when (preset) {
                  "Linear" -> {
                    handleX = 0.50f
                    handleY = 0.50f
                  }
                  "Ease In" -> {
                    handleX = 0.42f
                    handleY = 0.00f
                  }
                  "Ease Out" -> {
                    handleX = 0.00f
                    handleY = 0.58f
                  }
                  "Custom" -> {
                    handleX = 0.42f
                    handleY = 0.85f
                  }
                }
              }
              .testTag(tag)
          ) {
            Text(
              text = preset,
              fontSize = 11.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
              color = if (isSelected) VfxCyan else Color(0xFFCBD5E1),
              modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
            )
          }
        }
      }
    }
  }
}

/**
 * Draws the dark grid background and cubic Bezier curve with control handles.
 */
@Composable
fun BezierCurveCanvas(
  handleX: Float,
  handleY: Float,
  modifier: Modifier = Modifier
) {
  Canvas(modifier = modifier) {
    val w = size.width
    val h = size.height

    val padX = 24.dp.toPx()
    val padY = 24.dp.toPx()

    val graphWidth = w - padX * 2
    val graphHeight = h - padY * 2

    // 1. Dark Grid Background lines
    val gridLinesCount = 5
    for (i in 0..gridLinesCount) {
      val y = padY + (graphHeight / gridLinesCount) * i
      drawLine(
        color = Color(0xFF192233),
        start = Offset(padX, y),
        end = Offset(w - padX, y),
        strokeWidth = 1.dp.toPx()
      )
    }

    val gridColsCount = 6
    for (i in 0..gridColsCount) {
      val x = padX + (graphWidth / gridColsCount) * i
      drawLine(
        color = Color(0xFF192233),
        start = Offset(x, padY),
        end = Offset(x, h - padY),
        strokeWidth = 1.dp.toPx()
      )
    }

    // Baseline reference (diagonal linear reference)
    drawLine(
      color = Color(0xFF263248),
      start = Offset(padX, h - padY),
      end = Offset(w - padX, padY),
      strokeWidth = 1.dp.toPx(),
      pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)
    )

    // 2. Control points and Cubic Bezier Curve (representing Ease In-Out)
    val startPoint = Offset(padX, h - padY)
    val endPoint = Offset(w - padX, padY)

    // Control handles based on handleX and handleY
    val cp1 = Offset(
      x = padX + graphWidth * (handleX * 0.8f + 0.1f),
      y = (h - padY) - graphHeight * (handleY * 0.6f + 0.1f)
    )
    val cp2 = Offset(
      x = padX + graphWidth * (1f - (1f - handleX) * 0.4f),
      y = padY + graphHeight * (1f - handleY) * 0.5f
    )

    // Tangent Handle line 1 (Start to CP1)
    drawLine(
      color = VfxCyan.copy(alpha = 0.6f),
      start = startPoint,
      end = cp1,
      strokeWidth = 1.5.dp.toPx(),
      pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 6f), 0f)
    )
    drawCircle(
      color = VfxCyan,
      radius = 4.dp.toPx(),
      center = cp1
    )

    // Tangent Handle line 2 (End to CP2)
    drawLine(
      color = VfxMagenta.copy(alpha = 0.6f),
      start = endPoint,
      end = cp2,
      strokeWidth = 1.5.dp.toPx(),
      pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 6f), 0f)
    )
    drawCircle(
      color = VfxMagenta,
      radius = 4.dp.toPx(),
      center = cp2
    )

    // Cubic Bezier Curve
    val bezierPath = Path().apply {
      moveTo(startPoint.x, startPoint.y)
      cubicTo(
        cp1.x, cp1.y,
        cp2.x, cp2.y,
        endPoint.x, endPoint.y
      )
    }

    // Curve fill glow
    val fillPath = Path().apply {
      addPath(bezierPath)
      lineTo(endPoint.x, h - padY)
      lineTo(startPoint.x, h - padY)
      close()
    }
    drawPath(
      path = fillPath,
      brush = Brush.verticalGradient(
        colors = listOf(
          VfxCyan.copy(alpha = 0.15f),
          Color.Transparent
        ),
        startY = padY,
        endY = h - padY
      )
    )

    // Curve stroke
    drawPath(
      path = bezierPath,
      brush = Brush.horizontalGradient(
        colors = listOf(VfxCyan, Color(0xFFA855F7), VfxMagenta)
      ),
      style = Stroke(
        width = 3.dp.toPx(),
        cap = StrokeCap.Round
      )
    )

    // Start and End keyframe anchor dots
    drawCircle(
      color = Color.White,
      radius = 5.dp.toPx(),
      center = startPoint
    )
    drawCircle(
      color = Color.White,
      radius = 5.dp.toPx(),
      center = endPoint
    )
  }
}
