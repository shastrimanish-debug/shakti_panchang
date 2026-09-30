package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = SaffronSecondary,
    onPrimary = DeepDarkSlate,
    primaryContainer = SaffronPrimary,
    onPrimaryContainer = Color.White,
    secondary = MarigoldGold,
    onSecondary = DeepDarkSlate,
    background = DeepDarkSlate,
    onBackground = TextPrimaryDark,
    surface = CardBackgroundDark,
    onSurface = TextPrimaryDark,
    error = TempleRed,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = SaffronPrimary,
    onPrimary = Color.White,
    primaryContainer = MarigoldGold,
    onPrimaryContainer = DeepDarkSlate,
    secondary = TempleRed,
    onSecondary = Color.White,
    background = CreamBackground,
    onBackground = TextPrimaryLight,
    surface = CardBackgroundLight,
    onSurface = TextPrimaryLight,
    error = TempleRed,
    onError = Color.White
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Disabled to maintain traditional auspicious branding colors
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
