package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AcUnit
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Flip
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.RotateRight
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.VolumeMute
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
 * VFX Pro Quick Edit Studio Toolbox:
 * Speed curves, Reverse, Freeze frame, Rotate/Flip, Extract audio, Volume, Split at playhead.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickEditToolsBottomSheet(
  clip: MockVideoClip,
  currentPositionMs: Long,
  onSplitAtPlayhead: (clipId: String, playheadMs: Long) -> Unit,
  onSetSpeed: (clipId: String, speed: Float, curve: String) -> Unit,
  onReverse: (clipId: String) -> Unit,
  onFreeze: (clipId: String, playheadMs: Long) -> Unit,
  onRotate: (clipId: String) -> Unit,
  onFlipHorizontal: (clipId: String) -> Unit,
  onExtractAudio: (clipId: String) -> Unit,
  onSetVolume: (clipId: String, volume: Float) -> Unit,
  onDuplicate: (clipId: String) -> Unit,
  onDelete: (clipId: String) -> Unit,
  onDismiss: () -> Unit,
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  var currentSpeed by remember(clip.id) { mutableFloatStateOf(clip.speed) }
  var selectedCurve by remember(clip.id) { mutableStateOf(clip.speedCurve) }
  var preservePitch by remember { mutableStateOf(true) }
  var volumeValue by remember { mutableFloatStateOf(1.0f) }

  val curvePresets = listOf(
    "Standard" to 1.0f,
    "Bullet" to 2.5f,
    "Montage" to 1.8f,
    "Hero" to 0.4f,
    "Flash In" to 3.0f,
    "Slow-Mo" to 0.5f
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = CreamSurface,
    contentColor = WarmEspresso,
    dragHandle = {
      Box(
        modifier = Modifier
          .padding(vertical = 10.dp)
          .size(width = 38.dp, height = 4.dp)
          .clip(CircleShape)
          .background(WarmPeachAccent)
      )
    },
    modifier = modifier.testTag("quick_edit_tools_sheet")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 6.dp)
        .verticalScroll(rememberScrollState())
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "Quick Clip Toolbox",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = WarmEspresso
          )
          Text(
            text = "${clip.title} • ${String.format("%.1f", clip.durationSec)}s",
            fontSize = 11.sp,
            color = OrangePrimaryDark
          )
        }

        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = WarmMuted
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 1. Quick 1-Tap Action Grid
      Text(
        text = "INSTANT EDIT ACTIONS",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = WarmMuted
      )

      Spacer(modifier = Modifier.height(8.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        QuickActionButton(
          icon = Icons.Default.ContentCut,
          label = "Split Playhead",
          modifier = Modifier.weight(1f),
          onClick = {
            onSplitAtPlayhead(clip.id, currentPositionMs)
            onDismiss()
          }
        )

        QuickActionButton(
          icon = Icons.Default.SwapHoriz,
          label = if (clip.isReversed) "Reversed ✓" else "Reverse",
          isActive = clip.isReversed,
          modifier = Modifier.weight(1f),
          onClick = { onReverse(clip.id) }
        )

        QuickActionButton(
          icon = Icons.Default.AcUnit,
          label = "Freeze (3s)",
          modifier = Modifier.weight(1f),
          onClick = {
            onFreeze(clip.id, currentPositionMs)
            onDismiss()
          }
        )

        QuickActionButton(
          icon = Icons.Default.MusicNote,
          label = "Extract Audio",
          modifier = Modifier.weight(1f),
          onClick = {
            onExtractAudio(clip.id)
            onDismiss()
          }
        )
      }

      Spacer(modifier = Modifier.height(8.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        QuickActionButton(
          icon = Icons.Default.RotateRight,
          label = "Rotate 90°",
          modifier = Modifier.weight(1f),
          onClick = { onRotate(clip.id) }
        )

        QuickActionButton(
          icon = Icons.Default.Flip,
          label = if (clip.isFlippedHorizontal) "Flipped ✓" else "Flip H",
          isActive = clip.isFlippedHorizontal,
          modifier = Modifier.weight(1f),
          onClick = { onFlipHorizontal(clip.id) }
        )

        QuickActionButton(
          icon = Icons.Default.ContentCopy,
          label = "Duplicate",
          modifier = Modifier.weight(1f),
          onClick = {
            onDuplicate(clip.id)
            onDismiss()
          }
        )

        QuickActionButton(
          icon = Icons.Default.Delete,
          label = "Delete",
          isDestructive = true,
          modifier = Modifier.weight(1f),
          onClick = {
            onDelete(clip.id)
            onDismiss()
          }
        )
      }

      Spacer(modifier = Modifier.height(18.dp))

      // 2. Speed Ramping & Optical Curve Presets (VFX Pro Feature)
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = CreamCardBg,
        border = BorderStroke(1.dp, CreamBorder),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.Speed,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "Speed Ramping & Velocity Curves",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = WarmEspresso
              )
            }
            Surface(
              shape = RoundedCornerShape(4.dp),
              color = OrangeContainer
            ) {
              Text(
                text = "${String.format("%.2f", currentSpeed)}x",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = OrangePrimaryDark,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(10.dp))

          // Curve Presets Row
          LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            items(curvePresets) { (name, spd) ->
              val isSelected = selectedCurve == name
              Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (isSelected) OrangePrimary else CreamSurfaceVariant,
                border = BorderStroke(1.dp, if (isSelected) OrangePrimaryDark else CreamBorder),
                modifier = Modifier.clickable {
                  selectedCurve = name
                  currentSpeed = spd
                  onSetSpeed(clip.id, spd, name)
                }
              ) {
                Column(
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                  horizontalAlignment = Alignment.CenterHorizontally
                ) {
                  Text(
                    text = name,
                    fontSize = 11.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) Color.White else WarmEspresso
                  )
                  Text(
                    text = "${spd}x",
                    fontSize = 9.sp,
                    color = if (isSelected) Color.White.copy(alpha = 0.8f) else WarmMuted
                  )
                }
              }
            }
          }

          Spacer(modifier = Modifier.height(12.dp))

          // Linear Speed Slider (0.2x to 8.0x)
          Slider(
            value = currentSpeed,
            onValueChange = {
              currentSpeed = it
              selectedCurve = "Custom"
              onSetSpeed(clip.id, it, "Custom")
            },
            valueRange = 0.2f..8.0f,
            colors = SliderDefaults.colors(
              thumbColor = OrangePrimary,
              activeTrackColor = OrangePrimary,
              inactiveTrackColor = WarmPeachAccent
            )
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("0.2x (Ultra Slow)", fontSize = 9.sp, color = WarmMuted)
            Text("1.0x (Normal)", fontSize = 9.sp, color = WarmMuted)
            Text("8.0x (Hyperlapse)", fontSize = 9.sp, color = WarmMuted)
          }

          Spacer(modifier = Modifier.height(8.dp))

          // Pitch Preserve Switch
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Preserve Voice Pitch (No Chipmunk)",
              fontSize = 11.sp,
              color = WarmEspresso
            )
            Switch(
              checked = preservePitch,
              onCheckedChange = { preservePitch = it },
              colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = OrangePrimary
              )
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 3. Clip Volume & Boost
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = CreamCardBg,
        border = BorderStroke(1.dp, CreamBorder),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = if (volumeValue == 0f) Icons.Default.VolumeMute else Icons.Default.VolumeUp,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "Clip Audio Volume",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = WarmEspresso
              )
            }
            Text(
              text = "${(volumeValue * 100).toInt()}%",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = OrangePrimaryDark
            )
          }

          Slider(
            value = volumeValue,
            onValueChange = {
              volumeValue = it
              onSetVolume(clip.id, it)
            },
            valueRange = 0.0f..2.0f,
            colors = SliderDefaults.colors(
              thumbColor = OrangePrimary,
              activeTrackColor = OrangePrimary,
              inactiveTrackColor = WarmPeachAccent
            )
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("0% (Muted)", fontSize = 9.sp, color = WarmMuted)
            Text("100% (Original)", fontSize = 9.sp, color = WarmMuted)
            Text("200% (Boosted)", fontSize = 9.sp, color = WarmMuted)
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))
    }
  }
}

