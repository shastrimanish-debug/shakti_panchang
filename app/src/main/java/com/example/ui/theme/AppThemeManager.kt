package com.example.ui.theme

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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * 10 Distinct Professional Studio Themes
 */
enum class AppStudioTheme(
  val id: String,
  val displayName: String,
  val description: String,
  val primaryColor: Color,
  val primaryDark: Color,
  val backgroundColor: Color,
  val surfaceColor: Color,
  val surfaceRaised: Color,
  val accentColor: Color,
  val textColor: Color = Color.White
) {
  CYBER_CYAN(
    id = "cyber_cyan",
    displayName = "Cyber Cyan (Default Pro)",
    description = "Electric Cyan & Deep Obsidian Canvas",
    primaryColor = Color(0xFF00E5FF),
    primaryDark = Color(0xFF00B4D8),
    backgroundColor = Color(0xFF0B0F17),
    surfaceColor = Color(0xFF111827),
    surfaceRaised = Color(0xFF1E293B),
    accentColor = Color(0xFF38BDF8)
  ),
  NEON_EMERALD(
    id = "neon_emerald",
    displayName = "Neon Emerald",
    description = "Matrix Neon Green & Dark Slate",
    primaryColor = Color(0xFF10B981),
    primaryDark = Color(0xFF059669),
    backgroundColor = Color(0xFF07120C),
    surfaceColor = Color(0xFF0F2319),
    surfaceRaised = Color(0xFF1A3B2B),
    accentColor = Color(0xFF34D399)
  ),
  ROYAL_VIOLET(
    id = "royal_violet",
    displayName = "Royal Violet",
    description = "Cyberpunk Violet & Velvet Noir",
    primaryColor = Color(0xFF8B5CF6),
    primaryDark = Color(0xFF6D28D9),
    backgroundColor = Color(0xFF0E091B),
    surfaceColor = Color(0xFF17112B),
    surfaceRaised = Color(0xFF281E48),
    accentColor = Color(0xFFA78BFA)
  ),
  DAVINCI_GOLD(
    id = "davinci_gold",
    displayName = "DaVinci Cinema Gold",
    description = "Hollywood Cinema Charcoal & Warm Amber Gold",
    primaryColor = Color(0xFFF59E0B),
    primaryDark = Color(0xFFD97706),
    backgroundColor = Color(0xFF121110),
    surfaceColor = Color(0xFF1C1A17),
    surfaceRaised = Color(0xFF2E2924),
    accentColor = Color(0xFFFBBF24)
  ),
  SUNSET_CRIMSON(
    id = "sunset_crimson",
    displayName = "Sunset Crimson",
    description = "Neon Crimson & Deep Burgundy",
    primaryColor = Color(0xFFEF4444),
    primaryDark = Color(0xFFDC2626),
    backgroundColor = Color(0xFF12080A),
    surfaceColor = Color(0xFF200E12),
    surfaceRaised = Color(0xFF33171D),
    accentColor = Color(0xFFF87171)
  ),
  MIDNIGHT_OLED(
    id = "midnight_oled",
    displayName = "Midnight OLED",
    description = "Pitch Black 0x000000 & Electric Sky",
    primaryColor = Color(0xFF38BDF8),
    primaryDark = Color(0xFF0284C7),
    backgroundColor = Color(0xFF000000),
    surfaceColor = Color(0xFF0D0D0D),
    surfaceRaised = Color(0xFF1A1A1A),
    accentColor = Color(0xFF60A5FA)
  ),
  ARCTIC_ICE(
    id = "arctic_ice",
    displayName = "Arctic Ice",
    description = "Glacier Aqua & Frosted Navy",
    primaryColor = Color(0xFF06B6D4),
    primaryDark = Color(0xFF0891B2),
    backgroundColor = Color(0xFF08101E),
    surfaceColor = Color(0xFF0E1C33),
    surfaceRaised = Color(0xFF182E52),
    accentColor = Color(0xFF22D3EE)
  ),
  SYNTHWAVE_NEON(
    id = "synthwave_neon",
    displayName = "Synthwave 80s",
    description = "Hot Laser Pink & Neon Retrowave Blue",
    primaryColor = Color(0xFFF43F5E),
    primaryDark = Color(0xFFE11D48),
    backgroundColor = Color(0xFF13091B),
    surfaceColor = Color(0xFF221130),
    surfaceRaised = Color(0xFF381B4E),
    accentColor = Color(0xFF00E5FF)
  ),
  FOREST_SAGE(
    id = "forest_sage",
    displayName = "Forest Sage",
    description = "Nordic Pine & Muted Sage Teal",
    primaryColor = Color(0xFF14B8A6),
    primaryDark = Color(0xFF0D9488),
    backgroundColor = Color(0xFF091411),
    surfaceColor = Color(0xFF11241F),
    surfaceRaised = Color(0xFF1C3831),
    accentColor = Color(0xFF2DD4BF)
  ),
  TITANIUM_MONO(
    id = "titanium_mono",
    displayName = "Titanium Silver",
    description = "Minimalist Studio Monochrome Platinum",
    primaryColor = Color(0xFFE4E4E7),
    primaryDark = Color(0xFFA1A1AA),
    backgroundColor = Color(0xFF121214),
    surfaceColor = Color(0xFF1E1E22),
    surfaceRaised = Color(0xFF2E2E36),
    accentColor = Color(0xFFFFFFFF)
  ),
  TOKYO_NEON(
    id = "tokyo_neon",
    displayName = "Tokyo Neon Night",
    description = "Electric Magenta & Deep Midnight Indigo",
    primaryColor = Color(0xFFD946EF),
    primaryDark = Color(0xFFA21CAF),
    backgroundColor = Color(0xFF0F0B18),
    surfaceColor = Color(0xFF1B132B),
    surfaceRaised = Color(0xFF2C1F45),
    accentColor = Color(0xFFF472B6)
  ),
  SOLAR_AMBER(
    id = "solar_amber",
    displayName = "Solar Amber Flare",
    description = "Cinema Copper Bronze & Charcoal",
    primaryColor = Color(0xFFFB923C),
    primaryDark = Color(0xFFEA580C),
    backgroundColor = Color(0xFF120E0A),
    surfaceColor = Color(0xFF1C1610),
    surfaceRaised = Color(0xFF2E241B),
    accentColor = Color(0xFFFDBA74)
  );

  val sheetBorder: Color get() = primaryColor.copy(alpha = 0.25f)
}

