package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CreamBackground
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamCardBg
import com.example.ui.theme.CreamSurface
import com.example.ui.theme.CreamSurfaceVariant
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.WarmMuted
import com.example.ui.theme.WarmPeachAccent

/**
 * Trending Meme & SFX Soundboard:
 * Allows creators to add meme sound effects and cinematic foley directly onto the audio track.
 */
data class MemeSoundItem(
  val id: String,
  val title: String,
  val category: String,
  val durationSec: Float,
  val emoji: String,
  val tag: String
)

val trendingMemeSounds = listOf(
  MemeSoundItem("sfx_vine_boom", "Vine Boom", "Memes", 1.2f, "💥", "VIRAL"),
  MemeSoundItem("sfx_ding", "Ding! (Correct)", "Memes", 0.8f, "🔔", "POPULAR"),
  MemeSoundItem("sfx_whoosh", "Transition Fast Whoosh", "Transitions", 0.6f, "💨", "STAPLE"),
  MemeSoundItem("sfx_record_scratch", "Record Scratch (Awkward)", "Memes", 1.5f, "💿", "CLASSIC"),
  MemeSoundItem("sfx_camera_click", "Camera Shutter Click", "Foley", 0.4f, "📸", "CLEAN"),
  MemeSoundItem("sfx_applause", "Crowd Cheering & Applause", "Atmosphere", 3.0f, "👏", "HYPE"),
  MemeSoundItem("sfx_sad_trombone", "Sad Trombone (Wah Wah)", "Memes", 2.2f, "🎺", "FUNNY"),
  MemeSoundItem("sfx_air_horn", "MLG Air Horn Triple Blast", "Memes", 1.8f, "📢", "ENERGY"),
  MemeSoundItem("sfx_pop", "Wooden Cork Pop!", "Foley", 0.3f, "🍾", "ASMR"),
  MemeSoundItem("sfx_bass_drop", "Cinematic Sub Bass Drop", "Transitions", 2.5f, "💣", "4K HDR"),
  MemeSoundItem("sfx_error_buzzer", "Game Show Error Buzzer", "Memes", 1.1f, "❌", "FAIL"),
  MemeSoundItem("sfx_glitch", "Cyber Glitch Shudder", "Transitions", 0.9f, "⚡", "VFX")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MemeSfxBottomSheet(
  currentPositionMs: Long,
  onInsertSfx: (sfxTitle: String, atTimeMs: Long, durationMs: Long) -> Unit,
  onDismiss: () -> Unit,
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  var selectedCategory by remember { mutableStateOf("All") }
  var playingSfxId by remember { mutableStateOf<String?>(null) }

  val categories = listOf("All", "Memes", "Transitions", "Foley", "Atmosphere")
  val filteredSounds = if (selectedCategory == "All") {
    trendingMemeSounds
  } else {
    trendingMemeSounds.filter { it.category == selectedCategory }
  }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = CreamSurface,
    contentColor = WarmEspresso,
    dragHandle = {
      Box(
        modifier = Modifier
          .padding(vertical = 10.dp)
          .size(width = 38.dp, height = 4.dp)
          .clip(CircleShape)
          .background(WarmPeachAccent)
      )
    },
    modifier = modifier.testTag("meme_sfx_bottom_sheet")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 6.dp)
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = OrangeContainer,
            modifier = Modifier.size(34.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.VolumeUp,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(18.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Meme & SFX Soundboard",
              fontSize = 17.sp,
              fontWeight = FontWeight.Bold,
              color = WarmEspresso
            )
            Text(
              text = "VFX Pro Studio SFX • Insert at playhead",
              fontSize = 11.sp,
              color = WarmMuted
            )
          }
        }

        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = WarmMuted
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Category filters
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(categories) { cat ->
          val isSelected = cat == selectedCategory
          Surface(
            shape = RoundedCornerShape(16.dp),
            color = if (isSelected) OrangePrimary else CreamSurfaceVariant,
            border = BorderStroke(1.dp, if (isSelected) OrangePrimaryDark else CreamBorder),
            modifier = Modifier.clickable { selectedCategory = cat }
          ) {
            Text(
              text = cat,
              fontSize = 12.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
              color = if (isSelected) Color.White else WarmEspresso,
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Sounds list
      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(420.dp)
      ) {
        items(filteredSounds) { sfx ->
          val isPlaying = playingSfxId == sfx.id

          Surface(
            shape = RoundedCornerShape(12.dp),
            color = CreamCardBg,
            border = BorderStroke(1.dp, if (isPlaying) OrangePrimary else CreamBorder),
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              // Icon & Title
              Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                  shape = CircleShape,
                  color = if (isPlaying) OrangePrimary else CreamSurfaceVariant,
                  modifier = Modifier
                    .size(36.dp)
                    .clickable {
                      playingSfxId = if (isPlaying) null else sfx.id
                    }
                ) {
                  Box(contentAlignment = Alignment.Center) {
                    if (isPlaying) {
                      Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = "Playing",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                      )
                    } else {
                      Text(
                        text = sfx.emoji,
                        fontSize = 16.sp
                      )
                    }
                  }
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                  Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                      text = sfx.title,
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      color = WarmEspresso
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                      shape = RoundedCornerShape(4.dp),
                      color = OrangeContainer
                    ) {
                      Text(
                        text = sfx.tag,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        color = OrangePrimaryDark,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                      )
                    }
                  }
                  Text(
                    text = "${sfx.category} • ${sfx.durationSec}s",
                    fontSize = 10.sp,
                    color = WarmMuted
                  )
                }
              }

              // Insert Button
              Surface(
                shape = RoundedCornerShape(8.dp),
                color = OrangePrimary,
                modifier = Modifier
                  .clickable {
                    onInsertSfx(sfx.title, currentPositionMs, (sfx.durationSec * 1000f).toLong())
                    onDismiss()
                  }
                  .testTag("btn_insert_sfx_${sfx.id}")
              ) {
                Row(
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(13.dp)
                  )
                  Spacer(modifier = Modifier.width(4.dp))
                  Text(
                    text = "Add",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                  )
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}
