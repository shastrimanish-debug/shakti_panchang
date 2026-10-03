package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.Keyframe
import com.example.MockVideoClip
import com.example.ui.theme.CreamBackground
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamCardBg
import com.example.ui.theme.CreamSurface
import com.example.ui.theme.CreamSurfaceVariant
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.WarmMuted
import com.example.ui.theme.WarmPeachAccent

/**
 * Step 23: Pure Kotlin linear interpolation between keyframes for a property at the given timeMs.
 */
fun interpolateKeyframeValue(keyframes: List<Keyframe>, timeMs: Long, defaultValue: Float): Float {
  if (keyframes.isEmpty()) return defaultValue
  val sorted = keyframes.sortedBy { it.timeMs }
  if (timeMs <= sorted.first().timeMs) return sorted.first().value
  if (timeMs >= sorted.last().timeMs) return sorted.last().value
  for (i in 0 until sorted.size - 1) {
    val k1 = sorted[i]
    val k2 = sorted[i + 1]
    if (timeMs in k1.timeMs..k2.timeMs) {
      val span = (k2.timeMs - k1.timeMs).toFloat().coerceAtLeast(1f)
      val fraction = (timeMs - k1.timeMs).toFloat() / span
      return when (k2.easing) {
        "EaseIn" -> k1.value + (k2.value - k1.value) * (fraction * fraction)
        "EaseOut" -> k1.value + (k2.value - k1.value) * (1f - (1f - fraction) * (1f - fraction))
        "EaseInOut" -> {
          val curved = if (fraction < 0.5f) 2f * fraction * fraction else 1f - (-2f * fraction + 2f) * (-2f * fraction + 2f) / 2f
          k1.value + (k2.value - k1.value) * curved
        }
        else -> k1.value + (k2.value - k1.value) * fraction
      }
    }
  }
  return defaultValue
}

/**
 * Step 23: Checks if the current timeMs matches any keyframe within a tolerance window (200ms).
 */
fun isAtKeyframe(keyframes: List<Keyframe>, timeMs: Long, toleranceMs: Long = 200L): Boolean {
  return keyframes.any { kotlin.math.abs(it.timeMs - timeMs) <= toleranceMs }
}

