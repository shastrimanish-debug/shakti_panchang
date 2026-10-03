package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.AutoFixHigh
import androidx.compose.material.icons.filled.CenterFocusStrong
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Speed
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
 * Mock representation of an AI Magic Tool.
 */
data class MockAiTool(
  val id: String,
  val title: String,
  val description: String,
  val icon: ImageVector,
  val accentColor: Color,
  val badgeText: String = "PRO"
)

/**
 * AI Magic Hub / AI Tools Modal Bottom Sheet.
 *
 * Requirements:
 * 1. Top Bar titled 'AI Tools' with a subtle gradient text.
 * 2. A 2x2 grid layout showing 4 mock AI feature cards:
 *    - 'Auto-Rotoscope'
 *    - '3D Camera Tracker'
 *    - 'AI Relight'
 *    - 'Smooth Slow-Mo (Optical Flow)'
 * 3. Each card has a placeholder icon and a 'Pro' badge.
 * 4. Strictly UI layout only without actual neural inference.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiToolsBottomSheet(
  onDismiss: () -> Unit,
  onApplyTool: (MockAiTool) -> Unit,
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
    modifier = modifier.testTag("ai_tools_sheet")
  ) {
    AiToolsContent(
      onDismiss = onDismiss,
      onApplyTool = { tool ->
        onApplyTool(tool)
        onDismiss()
      }
    )
  }
}

@Composable
fun AiToolsContent(
  onDismiss: () -> Unit,
  onApplyTool: (MockAiTool) -> Unit,
  modifier: Modifier = Modifier
) {
  val aiTools = remember {
    listOf(
      MockAiTool(
        id = "auto_rotoscope",
        title = "Auto-Rotoscope",
        description = "Instant neural subject cutout & green screen",
        icon = Icons.Default.AutoFixHigh,
        accentColor = Color(0xFF00F0FF)
      ),
      MockAiTool(
        id = "camera_tracker_3d",
        title = "3D Camera Tracker",
        description = "Reconstruct 3D camera motion & ground planes",
        icon = Icons.Default.CenterFocusStrong,
        accentColor = Color(0xFFA855F7)
      ),
      MockAiTool(
        id = "ai_relight",
        title = "AI Relight",
        description = "Volumetric 3D studio lighting & bloom control",
        icon = Icons.Default.Lightbulb,
        accentColor = Color(0xFFF59E0B)
      ),
      MockAiTool(
        id = "smooth_slow_mo",
        title = "Smooth Slow-Mo (Optical Flow)",
        description = "Neural optical flow 480fps frame interpolation",
        icon = Icons.Default.Speed,
        accentColor = Color(0xFFEC4899)
      )
    )
  }

  var selectedToolId by remember { mutableStateOf("auto_rotoscope") }

  val titleGradient = remember {
    Brush.horizontalGradient(
      colors = listOf(
        Color(0xFF38BDF8), // Radiant Cyan
        Color(0xFFA855F7), // Purple
        Color(0xFFF43F5E)  // Rose
      )
    )
  }

  Column(
    modifier = modifier
      .fillMaxWidth()
      .height(520.dp)
      .padding(bottom = 16.dp)
      .testTag("ai_tools_content")
  ) {
    // 1. Top Bar with subtle gradient text and close button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp, vertical = 8.dp)
        .testTag("ai_tools_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFF1E1B4B),
          border = BorderStroke(1.dp, Color(0xFFA855F7).copy(alpha = 0.5f)),
          modifier = Modifier.size(38.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.AutoAwesome,
              contentDescription = "AI Magic Hub",
              tint = Color(0xFFC084FC),
              modifier = Modifier.size(22.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "AI Tools",
            style = MaterialTheme.typography.titleLarge.copy(
              brush = titleGradient,
              fontWeight = FontWeight.ExtraBold
            ),
            modifier = Modifier.testTag("ai_tools_title")
          )
          Text(
            text = "Neural Engine & Motion VFX Suite",
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF94A3B8)
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_ai_tools")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close AI Tools",
          tint = MaterialTheme.colorScheme.onSurface
        )
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // 2. 2x2 Grid Layout showing 4 Mock AI Feature Cards
    Box(
      modifier = Modifier
        .weight(1f)
        .padding(horizontal = 16.dp)
    ) {
      LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(bottom = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
          .fillMaxSize()
          .testTag("ai_tools_grid")
      ) {
        items(aiTools, key = { it.id }) { tool ->
          val isSelected = selectedToolId == tool.id

          AiFeatureCard(
            tool = tool,
            isSelected = isSelected,
            onClick = { selectedToolId = tool.id },
            modifier = Modifier.testTag("card_ai_${tool.id}")
          )
        }
      }
    }

    // 3. Bottom Action Bar with live selected tool status and Apply button
    Surface(
      color = CreamSurfaceVariant,
      border = BorderStroke(1.dp, CreamBorder),
      modifier = Modifier.fillMaxWidth()
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 18.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        val activeTool = aiTools.find { it.id == selectedToolId }
        Column(modifier = Modifier.weight(1f)) {
          Text(
            text = activeTool?.title ?: "Select an AI Tool",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = WarmEspresso,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
          Text(
            text = "Zero-latency real-time preview available",
            fontSize = 10.sp,
            color = WarmMuted,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Button(
          onClick = {
            if (activeTool != null) {
              onApplyTool(activeTool)
            }
          },
          colors = ButtonDefaults.buttonColors(
            containerColor = OrangePrimary,
            contentColor = Color.White
          ),
          shape = RoundedCornerShape(10.dp),
          contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
          modifier = Modifier.testTag("btn_apply_ai_tool")
        ) {
          Icon(
            imageVector = Icons.Default.AutoAwesome,
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Process Clip",
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp
          )
        }
      }
    }
  }
}

/**
 * Individual AI Feature Card with placeholder icon, Pro badge, title, and description.
 */