@Composable
private fun QuickActionButton(
  icon: ImageVector,
  label: String,
  modifier: Modifier = Modifier,
  isActive: Boolean = false,
  isDestructive: Boolean = false,
  onClick: () -> Unit
) {
  Surface(
    shape = RoundedCornerShape(10.dp),
    color = when {
      isDestructive -> Color(0xFFEF4444).copy(alpha = 0.12f)
      isActive -> OrangeContainer
      else -> CreamSurfaceVariant
    },
    border = BorderStroke(
      1.dp,
      when {
        isDestructive -> Color(0xFFEF4444).copy(alpha = 0.4f)
        isActive -> OrangePrimary
        else -> CreamBorder
      }
    ),
    modifier = modifier.clickable(onClick = onClick)
  ) {
    Column(
      modifier = Modifier.padding(vertical = 10.dp, horizontal = 4.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Icon(
        imageVector = icon,
        contentDescription = label,
        tint = when {
          isDestructive -> Color(0xFFEF4444)
          isActive -> OrangePrimaryDark
          else -> WarmEspresso
        },
        modifier = Modifier.size(20.dp)
      )
      Spacer(modifier = Modifier.height(4.dp))
      Text(
        text = label,
        fontSize = 10.sp,
        fontWeight = FontWeight.SemiBold,
        color = when {
          isDestructive -> Color(0xFFEF4444)
          isActive -> OrangePrimaryDark
          else -> WarmEspresso
        },
        maxLines = 1
      )
    }
  }
}