/**
 * Step 3 & 23: Properties & Keyframe Inspector Panel
 * Shown as a sliding bottom sheet when a video clip in the timeline is tapped.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PropertiesInspectorBottomSheet(
  clip: MockVideoClip,
  currentPositionMs: Long = 0L,
  onToggleKeyframe: (property: String, timeMs: Long, currentValue: Float) -> Unit = { _, _, _ -> },
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
          .background(WarmPeachAccent)
      )
    },
    modifier = modifier.testTag("properties_inspector_sheet")
  ) {
    PropertiesInspectorContent(
      clip = clip,
      currentPositionMs = currentPositionMs,
      onToggleKeyframe = onToggleKeyframe,
      onClose = onDismiss
    )
  }
}

@Composable
fun PropertiesInspectorContent(
  clip: MockVideoClip,
  currentPositionMs: Long = 0L,
  onToggleKeyframe: (property: String, timeMs: Long, currentValue: Float) -> Unit = { _, _, _ -> },
  onClose: () -> Unit,
  modifier: Modifier = Modifier
) {
  // Keyframes per property from clip.transformKeyframes
  val scaleKeyframes = clip.transformKeyframes["Scale"] ?: emptyList()
  val posXKeyframes = clip.transformKeyframes["Position X"] ?: emptyList()
  val posYKeyframes = clip.transformKeyframes["Position Y"] ?: emptyList()
  val opacityKeyframes = clip.transformKeyframes["Opacity"] ?: emptyList()

  // Step 23: Check if currentPositionMs lands on or near a keyframe
  val isScaleOnKeyframe = isAtKeyframe(scaleKeyframes, currentPositionMs)
  val isPosXOnKeyframe = isAtKeyframe(posXKeyframes, currentPositionMs)
  val isPosYOnKeyframe = isAtKeyframe(posYKeyframes, currentPositionMs)
  val isOpacityOnKeyframe = isAtKeyframe(opacityKeyframes, currentPositionMs)

  val anyOnKeyframe = isScaleOnKeyframe || isPosXOnKeyframe || isPosYOnKeyframe || isOpacityOnKeyframe

  // Transform property states - initialized with interpolated value if keyframes present
  var scaleValue by remember(clip.id) {
    mutableFloatStateOf(interpolateKeyframeValue(scaleKeyframes, currentPositionMs, 1.0f))
  }
  var positionX by remember(clip.id) {
    mutableFloatStateOf(interpolateKeyframeValue(posXKeyframes, currentPositionMs, 0f))
  }
  var positionY by remember(clip.id) {
    mutableFloatStateOf(interpolateKeyframeValue(posYKeyframes, currentPositionMs, 0f))
  }
  var opacityValue by remember(clip.id) {
    mutableFloatStateOf(interpolateKeyframeValue(opacityKeyframes, currentPositionMs, 100f))
  }

  // Step 23: Dynamically reflect interpolated values when playhead moves (currentPositionMs changes)
  LaunchedEffect(currentPositionMs, clip.id, clip.transformKeyframes) {
    if (scaleKeyframes.isNotEmpty()) {
      scaleValue = interpolateKeyframeValue(scaleKeyframes, currentPositionMs, scaleValue)
    }
    if (posXKeyframes.isNotEmpty()) {
      positionX = interpolateKeyframeValue(posXKeyframes, currentPositionMs, positionX)
    }
    if (posYKeyframes.isNotEmpty()) {
      positionY = interpolateKeyframeValue(posYKeyframes, currentPositionMs, positionY)
    }
    if (opacityKeyframes.isNotEmpty()) {
      opacityValue = interpolateKeyframeValue(opacityKeyframes, currentPositionMs, opacityValue)
    }
  }

  val totalKeyframeCount = scaleKeyframes.size + posXKeyframes.size + posYKeyframes.size + opacityKeyframes.size

  // Blend mode state (mocked, defaults to "Normal")
  var selectedBlendMode by remember(clip.id) { mutableStateOf("Normal") }
  var isBlendMenuExpanded by remember { mutableStateOf(false) }

  // Bezier Graph Editor state (Step 11)
  var showGraphEditor by remember(clip.id) { mutableStateOf(false) }

  val availableBlendModes = listOf(
    "Normal",
    "Screen",
    "Multiply",
    "Overlay",
    "Add / Linear Dodge",
    "Color Dodge",
    "Darken",
    "Soft Light"
  )

  val scrollState = rememberScrollState()

  Column(
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 18.dp)
      .padding(bottom = 32.dp)
      .verticalScroll(scrollState)
  ) {
    // 1. Header showing the selected clip name
    InspectorHeader(
      clip = clip,
      isGraphOpen = showGraphEditor,
      onToggleGraph = { showGraphEditor = !showGraphEditor },
      onReset = {
        scaleValue = 1.0f
        positionX = 0f
        positionY = 0f
        opacityValue = 100f
        selectedBlendMode = "Normal"
      },
      onClose = onClose
    )

    Spacer(modifier = Modifier.height(14.dp))

    // Section Title
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "TRANSFORM & MOTION",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = OrangePrimaryDark
      )

      Row(verticalAlignment = Alignment.CenterVertically) {
        // Active Keyframes Count Badge - turns red when currently parked on a keyframe
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = when {
            anyOnKeyframe -> Color(0xFFEF4444).copy(alpha = 0.25f)
            totalKeyframeCount > 0 -> OrangeContainer
            else -> CreamSurfaceVariant
          },
          border = BorderStroke(
            1.dp,
            when {
              anyOnKeyframe -> Color(0xFFEF4444)
              totalKeyframeCount > 0 -> OrangePrimary
              else -> CreamBorder
            }
          )
        ) {
          Text(
            text = when {
              anyOnKeyframe -> "♦ AT KEYFRAME"
              totalKeyframeCount > 0 -> "$totalKeyframeCount KEYFRAMES"
              else -> "♦ KEYFRAMES"
            },
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = when {
              anyOnKeyframe -> Color(0xFFEF4444)
              totalKeyframeCount > 0 -> OrangePrimaryDark
              else -> WarmMuted
            },
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }

        Spacer(modifier = Modifier.width(6.dp))

        // 'Graph' icon button in transform header
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = if (showGraphEditor) OrangeContainer else CreamSurfaceVariant,
          border = BorderStroke(1.dp, if (showGraphEditor) OrangePrimary else CreamBorder),
          modifier = Modifier
            .clickable { showGraphEditor = !showGraphEditor }
            .testTag("btn_open_graph_editor")
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = Icons.Default.ShowChart,
              contentDescription = "Graph Editor",
              tint = if (showGraphEditor) OrangePrimary else WarmMuted,
              modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(3.dp))
            Text(
              text = "Graph",
              fontSize = 9.sp,
              fontWeight = FontWeight.Bold,
              color = if (showGraphEditor) OrangePrimaryDark else WarmEspresso
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // 2. Transform Sliders with Diamond-Shaped 'Add Keyframe' Icon Buttons
    Surface(
      shape = RoundedCornerShape(12.dp),
      color = CreamCardBg,
      border = BorderStroke(1.dp, CreamBorder),
      modifier = Modifier.fillMaxWidth()
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(14.dp)
      ) {
        // Property: Scale (0.1x to 3.0x)
        TransformPropertyRow(
          label = "Scale",
          formattedValue = String.format(java.util.Locale.US, "%.2fx", scaleValue),
          value = scaleValue,
          valueRange = 0.1f..3.0f,
          isKeyframed = scaleKeyframes.isNotEmpty(),
          isOnKeyframe = isScaleOnKeyframe,
          keyframeCount = scaleKeyframes.size,
          onToggleKeyframe = {
            onToggleKeyframe("Scale", currentPositionMs, scaleValue)
          },
          onValueChange = {
            scaleValue = it
            if (isScaleOnKeyframe) {
              onToggleKeyframe("Scale", currentPositionMs, it)
            }
          },
          propertyTag = "scale"
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Property: Position X (-500 to +500 px)
        TransformPropertyRow(
          label = "Position X",
          formattedValue = "${if (positionX > 0) "+" else ""}${positionX.toInt()} px",
          value = positionX,
          valueRange = -500f..500f,
          isKeyframed = posXKeyframes.isNotEmpty(),
          isOnKeyframe = isPosXOnKeyframe,
          keyframeCount = posXKeyframes.size,
          onToggleKeyframe = {
            onToggleKeyframe("Position X", currentPositionMs, positionX)
          },
          onValueChange = {
            positionX = it
            if (isPosXOnKeyframe) {
              onToggleKeyframe("Position X", currentPositionMs, it)
            }
          },
          propertyTag = "pos_x"
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Property: Position Y (-500 to +500 px)
        TransformPropertyRow(
          label = "Position Y",
          formattedValue = "${if (positionY > 0) "+" else ""}${positionY.toInt()} px",
          value = positionY,
          valueRange = -500f..500f,
          isKeyframed = posYKeyframes.isNotEmpty(),
          isOnKeyframe = isPosYOnKeyframe,
          keyframeCount = posYKeyframes.size,
          onToggleKeyframe = {
            onToggleKeyframe("Position Y", currentPositionMs, positionY)
          },
          onValueChange = {
            positionY = it
            if (isPosYOnKeyframe) {
              onToggleKeyframe("Position Y", currentPositionMs, it)
            }
          },
          propertyTag = "pos_y"
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Property: Opacity (0% to 100%)
        TransformPropertyRow(
          label = "Opacity",
          formattedValue = "${opacityValue.toInt()}%",
          value = opacityValue,
          valueRange = 0f..100f,
          isKeyframed = opacityKeyframes.isNotEmpty(),
          isOnKeyframe = isOpacityOnKeyframe,
          keyframeCount = opacityKeyframes.size,
          onToggleKeyframe = {
            onToggleKeyframe("Opacity", currentPositionMs, opacityValue)
          },
          onValueChange = {
            opacityValue = it
            if (isOpacityOnKeyframe) {
              onToggleKeyframe("Opacity", currentPositionMs, it)
            }
          },
          propertyTag = "opacity"
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Open Bezier Graph Editor toggle banner
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = if (showGraphEditor) OrangeContainer else CreamSurfaceVariant,
          border = BorderStroke(1.dp, if (showGraphEditor) OrangePrimary else CreamBorder),
          modifier = Modifier
            .fillMaxWidth()
            .clickable { showGraphEditor = !showGraphEditor }
            .testTag("btn_graph_editor_banner")
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.ShowChart,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = if (showGraphEditor) "Collapse Velocity Graph" else "Keyframe Velocity Graph Editor",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = if (showGraphEditor) OrangePrimaryDark else WarmEspresso
              )
            }
            Text(
              text = if (showGraphEditor) "HIDE" else "EDIT CURVE",
              fontSize = 9.sp,
              fontWeight = FontWeight.ExtraBold,
              letterSpacing = 0.6.sp,
              color = OrangePrimary
            )
          }
        }
      }
    }

    // Bezier Graph Editor Animated Section (Step 11)
    AnimatedVisibility(
      visible = showGraphEditor,
      enter = fadeIn() + expandVertically(),
      exit = fadeOut() + shrinkVertically()
    ) {
      Column {
        Spacer(modifier = Modifier.height(12.dp))
        BezierGraphEditorSection(
          onClose = { showGraphEditor = false }
        )
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 3. 'Blend Mode' Dropdown Button (Mocked, showing 'Normal')
    Text(
      text = "COMPOSITING & BLEND",
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp,
      color = OrangePrimaryDark
    )

    Spacer(modifier = Modifier.height(8.dp))

    BlendModeDropdownSelector(
      selectedMode = selectedBlendMode,
      availableModes = availableBlendModes,
      isExpanded = isBlendMenuExpanded,
      onExpandChange = { isBlendMenuExpanded = it },
      onModeSelect = {
        selectedBlendMode = it
        isBlendMenuExpanded = false
      }
    )
  }
}

/**
 * Header showing selected clip name, visual format badge, reset and close buttons.
 */