@Composable
fun AiFeatureCard(
  tool: MockAiTool,
  isSelected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val proBadgeGradient = remember {
    Brush.horizontalGradient(
      colors = listOf(
        OrangePrimary,
        WarmPeachAccent
      )
    )
  }

  Card(
    onClick = onClick,
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(
      containerColor = if (isSelected) OrangeContainer else CreamCardBg
    ),
    border = BorderStroke(
      width = if (isSelected) 2.dp else 1.dp,
      color = if (isSelected) OrangePrimary else CreamBorder
    ),
    modifier = modifier.fillMaxWidth()
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp)
    ) {
      // Top row: Placeholder icon container + 'PRO' badge
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Placeholder Icon Container
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = OrangeContainer,
          border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.4f)),
          modifier = Modifier
            .size(40.dp)
            .testTag("ai_icon_container_${tool.id}")
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = tool.icon,
              contentDescription = tool.title,
              tint = OrangePrimary,
              modifier = Modifier.size(22.dp)
            )
          }
        }

        // 'PRO' Badge with gradient background
        Surface(
          shape = RoundedCornerShape(6.dp),
          color = Color.Transparent,
          modifier = Modifier
            .background(brush = proBadgeGradient, shape = RoundedCornerShape(6.dp))
            .testTag("pro_badge_${tool.id}")
        ) {
          Text(
            text = tool.badgeText,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 0.8.sp,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Title
      Text(
        text = tool.title,
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = WarmEspresso,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis,
        modifier = Modifier.testTag("ai_title_${tool.id}")
      )

      Spacer(modifier = Modifier.height(4.dp))

      // Description
      Text(
        text = tool.description,
        fontSize = 10.sp,
        lineHeight = 13.sp,
        color = WarmMuted,
        maxLines = 3,
        overflow = TextOverflow.Ellipsis
      )

      Spacer(modifier = Modifier.height(10.dp))

      // Selection indicator / status
      Row(
        verticalAlignment = Alignment.CenterVertically
      ) {
        Surface(
          shape = CircleShape,
          color = if (isSelected) tool.accentColor else CreamBorder,
          modifier = Modifier.size(7.dp)
        ) {}
        Spacer(modifier = Modifier.width(5.dp))
        Text(
          text = if (isSelected) "Active" else "Tap to Select",
          fontSize = 9.sp,
          fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
          color = if (isSelected) tool.accentColor else WarmMuted
        )
      }
    }
  }
}
