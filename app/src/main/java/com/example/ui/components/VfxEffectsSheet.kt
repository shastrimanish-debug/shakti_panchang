package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BlurOn
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Flare
import androidx.compose.material.icons.filled.Grain
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Videocam
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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Mock visual effect representation for the VFX Library.
 */
data class MockVfxEffect(
  val id: String,
  val title: String,
  val category: String,
  val icon: ImageVector,
  val gradientColors: List<Color>,
  val description: String
)

/**
 * Step 9: VFX & Effects Library Modal Bottom Sheet
 * UI Includes:
 * 1. Top Bar titled 'VFX Library' with a mock search bar.
 * 2. Horizontally scrollable row of category chips: 'Trending', 'Glitch', 'Blur', 'Stylized', 'Light Leaks'.
 * 3. Grid layout showing 6 mock effect cards ('RGB Split', 'Motion Blur', 'Film Grain', etc.)
 *    with a small gradient placeholder and title.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VfxEffectsBottomSheet(
  onDismiss: () -> Unit,
  onApplyEffect: (MockVfxEffect) -> Unit,
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
    modifier = modifier.testTag("vfx_library_sheet")
  ) {
    VfxEffectsContent(
      onDismiss = onDismiss,
      onApplyEffect = { effect ->
        onApplyEffect(effect)
        onDismiss()
      }
    )
  }
}

@Composable
fun VfxEffectsContent(
  onDismiss: () -> Unit,
  onApplyEffect: (MockVfxEffect) -> Unit,
  modifier: Modifier = Modifier
) {
  var searchQuery by remember { mutableStateOf("") }
  var selectedCategoryIndex by remember { mutableIntStateOf(0) }

  val categories = listOf("Trending", "Glitch", "Blur", "Stylized", "Light Leaks")

  // 6 Mock effect cards as requested
  val allEffects = remember {
    listOf(
      MockVfxEffect(
        id = "fx_rgb_split",
        title = "RGB Split",
        category = "Glitch",
        icon = Icons.Default.ElectricBolt,
        gradientColors = listOf(Color(0xFFFF0055), Color(0xFF00F0FF), Color(0xFF1E1B4B)),
        description = "Chromatic aberration channel separation"
      ),
      MockVfxEffect(
        id = "fx_motion_blur",
        title = "Motion Blur",
        category = "Blur",
        icon = Icons.Default.BlurOn,
        gradientColors = listOf(Color(0xFF3B82F6), Color(0xFF8B5CF6), Color(0xFF0F172A)),
        description = "Dynamic directional velocity blur"
      ),
      MockVfxEffect(
        id = "fx_film_grain",
        title = "Film Grain",
        category = "Stylized",
        icon = Icons.Default.Grain,
        gradientColors = listOf(Color(0xFFD97706), Color(0xFF78350F), Color(0xFF1C1917)),
        description = "Authentic 35mm celluloid analog texture"
      ),
      MockVfxEffect(
        id = "fx_prism_flare",
        title = "Prism Flare",
        category = "Light Leaks",
        icon = Icons.Default.Flare,
        gradientColors = listOf(Color(0xFFEC4899), Color(0xFFF59E0B), Color(0xFF1E1B4B)),
        description = "Anamorphic optical streak lens flare"
      ),
      MockVfxEffect(
        id = "fx_neon_glow",
        title = "Neon Glow",
        category = "Trending",
        icon = Icons.Default.AutoAwesome,
        gradientColors = listOf(Color(0xFF06B6D4), Color(0xFFA855F7), Color(0xFF090D16)),
        description = "High-voltage edge bloom & glow"
      ),
      MockVfxEffect(
        id = "fx_vhs_glitch",
        title = "VHS Glitch",
        category = "Glitch",
        icon = Icons.Default.Videocam,
        gradientColors = listOf(Color(0xFFEF4444), Color(0xFF6366F1), Color(0xFF18181B)),
        description = "Analog tape scanlines and sync noise"
      )
    )
  }

  var selectedEffectId by remember { mutableStateOf<String?>("fx_rgb_split") }

  // Filter effects based on search query or category
  val filteredEffects = allEffects.filter { effect ->
    val matchesSearch = searchQuery.isBlank() ||
        effect.title.contains(searchQuery, ignoreCase = true) ||
        effect.category.contains(searchQuery, ignoreCase = true)

    val currentCat = categories[selectedCategoryIndex]
    val matchesCat = (currentCat == "Trending") || (effect.category.equals(currentCat, ignoreCase = true))

    matchesSearch && matchesCat
  }

  Column(
    modifier = modifier
      .fillMaxWidth()
      .height(560.dp)
      .padding(bottom = 16.dp)
      .testTag("vfx_library_content")
  ) {
    // 1. Top Bar titled 'VFX Library' with Close Button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp, vertical = 6.dp)
        .testTag("vfx_library_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = VfxCyan.copy(alpha = 0.15f),
          border = BorderStroke(1.dp, VfxCyan.copy(alpha = 0.5f)),
          modifier = Modifier.size(36.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.AutoAwesome,
              contentDescription = null,
              tint = VfxCyan,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "VFX Library",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.testTag("vfx_library_title")
          )
          Text(
            text = "Realtime GPU Shaders & Visual Filters",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_vfx_library")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close VFX Library",
          tint = MaterialTheme.colorScheme.onSurface
        )
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Mock Search Bar
    Surface(
      shape = RoundedCornerShape(10.dp),
      color = Color(0xFF131824),
      border = BorderStroke(1.dp, Color(0xFF222B3D)),
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp)
        .testTag("vfx_mock_search_bar")
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(
          imageVector = Icons.Default.Search,
          contentDescription = "Search",
          tint = Color(0xFF64748B),
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        OutlinedTextField(
          value = searchQuery,
          onValueChange = { searchQuery = it },
          placeholder = {
            Text(
              text = "Search effects (e.g. Glitch, Blur)...",
              fontSize = 12.sp,
              color = Color(0xFF64748B)
            )
          },
          singleLine = true,
          colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Color.Transparent,
            unfocusedBorderColor = Color.Transparent,
            focusedContainerColor = Color.Transparent,
            unfocusedContainerColor = Color.Transparent,
            cursorColor = VfxCyan,
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White
          ),
          modifier = Modifier
            .weight(1f)
            .height(44.dp)
            .testTag("input_vfx_search")
        )

        if (searchQuery.isNotEmpty()) {
          IconButton(
            onClick = { searchQuery = "" },
            modifier = Modifier.size(24.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Close,
              contentDescription = "Clear search",
              tint = Color(0xFF94A3B8),
              modifier = Modifier.size(14.dp)
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // 2. Horizontally scrollable row of category chips
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .horizontalScroll(rememberScrollState())
        .padding(horizontal = 18.dp)
        .testTag("vfx_category_chips_row"),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      categories.forEachIndexed { index, category ->
        val isSelected = selectedCategoryIndex == index
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = if (isSelected) VfxMagenta.copy(alpha = 0.2f) else Color(0xFF131824),
          border = BorderStroke(
            width = 1.dp,
            color = if (isSelected) VfxMagenta else Color(0xFF222B3D)
          ),
          onClick = { selectedCategoryIndex = index },
          modifier = Modifier.testTag("vfx_chip_$category")
        ) {
          Text(
            text = category,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) Color.White else Color(0xFF94A3B8),
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(14.dp))

    // 3. Grid layout showing 6 mock effect cards with small gradient placeholders and titles
    Box(
      modifier = Modifier
        .weight(1f)
        .padding(horizontal = 18.dp)
    ) {
      LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(bottom = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier
          .fillMaxSize()
          .testTag("vfx_effects_grid")
      ) {
        itemsIndexed(
          if (filteredEffects.isNotEmpty()) filteredEffects else allEffects,
          key = { _, effect -> effect.id }
        ) { index, effect ->
          val isSelected = selectedEffectId == effect.id

          VfxEffectCard(
            effect = effect,
            isSelected = isSelected,
            onClick = { selectedEffectId = effect.id },
            modifier = Modifier.testTag("vfx_effect_item_${effect.id}")
          )
        }
      }
    }

    // Bottom Action Bar: Apply selected effect to current clip
    Surface(
      color = Color(0xFF0B0F19),
      border = BorderStroke(1.dp, Color(0xFF1E293B)),
      modifier = Modifier.fillMaxWidth()
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 18.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        val activeEffect = allEffects.find { it.id == selectedEffectId }
        Column(modifier = Modifier.weight(1f)) {
          Text(
            text = activeEffect?.title ?: "Select an effect",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
          Text(
            text = activeEffect?.description ?: "Realtime filter",
            fontSize = 10.sp,
            color = Color(0xFF94A3B8),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Button(
          onClick = {
            if (activeEffect != null) {
              onApplyEffect(activeEffect)
            }
          },
          colors = ButtonDefaults.buttonColors(
            containerColor = VfxMagenta,
            contentColor = Color.White
          ),
          shape = RoundedCornerShape(10.dp),
          contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp),
          modifier = Modifier.testTag("btn_apply_vfx_effect")
        ) {
          Icon(
            imageVector = Icons.Default.AutoAwesome,
            contentDescription = null,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Apply Effect",
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp
          )
        }
      }
    }
  }
}

/**
 * Individual VFX Effect Card with gradient placeholder and title.
 */