@Composable
fun InspectorHeader(
  clip: MockVideoClip,
  onReset: () -> Unit,
  onClose: () -> Unit,
  isGraphOpen: Boolean = false,
  onToggleGraph: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  Row(
    modifier = modifier
      .fillMaxWidth()
      .testTag("inspector_header"),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier.weight(1f)
    ) {
      Surface(
        shape = RoundedCornerShape(8.dp),
        color = clip.primaryColor.copy(alpha = 0.2f),
        border = BorderStroke(1.dp, clip.primaryColor),
        modifier = Modifier.size(38.dp)
      ) {
        Box(contentAlignment = Alignment.Center) {
          Icon(
            imageVector = Icons.Default.Movie,
            contentDescription = null,
            tint = clip.primaryColor,
            modifier = Modifier.size(20.dp)
          )
        }
      }

      Spacer(modifier = Modifier.width(10.dp))

      Column {
        Text(
          text = clip.title,
          style = MaterialTheme.typography.titleMedium,
          fontWeight = FontWeight.Bold,
          color = MaterialTheme.colorScheme.onSurface,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis,
          modifier = Modifier.testTag("inspector_clip_name")
        )
        Text(
          text = "Selected Clip • ${clip.durationSec}s • V1 Track",
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }

    Row(verticalAlignment = Alignment.CenterVertically) {
      if (onToggleGraph != null) {
        IconButton(
          onClick = onToggleGraph,
          modifier = Modifier.testTag("btn_header_graph_icon")
        ) {
          Icon(
            imageVector = Icons.Default.ShowChart,
            contentDescription = "Graph Editor",
            tint = if (isGraphOpen) OrangePrimary else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(20.dp)
          )
        }
      }

      IconButton(
        onClick = onReset,
        modifier = Modifier.testTag("btn_reset_transforms")
      ) {
        Icon(
          imageVector = Icons.Default.RestartAlt,
          contentDescription = "Reset Transforms",
          tint = MaterialTheme.colorScheme.onSurfaceVariant,
          modifier = Modifier.size(20.dp)
        )
      }

      IconButton(
        onClick = onClose,
        modifier = Modifier.testTag("btn_close_inspector")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close Inspector",
          tint = MaterialTheme.colorScheme.onSurface,
          modifier = Modifier.size(22.dp)
        )
      }
    }
  }
}

