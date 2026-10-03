package com.example.ui.components

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
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
 * 1-Tap Viral Templates Hub:
 * Allows creators to apply trending Instagram Reels, TikTok, and YouTube Shorts templates with a single tap.
 */
data class ViralTemplate(
  val id: String,
  val name: String,
  val category: String,
  val badge: String,
  val badgeColor: Color,
  val description: String,
  val aspect: String,
  val bpm: Int,
  val transitionType: String,
  val colorGradeName: String,
  val musicStyle: String,
  val gradient: List<Color>
)

val sampleViralTemplates = listOf(
  ViralTemplate(
    id = "tpl_phonk_velocity",
    name = "Phonk Velocity Beat Rush",
    category = "Trending Reels",
    badge = "🔥 VIRAL #1",
    badgeColor = Color(0xFFEF4444),
    description = "Ultra-fast beat sync with speed ramping curves, RGB chromatic split, and heavy bass drops.",
    aspect = "9:16",
    bpm = 140,
    transitionType = "Whip Zoom",
    colorGradeName = "Cyberpunk High Contrast",
    musicStyle = "Drift Phonk 140 BPM",
    gradient = listOf(Color(0xFFDC2626), Color(0xFF7C3AED))
  ),
  ViralTemplate(
    id = "tpl_aesthetic_vlog",
    name = "Aesthetic Day-in-the-Life",
    category = "Aesthetic Vlog",
    badge = "✨ POPULAR",
    badgeColor = OrangePrimary,
    description = "Pastel cream tones, gentle film grain, soft crossfade transitions, and chill lo-fi acoustic vibe.",
    aspect = "9:16",
    bpm = 85,
    transitionType = "Soft Dissolve",
    colorGradeName = "Warm Pastel Cream",
    musicStyle = "Lo-Fi Chill Hop 85 BPM",
    gradient = listOf(Color(0xFFF97316), Color(0xFFFBBF24))
  ),
  ViralTemplate(
    id = "tpl_cinematic_epic",
    name = "Teal & Orange Epic Cinema",
    category = "Cinematic",
    badge = "🎬 HOLLYWOOD",
    badgeColor = Color(0xFF0EA5E9),
    description = "21:9 anamorphic letterbox, Hollywood Teal & Orange grading, slow dramatic push-ins, and cinematic drone audio.",
    aspect = "21:9",
    bpm = 70,
    transitionType = "Film Flash Black",
    colorGradeName = "Teal & Orange Blockbuster",
    musicStyle = "Cinematic Orchestral Drone",
    gradient = listOf(Color(0xFF0284C7), Color(0xFF0D9488))
  ),
  ViralTemplate(
    id = "tpl_cyberpunk_neon",
    name = "Neon Cyberpunk Strobe",
    category = "Trending Reels",
    badge = "⚡ 120 FPS",
    badgeColor = Color(0xFFA855F7),
    description = "Electrifying magenta and cyan glow, neon strobe transitions, fast beat cuts for gaming & tech montages.",
    aspect = "9:16",
    bpm = 130,
    transitionType = "Glitch Shift",
    colorGradeName = "Neon Cyber Matrix",
    musicStyle = "Synthwave Electronic 130 BPM",
    gradient = listOf(Color(0xFF8B5CF6), Color(0xFFEC4899))
  ),
  ViralTemplate(
    id = "tpl_retro_vhs",
    name = "90s VHS Camcorder Nostalgia",
    category = "Retro & Film",
    badge = "📼 VINTAGE",
    badgeColor = Color(0xFFF59E0B),
    description = "Authentic CRT scanlines, chromatic aberration, play date stamp overlay, and subtle tape hiss.",
    aspect = "4:3",
    bpm = 95,
    transitionType = "Tape Glitch",
    colorGradeName = "Kodak Super 8 Retro",
    musicStyle = "Vintage Analog Synth",
    gradient = listOf(Color(0xFFD97706), Color(0xFFB45309))
  ),
  ViralTemplate(
    id = "tpl_fast_hype",
    name = "Hype Montage Flash Cut",
    category = "Action",
    badge = "🚀 HIGH ENERGY",
    badgeColor = Color(0xFF10B981),
    description = "Fast 0.5s jump cuts, zoom blurs, camera shake on each beat, ideal for gym, sports, and product teasers.",
    aspect = "9:16",
    bpm = 150,
    transitionType = "Zoom Shockwave",
    colorGradeName = "Vibrant Punch",
    musicStyle = "Trap Beat 150 BPM",
    gradient = listOf(Color(0xFF059669), Color(0xFF2563EB))
  )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TemplatesBottomSheet(
  onDismiss: () -> Unit,
  onApplyTemplate: (ViralTemplate) -> Unit,
  onApplyTemplateWithPhotos: ((ViralTemplate, List<String>) -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  var selectedCategory by remember { mutableStateOf("All") }
  var appliedTemplateId by remember { mutableStateOf<String?>(null) }

  // 3-photo replacement slots for social media trending template export
  val selectedPhotos = remember {
    mutableStateListOf(
      "Sample Photo 1 (Cover Portrait)",
      "Sample Photo 2 (Action Shot)",
      "Sample Photo 3 (Final Reveal)"
    )
  }
  var activeSlotIndex by remember { mutableStateOf<Int?>(null) }

  val photoPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri ->
    if (uri != null) {
      val slot = activeSlotIndex
      if (slot != null && slot in 0..2) {
        selectedPhotos[slot] = uri.toString()
      }
    }
  }

  val categories = listOf("All", "Trending Reels", "Aesthetic Vlog", "Cinematic", "Action", "Retro & Film")
  val filteredTemplates = if (selectedCategory == "All") {
    sampleViralTemplates
  } else {
    sampleViralTemplates.filter { it.category == selectedCategory }
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
    modifier = modifier.testTag("templates_bottom_sheet")
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
                imageVector = Icons.Default.ElectricBolt,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(18.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Viral 1-Tap Templates",
              fontSize = 17.sp,
              fontWeight = FontWeight.Bold,
              color = WarmEspresso
            )
            Text(
              text = "VFX Pro beat-sync, speed curves & cinematic styles",
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

      // Studio Pro: 3-Photo Quick Replace Card
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = CreamSurfaceVariant,
        border = BorderStroke(1.dp, CreamBorder),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("card_3_photo_replace")
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.AddPhotoAlternate,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "Replace 3 Photos (VFX Pro Auto-Reel)",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = WarmEspresso
              )
            }
            Text(
              text = "Tap slot to swap",
              fontSize = 10.sp,
              color = WarmMuted
            )
          }

          Spacer(modifier = Modifier.height(8.dp))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            for (i in 0..2) {
              val slotName = selectedPhotos.getOrNull(i) ?: "Photo ${i + 1}"
              val isCustomUri = slotName.startsWith("content://") || slotName.startsWith("file://")
              val displayName = if (isCustomUri) "Photo ${i + 1} ✓" else "Photo ${i + 1}"

              Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (isCustomUri) OrangeContainer else CreamCardBg,
                border = BorderStroke(
                  1.dp,
                  if (isCustomUri) OrangePrimary else CreamBorder
                ),
                modifier = Modifier
                  .weight(1f)
                  .clickable {
                    activeSlotIndex = i
                    photoPickerLauncher.launch(
                      PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                    )
                  }
                  .testTag("slot_photo_${i + 1}")
              ) {
                Column(
                  modifier = Modifier.padding(vertical = 8.dp, horizontal = 6.dp),
                  horizontalAlignment = Alignment.CenterHorizontally
                ) {
                  Icon(
                    imageVector = if (isCustomUri) Icons.Default.Check else Icons.Default.Image,
                    contentDescription = null,
                    tint = if (isCustomUri) OrangePrimary else WarmMuted,
                    modifier = Modifier.size(18.dp)
                  )
                  Spacer(modifier = Modifier.height(4.dp))
                  Text(
                    text = displayName,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isCustomUri) OrangePrimary else WarmEspresso,
                    maxLines = 1
                  )
                  Text(
                    text = "Tap to pick",
                    fontSize = 8.sp,
                    color = WarmMuted
                  )
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Category filter row
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

      // Templates list
      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(440.dp)
      ) {
        items(filteredTemplates) { template ->
          val isApplied = appliedTemplateId == template.id

          Surface(
            shape = RoundedCornerShape(14.dp),
            color = CreamCardBg,
            border = BorderStroke(
              width = if (isApplied) 1.5.dp else 1.dp,
              color = if (isApplied) OrangePrimary else CreamBorder
            ),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(modifier = Modifier.padding(14.dp)) {
              // Top badge & aspect ratio row
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Surface(
                  shape = RoundedCornerShape(4.dp),
                  color = template.badgeColor.copy(alpha = 0.15f),
                  border = BorderStroke(1.dp, template.badgeColor.copy(alpha = 0.4f))
                ) {
                  Text(
                    text = template.badge,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = template.badgeColor,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                  )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                  Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = CreamSurfaceVariant,
                    border = BorderStroke(0.5.dp, CreamBorder)
                  ) {
                    Text(
                      text = "${template.aspect} • ${template.bpm} BPM",
                      fontSize = 10.sp,
                      fontWeight = FontWeight.SemiBold,
                      color = WarmMuted,
                      modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                  }
                }
              }

              Spacer(modifier = Modifier.height(8.dp))

              // Title
              Text(
                text = template.name,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = WarmEspresso
              )

              Spacer(modifier = Modifier.height(4.dp))

              Text(
                text = template.description,
                fontSize = 11.sp,
                color = WarmMuted,
                lineHeight = 16.sp
              )

              Spacer(modifier = Modifier.height(10.dp))

              // Specs chips (Transition, Color, BGM)
              Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
              ) {
                TemplateSpecChip(Icons.Default.Movie, template.transitionType)
                TemplateSpecChip(Icons.Default.AutoAwesome, template.colorGradeName)
                TemplateSpecChip(Icons.Default.MusicNote, template.musicStyle)
              }

              Spacer(modifier = Modifier.height(12.dp))

              // 1-Tap Apply Button
              Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (isApplied) Color(0xFF10B981) else OrangePrimary,
                modifier = Modifier
                  .fillMaxWidth()
                  .clickable {
                    appliedTemplateId = template.id
                    if (onApplyTemplateWithPhotos != null) {
                      onApplyTemplateWithPhotos(template, selectedPhotos.toList())
                    } else {
                      onApplyTemplate(template)
                    }
                  }
                  .testTag("btn_apply_template_${template.id}")
              ) {
                Row(
                  modifier = Modifier.padding(vertical = 9.dp),
                  horizontalArrangement = Arrangement.Center,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Icon(
                    imageVector = if (isApplied) Icons.Default.Check else Icons.Default.ElectricBolt,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                  )
                  Spacer(modifier = Modifier.width(6.dp))
                  Text(
                    text = if (isApplied) "Applied with 3 Photos!" else "Apply 3-Photo Template",
                    fontSize = 12.sp,
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

@Composable
private fun TemplateSpecChip(
  icon: androidx.compose.ui.graphics.vector.ImageVector,
  label: String
) {
  Surface(
    shape = RoundedCornerShape(4.dp),
    color = CreamSurfaceVariant,
    border = BorderStroke(0.5.dp, CreamBorder)
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        tint = OrangePrimary,
        modifier = Modifier.size(11.dp)
      )
      Spacer(modifier = Modifier.width(4.dp))
      Text(
        text = label,
        fontSize = 9.sp,
        fontWeight = FontWeight.Medium,
        color = WarmEspresso,
        maxLines = 1
      )
    }
  }
}
