package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CenterFocusStrong
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.CropSquare
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.PictureInPicture
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Model for PIP Overlay Tool cards.
 */
data class PipToolOption(
  val id: String,
  val title: String,
  val description: String,
  val icon: ImageVector,
  val accentColor: Color
)

/**
 * Step 16: PIP (Picture-in-Picture) & Overlays Bottom Sheet UI
 *
 * Requirements:
 * 1. Top Bar titled 'PIP & Overlays' with a 'Close' icon button.
 * 2. Large, prominent 'Add New Overlay' action button at the top of the sheet.
 * 3. 2x2 grid of advanced overlay tool cards below it:
 *    - 'Chroma Key (Green Screen)'
 *    - 'Blending Modes'
 *    - 'Masking'
 *    - 'Motion Tracking'
 * 4. Below the grid, mock horizontally scrollable 'Blend Mode' chip row:
 *    (e.g., 'Normal', 'Screen', 'Multiply', 'Overlay').
 * 5. Strictly UI layout only.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PipOverlaysBottomSheet(
  onDismiss: () -> Unit,
  onAddNewOverlay: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = Color(0xFF0C1019),
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
    modifier = modifier.testTag("pip_overlays_sheet")
  ) {
    PipOverlaysContent(
      onDismiss = onDismiss,
      onAddNewOverlay = {
        onAddNewOverlay()
        onDismiss()
      }
    )
  }
}

@Composable
fun PipOverlaysContent(
  onDismiss: () -> Unit,
  onAddNewOverlay: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  var selectedToolId by remember { mutableStateOf("chroma_key") }
  var selectedBlendMode by remember { mutableStateOf("Screen") }

  val pipTools = listOf(
    PipToolOption(
      id = "chroma_key",
      title = "Chroma Key (Green Screen)",
      description = "Neural color keying & green spill suppression",
      icon = Icons.Default.ColorLens,
      accentColor = Color(0xFF10B981) // Emerald Green
    ),
    PipToolOption(
      id = "blending_modes",
      title = "Blending Modes",
      description = "Screen, multiply & luminosity composites",
      icon = Icons.Default.Layers,
      accentColor = Color(0xFF38BDF8) // Cyan/Sky
    ),
    PipToolOption(
      id = "masking",
      title = "Masking",
      description = "Linear, radial, rectangle & split alpha masks",
      icon = Icons.Default.CropSquare,
      accentColor = Color(0xFFF59E0B) // Amber
    ),
    PipToolOption(
      id = "motion_tracking",
      title = "Motion Tracking",
      description = "Pin overlay graphics to moving subjects",
      icon = Icons.Default.CenterFocusStrong,
      accentColor = Color(0xFFEC4899) // Pink / Magenta
    )
  )

  val blendModes = listOf(
    "Normal",
    "Screen",
    "Multiply",
    "Overlay",
    "Darken",
    "Lighten",
    "Color Dodge",
    "Soft Light"
  )

  Column(
    modifier = modifier
      .fillMaxWidth()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 6.dp)
      .padding(bottom = 30.dp)
      .testTag("pip_overlays_content")
  ) {
    // 1. Top Bar titled 'PIP & Overlays' with a 'Close' icon button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("pip_overlays_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFF0284C7).copy(alpha = 0.20f),
          border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.5f)),
          modifier = Modifier.size(38.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.PictureInPicture,
              contentDescription = "PIP & Overlays Icon",
              tint = Color(0xFF38BDF8),
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "PIP & Overlays",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.testTag("pip_overlays_title")
          )
          Text(
            text = "Multi-Layer Video Compositing & VFX",
            fontSize = 11.sp,
            color = Color(0xFF94A3B8)
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_pip_sheet")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close PIP Sheet",
          tint = MaterialTheme.colorScheme.onSurface
        )
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 2. Large, prominent 'Add New Overlay' action button at the top of the sheet
    Button(
      onClick = onAddNewOverlay,
      shape = RoundedCornerShape(12.dp),
      colors = ButtonDefaults.buttonColors(
        containerColor = Color(0xFF0369A1)
      ),
      border = BorderStroke(
        width = 1.5.dp,
        brush = Brush.horizontalGradient(
          listOf(Color(0xFF38BDF8), Color(0xFF818CF8), Color(0xFFC084FC))
        )
      ),
      modifier = Modifier
        .fillMaxWidth()
        .height(52.dp)
        .testTag("btn_add_new_overlay")
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
      ) {
        Surface(
          shape = CircleShape,
          color = Color.White.copy(alpha = 0.2f),
          modifier = Modifier.size(28.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.Add,
              contentDescription = null,
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
          }
        }
        Spacer(modifier = Modifier.width(10.dp))
        Column {
          Text(
            text = "Add New Overlay",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
          Text(
            text = "Insert video clip or graphic on secondary track",
            fontSize = 10.sp,
            color = Color(0xFFE0F2FE)
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(20.dp))

    // 3. 2x2 grid of advanced overlay tool cards:
    // 'Chroma Key (Green Screen)', 'Blending Modes', 'Masking', 'Motion Tracking'
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "OVERLAY COMPOSITING TOOLS",
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = Color(0xFF64748B)
      )

      Text(
        text = "Pro Studio Suite",
        fontSize = 9.sp,
        fontFamily = FontFamily.Monospace,
        color = Color(0xFF38BDF8)
      )
    }

    Spacer(modifier = Modifier.height(8.dp))

    // Row 1 of 2x2 Grid
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      PipToolCard(
        tool = pipTools[0], // Chroma Key
        isSelected = selectedToolId == pipTools[0].id,
        onClick = { selectedToolId = pipTools[0].id },
        modifier = Modifier
          .weight(1f)
          .testTag("card_pip_chroma_key")
      )

      PipToolCard(
        tool = pipTools[1], // Blending Modes
        isSelected = selectedToolId == pipTools[1].id,
        onClick = { selectedToolId = pipTools[1].id },
        modifier = Modifier
          .weight(1f)
          .testTag("card_pip_blending_modes")
      )
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Row 2 of 2x2 Grid
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      PipToolCard(
        tool = pipTools[2], // Masking
        isSelected = selectedToolId == pipTools[2].id,
        onClick = { selectedToolId = pipTools[2].id },
        modifier = Modifier
          .weight(1f)
          .testTag("card_pip_masking")
      )

      PipToolCard(
        tool = pipTools[3], // Motion Tracking
        isSelected = selectedToolId == pipTools[3].id,
        onClick = { selectedToolId = pipTools[3].id },
        modifier = Modifier
          .weight(1f)
          .testTag("card_pip_motion_tracking")
      )
    }

    Spacer(modifier = Modifier.height(20.dp))

    // 4. Mock horizontally scrollable 'Blend Mode' chip row (Normal, Screen, Multiply, Overlay, etc.)
    Card(
      shape = RoundedCornerShape(12.dp),
      colors = CardDefaults.cardColors(containerColor = Color(0xFF101726)),
      border = BorderStroke(1.dp, Color(0xFF1E293B)),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("pip_blend_modes_section")
    ) {
      Column(modifier = Modifier.padding(14.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "LAYER BLENDING MODE",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            color = Color(0xFF64748B)
          )

          Text(
            text = "Active: $selectedBlendMode",
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF38BDF8)
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
          modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .testTag("pip_blend_modes_row"),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          blendModes.forEach { mode ->
            val isModeSelected = selectedBlendMode == mode
            val chipTag = "chip_blend_${mode.lowercase().replace(" ", "_")}"

            Surface(
              shape = RoundedCornerShape(8.dp),
              color = if (isModeSelected) Color(0xFF1E293B) else Color(0xFF0F172A),
              border = BorderStroke(
                width = if (isModeSelected) 1.5.dp else 1.dp,
                color = if (isModeSelected) Color(0xFF38BDF8) else Color(0xFF263248)
              ),
              modifier = Modifier
                .clickable { selectedBlendMode = mode }
                .testTag(chipTag)
            ) {
              Text(
                text = mode,
                fontSize = 11.sp,
                fontWeight = if (isModeSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isModeSelected) Color.White else Color(0xFF94A3B8),
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
              )
            }
          }
        }
      }
    }
  }
}

/**
 * Overlay Tool Card for the 2x2 Grid.
 */