/**
 * Row representing one transform property with:
 * - Label & current numeric value
 * - Diamond-shaped 'Add Keyframe' icon button
 * - M3 UI Slider
 */
@Composable
fun TransformPropertyRow(
  label: String,
  formattedValue: String,
  value: Float,
  valueRange: ClosedFloatingPointRange<Float>,
  isKeyframed: Boolean,
  isOnKeyframe: Boolean = false,
  keyframeCount: Int = 0,
  onToggleKeyframe: () -> Unit,
  onValueChange: (Float) -> Unit,
  propertyTag: String,
  modifier: Modifier = Modifier
) {
  val activeColor = when {
    isOnKeyframe -> Color(0xFFEF4444) // Red when landed on a keyframe
    isKeyframed -> OrangePrimaryDark   // Orange when animated
    else -> MaterialTheme.colorScheme.primary
  }

  Column(modifier = modifier.fillMaxWidth()) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      // Property Label & Status Badge
      Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
          text = label,
          fontSize = 13.sp,
          fontWeight = FontWeight.SemiBold,
          color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = formattedValue,
          fontSize = 12.sp,
          fontWeight = FontWeight.Medium,
          fontFamily = FontFamily.Monospace,
          color = activeColor
        )

        if (isOnKeyframe) {
          Spacer(modifier = Modifier.width(6.dp))
          Surface(
            shape = RoundedCornerShape(3.dp),
            color = Color(0xFFEF4444).copy(alpha = 0.25f),
            border = BorderStroke(0.5.dp, Color(0xFFEF4444))
          ) {
            Text(
              text = "KEYFRAME",
              fontSize = 8.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFFEF4444),
              modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
            )
          }
        } else if (isKeyframed && keyframeCount > 0) {
          Spacer(modifier = Modifier.width(6.dp))
          Surface(
            shape = RoundedCornerShape(3.dp),
            color = OrangeContainer,
            border = BorderStroke(0.5.dp, OrangePrimary.copy(alpha = 0.5f))
          ) {
            Text(
              text = "$keyframeCount KF",
              fontSize = 8.sp,
              fontWeight = FontWeight.Bold,
              color = OrangePrimaryDark,
              modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
            )
          }
        }
      }

      // Diamond-shaped 'Add Keyframe' icon button (Step 23)
      DiamondKeyframeButton(
        isKeyframed = isKeyframed,
        isOnKeyframe = isOnKeyframe,
        onClick = onToggleKeyframe,
        propertyName = label,
        testTag = "keyframe_btn_$propertyTag"
      )
    }

    // UI Slider for the transform property
    Slider(
      value = value,
      onValueChange = onValueChange,
      valueRange = valueRange,
      colors = SliderDefaults.colors(
        thumbColor = if (isOnKeyframe) Color(0xFFEF4444) else OrangePrimary,
        activeTrackColor = if (isOnKeyframe) Color(0xFFEF4444) else OrangePrimary,
        inactiveTrackColor = WarmPeachAccent
      ),
      modifier = Modifier
        .fillMaxWidth()
        .height(34.dp)
        .testTag("slider_$propertyTag")
    )
  }
}

