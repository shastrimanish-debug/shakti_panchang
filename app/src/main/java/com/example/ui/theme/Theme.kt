package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme =
  darkColorScheme(
    primary = OrangePrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF381E0E),
    onPrimaryContainer = Color(0xFFFFCCAA),
    secondary = OrangeLight,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFF242430),
    onSecondaryContainer = Color.White,
    background = Color(0xFF101014),
    onBackground = Color(0xFFF0F0F5),
    surface = Color(0xFF181820),
    onSurface = Color(0xFFF0F0F5),
    surfaceVariant = Color(0xFF22222C),
    onSurfaceVariant = Color(0xFFA0A0B0),
    outline = Color(0xFF2E2E3C),
  )

private val LightColorScheme =
  lightColorScheme(
    primary = OrangePrimary,
    onPrimary = Color.White,
    primaryContainer = OrangeContainer,
    onPrimaryContainer = OrangeOnContainer,
    secondary = OrangeLight,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF3F4F6),
    onSecondaryContainer = Color(0xFF1F2937),
    background = Color(0xFFFFFFFF),
    onBackground = Color(0xFF111827),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF111827),
    surfaceVariant = Color(0xFFF9FAFB),
    onSurfaceVariant = Color(0xFF4B5563),
    outline = Color(0xFFE5E7EB),
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = false,
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val activeTheme by AppThemeManager.currentTheme.collectAsState()
  val colorScheme = AppThemeManager.getMaterialColorScheme(activeTheme)

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
