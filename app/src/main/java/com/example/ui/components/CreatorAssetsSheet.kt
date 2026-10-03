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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.EmojiEmotions
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Model for mock sticker / creator asset item.
 */
data class MockStickerAsset(
  val id: String,
  val label: String,
  val category: String,
  val icon: ImageVector,
  val gradientColors: List<Color>,
  val badgeText: String? = null
)

/**
 * Step 17: Creator Assets Library (Stickers & GIFs) Bottom Sheet UI
 *
 * Requirements:
 * 1. Top Bar titled 'Assets & Stickers' with a 'Close' icon button.
 * 2. Mock search bar at the top for finding stickers or GIFs.
 * 3. Tab row with categories: 'Trending', 'Arrows', 'Emojis', 'VFX Elements', and 'Giphy'.
 * 4. Grid layout below showing 6-8 mock sticker placeholders
 *    (simple colorful rounded boxes with small icon or text inside like 'Arrow', 'Fire', 'Subscribe').
 * 5. Strictly UI layout only.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreatorAssetsBottomSheet(
  onDismiss: () -> Unit,
  onSelectAsset: (MockStickerAsset) -> Unit = {},
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
    modifier = modifier.testTag("stickers_sheet")
  ) {
    CreatorAssetsContent(
      onDismiss = onDismiss,
      onSelectAsset = { asset ->
        onSelectAsset(asset)
        onDismiss()
      }
    )
  }
}

@Composable
fun CreatorAssetsContent(
  onDismiss: () -> Unit,
  onSelectAsset: (MockStickerAsset) -> Unit = {},
  modifier: Modifier = Modifier
) {
  var searchQuery by remember { mutableStateOf("") }
  var selectedTabIndex by remember { mutableIntStateOf(0) }
  var selectedAssetId by remember { mutableStateOf<String?>(null) }

  val categories = listOf("Trending", "Arrows", "Emojis", "VFX Elements", "Giphy")

  val stickerAssets = listOf(
    MockStickerAsset(
      id = "sticker_fire",
      label = "Fire",
      category = "Trending",
      icon = Icons.Default.LocalFireDepartment,
      gradientColors = listOf(Color(0xFFFF5722), Color(0xFFFF9800)),
      badgeText = "HOT"
    ),
    MockStickerAsset(
      id = "sticker_arrow",
      label = "Arrow",
      category = "Arrows",
      icon = Icons.Default.Navigation,
      gradientColors = listOf(Color(0xFF06B6D4), Color(0xFF3B82F6)),
      badgeText = "KINETIC"
    ),
    MockStickerAsset(
      id = "sticker_subscribe",
      label = "Subscribe",
      category = "Trending",
      icon = Icons.Default.NotificationsActive,
      gradientColors = listOf(Color(0xFFDC2626), Color(0xFFEF4444)),
      badgeText = "YOUTUBE"
    ),
    MockStickerAsset(
      id = "sticker_like",
      label = "Like Heart",
      category = "Emojis",
      icon = Icons.Default.Favorite,
      gradientColors = listOf(Color(0xFFEC4899), Color(0xFFF43F5E)),
      badgeText = "POP"
    ),
    MockStickerAsset(
      id = "sticker_spark",
      label = "Lightning",
      category = "VFX Elements",
      icon = Icons.Default.FlashOn,
      gradientColors = listOf(Color(0xFFEAB308), Color(0xFFF59E0B)),
      badgeText = "FX"
    ),
    MockStickerAsset(
      id = "sticker_cinema",
      label = "Action Slate",
      category = "Trending",
      icon = Icons.Default.Movie,
      gradientColors = listOf(Color(0xFF8B5CF6), Color(0xFF6366F1)),
      badgeText = "PRO"
    ),
    MockStickerAsset(
      id = "sticker_star",
      label = "Starlight Glow",
      category = "VFX Elements",
      icon = Icons.Default.Star,
      gradientColors = listOf(Color(0xFF10B981), Color(0xFF14B8A6)),
      badgeText = "GLOW"
    ),
    MockStickerAsset(
      id = "sticker_magic",
      label = "AI Magic",
      category = "Giphy",
      icon = Icons.Default.AutoAwesome,
      gradientColors = listOf(Color(0xFFD946EF), Color(0xFF8B5CF6)),
      badgeText = "GIF"
    )
  )

  val filteredAssets = remember(searchQuery, selectedTabIndex) {
    val category = categories[selectedTabIndex]
    stickerAssets.filter { asset ->
      (category == "Trending" || asset.category == category) &&
          (searchQuery.isBlank() || asset.label.contains(searchQuery, ignoreCase = true))
    }
  }

  Column(
    modifier = modifier
      .fillMaxWidth()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 6.dp)
      .padding(bottom = 30.dp)
      .testTag("stickers_content")
  ) {
    // 1. Top Bar titled 'Assets & Stickers' with 'Close' icon button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("stickers_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFFF59E0B).copy(alpha = 0.18f),
          border = BorderStroke(1.dp, Color(0xFFFBBF24).copy(alpha = 0.5f)),
          modifier = Modifier.size(38.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.EmojiEmotions,
              contentDescription = "Assets & Stickers Icon",
              tint = Color(0xFFFBBF24),
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "Assets & Stickers",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.testTag("stickers_title")
          )
          Text(
            text = "Overlays, Animated Stickers & Giphy Loops",
            fontSize = 11.sp,
            color = Color(0xFF94A3B8)
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_stickers_sheet")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close Stickers Sheet",
          tint = MaterialTheme.colorScheme.onSurface
        )
      }
    }

    Spacer(modifier = Modifier.height(14.dp))

    // 2. Mock Search Bar at the top
    OutlinedTextField(
      value = searchQuery,
      onValueChange = { searchQuery = it },
      placeholder = {
        Text(
          text = "Search animated stickers, overlays & GIFs...",
          fontSize = 12.sp,
          color = Color(0xFF64748B)
        )
      },
      leadingIcon = {
        Icon(
          imageVector = Icons.Default.Search,
          contentDescription = "Search icon",
          tint = Color(0xFF94A3B8),
          modifier = Modifier.size(18.dp)
        )
      },
      trailingIcon = {
        if (searchQuery.isNotEmpty()) {
          IconButton(onClick = { searchQuery = "" }) {
            Icon(
              imageVector = Icons.Default.Close,
              contentDescription = "Clear search",
              tint = Color(0xFF94A3B8),
              modifier = Modifier.size(16.dp)
            )
          }
        }
      },
      singleLine = true,
      shape = RoundedCornerShape(12.dp),
      colors = OutlinedTextFieldDefaults.colors(
        focusedContainerColor = Color(0xFF0F172A),
        unfocusedContainerColor = Color(0xFF0F172A),
        focusedBorderColor = Color(0xFFFBBF24),
        unfocusedBorderColor = Color(0xFF1E293B),
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White
      ),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("search_stickers_input")
    )

    Spacer(modifier = Modifier.height(14.dp))

    // 3. Tab row with categories: 'Trending', 'Arrows', 'Emojis', 'VFX Elements', and 'Giphy'
    ScrollableTabRow(
      selectedTabIndex = selectedTabIndex,
      containerColor = Color.Transparent,
      contentColor = Color(0xFFFBBF24),
      edgePadding = 0.dp,
      indicator = { tabPositions ->
        TabRowDefaults.SecondaryIndicator(
          modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTabIndex]),
          color = Color(0xFFFBBF24),
          height = 2.5.dp
        )
      },
      divider = {},
      modifier = Modifier
        .fillMaxWidth()
        .testTag("stickers_tab_row")
    ) {
      categories.forEachIndexed { index, category ->
        val isSelected = selectedTabIndex == index
        Tab(
          selected = isSelected,
          onClick = { selectedTabIndex = index },
          text = {
            Text(
              text = category,
              fontSize = 12.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
              color = if (isSelected) Color(0xFFFBBF24) else Color(0xFF94A3B8)
            )
          },
          modifier = Modifier.testTag("tab_sticker_${category.lowercase().replace(" ", "_")}")
        )
      }
    }

    Spacer(modifier = Modifier.height(14.dp))

    // 4. Grid layout showing 6-8 mock sticker placeholders
    // (simple colorful rounded boxes with small icon or text inside like 'Arrow', 'Fire', 'Subscribe')
    Text(
      text = "SELECT ASSET TO INSERT TO TIMELINE",
      fontSize = 10.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp,
      color = Color(0xFF64748B)
    )

    Spacer(modifier = Modifier.height(8.dp))

    // 4 rows of 2 columns or 2 rows of 4 columns:
    // Let's render in 2-column grid rows to ensure responsive layout inside the vertical scroll
    val displayList = if (filteredAssets.isNotEmpty()) filteredAssets else stickerAssets
    val chunkedAssets = displayList.chunked(2)

    Column(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("stickers_grid"),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      chunkedAssets.forEach { rowItems ->
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          rowItems.forEach { asset ->
            val isSelected = selectedAssetId == asset.id
            val itemTag = "sticker_card_${asset.id}"

            Card(
              onClick = {
                selectedAssetId = asset.id
                onSelectAsset(asset)
              },
              shape = RoundedCornerShape(12.dp),
              colors = CardDefaults.cardColors(containerColor = Color(0xFF101726)),
              border = BorderStroke(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) Color(0xFFFBBF24) else Color(0xFF1E293B)
              ),
              modifier = Modifier
                .weight(1f)
                .testTag(itemTag)
            ) {
              Column(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
              ) {
                // Asset thumbnail preview box with colorful gradient
                Box(
                  modifier = Modifier
                    .size(width = 80.dp, height = 64.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Brush.linearGradient(asset.gradientColors))
                    .border(
                      BorderStroke(1.dp, Color.White.copy(alpha = 0.25f)),
                      RoundedCornerShape(10.dp)
                    ),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(
                    imageVector = asset.icon,
                    contentDescription = asset.label,
                    tint = Color.White,
                    modifier = Modifier.size(30.dp)
                  )

                  asset.badgeText?.let { badge ->
                    Surface(
                      shape = RoundedCornerShape(3.dp),
                      color = Color.Black.copy(alpha = 0.55f),
                      modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(4.dp)
                    ) {
                      Text(
                        text = badge,
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                      )
                    }
                  }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                  text = asset.label,
                  fontSize = 12.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  textAlign = TextAlign.Center
                )

                Text(
                  text = asset.category,
                  fontSize = 9.sp,
                  color = Color(0xFF94A3B8),
                  textAlign = TextAlign.Center
                )
              }
            }
          }

          if (rowItems.size == 1) {
            Spacer(modifier = Modifier.weight(1f))
          }
        }
      }
    }
  }
}