/**
 * Step 23: Diamond-shaped 'Add Keyframe' icon button.
 * Renders an explicit Diamond icon button next to the Transform sliders.
 * When the playhead lands on a keyframe (isOnKeyframe = true), the diamond turns vibrant red and active!
 */
@Composable
fun DiamondKeyframeButton(
  isKeyframed: Boolean,
  isOnKeyframe: Boolean = false,
  onClick: () -> Unit,
  propertyName: String,
  testTag: String,
  modifier: Modifier = Modifier
) {
  val activeColor = when {
    isOnKeyframe -> Color(0xFFEF4444) // Vibrant red when playhead lands on keyframe
    isKeyframed -> OrangePrimaryDark   // Orange when property has keyframes
    else -> WarmMuted                 // Warm muted inactive
  }

  Surface(
    shape = RoundedCornerShape(6.dp),
    color = when {
      isOnKeyframe -> Color(0xFFEF4444).copy(alpha = 0.28f)
      isKeyframed -> OrangeContainer
      else -> CreamSurfaceVariant
    },
    border = BorderStroke(
      width = if (isOnKeyframe) 1.5.dp else 1.dp,
      color = if (isOnKeyframe) Color(0xFFEF4444) else if (isKeyframed) OrangePrimary else CreamBorder
    ),
    onClick = onClick,
    modifier = modifier
      .size(36.dp)
      .testTag(testTag)
  ) {
    Box(
      contentAlignment = Alignment.Center,
      modifier = Modifier.padding(4.dp)
    ) {
      Icon(
        imageVector = Icons.Default.Diamond,
        contentDescription = if (isOnKeyframe) "At Keyframe for $propertyName (Click to remove)" else "Add Keyframe for $propertyName",
        tint = activeColor,
        modifier = Modifier.size(20.dp)
      )
    }
  }
}

