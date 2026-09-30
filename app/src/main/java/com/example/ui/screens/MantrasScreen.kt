package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PanchangRepository
import com.example.data.SacredMantra

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MantrasScreen() {
    val mantras = remember { PanchangRepository.getSacredMantras() }
    var selectedMantra by remember { mutableStateOf<SacredMantra?>(null) }
    var fontSizeSp by remember { mutableStateOf(16f) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("मंत्र एवं स्तोत्र (Sacred Mantras)", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        if (selectedMantra == null) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(MaterialTheme.colorScheme.background)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(mantras) { mantra ->
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedMantra = mantra }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.MenuBook,
                                contentDescription = "Mantra",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = mantra.hindiTitle,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = "${mantra.title} • ${mantra.deity}",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }
                }
            }
        } else {
            // Reader Detail View
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(MaterialTheme.colorScheme.background)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = { selectedMantra = null }) {
                        Text("← वापस (Back)")
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("अक्षर आकार:", fontSize = 12.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        IconButton(onClick = { if (fontSizeSp > 12f) fontSizeSp -= 2f }) {
                            Text("-", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        }
                        Text("${fontSizeSp.toInt()}sp", fontSize = 12.sp)
                        IconButton(onClick = { if (fontSizeSp < 26f) fontSizeSp += 2f }) {
                            Text("+", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        }
                    }
                }

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth().weight(1f)
                ) {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Text(
                                text = selectedMantra!!.hindiTitle,
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "देवता: ${selectedMantra!!.deity}",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        item {
                            Divider()
                        }
                        item {
                            Text(
                                text = selectedMantra!!.sanskritText,
                                fontSize = fontSizeSp.sp,
                                fontWeight = FontWeight.Medium,
                                lineHeight = (fontSizeSp * 1.5f).sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        item {
                            Divider()
                        }
                        item {
                            Text(
                                text = "अर्थ (Meaning):",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = selectedMantra!!.meaning,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                            )
                        }
                    }
                }
            }
        }
    }
}