/**
 * Global Theme Controller for dynamic live switching across all screens
 */
object AppThemeManager {
  private val _currentTheme = MutableStateFlow(AppStudioTheme.CYBER_CYAN)
  val currentTheme = _currentTheme.asStateFlow()

  fun setTheme(theme: AppStudioTheme) {
    _currentTheme.value = theme
  }

  fun getMaterialColorScheme(theme: AppStudioTheme = _currentTheme.value) = darkColorScheme(
    primary = theme.primaryColor,
    onPrimary = Color.Black,
    primaryContainer = theme.surfaceRaised,
    onPrimaryContainer = theme.primaryColor,
    secondary = theme.accentColor,
    onSecondary = Color.Black,
    secondaryContainer = theme.surfaceColor,
    onSecondaryContainer = Color.White,
    background = theme.backgroundColor,
    onBackground = theme.textColor,
    surface = theme.surfaceColor,
    onSurface = theme.textColor,
    surfaceVariant = theme.surfaceRaised,
    onSurfaceVariant = Color(0xFF94A3B8),
    outline = Color(0xFF334155)
  )
}

/**
 * 1-Tap Theme Selection Bottom Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudioThemePickerSheet(
  onDismiss: () -> Unit,
  modifier: Modifier = Modifier
) {
  val currentTheme by AppThemeManager.currentTheme.collectAsState()

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = currentTheme.surfaceColor,
    contentColor = currentTheme.textColor,
    modifier = modifier.testTag("sheet_theme_picker")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 8.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = CircleShape,
            color = currentTheme.primaryColor.copy(alpha = 0.2f),
            modifier = Modifier.size(36.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.Palette,
                contentDescription = null,
                tint = currentTheme.primaryColor,
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Select App Theme",
              style = MaterialTheme.typography.titleLarge,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
            Text(
              text = "10 Pro Cinema & Studio Color Themes",
              style = MaterialTheme.typography.bodySmall,
              color = Color(0xFF94A3B8)
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF94A3B8))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(460.dp)
      ) {
        items(AppStudioTheme.entries) { theme ->
          val isSelected = theme == currentTheme
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) theme.surfaceRaised else theme.surfaceColor,
            border = BorderStroke(
              width = if (isSelected) 2.dp else 1.dp,
              color = if (isSelected) theme.primaryColor else Color(0xFF334155)
            ),
            modifier = Modifier
              .fillMaxWidth()
              .clickable {
                AppThemeManager.setTheme(theme)
              }
              .testTag("theme_item_${theme.id}")
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              // Color Swatch Circle
              Box(
                modifier = Modifier
                  .size(36.dp)
                  .clip(CircleShape)
                  .background(
                    Brush.sweepGradient(
                      colors = listOf(
                        theme.primaryColor,
                        theme.accentColor,
                        theme.surfaceRaised,
                        theme.primaryColor
                      )
                    )
                  )
                  .border(2.dp, Color.White.copy(alpha = 0.3f), CircleShape)
              )

              Spacer(modifier = Modifier.width(12.dp))

              Column(modifier = Modifier.weight(1f)) {
                Text(
                  text = theme.displayName,
                  fontSize = 14.sp,
                  fontWeight = FontWeight.Bold,
                  color = if (isSelected) theme.primaryColor else Color.White
                )
                Text(
                  text = theme.description,
                  fontSize = 11.sp,
                  color = Color(0xFF94A3B8)
                )
              }

              if (isSelected) {
                Surface(
                  shape = CircleShape,
                  color = theme.primaryColor,
                  modifier = Modifier.size(24.dp)
                ) {
                  Box(contentAlignment = Alignment.Center) {
                    Icon(
                      imageVector = Icons.Default.Check,
                      contentDescription = "Selected",
                      tint = Color.Black,
                      modifier = Modifier.size(16.dp)
                    )
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