/**
 * 'Blend Mode' dropdown button (mocked, showing 'Normal' by default)
 */
@Composable
fun BlendModeDropdownSelector(
  selectedMode: String,
  availableModes: List<String>,
  isExpanded: Boolean,
  onExpandChange: (Boolean) -> Unit,
  onModeSelect: (String) -> Unit,
  modifier: Modifier = Modifier
) {
  Box(modifier = modifier.fillMaxWidth()) {
    Surface(
      shape = RoundedCornerShape(10.dp),
      color = Color(0xFF131824),
      border = BorderStroke(1.dp, Color(0xFF222B3D)),
      onClick = { onExpandChange(true) },
      modifier = Modifier
        .fillMaxWidth()
        .testTag("blend_mode_dropdown")
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 14.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "Blend Mode",
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          Spacer(modifier = Modifier.height(2.dp))
          Text(
            text = selectedMode,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = if (selectedMode == "Normal") MaterialTheme.colorScheme.onSurface else OrangePrimary
          )
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(4.dp),
            color = CreamSurfaceVariant,
            modifier = Modifier.padding(end = 6.dp)
          ) {
            Text(
              text = if (selectedMode == "Normal") "DEFAULT" else "COMPOSITED",
              fontSize = 9.sp,
              fontWeight = FontWeight.SemiBold,
              color = WarmMuted,
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            )
          }

          Icon(
            imageVector = Icons.Default.ArrowDropDown,
            contentDescription = "Expand blend modes",
            tint = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    }

    DropdownMenu(
      expanded = isExpanded,
      onDismissRequest = { onExpandChange(false) },
      modifier = Modifier
        .background(CreamSurface)
        .border(1.dp, CreamBorder, RoundedCornerShape(8.dp))
        .testTag("blend_mode_menu")
    ) {
      availableModes.forEach { mode ->
        val isSelected = mode == selectedMode
        DropdownMenuItem(
          text = {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = mode,
                color = if (isSelected) OrangePrimary else WarmEspresso,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
              )
              if (isSelected) {
                Icon(
                  imageVector = Icons.Default.Check,
                  contentDescription = "Selected",
                  tint = OrangePrimary,
                  modifier = Modifier.size(16.dp)
                )
              }
            }
          },
          onClick = { onModeSelect(mode) },
          modifier = Modifier.testTag("blend_mode_item_${mode.lowercase().replace(" ", "_").replace("/", "_")}")
        )
      }
    }
  }
}
