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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ClosedCaption
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.RecordVoiceOver
import androidx.compose.material.icons.filled.Style
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.Title
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Model for Main Text Actions.
 */
data class TextActionOption(
  val id: String,
  val title: String,
  val subtitle: String,
  val icon: ImageVector,
  val isAi: Boolean = false
)

/**
 * Step 15: Text & Auto-Captions Bottom Sheet UI
 *
 * Requirements:
 * 1. Top Bar titled 'Text & Captions' with a 'Close' icon button.
 * 2. A row of three main action cards: 'Add Text', 'Auto-Captions (AI)', and 'Templates'.
 * 3. A mock text styling section showing:
 *    - A horizontally scrollable row of Font preset chips (e.g., 'Inter', 'Bangers', 'Cinzel')
 *    - A row of circular color swatches
 * 4. A prominent 'Generate Auto-Captions' action button at the bottom with a glowing border and a magic spark icon.
 * 5. Strictly UI layout only.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TextCaptionsBottomSheet(
  onDismiss: () -> Unit,
  onGenerateCaptions: () -> Unit = {},
  onAddTextOverlay: (text: String, font: String, colorHex: String) -> Unit = { _, _, _ -> },
  onGenerateVoiceover: (text: String, voice: String, isSpeechToSong: Boolean, melody: String) -> Unit = { _, _, _, _ -> },
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
    modifier = modifier.testTag("text_captions_sheet")
  ) {
    TextCaptionsContent(
      onDismiss = onDismiss,
      onGenerateCaptions = {
        onGenerateCaptions()
        onDismiss()
      },
      onGenerateVoiceover = { text, voice, isSong, melody ->
        onGenerateVoiceover(text, voice, isSong, melody)
        onDismiss()
      }
    )
  }
}

@Composable
fun TextCaptionsContent(
  onDismiss: () -> Unit,
  onGenerateCaptions: () -> Unit = {},
  onGenerateVoiceover: (text: String, voice: String, isSpeechToSong: Boolean, melody: String) -> Unit = { _, _, _, _ -> },
  modifier: Modifier = Modifier
) {
  var selectedActionId by remember { mutableStateOf("auto_captions") }
  var selectedFont by remember { mutableStateOf("Inter") }
  var selectedColorIndex by remember { mutableIntStateOf(1) } // Cyan default
  var textInputSample by remember { mutableStateOf("EPIC MONTAGE 4K") }

  val mainActions = listOf(
    TextActionOption(
      id = "add_text",
      title = "Add Text",
      subtitle = "Custom titles & headers",
      icon = Icons.Default.TextFields
    ),
    TextActionOption(
      id = "auto_captions",
      title = "Auto-Captions (AI)",
      subtitle = "Speech-to-text kinetic sync",
      icon = Icons.Default.ClosedCaption,
      isAi = true
    ),
    TextActionOption(
      id = "ai_voiceover",
      title = "AI Voiceover",
      subtitle = "TTS & Speech-to-Song",
      icon = Icons.Default.RecordVoiceOver,
      isAi = true
    ),
    TextActionOption(
      id = "templates",
      title = "Templates",
      subtitle = "Motion lower-thirds",
      icon = Icons.Default.Style
    )
  )

  val fontPresets = listOf("Bebas Neue", "Anton", "Montserrat", "Pacifico", "Cinzel", "Bangers", "Impact Bold", "Monospace Code")

  val colorSwatches = listOf(
    Color(0xFFFFFFFF), // Pure White
    Color(0xFF06B6D4), // Cyan
    Color(0xFFFBBF24), // Vibrant Yellow
    Color(0xFFF43F5E), // Neon Coral Red
    Color(0xFFA855F7), // Cyber Purple
    Color(0xFF10B981), // Emerald Green
    Color(0xFF0F172A)  // Deep Obsidian
  )

  Column(
    modifier = modifier
      .fillMaxWidth()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 6.dp)
      .padding(bottom = 30.dp)
      .testTag("text_captions_content")
  ) {
    // 1. Top Bar titled 'Text & Captions' with 'Close' icon button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("text_captions_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFFE879F9).copy(alpha = 0.18f),
          border = BorderStroke(1.dp, Color(0xFFC084FC).copy(alpha = 0.5f)),
          modifier = Modifier.size(38.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.Title,
              contentDescription = "Text & Captions Icon",
              tint = Color(0xFFE879F9),
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "Text & Captions",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.testTag("text_captions_title")
          )
          Text(
            text = "Kinetic Typography & AI Subtitles",
            fontSize = 11.sp,
            color = Color(0xFF94A3B8)
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_text_captions")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close Text & Captions",
          tint = MaterialTheme.colorScheme.onSurface
        )
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 2. Row of three main action cards: 'Add Text', 'Auto-Captions (AI)', 'Templates'
    Text(
      text = "TEXT TOOLS",
      fontSize = 10.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp,
      color = Color(0xFF64748B)
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("text_main_actions_row"),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      mainActions.forEach { action ->
        val isSelected = selectedActionId == action.id
        val cardTag = "card_action_${action.id}"

        Card(
          onClick = { selectedActionId = action.id },
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Color(0xFF1E1B4B) else Color(0xFF0F172A)
          ),
          border = BorderStroke(
            width = if (isSelected) 1.5.dp else 1.dp,
            color = if (isSelected) Color(0xFFA855F7) else Color(0xFF263248)
          ),
          modifier = Modifier
            .weight(1f)
            .testTag(cardTag)
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Box(
              modifier = Modifier
                .size(34.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(
                  if (action.isAi) Color(0xFF9333EA).copy(alpha = 0.25f)
                  else Color(0xFF334155)
                ),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = action.icon,
                contentDescription = action.title,
                tint = if (action.isAi) Color(0xFFE879F9) else Color(0xFF38BDF8),
                modifier = Modifier.size(18.dp)
              )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
              text = action.title,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = if (isSelected) Color.White else Color(0xFFE2E8F0),
              textAlign = TextAlign.Center,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )

            Text(
              text = action.subtitle,
              fontSize = 8.sp,
              color = Color(0xFF94A3B8),
              textAlign = TextAlign.Center,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(18.dp))

    // 3. Mock Text Styling Section
    Card(
      shape = RoundedCornerShape(12.dp),
      colors = CardDefaults.cardColors(containerColor = Color(0xFF101726)),
      border = BorderStroke(1.dp, Color(0xFF1E293B)),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("text_styling_section")
    ) {
      Column(modifier = Modifier.padding(14.dp)) {
        // Section header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "TYPOGRAPHY & STYLING",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            color = Color(0xFF64748B)
          )

          Text(
            text = "Kinetic Motion Engine",
            fontSize = 9.sp,
            fontFamily = FontFamily.Monospace,
            color = Color(0xFF38BDF8)
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Preview box of styled text
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = Color(0xFF070B12),
          border = BorderStroke(1.dp, Color(0xFF1E293B)),
          modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
        ) {
          Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
          ) {
            Text(
              text = textInputSample,
              fontFamily = com.example.ui.theme.AppFonts.getFontFamily(selectedFont),
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              letterSpacing = 2.sp,
              color = colorSwatches[selectedColorIndex],
              modifier = Modifier.testTag("text_preview_sample")
            )
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Font Presets: horizontally scrollable row of Font preset chips
        Text(
          text = "FONT PRESETS",
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF94A3B8)
        )

        Spacer(modifier = Modifier.height(6.dp))

        Row(
          modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .testTag("font_presets_row"),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          fontPresets.forEach { fontName ->
            val isFontSelected = selectedFont == fontName
            val chipTag = "chip_font_${fontName.lowercase().replace(" ", "_")}"

            Surface(
              shape = RoundedCornerShape(8.dp),
              color = if (isFontSelected) Color(0xFF7C3AED) else Color(0xFF1E293B),
              border = BorderStroke(
                1.dp,
                if (isFontSelected) Color(0xFFC084FC) else Color(0xFF334155)
              ),
              modifier = Modifier
                .clickable { selectedFont = fontName }
                .testTag(chipTag)
            ) {
              Text(
                text = fontName,
                fontFamily = com.example.ui.theme.AppFonts.getFontFamily(fontName),
                fontSize = 12.sp,
                fontWeight = if (isFontSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isFontSelected) Color.White else Color(0xFFE2E8F0),
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Color Swatches: Row of circular color swatches
        Text(
          text = "COLOR PALETTE",
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF94A3B8)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
          modifier = Modifier
            .fillMaxWidth()
            .testTag("color_swatches_row"),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          colorSwatches.forEachIndexed { index, color ->
            val isColorSelected = selectedColorIndex == index
            val swatchTag = "swatch_color_$index"

            Box(
              modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(color)
                .border(
                  BorderStroke(
                    if (isColorSelected) 2.5.dp else 1.dp,
                    if (isColorSelected) Color(0xFFC084FC) else Color(0xFF334155)
                  ),
                  CircleShape
                )
                .clickable { selectedColorIndex = index }
                .testTag(swatchTag),
              contentAlignment = Alignment.Center
            ) {
              if (isColorSelected) {
                Icon(
                  imageVector = Icons.Default.Check,
                  contentDescription = null,
                  tint = if (color == Color.White) Color.Black else Color.White,
                  modifier = Modifier.size(15.dp)
                )
              }
            }
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(18.dp))

    // Action button: Auto-Captions OR AI Voiceover / Speech-to-Song
    if (selectedActionId == "ai_voiceover") {
      var ttsText by remember { mutableStateOf("Welcome to this viral edit! Drop a like and subscribe.") }
      var selectedVoice by remember { mutableStateOf("Jessie (Viral Female)") }
      var isSongMode by remember { mutableStateOf(false) }
      var selectedMelody by remember { mutableStateOf("Pop Anthem (120 BPM)") }

      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF101726)),
        border = BorderStroke(1.dp, Color(0xFF1E293B)),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("ai_voiceover_customizer")
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = if (isSongMode) "SPEECH-TO-SONG (AI)" else "AI VOICEOVER (TTS)",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              letterSpacing = 1.sp,
              color = Color(0xFFE879F9)
            )

            Surface(
              shape = RoundedCornerShape(12.dp),
              color = if (isSongMode) Color(0xFF9333EA) else Color(0xFF1E293B),
              border = BorderStroke(1.dp, if (isSongMode) Color(0xFFC084FC) else Color(0xFF334155)),
              modifier = Modifier.clickable { isSongMode = !isSongMode }
            ) {
              Text(
                text = if (isSongMode) "Mode: Song 🎵" else "Mode: Voice 🎙️",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(10.dp))

          OutlinedTextField(
            value = ttsText,
            onValueChange = { ttsText = it },
            label = { Text(if (isSongMode) "Song Lyrics / Hook" else "Text / Script to speak", fontSize = 11.sp) },
            maxLines = 3,
            colors = OutlinedTextFieldDefaults.colors(
              focusedTextColor = Color.White,
              unfocusedTextColor = Color(0xFFE2E8F0),
              focusedBorderColor = Color(0xFFA855F7),
              unfocusedBorderColor = Color(0xFF334155)
            ),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("input_ai_voiceover_text")
          )

          Spacer(modifier = Modifier.height(10.dp))

          Text(
            text = if (isSongMode) "SELECT MELODY / HARMONY:" else "SELECT AI VOICE:",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF94A3B8)
          )

          Spacer(modifier = Modifier.height(4.dp))

          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            val list = if (isSongMode) {
              listOf("Pop Anthem (120 BPM)", "Lofi Chillhop (85 BPM)", "Trap Beat (140 BPM)", "Acoustic Folk (95 BPM)")
            } else {
              listOf("Jessie (Viral Female)", "Deep Storyteller (Male)", "Energetic Hype (Promo)", "Anime Kawaii", "British Narrator")
            }

            list.forEach { item ->
              val isSel = if (isSongMode) selectedMelody == item else selectedVoice == item
              Surface(
                shape = RoundedCornerShape(6.dp),
                color = if (isSel) Color(0xFF7C3AED) else Color(0xFF1E293B),
                border = BorderStroke(1.dp, if (isSel) Color(0xFFC084FC) else Color(0xFF334155)),
                modifier = Modifier.clickable {
                  if (isSongMode) selectedMelody = item else selectedVoice = item
                }
              ) {
                Text(
                  text = item,
                  fontSize = 10.sp,
                  fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                  color = if (isSel) Color.White else Color(0xFF94A3B8),
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      Button(
        onClick = {
          onGenerateVoiceover(ttsText, selectedVoice, isSongMode, selectedMelody)
        },
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF8B5CF6)),
        border = BorderStroke(
          width = 1.5.dp,
          brush = Brush.horizontalGradient(
            listOf(Color(0xFFE879F9), Color(0xFF38BDF8), Color(0xFFC084FC))
          )
        ),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("btn_generate_ai_voiceover")
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center
        ) {
          Icon(
            imageVector = Icons.Default.RecordVoiceOver,
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = if (isSongMode) "Generate Speech-to-Song Clip" else "Generate AI Voiceover Clip",
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
        }
      }
    } else {
      // 4. Prominent 'Generate Auto-Captions' action button at the bottom with glowing border & magic spark icon
      Button(
        onClick = onGenerateCaptions,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6B21A8)),
        border = BorderStroke(
          width = 1.5.dp,
          brush = Brush.horizontalGradient(
            listOf(Color(0xFFE879F9), Color(0xFF38BDF8), Color(0xFFC084FC))
          )
        ),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("btn_generate_auto_captions")
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center
        ) {
          Icon(
            imageVector = Icons.Default.AutoAwesome,
            contentDescription = "Magic Spark Icon",
            tint = Color(0xFFF0ABFC),
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Generate Auto-Captions",
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
        }
      }
    }
  }
}
