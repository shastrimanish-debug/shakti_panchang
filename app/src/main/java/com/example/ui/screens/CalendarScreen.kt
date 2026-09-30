package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PanchangRepository
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen() {
    var currentMonthCalendar by remember { mutableStateOf(Calendar.getInstance()) }
    var selectedDate by remember { mutableStateOf(Date()) }

    val monthFormat = SimpleDateFormat("MMMM yyyy", Locale.getDefault())
    val monthTitle = monthFormat.format(currentMonthCalendar.time)

    val daysInMonth = remember(currentMonthCalendar) {
        val cal = currentMonthCalendar.clone() as Calendar
        cal.set(Calendar.DAY_OF_MONTH, 1)
        val maxDays = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
        val startDayOfWeek = cal.get(Calendar.DAY_OF_WEEK) - 1 // 0 for Sunday
        
        val list = mutableListOf<Date?>()
        for (i in 0 until startDayOfWeek) {
            list.add(null)
        }
        for (i in 1..maxDays) {
            cal.set(Calendar.DAY_OF_MONTH, i)
            list.add(cal.time)
        }
        list
    }

    val selectedPanchang = remember(selectedDate) {
        PanchangRepository.getPanchangForDate(selectedDate, "New Delhi")
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("पंचांग कैलेंडर (Calendar)", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Month Switcher Header
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
                        val cal = currentMonthCalendar.clone() as Calendar
                        cal.add(Calendar.MONTH, -1)
                        currentMonthCalendar = cal
                    }) {
                        Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month")
                    }

                    Text(
                        text = monthTitle,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = MaterialTheme.colorScheme.primary
                    )

                    IconButton(onClick = {
                        val cal = currentMonthCalendar.clone() as Calendar
                        cal.add(Calendar.MONTH, 1)
                        currentMonthCalendar = cal
                    }) {
                        Icon(Icons.Default.ChevronRight, contentDescription = "Next Month")
                    }
                }
            }

            // Weekday headers
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                val weekdays = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
                weekdays.forEach { day ->
                    Text(
                        text = day,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.width(36.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Days Grid
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(7),
                    modifier = Modifier.padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    items(daysInMonth) { date ->
                        if (date == null) {
                            Box(modifier = Modifier.size(40.dp))
                        } else {
                            val calDay = Calendar.getInstance().apply { time = date }
                            val dayNum = calDay.get(Calendar.DAY_OF_MONTH)
                            val isSelected = isSameDay(date, selectedDate)
                            val dayOfYear = calDay.get(Calendar.DAY_OF_YEAR)
                            val hasFestival = dayOfYear % 15 == 10 || dayOfYear == 100 || dayOfYear == 220 || dayOfYear == 305

                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(
                                        when {
                                            isSelected -> MaterialTheme.colorScheme.primary
                                            hasFestival -> MaterialTheme.colorScheme.primaryContainer
                                            else -> Color.Transparent
                                        }
                                    )
                                    .clickable { selectedDate = date },
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = dayNum.toString(),
                                        fontSize = 14.sp,
                                        fontWeight = if (isSelected || hasFestival) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                                    )
                                    if (hasFestival && !isSelected) {
                                        Box(
                                            modifier = Modifier
                                                .size(4.dp)
                                                .clip(CircleShape)
                                                .background(MaterialTheme.colorScheme.primary)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Selected Date Summary Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "पंचांग विवरण: ${selectedPanchang.displayDate}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("तिथि: ${selectedPanchang.tithi}", fontSize = 13.sp)
                    Text("नक्षत्र: ${selectedPanchang.nakshatra}", fontSize = 13.sp)
                    Text("योग: ${selectedPanchang.yoga} | करण: ${selectedPanchang.karana}", fontSize = 13.sp)
                    selectedPanchang.festivalName?.let {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("पर्व: $it", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

private fun isSameDay(date1: Date, date2: Date): Boolean {
    val cal1 = Calendar.getInstance().apply { time = date1 }
    val cal2 = Calendar.getInstance().apply { time = date2 }
    return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
            cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
}
