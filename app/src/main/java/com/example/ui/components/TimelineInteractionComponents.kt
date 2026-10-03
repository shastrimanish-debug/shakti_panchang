package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CompareArrows
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Transform
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamCardBg
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Step 4: Floating context menu appearing above the selected clip
 * with icons for: 'Split' (scissors), 'Quick Tools' (Speed/Reverse/Freeze), 'Duplicate', and 'Delete'.
 */
@Composable
fun ClipFloatingContextMenu(
  visible: Boolean,
  onSplit: () -> Unit,
  onQuickTools: () -> Unit = {},
  onDuplicate: () -> Unit,
  onDelete: () -> Unit,
  modifier: Modifier = Modifier
) {
  if (visible) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = modifier
        .testTag("clip_floating_context_menu")
        .padding(bottom = 2.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(10.dp),
        color = CreamCardBg,
        border = BorderStroke(1.5.dp, OrangePrimary),
        shadowElevation = 8.dp
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          // 1. Split (Scissors)
          ContextMenuItemButton(
            icon = Icons.Default.ContentCut,
            label = "Split",
            tint = WarmEspresso,
            testTag = "btn_clip_split",
            onClick = onSplit
          )

          // Vertical divider
          Box(
            modifier = Modifier
              .width(1.dp)
              .height(18.dp)
              .background(CreamBorder)
          )

          // 2. Quick Tools (Speed, Reverse, Freeze, Rotate)
          ContextMenuItemButton(
            icon = Icons.Default.Tune,
            label = "Tools",
            tint = OrangePrimary,
            testTag = "btn_clip_quick_tools",
            onClick = onQuickTools
          )

          // Vertical divider
          Box(
            modifier = Modifier
              .width(1.dp)
              .height(18.dp)
              .background(CreamBorder)
          )

          // 3. Duplicate
          ContextMenuItemButton(
            icon = Icons.Default.ContentCopy,
            label = "Duplicate",
            tint = WarmEspresso,
            testTag = "btn_clip_duplicate",
            onClick = onDuplicate
          )

          // Vertical divider
          Box(
            modifier = Modifier
              .width(1.dp)
              .height(18.dp)
              .background(CreamBorder)
          )

          // 4. Delete (Trash)
          ContextMenuItemButton(
            icon = Icons.Default.Delete,
            label = "Delete",
            tint = Color(0xFFEF4444),
            testTag = "btn_clip_delete",
            onClick = onDelete
          )
        }
      }

      // Little downward triangle arrow connecting to the clip below
      Box(
        modifier = Modifier
          .offset(y = (-2).dp)
          .size(8.dp)
          .rotate(45f)
          .background(CreamCardBg)
          .border(0.75.dp, OrangePrimary)
      )
    }
  }
}

@Composable
fun ContextMenuItemButton(
  icon: ImageVector,
  label: String,
  tint: Color,
  testTag: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    onClick = onClick,
    shape = RoundedCornerShape(6.dp),
    color = Color.Transparent,
    modifier = modifier.testTag(testTag)
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(
        imageVector = icon,
        contentDescription = label,
        tint = tint,
        modifier = Modifier.size(15.dp)
      )
      Spacer(modifier = Modifier.width(4.dp))
      Text(
        text = label,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = tint
      )
    }
  }
}

/**
 * Step 4: Visual slot between adjacent clips as a distinct drop-zone to accept transitions.
 */
@Composable
fun TransitionDropZoneSlot(
  slotIndex: Int,
  transitionName: String?,
  transitionDurationSec: Float,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val hasTransition = !transitionName.isNullOrBlank()
  val slotTag = "transition_slot_$slotIndex"

  Box(
    modifier = modifier
      .width(52.dp)
      .height(60.dp)
      .clip(RoundedCornerShape(8.dp))
      .background(
        if (hasTransition) {
          Brush.verticalGradient(
            listOf(
              Color(0xFF1E1B4B),
              Color(0xFF0F172A)
            )
          )
        } else {
          Brush.verticalGradient(
            listOf(
              Color(0xFF0B0F19),
              Color(0xFF070A10)
            )
          )
        }
      )
      .border(
        width = if (hasTransition) 1.5.dp else 1.dp,
        color = if (hasTransition) VfxMagenta else Color(0xFF334155),
        shape = RoundedCornerShape(8.dp)
      )
      .clickable(onClick = onClick)
      .testTag(slotTag),
    contentAlignment = Alignment.Center
  ) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center,
      modifier = Modifier.padding(2.dp)
    ) {
      if (hasTransition) {
        // Active applied transition indicator
        Surface(
          shape = CircleShape,
          color = VfxMagenta.copy(alpha = 0.25f),
          border = BorderStroke(1.dp, VfxMagenta),
          modifier = Modifier.size(24.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.CompareArrows,
              contentDescription = transitionName,
              tint = VfxMagenta,
              modifier = Modifier.size(15.dp)
            )
          }
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
          text = transitionName!!.take(8).uppercase(),
          fontSize = 8.sp,
          fontWeight = FontWeight.Black,
          color = Color.White,
          maxLines = 1
        )

        Text(
          text = "${transitionDurationSec}s",
          fontSize = 7.sp,
          fontFamily = FontFamily.Monospace,
          color = VfxMagenta
        )
      } else {
        // Empty distinct drop-zone to accept transitions
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xFF1E293B).copy(alpha = 0.5f),
          border = BorderStroke(1.dp, Color(0xFF475569)),
          modifier = Modifier.size(22.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.AutoAwesome,
              contentDescription = "Add Transition",
              tint = Color(0xFF94A3B8),
              modifier = Modifier.size(13.dp)
            )
          }
        }

        Spacer(modifier = Modifier.height(3.dp))

        Text(
          text = "TRANS",
          fontSize = 8.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF64748B),
          letterSpacing = 0.5.sp
        )
      }
    }
  }
}
