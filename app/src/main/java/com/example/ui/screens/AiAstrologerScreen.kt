package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(val text: String, val isUser: Boolean)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiAstrologerScreen() {
    var promptInput by remember { mutableStateOf("") }
    val chatMessages = remember {
        mutableStateListOf(
            ChatMessage("नमस्ते! मैं आपका पंचांग और ज्योतिष सहायक (AI Pandit) हूँ। व्रत, मुहूर्त, पूजा विधि या राशिफल से जुड़ा कोई भी प्रश्न पूछें।", false)
        )
    }
    var isLoading by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI ज्योतिषी (AI Astrologer Pandit)", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(chatMessages) { message ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
                    ) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (message.isUser) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                            modifier = Modifier.widthIn(max = 300.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                if (!message.isUser) {
                                    Icon(
                                        Icons.Default.AutoAwesome,
                                        contentDescription = "AI",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                }
                                Text(
                                    text = message.text,
                                    fontSize = 14.sp,
                                    color = if (message.isUser) Color.White else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }

            // Input Bar
            Surface(
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = promptInput,
                        onValueChange = { promptInput = it },
                        placeholder = { Text("प्रश्न पूछें (e.g. एकादशी व्रत के नियम क्या हैं?)") },
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        shape = RoundedCornerShape(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = {
                            if (promptInput.isNotBlank() && !isLoading) {
                                val userQuery = promptInput
                                chatMessages.add(ChatMessage(userQuery, true))
                                promptInput = ""
                                isLoading = true

                                coroutineScope.launch {
                                    delay(800) // simulate thoughtful astrological response
                                    val responseText = when {
                                        userQuery.contains("एकादशी", ignoreCase = true) -> "एकादशी व्रत के दिन चावल का सेवन पूर्णतः वर्जित है। भगवान विष्णु का पूजन करें, विष्णु सहस्त्रनाम का पाठ करें और सात्विक आहार ग्रहण करें।"
                                        userQuery.contains("मुहूर्त", ignoreCase = true) -> "किसी भी शुभ कार्य के लिए अभिजीत मुहूर्त (दोपहर 11:45 से 12:32) सबसे उत्तम एवं दोषमुक्त माना जाता है।"
                                        userQuery.contains("शादी", ignoreCase = true) || userQuery.contains("विवाह", ignoreCase = true) -> "विवाह हेतु लग्न, नक्षत्र (रोहिणी, मृगशिरा, उत्तर फाल्गुनी) और वर-वधू की कुंडली का मिलान अति आवश्यक है।"
                                        userQuery.contains("राहुकाल", ignoreCase = true) -> "राहुकाल दिन का सबसे अशुभ समय माना जाता है (सामान्यतः दोपहर 3:30 से 5:00 के बीच)। इस दौरान कोई भी नया या मांगलिक कार्य न करें।"
                                        else -> "शास्त्रों के अनुसार अपने समीपस्थ मंदिर में दर्शन करें, सूर्यदेव को अर्घ्य दें और पंचांग के अनुसार शुभ योग में कार्य प्रारंभ करें। आपकी सफलता की कामना करते हैं।"
                                    }
                                    chatMessages.add(ChatMessage(responseText, false))
                                    isLoading = false
                                }
                            }
                        },
                        enabled = !isLoading,
                        modifier = Modifier
                            .size(48.dp)
                            .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(24.dp))
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White)
                    }
                }
            }
        }
    }
}