@Composable
fun PipToolCard(
  tool: PipToolOption,
  isSelected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    onClick = onClick,
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(
      containerColor = if (isSelected) Color(0xFF131B2A) else Color(0xFF0B1019)
    ),
    border = BorderStroke(
      width = if (isSelected) 1.5.dp else 1.dp,
      color = if (isSelected) tool.accentColor else Color(0xFF1E293B)
    ),
    modifier = modifier.fillMaxWidth()
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = if (isSelected) tool.accentColor.copy(alpha = 0.2f) else Color(0xFF1E293B),
          modifier = Modifier.size(32.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = tool.icon,
              contentDescription = tool.title,
              tint = if (isSelected) tool.accentColor else Color(0xFF94A3B8),
              modifier = Modifier.size(18.dp)
            )
          }
        }

        // Active indicator pill
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = if (isSelected) tool.accentColor.copy(alpha = 0.15f) else Color(0xFF1E293B),
          border = BorderStroke(1.dp, if (isSelected) tool.accentColor else Color(0xFF334155))
        ) {
          Text(
            text = if (isSelected) "ACTIVE" else "READY",
            fontSize = 8.sp,
            fontWeight = FontWeight.Bold,
            color = if (isSelected) tool.accentColor else Color(0xFF64748B),
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      Text(
        text = tool.title,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = tool.description,
        fontSize = 10.sp,
        lineHeight = 13.sp,
        color = Color(0xFF94A3B8),
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
      )
    }
  }
}
