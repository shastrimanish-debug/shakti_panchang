package com.example.ui.components

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CompareArrows
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.East
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material.icons.filled.Transform
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.runtime.mutableFloatStateOf
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Data representation for a transition applied between adjacent clips.
 */
data class MockTransition(
  val id: String,
  val name: String,
  val description: String,
  val icon: ImageVector,
  val previewGradient: List<Color>
)

val AvailableTransitions = listOf(
  MockTransition(
    id = "cross_dissolve",
    name = "Cross Dissolve",
    description = "Smoothly blend incoming and outgoing frames with optical alpha cross-fade",
    icon = Icons.Default.Transform,
    previewGradient = listOf(Color(0xFF0284C7), Color(0xFF7C3AED))
  ),
  MockTransition(
    id = "fade_to_black",
    name = "Fade to Black",
    description = "Cinematic dip into deep black before rising into the next scene",
    icon = Icons.Default.DarkMode,
    previewGradient = listOf(Color(0xFF1E293B), Color(0xFF000000), Color(0xFF1E293B))
  ),
  MockTransition(
    id = "directional_wipe",
    name = "Directional Wipe",
    description = "Crisp horizontal geometric wipe reveal moving left-to-right",
    icon = Icons.Default.East,
    previewGradient = listOf(Color(0xFFEC4899), Color(0xFF06B6D4))
  ),
  MockTransition(
    id = "zoom_blur",
    name = "Zoom Blur",
    description = "Dynamic kinetic zoom push with directional optical motion blur",
    icon = Icons.Default.ZoomIn,
    previewGradient = listOf(Color(0xFFF59E0B), Color(0xFFEF4444))
  )
)

/**
 * Step 4: Add Transition Picker Panel
 * Appears when tapping one of the transition slots between adjacent clips.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransitionPickerBottomSheet(
  slotIndex: Int,
  fromClipTitle: String,
  toClipTitle: String,
  currentTransitionName: String?,
  onSelectTransition: (name: String, durationSec: Float) -> Unit,
  onRemoveTransition: () -> Unit,
  onDismiss: () -> Unit,
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = Color(0xFF0F141E),
    contentColor = MaterialTheme.colorScheme.onSurface,
    dragHandle = {
      Box(
        modifier = Modifier
          .padding(top = 10.dp, bottom = 4.dp)
          .size(width = 38.dp, height = 4.dp)
          .clip(CircleShape)
          .background(Color(0xFF334155))
      )
    },
    modifier = modifier.testTag("transition_picker_sheet")
  ) {
    TransitionPickerContent(
      slotIndex = slotIndex,
      fromClipTitle = fromClipTitle,
      toClipTitle = toClipTitle,
      currentTransitionName = currentTransitionName,
      onSelectTransition = onSelectTransition,
      onRemoveTransition = onRemoveTransition,
      onDismiss = onDismiss
    )
  }
}

@Composable
fun TransitionPickerContent(
  slotIndex: Int,
  fromClipTitle: String,
  toClipTitle: String,
  currentTransitionName: String?,
  onSelectTransition: (name: String, durationSec: Float) -> Unit,
  onRemoveTransition: () -> Unit,
  onDismiss: () -> Unit,
  modifier: Modifier = Modifier
) {
  var selectedTransitionId by remember {
    mutableStateOf(
      AvailableTransitions.find { it.name == currentTransitionName }?.id ?: "cross_dissolve"
    )
  }
  var selectedDuration by remember { mutableFloatStateOf(0.5f) }

  Column(
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 18.dp)
      .padding(bottom = 32.dp)
      .verticalScroll(rememberScrollState())
      .testTag("transition_picker_content")
  ) {
      // Header: Transition Slot info & Close button
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .testTag("transition_picker_header"),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.weight(1f)
        ) {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = VfxCyan.copy(alpha = 0.15f),
            border = BorderStroke(1.dp, VfxCyan.copy(alpha = 0.5f)),
            modifier = Modifier.size(38.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.CompareArrows,
                contentDescription = null,
                tint = VfxCyan,
                modifier = Modifier.size(20.dp)
              )
            }
          }

          Spacer(modifier = Modifier.width(10.dp))

          Column {
            Text(
              text = "Add Transition",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "Slot #${slotIndex + 1} • Between Clips",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        IconButton(
          onClick = onDismiss,
          modifier = Modifier.testTag("btn_close_transition_picker")
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close Picker",
            tint = MaterialTheme.colorScheme.onSurface
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Adjacent Clips Connection Preview Card
      Surface(
        shape = RoundedCornerShape(10.dp),
        color = Color(0xFF131824),
        border = BorderStroke(1.dp, Color(0xFF222B3D)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Text(
            text = fromClipTitle,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF38BDF8),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f)
          )

          Surface(
            shape = RoundedCornerShape(4.dp),
            color = Color(0xFF1E293B),
            border = BorderStroke(1.dp, VfxCyan.copy(alpha = 0.6f)),
            modifier = Modifier.padding(horizontal = 8.dp)
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = null,
                tint = VfxCyan,
                modifier = Modifier.size(12.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "BRIDGE",
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = VfxCyan
              )
            }
          }

          Text(
            text = toClipTitle,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFFA855F7),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Section Header: Available Transitions
      Text(
        text = "SELECT TRANSITION STYLE",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = VfxCyan
      )

      Spacer(modifier = Modifier.height(10.dp))

      // List of Mock Transitions
      Column(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        AvailableTransitions.forEach { transition ->
          val isSelected = (transition.id == selectedTransitionId)
          TransitionOptionCard(
            transition = transition,
            isSelected = isSelected,
            onClick = { selectedTransitionId = transition.id }
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Duration Selector (0.3s, 0.5s, 1.0s, 1.5s)
      Text(
        text = "TRANSITION DURATION",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = VfxMagenta
      )

      Spacer(modifier = Modifier.height(8.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        listOf(0.3f, 0.5f, 1.0f, 1.5f).forEach { duration ->
          val isDurationSelected = (selectedDuration == duration)
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isDurationSelected) VfxMagenta.copy(alpha = 0.2f) else Color(0xFF131824),
            border = BorderStroke(
              1.dp,
              if (isDurationSelected) VfxMagenta else Color(0xFF222B3D)
            ),
            onClick = { selectedDuration = duration },
            modifier = Modifier
              .weight(1f)
              .testTag("duration_${duration}s")
          ) {
            Column(
              modifier = Modifier.padding(vertical = 8.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = "${duration}s",
                fontSize = 13.sp,
                fontWeight = if (isDurationSelected) FontWeight.Bold else FontWeight.Medium,
                fontFamily = FontFamily.Monospace,
                color = if (isDurationSelected) Color.White else Color(0xFF94A3B8)
              )
              Text(
                text = "${(duration * 30).toInt()} frames",
                fontSize = 9.sp,
                color = if (isDurationSelected) VfxMagenta else Color(0xFF64748B)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Action Buttons: Apply Transition & Remove Transition
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        if (currentTransitionName != null) {
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = Color(0xFF2B161B),
            border = BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.5f)),
            onClick = {
              onRemoveTransition()
              onDismiss()
            },
            modifier = Modifier.testTag("btn_remove_transition")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Delete,
                contentDescription = "Remove Transition",
                tint = Color(0xFFEF4444),
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "Remove",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFEF4444)
              )
            }
          }
        }

        Button(
          onClick = {
            val selected = AvailableTransitions.find { it.id == selectedTransitionId }
            if (selected != null) {
              onSelectTransition(selected.name, selectedDuration)
            }
            onDismiss()
          },
          colors = ButtonDefaults.buttonColors(
            containerColor = VfxCyan,
            contentColor = Color.Black
          ),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1f)
            .height(44.dp)
            .testTag("btn_apply_transition")
        ) {
          Icon(
            imageVector = Icons.Default.Check,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Apply Transition",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
          )
        }
      }
    }
  }

/**
 * Individual Transition Option Card in the picker.
 */
