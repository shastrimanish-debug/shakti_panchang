package com.example.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Panchang", Icons.Default.Today)
    object Calendar : Screen("calendar", "Calendar", Icons.Default.CalendarMonth)
    object Festivals : Screen("festivals", "Festivals", Icons.Default.Celebration)
    object Horoscope : Screen("horoscope", "Horoscope", Icons.Default.Star)
    object Mantras : Screen("mantras", "Mantras", Icons.Default.MenuBook)
    object AiAstrologer : Screen("ai_astrologer", "AI Pandit", Icons.Default.AutoAwesome)
}

@Composable
fun BottomNavigationBar(currentRoute: String, onNavigate: (String) -> Unit) {
    val items = listOf(
        Screen.Home,
        Screen.Calendar,
        Screen.Festivals,
        Screen.Horoscope,
        Screen.Mantras,
        Screen.AiAstrologer
    )

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.primary
    ) {
        items.forEach { screen ->
            NavigationBarItem(
                icon = { Icon(screen.icon, contentDescription = screen.title) },
                label = { Text(screen.title, maxLines = 1) },
                selected = currentRoute == screen.route,
                onClick = {
                    if (currentRoute != screen.route) {
                        onNavigate(screen.route)
                    }
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            )
        }
    }
}
