package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PanchangDay
import com.example.data.PanchangRepository
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    selectedCity: String,
    onCitySelected: (String) -> Unit,
    onNavigateToAi: () -> Unit
) {
    var currentDate by remember { mutableStateOf(Date()) }
    var showCityDialog by remember { mutableStateOf(false) }

    val panchang: PanchangDay = remember(currentDate, selectedCity) {
        PanchangRepository.getPanchangForDate(currentDate, selectedCity)
    }

    val dateFormat = SimpleDateFormat("EEEE, dd MMM yyyy", Locale.getDefault())

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("शक्ति पंचांग", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Text("Vikram Samvat 2083", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                    }
                },
                actions = {
                    // City selector badge
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.primaryContainer,
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .clickable { showCityDialog = true }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = "Location", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(selectedCity, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = androidx.compose.ui.Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Date Navigation Header
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = {
                            val cal = Calendar.getInstance().apply { time = currentDate; add(Calendar.DAY_OF_YEAR, -1) }
                            currentDate = cal.time
                        }) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Day")
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = dateFormat.format(currentDate),
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = panchang.hinduMonth,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                            )
                        }

                        IconButton(onClick = {
                            val cal = Calendar.getInstance().apply { time = currentDate; add(Calendar.DAY_OF_YEAR, 1) }
                            currentDate = cal.time
                        }) {
                            Icon(Icons.Default.ChevronRight, contentDescription = "Next Day")
                        }
                    }
                }
            }

            // Festival Banner if present
            panchang.festivalName?.let { festival ->
                item {
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Celebration,
                                contentDescription = "Festival",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text("विशेष पर्व / त्यौहार", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                Text(festival, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
                            }
                        }
                    }
                }
            }

            // Core Panchang 4 Grid Cards
            item {
                Text("मुख्य पंचांग (Core Panchang)", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MaterialTheme.colorScheme.primary)
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    PanchangInfoCard(
                        modifier = Modifier.weight(1f),
                        title = "तिथि (Tithi)",
                        value = panchang.tithi,
                        subValue = "End: ${panchang.tithiEndTime}",
                        icon = Icons.Default.Event
                    )
                    PanchangInfoCard(
                        modifier = Modifier.weight(1f),
                        title = "नक्षत्र (Nakshatra)",
                        value = panchang.nakshatra,
                        subValue = "End: ${panchang.nakshatraEndTime}",
                        icon = Icons.Default.Star
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    PanchangInfoCard(
                        modifier = Modifier.weight(1f),
                        title = "योग (Yoga)",
                        value = panchang.yoga,
                        subValue = panchang.ritu,
                        icon = Icons.Default.SelfImprovement
                    )
                    PanchangInfoCard(
                        modifier = Modifier.weight(1f),
                        title = "करण (Karana)",
                        value = panchang.karana,
                        subValue = "Paksha: ${panchang.hinduMonth.substringAfter(",")}",
                        icon = Icons.Default.FilterVintage
                    )
                }
            }

            // Sun & Moon Times
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("सूर्य एवं चन्द्र गणना (Sun & Moon)", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            SunMoonDetailItem(icon = Icons.Default.WbSunny, label = "सूर्योदय", time = panchang.sunrise)
                            SunMoonDetailItem(icon = Icons.Default.NightsStay, label = "सूर्यास्त", time = panchang.sunset)
                            SunMoonDetailItem(icon = Icons.Default.Brightness3, label = "चन्द्रोदय", time = panchang.moonrise)
                            SunMoonDetailItem(icon = Icons.Default.DarkMode, label = "चन्द्रास्त", time = panchang.moonset)
                        }
                    }
                }
            }

            // Inauspicious Times (Rahu Kaal Warning)
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Warning, contentDescription = "Warning", tint = MaterialTheme.colorScheme.error)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("अशुभ समय (Inauspicious Times)", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.error)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        TimeRow("राहुकाल (Rahu Kaal)", panchang.rahuKaal)
                        TimeRow("यमगण्ड (Yamagandam)", panchang.yamagandam)
                        TimeRow("गुळिक काल (Gulikai)", panchang.gulikai)
                    }
                }
            }

            // Auspicious Muhurats
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CheckCircle, contentDescription = "Auspicious", tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("शुभ मुहूर्त (Auspicious Muhurat)", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.primary)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        TimeRow("अभिजित मुहूर्त (Abhijit)", panchang.abhijitMuhurat)
                        TimeRow("अमृत काल (Amrit Kaal)", panchang.amritKaal)
                    }
                }
            }

            // AI Astrologer Banner Prompt
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    modifier = Modifier.clickable { onNavigateToAi() }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = "AI", tint = Color.White)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("AI ज्योतिषी से पूछें", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
                            Text("व्रत नियम, पूजा विधि या मुहूर्त की जानकारी लें", fontSize = 12.sp, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f))
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = "Go", tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }

    if (showCityDialog) {
        AlertDialog(
            onDismissRequest = { showCityDialog = false },
            title = { Text("शहर चुनें (Select City)") },
            text = {
                LazyColumn {
                    items(PanchangRepository.cities) { city ->
                        ListItem(
                            headlineContent = { Text(city.name) },
                            supportingContent = { Text(city.state) },
                            modifier = Modifier.clickable {
                                onCitySelected(city.name)
                                showCityDialog = false
                            }
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showCityDialog = false }) {
                    Text("बंद करें")
                }
            }
        )
    }
}

@Composable
fun PanchangInfoCard(modifier: Modifier = Modifier, title: String, value: String, subValue: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = title, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(title, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f), fontWeight = FontWeight.Medium)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(value, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface, maxLines = 1)
            Spacer(modifier = Modifier.height(2.dp))
            Text(subValue, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, maxLines = 1)
        }
    }
}

@Composable
fun SunMoonDetailItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, time: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = label, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.height(4.dp))
        Text(label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
        Text(time, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
    }
}

@Composable
fun TimeRow(label: String, time: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
        Text(time, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
    }
}