@Composable
fun TransitionOptionCard(
  transition: MockTransition,
  isSelected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val tag = "transition_item_${transition.id}"
  Surface(
    shape = RoundedCornerShape(10.dp),
    color = if (isSelected) Color(0xFF162032) else Color(0xFF131824),
    border = BorderStroke(
      width = if (isSelected) 1.5.dp else 1.dp,
      color = if (isSelected) VfxCyan else Color(0xFF222B3D)
    ),
    onClick = onClick,
    modifier = modifier
      .fillMaxWidth()
      .testTag(tag)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      // Visual gradient thumbnail
      Box(
        modifier = Modifier
          .size(44.dp)
          .clip(RoundedCornerShape(8.dp))
          .background(Brush.horizontalGradient(transition.previewGradient))
          .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(8.dp)),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = transition.icon,
          contentDescription = null,
          tint = Color.White,
          modifier = Modifier.size(22.dp)
        )
      }

      Spacer(modifier = Modifier.width(12.dp))

      Column(modifier = Modifier.weight(1f)) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Text(
            text = transition.name,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = if (isSelected) VfxCyan else MaterialTheme.colorScheme.onSurface
          )
          if (isSelected) {
            Surface(
              shape = RoundedCornerShape(4.dp),
              color = VfxCyan.copy(alpha = 0.2f)
            ) {
              Text(
                text = "SELECTED",
                fontSize = 8.sp,
                fontWeight = FontWeight.Black,
                color = VfxCyan,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
          text = transition.description,
          fontSize = 11.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis
        )
      }

      Spacer(modifier = Modifier.width(8.dp))

      // Selection checkmark or radio dot
      Surface(
        shape = CircleShape,
        color = if (isSelected) VfxCyan else Color(0xFF1E293B),
        border = BorderStroke(1.dp, if (isSelected) VfxCyan else Color(0xFF334155)),
        modifier = Modifier.size(22.dp)
      ) {
        if (isSelected) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.Check,
              contentDescription = null,
              tint = Color.Black,
              modifier = Modifier.size(14.dp)
            )
          }
        }
      }
    }
  }
}