@Composable
fun VfxEffectCard(
  effect: MockVfxEffect,
  isSelected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    onClick = onClick,
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(
      containerColor = Color(0xFF131824)
    ),
    border = BorderStroke(
      width = if (isSelected) 2.dp else 1.dp,
      color = if (isSelected) VfxMagenta else Color(0xFF222B3D)
    ),
    modifier = modifier.fillMaxWidth()
  ) {
    Column {
      // Small Gradient Placeholder with Effect Icon
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .aspectRatio(16f / 10f)
          .background(
            brush = Brush.linearGradient(effect.gradientColors)
          )
          .testTag("vfx_placeholder_${effect.id}")
      ) {
        // Center icon
        Box(
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          Surface(
            shape = CircleShape,
            color = Color(0x66000000),
            modifier = Modifier.size(34.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = effect.icon,
                contentDescription = effect.title,
                tint = Color.White,
                modifier = Modifier.size(20.dp)
              )
            }
          }
        }

        // Selected check badge
        if (isSelected) {
          Surface(
            shape = CircleShape,
            color = VfxMagenta,
            modifier = Modifier
              .align(Alignment.TopEnd)
              .padding(6.dp)
              .size(20.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.Check,
                contentDescription = "Selected",
                tint = Color.White,
                modifier = Modifier.size(13.dp)
              )
            }
          }
        }

        // Category Tag
        Surface(
          shape = RoundedCornerShape(3.dp),
          color = Color(0x99000000),
          modifier = Modifier
            .align(Alignment.BottomStart)
            .padding(6.dp)
        ) {
          Text(
            text = effect.category.uppercase(),
            fontSize = 8.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp,
            color = Color(0xFFE2E8F0),
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
          )
        }
      }

      // Title & description below gradient placeholder
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(Color(0xFF0E1320))
          .padding(horizontal = 10.dp, vertical = 8.dp)
      ) {
        Text(
          text = effect.title,
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
          text = effect.description,
          fontSize = 9.sp,
          color = Color(0xFF94A3B8),
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
      }
    }
  }
}
