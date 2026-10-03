package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ClosedCaption
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Crop
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Gesture
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.GridOn
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Redo
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Subtitles
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Translate
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.DoodlePoint
import com.example.DoodleStroke
import com.example.MediaClip
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangePrimary

/**
 * 1. Duration Sheet: Adjust exact duration of photo or video clip
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickDurationSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyDuration: (Long) -> Unit
) {
  var durationSec by remember(clip) { mutableFloatStateOf(clip.durationMs / 1000f) }
  val presets = listOf(1f, 2f, 3f, 5f, 8f, 10f, 15f, 30f)

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.Timer, contentDescription = null, tint = OrangePrimary)
          Spacer(modifier = Modifier.width(8.dp))
          Text("Clip Duration", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("Set how long this clip appears on the timeline", fontSize = 12.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(16.dp))

      // Duration readout display
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = OrangeContainer,
        border = BorderStroke(1.5.dp, OrangePrimary),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(14.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Text("%.1f s".format(durationSec), fontSize = 32.sp, fontWeight = FontWeight.Black, color = OrangePrimary)
          Text("(${((durationSec * 1000).toLong())} milliseconds)", fontSize = 11.sp, color = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Slider
      Text("Adjust Duration", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Slider(
        value = durationSec,
        onValueChange = { durationSec = it },
        valueRange = 0.5f..60.0f,
        colors = SliderDefaults.colors(
          thumbColor = OrangePrimary,
          activeTrackColor = OrangePrimary,
          inactiveTrackColor = Color(0xFFE5E7EB)
        )
      )

      // Quick Presets
      Spacer(modifier = Modifier.height(8.dp))
      Text("Quick Presets", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(presets) { p ->
          val isSel = kotlin.math.abs(durationSec - p) < 0.2f
          FilterChip(
            selected = isSel,
            onClick = { durationSec = p },
            label = { Text("${p.toInt()}s") },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangePrimary,
              selectedLabelColor = Color.White
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(20.dp))
      Button(
        onClick = { onApplyDuration((durationSec * 1000).toLong()) },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().height(48.dp)
      ) {
        Text("Apply Duration", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
      }
      Spacer(modifier = Modifier.height(12.dp))
    }
  }
}

/**
 * 2. Crop & Aspect Ratio Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickCropSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyCrop: (ratio: String, zoom: Float) -> Unit
) {
  var selectedRatio by remember(clip) { mutableStateOf(clip.cropRatio) }
  var zoomLevel by remember(clip) { mutableFloatStateOf(clip.cropZoom) }

  val ratios = listOf(
    "Fit" to "Original Fit",
    "9:16" to "Reels / TikTok",
    "16:9" to "YouTube Landscape",
    "1:1" to "Square Post",
    "4:5" to "Instagram Portrait",
    "3:4" to "iPad / Tablet",
    "2:3" to "Photo Portrait",
    "4:3" to "Classic Display",
    "21:9" to "Cinematic Film"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.Crop, contentDescription = null, tint = OrangePrimary)
          Spacer(modifier = Modifier.width(8.dp))
          Text("Crop & Format", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("Select social canvas ratio and crop zoom level", fontSize = 12.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(16.dp))

      // Ratio Cards Grid
      Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        ratios.chunked(2).forEach { rowRatios ->
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            rowRatios.forEach { (rKey, rDesc) ->
              val isSel = selectedRatio == rKey
              Card(
                onClick = { selectedRatio = rKey },
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = if (isSel) OrangeContainer else Color(0xFFF9FAFB)),
                border = BorderStroke(1.5.dp, if (isSel) OrangePrimary else Color(0xFFE5E7EB)),
                modifier = Modifier.weight(1f)
              ) {
                Column(modifier = Modifier.padding(10.dp)) {
                  Text(rKey, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = if (isSel) OrangePrimary else Color(0xFF1F2937))
                  Text(rDesc, fontSize = 10.sp, color = Color(0xFF6B7280))
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
      Text("Zoom & Scale: %.1fx".format(zoomLevel), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Slider(
        value = zoomLevel,
        onValueChange = { zoomLevel = it },
        valueRange = 1.0f..3.0f,
        colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary)
      )

      Spacer(modifier = Modifier.height(16.dp))
      Button(
        onClick = { onApplyCrop(selectedRatio, zoomLevel) },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().height(48.dp)
      ) {
        Text("Apply Crop", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
      }
      Spacer(modifier = Modifier.height(12.dp))
    }
  }
}

/**
 * 3. Enhance Sheet: Brightness, Contrast, Saturation, Warmth & 1-Tap AI Auto Enhance
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickEnhanceSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyEnhance: (b: Float, c: Float, s: Float, w: Float) -> Unit
) {
  var brightness by remember(clip) { mutableFloatStateOf(clip.brightness) }
  var contrast by remember(clip) { mutableFloatStateOf(clip.contrast) }
  var saturation by remember(clip) { mutableFloatStateOf(clip.saturation) }
  var warmth by remember(clip) { mutableFloatStateOf(clip.warmth) }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .verticalScroll(rememberScrollState())
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = OrangePrimary)
          Spacer(modifier = Modifier.width(8.dp))
          Text("Enhance & Color Tuning", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("Adjust color parameters or use 1-tap AI Auto-Enhance", fontSize = 12.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(14.dp))

      // 1-Tap AI Auto-Enhance Card
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
        border = BorderStroke(1.5.dp, Color(0xFF3B82F6)),
        onClick = {
          brightness = 15f
          contrast = 20f
          saturation = 25f
          warmth = 10f
        },
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier.padding(14.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Surface(shape = CircleShape, color = Color(0xFF3B82F6), modifier = Modifier.size(36.dp)) {
            Box(contentAlignment = Alignment.Center) {
              Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
            }
          }
          Spacer(modifier = Modifier.width(12.dp))
          Column(modifier = Modifier.weight(1f)) {
            Text("1-Tap AI Auto-Enhance", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF1E3A8A))
            Text("Instantly balance exposure, clarity & vibrant pop", fontSize = 11.sp, color = Color(0xFF3B82F6))
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Brightness
      Text("Brightness (${brightness.toInt()})", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Slider(
        value = brightness,
        onValueChange = { brightness = it },
        valueRange = -50f..50f,
        colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary)
      )

      // Contrast
      Text("Contrast (${contrast.toInt()})", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Slider(
        value = contrast,
        onValueChange = { contrast = it },
        valueRange = -50f..50f,
        colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary)
      )

      // Saturation
      Text("Saturation (${saturation.toInt()})", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Slider(
        value = saturation,
        onValueChange = { saturation = it },
        valueRange = -50f..50f,
        colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary)
      )

      // Warmth
      Text("Warmth (${warmth.toInt()})", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Slider(
        value = warmth,
        onValueChange = { warmth = it },
        valueRange = -50f..50f,
        colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary)
      )

      Spacer(modifier = Modifier.height(10.dp))
      Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
        OutlinedButton(
          onClick = {
            brightness = 0f
            contrast = 0f
            saturation = 0f
            warmth = 0f
          },
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.weight(1f).height(48.dp)
        ) {
          Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Reset")
        }
        Button(
          onClick = { onApplyEnhance(brightness, contrast, saturation, warmth) },
          colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.weight(1.5f).height(48.dp)
        ) {
          Text("Apply Enhance", fontWeight = FontWeight.Bold, color = Color.White)
        }
      }
      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

/**
 * 4. Stickers & Overlays Sheet: Emojis, Creator Badges, VFX Elements & Arrows
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickStickerSheet(
  onDismiss: () -> Unit,
  onAddSticker: (String) -> Unit
) {
  var selectedCategory by remember { mutableIntStateOf(0) }
  val categories = listOf("🔥 Viral", "🎬 Badges", "⚡ VFX", "🎯 Arrows", "✨ Reactions")

  val viralStickers = listOf(
    "🔥", "💥", "✨", "💯", "🚀", "⚡", "🎉", "👑", "⭐", "❤️",
    "😍", "😂", "🤯", "🥶", "💀", "🙌", "🤩", "👀", "💪", "👏"
  )
  val badges = listOf(
    "SUBSCRIBE", "LIKE 👍", "FOLLOW", "SHARE", "NEW ⚡", "VIP 👑",
    "VLOG 🎥", "LIVE 🔴", "TOP 10", "TRENDING", "WARNING ⚠️", "100% REAL"
  )
  val vfxElements = listOf(
    "⚡ Lightning", "💥 Explosion", "🔥 Fireball", "✨ Sparkle", "🌀 Vortex",
    "💫 Star Trail", "🌪️ Cyclone", "☄️ Meteor", "🔮 Plasma", "🌈 Aurora"
  )
  val arrows = listOf(
    "👉", "👈", "👆", "👇", "➡️", "⬅️", "⬆️", "⬇️", "🎯", "📍", "🛑", "⚠️"
  )
  val reactions = listOf(
    "OMG! 😱", "WOW! 🤩", "EPIC 🔥", "NO WAY! 🤯", "SUS 👀", "LOL 😂",
    "GOAT 🐐", "SHEESH 🥶", "OP! 💥", "CHAD 🗿"
  )

  val currentList = when (selectedCategory) {
    0 -> viralStickers
    1 -> badges
    2 -> vfxElements
    3 -> arrows
    else -> reactions
  }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text("Stickers & Badges", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("Tap any sticker or badge to insert on playhead", fontSize = 12.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(12.dp))

      // Category selector
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(categories.indices.toList()) { idx ->
          val isSel = selectedCategory == idx
          FilterChip(
            selected = isSel,
            onClick = { selectedCategory = idx },
            label = { Text(categories[idx]) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangePrimary,
              selectedLabelColor = Color.White
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Grid of items
      LazyVerticalGrid(
        columns = GridCells.Fixed(if (selectedCategory == 1 || selectedCategory == 4) 2 else 4),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth().height(260.dp)
      ) {
        items(currentList) { item ->
          Card(
            onClick = {
              onAddSticker(item)
              onDismiss()
            },
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF9FAFB)),
            border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
            modifier = Modifier.fillMaxWidth()
          ) {
            Box(
              modifier = Modifier.fillMaxWidth().padding(10.dp),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = item,
                fontSize = if (selectedCategory == 0 || selectedCategory == 3) 28.sp else 13.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

/**
 * 5. Text Designer Sheet: Fonts, Styles, Presets, Colors & Sizes
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickTextDesignerSheet(
  onDismiss: () -> Unit,
  onApplyText: (text: String, font: String, style: String, color: Color) -> Unit
) {
  var textInput by remember { mutableStateOf("Trending Title") }
  var selectedFont by remember { mutableStateOf("Impact Bold") }
  var selectedStyle by remember { mutableStateOf("Hormozi Viral") }
  var selectedColor by remember { mutableStateOf(Color(0xFFFACC15)) }
  var isAllCaps by remember { mutableStateOf(true) }
  var hasShadow by remember { mutableStateOf(true) }

  val fontOptions = listOf(
    "Impact Bold" to "Heavy condensed display typography",
    "Bebas Viral" to "Ultra-tall bold YouTube / TikTok font",
    "Montserrat Clean" to "Modern geometric sans-serif",
    "Anton Grotesk" to "Punchy high-contrast video heading",
    "Cinematic Serif" to "Elegant editorial movie luxury serif",
    "Monospace Code" to "Cyberpunk terminal tech code font",
    "Brush Script" to "Dynamic hand-drawn signature script",
    "Comic Pop" to "Playful bold cartoon comic style",
    "Futuristic Tech" to "Sharp sci-fi gaming modern style",
    "Retro Pixel" to "8-bit nostalgic arcade gaming font"
  )

  val stylePresets = listOf(
    "Hormozi Viral" to Color(0xFFFACC15),
    "Beast Dynamic" to Color(0xFF4ADE80),
    "Neon Cyan Glow" to Color(0xFF00E5FF),
    "Cyber Violet" to Color(0xFFE040FB),
    "Fire Crimson" to Color(0xFFFF3344),
    "Golden Luxury" to Color(0xFFFFD700),
    "Subtitle Black Pill" to Color(0xFFFFFFFF),
    "Yellow Box Highlight" to Color(0xFF000000),
    "Ghost White" to Color(0xFFFFFFFF),
    "Hot Pink Pop" to Color(0xFFFF4081),
    "Sunset Orange" to Color(0xFFFF6D00),
    "Electric Lime" to Color(0xFF76FF03)
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .verticalScroll(rememberScrollState())
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.TextFields, contentDescription = null, tint = OrangePrimary)
          Spacer(modifier = Modifier.width(8.dp))
          Text("VFX Pro Typography & Motion Titles", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("Customize typography, fonts, strokes, glows & viral presets", fontSize = 12.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(14.dp))

      // Text Input Field
      OutlinedTextField(
        value = textInput,
        onValueChange = { textInput = it },
        label = { Text("Enter Subtitle / Caption Text") },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Live Text Preview Card with dark canvas
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        border = BorderStroke(1.5.dp, Color(0xFF334155)),
        modifier = Modifier.fillMaxWidth().height(95.dp)
      ) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          val fFamily = com.example.ui.theme.AppFonts.getFontFamily(selectedFont)

          val displayText = if (isAllCaps) (textInput.ifEmpty { "Sample Text" }).uppercase() else (textInput.ifEmpty { "Sample Text" })
          val isPill = selectedStyle == "Subtitle Black Pill"
          val isYellowBox = selectedStyle == "Yellow Box Highlight"

          Box(
            modifier = Modifier
              .background(
                when {
                  isPill -> Color(0xDD000000)
                  isYellowBox -> Color(0xFFFACC15)
                  else -> Color.Transparent
                },
                RoundedCornerShape(8.dp)
              )
              .padding(horizontal = 14.dp, vertical = 6.dp)
          ) {
            Text(
              text = displayText,
              fontFamily = fFamily,
              fontSize = 24.sp,
              fontWeight = FontWeight.Black,
              color = if (isYellowBox) Color.Black else selectedColor,
              textAlign = TextAlign.Center
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Quick Format Toggles: ALL CAPS, Shadow
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        FilterChip(
          selected = isAllCaps,
          onClick = { isAllCaps = !isAllCaps },
          label = { Text("ALL CAPS") },
          leadingIcon = {
            if (isAllCaps) Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
          },
          colors = FilterChipDefaults.filterChipColors(selectedContainerColor = OrangePrimary, selectedLabelColor = Color.White)
        )
        FilterChip(
          selected = hasShadow,
          onClick = { hasShadow = !hasShadow },
          label = { Text("Deep Shadow") },
          leadingIcon = {
            if (hasShadow) Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
          },
          colors = FilterChipDefaults.filterChipColors(selectedContainerColor = OrangePrimary, selectedLabelColor = Color.White)
        )
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Font Family selection with real font rendering
      Text("Select Font Typography (${fontOptions.size})", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF374151))
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(fontOptions) { (font, desc) ->
          val isSel = selectedFont == font
          val itemFont = com.example.ui.theme.AppFonts.getFontFamily(font)
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isSel) OrangeContainer else Color(0xFFF9FAFB),
            border = BorderStroke(1.5.dp, if (isSel) OrangePrimary else Color(0xFFE5E7EB)),
            modifier = Modifier.clickable { selectedFont = font }
          ) {
            Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)) {
              Text(
                text = font,
                fontFamily = itemFont,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = if (isSel) OrangePrimary else Color(0xFF1E293B)
              )
              Text(
                text = desc,
                fontSize = 9.sp,
                color = Color(0xFF64748B)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Style & Color Presets (VFX Pro Cinema styles)
      Text("VFX Pro Studio Typography Presets (${stylePresets.size})", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF374151))
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(stylePresets) { (name, col) ->
          val isSel = selectedStyle == name
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isSel) OrangeContainer else Color(0xFFF9FAFB),
            border = BorderStroke(1.5.dp, if (isSel) OrangePrimary else Color(0xFFE5E7EB)),
            modifier = Modifier.clickable {
              selectedStyle = name
              selectedColor = col
            }
          ) {
            Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
              Box(modifier = Modifier.size(16.dp).background(col, CircleShape).border(1.dp, Color(0x33000000), CircleShape))
              Spacer(modifier = Modifier.width(6.dp))
              Text(name, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = if (isSel) OrangePrimary else Color(0xFF1F2937))
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))
      Button(
        onClick = {
          if (textInput.isNotBlank()) {
            val finalOutput = if (isAllCaps) textInput.uppercase() else textInput
            onApplyText(finalOutput, selectedFont, selectedStyle, selectedColor)
            onDismiss()
          }
        },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().height(50.dp)
      ) {
        Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
        Spacer(modifier = Modifier.width(6.dp))
        Text("Add Styled Text to Timeline", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
      }
      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

/**
 * 6. Effects (VFX) Sheet: Expanded to 68+ VFX Presets across 10 Categories
 * VFX Pro Cinema Engine with Live Intensity, Speed, Atmosphere & Color Tint controls.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickEffectsSheet(
  currentEffect: String,
  currentIntensity: Float = 0.85f,
  currentSpeed: Float = 1.0f,
  currentColor: Long = 0xFF00E5FF,
  currentAtmosphere: Float = 0.5f,
  onDismiss: () -> Unit,
  onApplyEffect: (effect: String, intensity: Float, speed: Float, color: Long, atmosphere: Float) -> Unit,
  onApplyToAll: (effect: String, intensity: Float, speed: Float, color: Long, atmosphere: Float) -> Unit = { _, _, _, _, _ -> }
) {
  var selectedEffect by remember { mutableStateOf(currentEffect) }
  var intensity by remember { mutableFloatStateOf(currentIntensity) }
  var speed by remember { mutableFloatStateOf(currentSpeed) }
  var selectedColor by remember { mutableStateOf(currentColor) }
  var atmosphere by remember { mutableFloatStateOf(currentAtmosphere) }
  var selectedCategory by remember { mutableStateOf("Trending") }

  val effectCategories = listOf(
    "Trending",
    "Retro & Film",
    "Glitch & Data",
    "Light & Glow",
    "Distortion",
    "Atmosphere",
    "Action & Anime",
    "Night & Vision",
    "Artistic",
    "Cinematic"
  )

  data class EffectData(val name: String, val desc: String, val category: String)

  val allEffects = listOf(
    // 1. Trending & Viral (8)
    EffectData("None", "Original clean video", "Trending"),
    EffectData("Glitch RGB", "Chromatic split & digital glitch", "Trending"),
    EffectData("White Strobe", "High energy white strobe beat flash", "Trending"),
    EffectData("Camera Shake", "Action earthquake dynamic camera tremor", "Trending"),
    EffectData("Zoom Blur", "High-velocity center impact zoom blur", "Trending"),
    EffectData("Sparkles", "Magical fairy shimmer glitter sparkles", "Trending"),
    EffectData("Edge Glow Pulse", "Dynamic radiant edge illumination", "Trending"),
    EffectData("Optical Flash", "Subtle white flash on impact beats", "Trending"),

    // 2. Retro & Film (8)
    EffectData("VHS 1980s", "Classic retro tape scanlines & chromatic wear", "Retro & Film"),
    EffectData("Film Grain", "35mm analog cinema dirty film grain", "Retro & Film"),
    EffectData("Vintage 8mm", "Old projector flicker & nostalgic sepia frame", "Retro & Film"),
    EffectData("Retro TV Noise", "Cathode ray tube interlaced static noise", "Retro & Film"),
    EffectData("Super 8 Dust", "Analog dust specks, scratches & jitter", "Retro & Film"),
    EffectData("90s Camcorder", "Old-school date stamp & green phosphor", "Retro & Film"),
    EffectData("Polaroid Fade", "Faded chemical instant photo tone", "Retro & Film"),
    EffectData("Light Leak 70s", "Warm vintage anamorphic lens burns", "Retro & Film"),

    // 3. Glitch & Datamosh (7)
    EffectData("RGB Split Shift", "Dual color prism horizontal chromatic drift", "Glitch & Data"),
    EffectData("Cyber Glitch Byte", "Digital datamosh artifact pixel stretch", "Glitch & Data"),
    EffectData("Matrix Glow", "Cyberpunk falling neon digital cascade", "Glitch & Data"),
    EffectData("Bad Signal Jammer", "Heavy analog interference transmission drop", "Glitch & Data"),
    EffectData("Pixel Sorter", "Algorithmic pixel displacement sort", "Glitch & Data"),
    EffectData("Interlaced Wave", "High-frequency horizontal scanline distortion", "Glitch & Data"),
    EffectData("TV CRT Scan", "Cathode tube curved glass scan beam", "Glitch & Data"),

    // 4. Light & Glow (7)
    EffectData("Lens Flare", "Hollywood anamorphic horizontal golden streak", "Light & Glow"),
    EffectData("Neon Bloom", "Intense hyper-bright cyberpunk edge glow", "Light & Glow"),
    EffectData("Heart Bokeh", "Dreamy romantic pastel heart light spheres", "Light & Glow"),
    EffectData("Golden Hour Ray", "Warm atmospheric sunset volumetric sunbeams", "Light & Glow"),
    EffectData("Rainbow Prism", "Multi-spectral crystal refraction flare", "Light & Glow"),
    EffectData("Dreamy Soft Glow", "Soft ethereal diffuse bloom filter", "Light & Glow"),
    EffectData("Cyber Laser Beams", "Neon cutting laser beams across scene", "Light & Glow"),

    // 5. Distortion & 3D (7)
    EffectData("Wave Warp", "Underwater wavy fluid liquid ripples", "Distortion"),
    EffectData("Radial Fish Eye", "Ultra wide angle curved fisheye bubble distortion", "Distortion"),
    EffectData("Mirror Reflection", "Symmetric dual mirror kaleidoscope prism", "Distortion"),
    EffectData("Swirl Vortex", "Hypnotic rotating vortex spiral distortion", "Distortion"),
    EffectData("Kaleidoscope 8-Way", "8-facet geometric kaleidoscopic reflection", "Distortion"),
    EffectData("Tilt-Shift Miniature", "Cinematic shallow-depth diorama blur", "Distortion"),
    EffectData("Underwater Ripple", "Submerged aquatic caustic refraction waves", "Distortion"),

    // 6. Atmosphere & Elements (8)
    EffectData("Smoke Fog", "Mysterious dense atmospheric smoke haze", "Atmosphere"),
    EffectData("Rain Drops", "Cinematic rain streaks & blurred window droplets", "Atmosphere"),
    EffectData("Snow Winter", "Gentle falling festive snow & frost particles", "Atmosphere"),
    EffectData("Fire Embers", "Floating intense burning fire embers & sparks", "Atmosphere"),
    EffectData("Lightning Strike", "Electric thunderstorm flash & lightning bolts", "Atmosphere"),
    EffectData("Sakura Blossoms", "Japanese pink cherry blossom petals drift", "Atmosphere"),
    EffectData("Cosmic Stardust", "Interstellar shimmering nebula particles", "Atmosphere"),
    EffectData("Underwater Bubbles", "Rising effervescent aquatic bubbles", "Atmosphere"),

    // 7. Action & Comic / Anime (6)
    EffectData("Manga Speed Lines", "High-octane anime radial action speed lines", "Action & Anime"),
    EffectData("Comic Halftone", "Classic pop-art halftone CMYK print dots", "Action & Anime"),
    EffectData("Super Saiyan Aura", "Golden roaring Dragon Ball flaming aura", "Action & Anime"),
    EffectData("Action Impact Blast", "Radial sonic shockwave punch explosion", "Action & Anime"),
    EffectData("Neon Cyber Outline", "Futuristic glowing vector silhouette trace", "Action & Anime"),
    EffectData("Anime Motion Streaks", "High-velocity streak lines across frame", "Action & Anime"),

    // 8. Night & Vision (6)
    EffectData("Cyber Thermal Vision", "FLIR heat-map predator thermal infrared", "Night & Vision"),
    EffectData("Night Vision Gen-3", "Military phosphor green night optic boost", "Night & Vision"),
    EffectData("Inverted Negative", "Graphic photo negative film inversion", "Night & Vision"),
    EffectData("Infrared Crimson", "Deep infrared surveillance monochrome", "Night & Vision"),
    EffectData("Cyber X-Ray", "High-contrast skeletal X-ray radiograph", "Night & Vision"),
    EffectData("Matrix Wireframe", "3D cyber matrix vector coordinate grid", "Night & Vision"),

    // 9. Artistic & Painterly (6)
    EffectData("Oil Paint Canvas", "Impressionist heavy textured brush strokes", "Artistic"),
    EffectData("Charcoal Sketch", "Monochrome fine-art charcoal pencil sketch", "Artistic"),
    EffectData("Vaporwave Sunset", "80s synthwave neon magenta retro aesthetic", "Artistic"),
    EffectData("Water Color Flow", "Soft bleeding watercolor pigments on paper", "Artistic"),
    EffectData("Pixel 8-Bit Retro", "Vintage arcade pixelated game console look", "Artistic"),
    EffectData("Duotone Gradient", "Editorial bold dual-tone color mapping", "Artistic"),

    // 10. Opening & Cinematic (5)
    EffectData("Cinematic Letterbox", "2.39:1 Hollywood cinema scope letterbox", "Cinematic"),
    EffectData("Film Leader Countdown", "Vintage 3-2-1 film reel intro countdown", "Cinematic"),
    EffectData("Blur Fade Reveal", "Soft focus dreamy opening reveal transition", "Cinematic"),
    EffectData("Black Hole Pull", "Gravitational center black hole spacetime pull", "Cinematic"),
    EffectData("TV Turn Off Line", "Old cathode ray tube horizontal collapse beam", "Cinematic")
  )

  val filteredEffects = allEffects.filter { it.category == selectedCategory || (selectedCategory == "Trending" && it.name in listOf("None", "Glitch RGB", "White Strobe", "Camera Shake", "Zoom Blur", "Sparkles", "VHS 1980s", "Neon Bloom")) }

  val colorPalette = listOf(
    0xFF00E5FF to "Cyan",
    0xFFFFD700 to "Gold",
    0xFFFF1744 to "Crimson",
    0xFFFF007F to "Neon Pink",
    0xFF00E676 to "Emerald",
    0xFF8A2BE2 to "Purple",
    0xFFFFFFFF to "White"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 8.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = OrangeContainer,
            border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.5f)),
            modifier = Modifier.size(36.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(20.dp))
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text("Pro VFX Suite (${allEffects.size} Effects)", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
            Text("VFX Pro Cinema Engine • Live GPU Shader Sliders", fontSize = 11.sp, color = Color(0xFF64748B))
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Category filter tabs
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(effectCategories) { cat ->
          val isSel = selectedCategory == cat
          FilterChip(
            selected = isSel,
            onClick = { selectedCategory = cat },
            label = { Text(cat, fontSize = 11.sp, fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangePrimary,
              selectedLabelColor = Color.White
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Effects Grid
      LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(230.dp)
      ) {
        items(filteredEffects) { effect ->
          val isSel = selectedEffect == effect.name
          Card(
            onClick = {
              selectedEffect = effect.name
              onApplyEffect(effect.name, intensity, speed, selectedColor, atmosphere)
            },
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = if (isSel) OrangeContainer else Color(0xFFF9FAFB)),
            border = BorderStroke(1.5.dp, if (isSel) OrangePrimary else Color(0xFFE5E7EB)),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(modifier = Modifier.padding(10.dp)) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                if (isSel) {
                  Icon(Icons.Default.Check, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(16.dp))
                  Spacer(modifier = Modifier.width(4.dp))
                }
                Text(
                  effect.name,
                  fontWeight = FontWeight.Bold,
                  fontSize = 12.sp,
                  color = if (isSel) OrangePrimary else Color(0xFF1F2937)
                )
              }
              Spacer(modifier = Modifier.height(2.dp))
              Text(effect.desc, fontSize = 9.sp, color = Color(0xFF6B7280), maxLines = 1)
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Live VFX Parameter Sliders (VFX Pro Cinema Feature)
      if (selectedEffect != "None") {
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = Color(0xFFF8FAFC),
          border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Text(
              "Effect Fine-Tuning: $selectedEffect",
              fontWeight = FontWeight.Bold,
              fontSize = 12.sp,
              color = Color(0xFF0F172A)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Slider 1: Intensity
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("Effect Intensity / Strength", fontSize = 11.sp, color = Color(0xFF475569))
              Text("${(intensity * 100).toInt()}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
            }
            Slider(
              value = intensity,
              onValueChange = {
                intensity = it
                onApplyEffect(selectedEffect, intensity, speed, selectedColor, atmosphere)
              },
              valueRange = 0.1f..1.0f,
              colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary),
              modifier = Modifier.fillMaxWidth()
            )

            // Slider 2: Speed / Frequency
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("Effect Speed / Rate", fontSize = 11.sp, color = Color(0xFF475569))
              Text("%.1fx".format(speed), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
            }
            Slider(
              value = speed,
              onValueChange = {
                speed = it
                onApplyEffect(selectedEffect, intensity, speed, selectedColor, atmosphere)
              },
              valueRange = 0.2f..3.0f,
              colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary),
              modifier = Modifier.fillMaxWidth()
            )

            // Color Palette Selector
            Text("VFX Glow & Aura Tint", fontSize = 11.sp, color = Color(0xFF475569))
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              items(colorPalette) { (cHex, name) ->
                val isColorSel = selectedColor == cHex
                Box(
                  modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(Color(cHex))
                    .border(if (isColorSel) 2.5.dp else 1.dp, if (isColorSel) OrangePrimary else Color(0x33000000), CircleShape)
                    .clickable {
                      selectedColor = cHex
                      onApplyEffect(selectedEffect, intensity, speed, selectedColor, atmosphere)
                    },
                  contentAlignment = Alignment.Center
                ) {
                  if (isColorSel) {
                    Icon(Icons.Default.Check, contentDescription = name, tint = if (cHex == 0xFFFFFFFF) Color.Black else Color.White, modifier = Modifier.size(16.dp))
                  }
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Bottom Action Buttons: Apply to Clip & Apply to All
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        OutlinedButton(
          onClick = {
            onApplyToAll(selectedEffect, intensity, speed, selectedColor, atmosphere)
            onDismiss()
          },
          border = BorderStroke(1.dp, OrangePrimary),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1f)
            .height(44.dp)
        ) {
          Text("Apply to All Clips", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = OrangePrimary)
        }

        Button(
          onClick = {
            onApplyEffect(selectedEffect, intensity, speed, selectedColor, atmosphere)
            onDismiss()
          },
          colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1.2f)
            .height(44.dp)
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(4.dp))
          Text("Apply Effect", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }

      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

/**
 * 7. Body Effect Sheet: VFX Pro AI Body Tracking (Halo, Wings, Lightning, Aura, Laser Eyes)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickBodyEffectSheet(
  currentBodyEffect: String,
  currentEffectColor: Long = 0xFF00E5FF,
  currentIntensity: Float = 0.85f,
  onDismiss: () -> Unit,
  onApplyBodyEffect: (String, Long, Float) -> Unit
) {
  var selectedEffect by remember { mutableStateOf(currentBodyEffect) }
  var selectedColor by remember { mutableStateOf(currentEffectColor) }
  var intensity by remember { mutableFloatStateOf(currentIntensity) }

  val bodyEffects = listOf(
    "None" to "No Body Effect",
    "Glowing Halo" to "Golden / Neon Saint Halo over head",
    "Angel Wings" to "Radiant Feathered Light Wings on Shoulders",
    "Cyber Wings" to "Mecha Holographic Neon Blade Wings",
    "Lightning Stroke" to "High-Voltage Electric Body Arcs",
    "Super Saiyan Aura" to "Golden Flaming Dragon Energy Shield",
    "Laser Eyes" to "Cybernetic High-Power Laser Eye Beams",
    "Ghost Clone Trail" to "Multi-pass RGB Motion Echo & Clones",
    "Cyber Edge" to "Tron Matrix Neon Silhouette Grid",
    "Cosmic Nebula" to "Galaxy Star Dust Ki Shield"
  )

  val colorPalette = listOf(
    0xFF00E5FF to "Cyan",
    0xFFFFD700 to "Gold",
    0xFFFF1744 to "Crimson",
    0xFFFF007F to "Neon Pink",
    0xFF00E676 to "Emerald",
    0xFF8A2BE2 to "Purple",
    0xFFFFFFFF to "White"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFF8B5CF6))
          Spacer(modifier = Modifier.width(8.dp))
          Text("VFX Pro AI Body Tracking", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("AI Body Tracking: Halos, Angel Wings, Lightning Arcs & Energy Auras", fontSize = 12.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(12.dp))

      LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth().height(220.dp)
      ) {
        items(bodyEffects) { (name, desc) ->
          val isSel = selectedEffect == name
          Card(
            onClick = { selectedEffect = name },
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = if (isSel) Color(0xFFF3E8FF) else Color(0xFFF9FAFB)),
            border = BorderStroke(1.5.dp, if (isSel) Color(0xFF8B5CF6) else Color(0xFFE5E7EB)),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(modifier = Modifier.padding(8.dp)) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                if (isSel) {
                  Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFF8B5CF6), modifier = Modifier.size(15.dp))
                  Spacer(modifier = Modifier.width(4.dp))
                }
                Text(name, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = if (isSel) Color(0xFF8B5CF6) else Color(0xFF1F2937))
              }
              Spacer(modifier = Modifier.height(2.dp))
              Text(desc, fontSize = 9.5.sp, color = Color(0xFF6B7280), maxLines = 2)
            }
          }
        }
      }

      if (selectedEffect != "None") {
        Spacer(modifier = Modifier.height(10.dp))
        Text("Effect Glow Color", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
        Spacer(modifier = Modifier.height(6.dp))
        Row(
          horizontalArrangement = Arrangement.spacedBy(10.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          colorPalette.forEach { (colorHex, _) ->
            val isColorSel = selectedColor == colorHex
            Box(
              modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(Color(colorHex))
                .border(
                  width = if (isColorSel) 2.5.dp else 1.dp,
                  color = if (isColorSel) Color(0xFF1F2937) else Color(0xFFD1D5DB),
                  shape = CircleShape
                )
                .clickable { selectedColor = colorHex },
              contentAlignment = Alignment.Center
            ) {
              if (isColorSel) {
                Icon(
                  Icons.Default.Check,
                  contentDescription = null,
                  tint = if (colorHex == 0xFFFFFFFFL) Color.Black else Color.White,
                  modifier = Modifier.size(16.dp)
                )
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Glow & Aura Intensity", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
          Text("${(intensity * 100).toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF8B5CF6))
        }
        Slider(
          value = intensity,
          onValueChange = { intensity = it },
          valueRange = 0.2f..1.0f,
          colors = SliderDefaults.colors(
            thumbColor = Color(0xFF8B5CF6),
            activeTrackColor = Color(0xFF8B5CF6)
          ),
          modifier = Modifier.fillMaxWidth()
        )
      }

      Spacer(modifier = Modifier.height(12.dp))
      Button(
        onClick = {
          onApplyBodyEffect(selectedEffect, selectedColor, intensity)
          onDismiss()
        },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF8B5CF6)),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth().height(44.dp)
      ) {
        Text("Apply Body Effect", fontWeight = FontWeight.Bold, color = Color.White)
      }

      Spacer(modifier = Modifier.height(8.dp))
    }
  }
}

/**
 * Optical Flow Motion Blur & Smooth Slow-Mo Sheet (VFX Pro Flagship Feature)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickMotionBlurSheet(
  motionBlurEnabled: Boolean,
  intensity: Float,
  shutterAngle: Int,
  blendPasses: Int,
  smoothSlowMoEnabled: Boolean,
  smoothSlowMoQuality: String,
  onDismiss: () -> Unit,
  onApply: (Boolean, Float, Int, Int, Boolean, String) -> Unit
) {
  var isBlurEnabled by remember { mutableStateOf(motionBlurEnabled) }
  var blurIntensity by remember { mutableFloatStateOf(intensity) }
  var currentShutterAngle by remember { mutableIntStateOf(shutterAngle) }
  var passes by remember { mutableIntStateOf(blendPasses) }
  var isSlowMoEnabled by remember { mutableStateOf(smoothSlowMoEnabled) }
  var slowMoQuality by remember { mutableStateOf(smoothSlowMoQuality) }

  val shutterPresets = listOf(90 to "90° Crisp", 180 to "180° Film", 360 to "360° Dream")
  val passPresets = listOf(2 to "2x Fast", 4 to "4x Balanced", 6 to "6x Ultra")
  val qualityOptions = listOf("Optical Flow", "Frame Blend", "Twixter AI")

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .navigationBarsPadding()
        .verticalScroll(rememberScrollState())
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.Speed, contentDescription = null, tint = Color(0xFF0284C7))
          Spacer(modifier = Modifier.width(8.dp))
          Text("Optical Flow & Motion Blur", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("VFX Pro Optical Flow Frame Interpolation & Directional Motion Blur", fontSize = 11.5.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(14.dp))

      // Section 1: Smooth Slow-Mo (Optical Flow)
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = if (isSlowMoEnabled) Color(0xFFE0F2FE) else Color(0xFFF9FAFB)),
        border = BorderStroke(1.dp, if (isSlowMoEnabled) Color(0xFF0284C7) else Color(0xFFE5E7EB)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text("Smooth Slow-Mo (Optical Flow)", fontWeight = FontWeight.Bold, fontSize = 13.5.sp, color = Color(0xFF0F172A))
              Text("AI frame blending generates silky 120FPS slow motion without stutter", fontSize = 10.sp, color = Color(0xFF64748B))
            }
            Switch(
              checked = isSlowMoEnabled,
              onCheckedChange = { isSlowMoEnabled = it },
              colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFF0284C7), checkedTrackColor = Color(0xFFBAE6FD))
            )
          }

          if (isSlowMoEnabled) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
              horizontalArrangement = Arrangement.spacedBy(6.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              qualityOptions.forEach { q ->
                val isSel = slowMoQuality == q
                FilterChip(
                  selected = isSel,
                  onClick = { slowMoQuality = q },
                  label = { Text(q, fontSize = 10.sp) },
                  colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF0284C7),
                    selectedLabelColor = Color.White,
                    containerColor = Color.White
                  ),
                  modifier = Modifier.weight(1f)
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Section 2: Motion Blur
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = if (isBlurEnabled) Color(0xFFF0FDF4) else Color(0xFFF9FAFB)),
        border = BorderStroke(1.dp, if (isBlurEnabled) Color(0xFF16A34A) else Color(0xFFE5E7EB)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text("Optical Flow Motion Blur", fontWeight = FontWeight.Bold, fontSize = 13.5.sp, color = Color(0xFF0F172A))
              Text("Directional shutter blur on fast camera sweeps and action cuts", fontSize = 10.sp, color = Color(0xFF64748B))
            }
            Switch(
              checked = isBlurEnabled,
              onCheckedChange = { isBlurEnabled = it },
              colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFF16A34A), checkedTrackColor = Color(0xFFBBF7D0))
            )
          }

          if (isBlurEnabled) {
            Spacer(modifier = Modifier.height(10.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("Blur Intensity", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
              Text("${blurIntensity.toInt()}%", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A))
            }
            Slider(
              value = blurIntensity,
              onValueChange = { blurIntensity = it },
              valueRange = 10f..100f,
              colors = SliderDefaults.colors(thumbColor = Color(0xFF16A34A), activeTrackColor = Color(0xFF16A34A)),
              modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(6.dp))
            Text("Shutter Angle (Motion Spread)", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
            Spacer(modifier = Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
              shutterPresets.forEach { (angle, label) ->
                val isAngleSel = currentShutterAngle == angle
                FilterChip(
                  selected = isAngleSel,
                  onClick = { currentShutterAngle = angle },
                  label = { Text(label, fontSize = 10.sp) },
                  colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF16A34A),
                    selectedLabelColor = Color.White,
                    containerColor = Color.White
                  ),
                  modifier = Modifier.weight(1f)
                )
              }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text("Blend Passes (Smoothness)", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
            Spacer(modifier = Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
              passPresets.forEach { (p, label) ->
                val isPassSel = passes == p
                FilterChip(
                  selected = isPassSel,
                  onClick = { passes = p },
                  label = { Text(label, fontSize = 10.sp) },
                  colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF16A34A),
                    selectedLabelColor = Color.White,
                    containerColor = Color.White
                  ),
                  modifier = Modifier.weight(1f)
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
      Button(
        onClick = {
          onApply(isBlurEnabled, blurIntensity, currentShutterAngle, passes, isSlowMoEnabled, slowMoQuality)
          onDismiss()
        },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth().height(44.dp)
      ) {
        Text("Apply Optical Flow & Blur", fontWeight = FontWeight.Bold, color = Color.White)
      }
      Spacer(modifier = Modifier.height(10.dp))
    }
  }
}

/**
 * 8. Background Sheet: Frosted Glass Blur, Studio Auto-Blur, Studio Solid Colors, Gradients
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickBackgroundSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyBackground: (blur: Float, colorHex: Long) -> Unit,
  initialAutoBlur: Boolean = true,
  onToggleAutoBlur: ((Boolean) -> Unit)? = null
) {
  var blurLevel by remember(clip) { mutableFloatStateOf(if (clip.bgBlur > 0f) clip.bgBlur else 35f) }
  var autoBlurActive by remember { mutableStateOf(initialAutoBlur) }
  var selectedColorHex by remember(clip) { mutableStateOf(clip.bgColor) }

  val blurPresets = listOf(
    "Off" to 0f,
    "Soft" to 15f,
    "Studio Pro" to 35f,
    "Deep" to 65f,
    "Heavy" to 90f
  )

  val colorPresets = listOf(
    "Black" to 0xFF000000,
    "White" to 0xFFFFFFFF,
    "Studio Grey" to 0xFF1E293B,
    "Warm Sunset" to 0xFFFF7A22,
    "Deep Indigo" to 0xFF4F46E5,
    "Emerald" to 0xFF10B981,
    "Crimson" to 0xFFE11D48,
    "Purple Haze" to 0xFF9333EA
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 10.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.Palette, contentDescription = null, tint = OrangePrimary)
          Spacer(modifier = Modifier.width(8.dp))
          Text("Canvas Background & Blur", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }
      Text("Studio cinematic auto-blurred video backdrop or solid canvas colors", fontSize = 12.sp, color = Color(0xFF6B7280))
      Spacer(modifier = Modifier.height(14.dp))

      // 1. Studio Auto-Blur Switch Card
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = if (autoBlurActive) Color(0xFFFFF7ED) else Color(0xFFF9FAFB),
        border = BorderStroke(1.5.dp, if (autoBlurActive) OrangePrimary else Color(0xFFE5E7EB)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 10.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("Auto Background Blur", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF1F2937))
              Spacer(modifier = Modifier.width(6.dp))
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = OrangePrimary.copy(alpha = 0.15f)
              ) {
                Text("CINEMA FIT", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = OrangePrimary, modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp))
              }
            }
            Text("Automatically blurs video behind letterbox/pillarbox borders", fontSize = 11.sp, color = Color(0xFF6B7280))
          }
          Switch(
            checked = autoBlurActive,
            onCheckedChange = {
              autoBlurActive = it
              if (it && blurLevel == 0f) blurLevel = 35f
              onToggleAutoBlur?.invoke(it)
            },
            colors = SwitchDefaults.colors(
              checkedThumbColor = Color.White,
              checkedTrackColor = OrangePrimary
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 2. Blur Intensity Presets
      Text("Frosted Blur Presets (${blurLevel.toInt()}%)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Spacer(modifier = Modifier.height(6.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        blurPresets.forEach { (label, value) ->
          val isSelected = kotlin.math.abs(blurLevel - value) < 8f
          OutlinedButton(
            onClick = {
              blurLevel = value
              if (value > 0f) autoBlurActive = true
            },
            shape = RoundedCornerShape(8.dp),
            border = BorderStroke(1.dp, if (isSelected) OrangePrimary else Color(0xFFE5E7EB)),
            colors = ButtonDefaults.outlinedButtonColors(
              containerColor = if (isSelected) OrangePrimary.copy(alpha = 0.12f) else Color.Transparent
            ),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
            modifier = Modifier.weight(1f)
          ) {
            Text(label, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal, color = if (isSelected) OrangePrimary else Color(0xFF4B5563))
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Blur Slider
      Slider(
        value = blurLevel,
        onValueChange = {
          blurLevel = it
          if (it > 0f) autoBlurActive = true
        },
        valueRange = 0f..100f,
        colors = SliderDefaults.colors(thumbColor = OrangePrimary, activeTrackColor = OrangePrimary)
      )

      Spacer(modifier = Modifier.height(14.dp))

      // Solid Colors Palette
      Text("Solid Canvas Colors", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Spacer(modifier = Modifier.height(8.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        items(colorPresets) { (name, hex) ->
          val isSel = selectedColorHex == hex
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.clickable { selectedColorHex = hex }
          ) {
            Box(
              modifier = Modifier
                .size(42.dp)
                .background(Color(hex), CircleShape)
                .border(2.dp, if (isSel) OrangePrimary else Color(0xFFD1D5DB), CircleShape),
              contentAlignment = Alignment.Center
            ) {
              if (isSel) {
                Icon(Icons.Default.Check, contentDescription = null, tint = if (hex == 0xFFFFFFFF) Color.Black else Color.White, modifier = Modifier.size(20.dp))
              }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(name, fontSize = 10.sp, color = Color(0xFF6B7280))
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))
      Button(
        onClick = {
          onApplyBackground(if (autoBlurActive) blurLevel.coerceAtLeast(15f) else blurLevel, selectedColorHex)
          onDismiss()
        },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().height(48.dp)
      ) {
        Text("Apply Background", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
      }
      Spacer(modifier = Modifier.height(12.dp))
    }
  }
}

/**
 * 9. VFX Pro AI Auto-Captions Bottom Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickAutoCaptionsSheet(
  captions: List<MediaClip>,
  activeStyle: String,
  totalDurationMs: Long,
  onDismiss: () -> Unit,
  onGenerateCaptions: (language: String, style: String) -> Unit,
  onUpdateCaptionText: (clipId: String, text: String) -> Unit,
  onRemoveCaption: (clipId: String) -> Unit,
  onAddCustomCaption: (text: String, startMs: Long) -> Unit,
  onApplyStyle: (style: String) -> Unit,
  onClearAll: () -> Unit
) {
  var selectedLanguage by remember { mutableStateOf("English (US)") }
  var selectedStyle by remember { mutableStateOf(activeStyle) }
  var newCaptionText by remember { mutableStateOf("") }
  var isGenerating by remember { mutableStateOf(false) }

  val languages = listOf("English (US)", "Hindi / Hinglish", "Spanish", "Auto-Detect")

  val stylePresets = listOf(
    Triple("Hormozi Viral", "Alex Hormozi style: bold yellow & white punch text", Color(0xFFFACC15)),
    Triple("Beast Pop", "MrBeast style: neon green pop with heavy outline", Color(0xFF22C55E)),
    Triple("Cinematic Minimal", "Classic documentary: clean white tracking", Color.White),
    Triple("Karaoke Wave", "Dynamic lyric bounce: glowing cyan rhythm", Color(0xFF06B6D4)),
    Triple("Cyber Boxed", "Futuristic pill: high-contrast boxed tags", Color(0xFFEAB308))
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 8.dp)
        .navigationBarsPadding()
        .verticalScroll(rememberScrollState())
    ) {
      // Top Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = OrangePrimary.copy(alpha = 0.15f),
            modifier = Modifier.size(36.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(Icons.Default.ClosedCaption, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(22.dp))
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("Auto-Captions", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1F2937))
              Spacer(modifier = Modifier.width(6.dp))
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF10B981)
              ) {
                Text("AI PRO", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp))
              }
            }
            Text("Speech-to-text with viral subtitle animations", fontSize = 12.sp, color = Color(0xFF6B7280))
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 1. Language Selector
      Text("Audio Spoken Language", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(languages) { lang ->
          val isSelected = selectedLanguage == lang
          FilterChip(
            selected = isSelected,
            onClick = { selectedLanguage = lang },
            label = { Text(lang, fontSize = 12.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
            leadingIcon = {
              if (isSelected) {
                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
              } else {
                Icon(Icons.Default.Translate, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color(0xFF6B7280))
              }
            },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangePrimary.copy(alpha = 0.15f),
              selectedLabelColor = OrangePrimary,
              selectedLeadingIconColor = OrangePrimary
            ),
            border = FilterChipDefaults.filterChipBorder(
              enabled = true,
              selected = isSelected,
              borderColor = Color(0xFFE5E7EB),
              selectedBorderColor = OrangePrimary
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 2. Subtitle Animation Style Presets
      Text("Caption Style & Animation", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
      Spacer(modifier = Modifier.height(8.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        items(stylePresets) { (name, desc, color) ->
          val isSelected = selectedStyle == name
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) Color(0xFF0F172A) else Color(0xFFF9FAFB),
            border = BorderStroke(1.5.dp, if (isSelected) OrangePrimary else Color(0xFFE5E7EB)),
            onClick = {
              selectedStyle = name
              onApplyStyle(name)
            },
            modifier = Modifier.width(160.dp)
          ) {
            Column(modifier = Modifier.padding(12.dp)) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Surface(
                  shape = CircleShape,
                  color = color,
                  modifier = Modifier.size(12.dp)
                ) {}
                if (isSelected) {
                  Icon(Icons.Default.Check, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(16.dp))
                }
              }
              Spacer(modifier = Modifier.height(8.dp))
              Text(
                text = name,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) Color.White else Color(0xFF1F2937)
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = desc,
                fontSize = 10.sp,
                color = if (isSelected) Color(0xFF94A3B8) else Color(0xFF6B7280),
                lineHeight = 13.sp
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // 3. Generate Auto-Captions Button
      Button(
        onClick = {
          onGenerateCaptions(selectedLanguage, selectedStyle)
        },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text("Generate Auto-Captions (AI)", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // 4. Synchronized Captions List
      if (captions.isNotEmpty()) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Timeline Captions (${captions.size})",
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1F2937)
          )
          TextButton(onClick = onClearAll) {
            Text("Clear All", fontSize = 12.sp, color = Color(0xFFEF4444))
          }
        }

        Spacer(modifier = Modifier.height(6.dp))

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          captions.forEachIndexed { idx, cap ->
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = Color(0xFFF9FAFB),
              border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                // Timecode pill
                Surface(
                  shape = RoundedCornerShape(6.dp),
                  color = OrangePrimary.copy(alpha = 0.12f),
                  modifier = Modifier.padding(end = 10.dp)
                ) {
                  val startSec = cap.startTimeMs / 1000f
                  val endSec = (cap.startTimeMs + cap.durationMs) / 1000f
                  Text(
                    text = String.format("%.1fs-%.1fs", startSec, endSec),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = OrangePrimary,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                  )
                }

                // Subtitle input
                OutlinedTextField(
                  value = cap.title,
                  onValueChange = { onUpdateCaptionText(cap.id, it) },
                  modifier = Modifier.weight(1f),
                  singleLine = true,
                  colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = OrangePrimary,
                    unfocusedBorderColor = Color(0xFFE5E7EB)
                  )
                )

                Spacer(modifier = Modifier.width(6.dp))

                IconButton(
                  onClick = { onRemoveCaption(cap.id) },
                  modifier = Modifier.size(32.dp)
                ) {
                  Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFF9CA3AF), modifier = Modifier.size(18.dp))
                }
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Add custom subtitle line
        Row(
          modifier = Modifier.fillMaxWidth(),
          verticalAlignment = Alignment.CenterVertically
        ) {
          OutlinedTextField(
            value = newCaptionText,
            onValueChange = { newCaptionText = it },
            placeholder = { Text("Add custom subtitle line...", fontSize = 12.sp) },
            modifier = Modifier.weight(1f),
            singleLine = true
          )
          Spacer(modifier = Modifier.width(8.dp))
          Button(
            onClick = {
              if (newCaptionText.isNotBlank()) {
                val nextStart = (captions.maxOfOrNull { it.startTimeMs + it.durationMs } ?: 0L).coerceAtMost(totalDurationMs)
                onAddCustomCaption(newCaptionText, nextStart)
                newCaptionText = ""
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
            shape = RoundedCornerShape(10.dp)
          ) {
            Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
          }
        }
      } else {
        // Helpful banner when no captions yet
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = Color(0xFFF8FAFC),
          border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Icon(Icons.Default.Subtitles, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.height(6.dp))
            Text("No Captions Yet", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              "Tap 'Generate Auto-Captions' above to transcribe voiceover into synchronized viral subtitles!",
              fontSize = 11.sp,
              color = Color(0xFF64748B),
              textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Bottom Done Button
      OutlinedButton(
        onClick = onDismiss,
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.5.dp, Color(0xFFD1D5DB)),
        modifier = Modifier
          .fillMaxWidth()
          .height(46.dp)
      ) {
        Text("Done", fontWeight = FontWeight.SemiBold, color = Color(0xFF374151), fontSize = 14.sp)
      }

      Spacer(modifier = Modifier.height(12.dp))
    }
  }
}

/**
 * 12. AI Smart Cutout Sheet: 1-Tap subject isolation, background removal, and sticker outlines
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickSmartCutoutSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyCutout: (Boolean, String, Float, Boolean, String) -> Unit,
  onApplyToAll: (Boolean, String, Float, Boolean, String) -> Unit
) {
  var isEnabled by remember(clip) { mutableStateOf(clip.isCutoutEnabled) }
  var selectedStrokeEffect by remember(clip) { mutableStateOf(clip.cutoutStrokeEffect) }
  var strokeWidth by remember(clip) { mutableFloatStateOf(clip.cutoutStrokeWidth) }
  var isInverted by remember(clip) { mutableStateOf(clip.cutoutInverted) }
  var selectedBgReplacement by remember(clip) { mutableStateOf(clip.cutoutBgReplacement) }

  val outlineEffects = listOf(
    "None" to Color(0xFF94A3B8),
    "White Sticker" to Color.White,
    "Neon Cyan" to Color(0xFF06B6D4),
    "Neon Orange" to Color(0xFFFF7A22),
    "Neon Purple" to Color(0xFFA855F7),
    "Shadow Glow" to Color(0xFF334155)
  )

  val bgReplacements = listOf(
    "Transparent" to "Clear Overlay",
    "Dark Studio" to "#0F172A Studio",
    "Cyber Grid" to "Creator Grid",
    "Neon Gradient" to "Vibrant Glow",
    "Frosted Blur" to "Ambient Blur"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937),
    shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = CircleShape,
            color = Color(0xFFFDF2F8),
            border = BorderStroke(1.dp, Color(0xFFFBCFE8)),
            modifier = Modifier.size(38.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.ContentCut,
                contentDescription = null,
                tint = Color(0xFFEC4899),
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "AI Smart Cutout",
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF1F2937)
            )
            Text(
              text = "Auto-isolate subject without green screen",
              fontSize = 11.sp,
              color = Color(0xFF6B7280)
            )
          }
        }

        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Master Toggle Switch Card
      Surface(
        shape = RoundedCornerShape(14.dp),
        color = if (isEnabled) Color(0xFFFDF2F8) else Color(0xFFF9FAFB),
        border = BorderStroke(1.5.dp, if (isEnabled) Color(0xFFEC4899) else Color(0xFFE5E7EB)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text(
              text = if (isEnabled) "✂ Subject Cutout Active" else "Enable Smart Cutout",
              fontWeight = FontWeight.Bold,
              fontSize = 14.sp,
              color = if (isEnabled) Color(0xFFBE185D) else Color(0xFF1F2937)
            )
            Text(
              text = "Neural mask separates foreground subject in real time",
              fontSize = 11.sp,
              color = Color(0xFF6B7280)
            )
          }

          Switch(
            checked = isEnabled,
            onCheckedChange = { isEnabled = it },
            colors = SwitchDefaults.colors(
              checkedThumbColor = Color.White,
              checkedTrackColor = Color(0xFFEC4899),
              uncheckedThumbColor = Color(0xFF9CA3AF),
              uncheckedTrackColor = Color(0xFFE5E7EB)
            )
          )
        }
      }

      if (isEnabled) {
        Spacer(modifier = Modifier.height(14.dp))

        // Visual Cutout Simulator / Preview Box
        Card(
          shape = RoundedCornerShape(14.dp),
          colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
          modifier = Modifier
            .fillMaxWidth()
            .height(130.dp)
        ) {
          Box(modifier = Modifier.fillMaxSize()) {
            // Background representation
            val simBrush = when (selectedBgReplacement) {
              "Dark Studio" -> Brush.radialGradient(listOf(Color(0xFF334155), Color(0xFF0F172A)))
              "Cyber Grid" -> Brush.linearGradient(listOf(Color(0xFF020617), Color(0xFF1E1B4B)))
              "Neon Gradient" -> Brush.linearGradient(listOf(Color(0xFFFF007A), Color(0xFF7928CA), Color(0xFF0070F3)))
              "Frosted Blur" -> Brush.verticalGradient(listOf(Color(0x88000000), Color(0xBB1E293B)))
              else -> Brush.verticalGradient(listOf(Color(0xFF1E293B), Color(0xFF0F172A))) // Transparent
            }
            Box(
              modifier = Modifier
                .fillMaxSize()
                .background(simBrush)
            )

            // Centered subject silhouette with chosen border
            val simStrokeColor = when (selectedStrokeEffect) {
              "White Sticker" -> Color.White
              "Neon Cyan" -> Color(0xFF06B6D4)
              "Neon Orange" -> Color(0xFFFF7A22)
              "Neon Purple" -> Color(0xFFA855F7)
              "Shadow Glow" -> Color(0xFF0F172A)
              else -> Color.Transparent
            }

            Box(
              modifier = Modifier
                .align(Alignment.Center)
                .size(86.dp)
                .clip(CircleShape)
                .background(if (isInverted) Color(0x33EC4899) else Color(0xFFEC4899).copy(alpha = 0.85f))
                .border(
                  width = if (selectedStrokeEffect != "None") (strokeWidth * 0.7f).dp else 0.dp,
                  color = simStrokeColor,
                  shape = CircleShape
                ),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = if (isInverted) "MASK INVERTED" else "👤 SUBJECT",
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                textAlign = TextAlign.Center
              )
            }

            // Top Status Pill
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = Color(0xDD000000),
              modifier = Modifier
                .align(Alignment.TopStart)
                .padding(8.dp)
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Box(
                  modifier = Modifier
                    .size(6.dp)
                    .background(Color(0xFF22C55E), CircleShape)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = "AI Cutout • $selectedStrokeEffect",
                  fontSize = 10.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White
                )
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 1. Outline & Sticker Border Styles
        Text(
          text = "Sticker Outline & Neon Glow",
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1F2937)
        )
        Spacer(modifier = Modifier.height(6.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          items(outlineEffects) { (styleName, col) ->
            val isSel = selectedStrokeEffect == styleName
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = if (isSel) Color(0xFFFDF2F8) else Color(0xFFF9FAFB),
              border = BorderStroke(1.5.dp, if (isSel) Color(0xFFEC4899) else Color(0xFFE5E7EB)),
              modifier = Modifier
                .clickable { selectedStrokeEffect = styleName }
                .testTag("btn_cutout_style_$styleName")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Box(
                  modifier = Modifier
                    .size(14.dp)
                    .background(col, CircleShape)
                    .border(1.dp, Color(0xFFD1D5DB), CircleShape)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = styleName,
                  fontSize = 12.sp,
                  fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                  color = if (isSel) Color(0xFFBE185D) else Color(0xFF374151)
                )
              }
            }
          }
        }

        // Outline Width Slider (only if an outline is selected)
        if (selectedStrokeEffect != "None") {
          Spacer(modifier = Modifier.height(12.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("Outline Thickness", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF4B5563))
            Text("${strokeWidth.toInt()} px", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEC4899))
          }
          Slider(
            value = strokeWidth,
            onValueChange = { strokeWidth = it },
            valueRange = 2f..12f,
            colors = SliderDefaults.colors(
              thumbColor = Color(0xFFEC4899),
              activeTrackColor = Color(0xFFEC4899),
              inactiveTrackColor = Color(0xFFFCE7F3)
            )
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 2. Background Replacement
        Text(
          text = "Background Behind Cutout",
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1F2937)
        )
        Spacer(modifier = Modifier.height(6.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          items(bgReplacements) { (bgKey, bgLabel) ->
            val isSel = selectedBgReplacement == bgKey
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = if (isSel) Color(0xFFFDF2F8) else Color(0xFFF9FAFB),
              border = BorderStroke(1.5.dp, if (isSel) Color(0xFFEC4899) else Color(0xFFE5E7EB)),
              modifier = Modifier
                .clickable { selectedBgReplacement = bgKey }
                .testTag("btn_cutout_bg_$bgKey")
            ) {
              Column(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
              ) {
                Text(
                  text = bgKey,
                  fontSize = 12.sp,
                  fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                  color = if (isSel) Color(0xFFBE185D) else Color(0xFF374151)
                )
                Text(
                  text = bgLabel,
                  fontSize = 9.sp,
                  color = Color(0xFF6B7280)
                )
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 3. Invert Mask Switch
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFFF9FAFB),
          border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text("Invert Cutout Mask", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1F2937))
              Text("Keep original background and silhouette the person", fontSize = 10.sp, color = Color(0xFF6B7280))
            }
            Switch(
              checked = isInverted,
              onCheckedChange = { isInverted = it },
              colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = Color(0xFFEC4899)
              )
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Action Buttons: Apply to All & Apply to Clip
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedButton(
          onClick = {
            onApplyToAll(isEnabled, selectedStrokeEffect, strokeWidth, isInverted, selectedBgReplacement)
            onDismiss()
          },
          border = BorderStroke(1.dp, Color(0xFFEC4899)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .weight(1f)
            .height(46.dp)
            .testTag("btn_cutout_apply_to_all")
        ) {
          Text("Apply to All", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFEC4899))
        }

        Button(
          onClick = {
            onApplyCutout(isEnabled, selectedStrokeEffect, strokeWidth, isInverted, selectedBgReplacement)
            onDismiss()
          },
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEC4899)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .weight(1.3f)
            .height(46.dp)
            .testTag("btn_cutout_apply_clip")
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Apply to Clip", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }

      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

/**
 * 13. Freehand Doodle & Neon Pen Drawing Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickDoodleSheet(
  doodleStrokes: List<DoodleStroke>,
  onDismiss: () -> Unit,
  onAddStroke: (DoodleStroke) -> Unit,
  onUndo: () -> Unit,
  onRedo: () -> Unit,
  onClear: () -> Unit
) {
  var selectedBrush by remember { mutableStateOf("Neon") }
  var strokeWidth by remember { mutableFloatStateOf(8f) }
  var selectedColor by remember { mutableStateOf(0xFF00F0FF) }
  var currentPoints by remember { mutableStateOf<List<DoodlePoint>>(emptyList()) }

  val brushTypes = listOf(
    "Neon" to "✨ Neon Glow",
    "Pen" to "✏️ Classic Pen",
    "Arrow" to "↗️ Arrow Pen",
    "Highlighter" to "🖍️ Marker",
    "Rainbow" to "🌈 Rainbow Chalk",
    "Eraser" to "🧹 Eraser"
  )

  val colorPresets = listOf(
    0xFF00F0FF to "Cyan",
    0xFF39FF14 to "Lime",
    0xFFFF007F to "Neon Pink",
    0xFFFFE600 to "Yellow",
    0xFFFF5E00 to "Orange",
    0xFFBF00FF to "Purple",
    0xFFFFFFFF to "White",
    0xFF000000 to "Black"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937),
    shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      // Header with Title & Action Controls (Undo, Redo, Clear, Close)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = CircleShape,
            color = Color(0xFFF0FDF4),
            border = BorderStroke(1.dp, Color(0xFFBBF7D0)),
            modifier = Modifier.size(38.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.Brush,
                contentDescription = null,
                tint = Color(0xFF16A34A),
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "Freehand & Neon Doodle",
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF1F2937)
            )
            Text(
              text = "Draw neon glows, arrows & highlights",
              fontSize = 11.sp,
              color = Color(0xFF6B7280)
            )
          }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
          IconButton(
            onClick = onUndo,
            modifier = Modifier.testTag("btn_doodle_undo")
          ) {
            Icon(Icons.Default.Undo, contentDescription = "Undo", tint = Color(0xFF374151))
          }
          IconButton(
            onClick = onRedo,
            modifier = Modifier.testTag("btn_doodle_redo")
          ) {
            Icon(Icons.Default.Redo, contentDescription = "Redo", tint = Color(0xFF374151))
          }
          IconButton(
            onClick = onClear,
            modifier = Modifier.testTag("btn_doodle_clear")
          ) {
            Icon(Icons.Default.Delete, contentDescription = "Clear All", tint = Color(0xFFEF4444))
          }
          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Interactive Freehand Drawing Pad / Canvas Box
      Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0B0F19)),
        modifier = Modifier
          .fillMaxWidth()
          .height(200.dp)
      ) {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .pointerInput(selectedBrush, selectedColor, strokeWidth) {
              detectDragGestures(
                onDragStart = { offset ->
                  currentPoints = listOf(DoodlePoint(offset.x, offset.y))
                },
                onDrag = { change, _ ->
                  change.consume()
                  currentPoints = currentPoints + DoodlePoint(change.position.x, change.position.y)
                },
                onDragEnd = {
                  if (currentPoints.isNotEmpty()) {
                    if (selectedBrush == "Eraser") {
                      onUndo()
                    } else {
                      onAddStroke(
                        DoodleStroke(
                          points = currentPoints,
                          color = selectedColor,
                          strokeWidth = strokeWidth,
                          brushType = selectedBrush
                        )
                      )
                    }
                    currentPoints = emptyList()
                  }
                },
                onDragCancel = {
                  currentPoints = emptyList()
                }
              )
            }
        ) {
          // Drawing Canvas
          Canvas(modifier = Modifier.fillMaxSize()) {
            val allStrokes = doodleStrokes + if (currentPoints.isNotEmpty() && selectedBrush != "Eraser") {
              listOf(
                DoodleStroke(
                  points = currentPoints,
                  color = selectedColor,
                  strokeWidth = strokeWidth,
                  brushType = selectedBrush
                )
              )
            } else emptyList()

            allStrokes.forEach { stroke ->
              if (stroke.points.size >= 2) {
                val path = Path().apply {
                  moveTo(stroke.points.first().x, stroke.points.first().y)
                  for (i in 1 until stroke.points.size) {
                    val p = stroke.points[i]
                    lineTo(p.x, p.y)
                  }
                }

                val strokeColor = Color(stroke.color)

                when (stroke.brushType) {
                  "Neon" -> {
                    // Outer diffuse glow
                    drawPath(
                      path = path,
                      color = strokeColor.copy(alpha = 0.35f),
                      style = Stroke(
                        width = stroke.strokeWidth * 3.2f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                      )
                    )
                    // Mid halo
                    drawPath(
                      path = path,
                      color = strokeColor.copy(alpha = 0.65f),
                      style = Stroke(
                        width = stroke.strokeWidth * 1.8f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                      )
                    )
                    // Sharp core
                    drawPath(
                      path = path,
                      color = Color.White,
                      style = Stroke(
                        width = stroke.strokeWidth * 0.75f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                      )
                    )
                  }
                  "Highlighter" -> {
                    drawPath(
                      path = path,
                      color = strokeColor.copy(alpha = 0.45f),
                      style = Stroke(
                        width = stroke.strokeWidth * 2.2f,
                        cap = StrokeCap.Square,
                        join = StrokeJoin.Miter
                      )
                    )
                  }
                  "Arrow" -> {
                    drawPath(
                      path = path,
                      color = strokeColor,
                      style = Stroke(
                        width = stroke.strokeWidth,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                      )
                    )
                    // Arrow head at end point
                    val endP = stroke.points.last()
                    val prevP = stroke.points[stroke.points.size - 2]
                    val angle = kotlin.math.atan2(endP.y - prevP.y, endP.x - prevP.x)
                    val arrowLen = stroke.strokeWidth * 3.5f
                    val arrowP1 = androidx.compose.ui.geometry.Offset(
                      endP.x - arrowLen * kotlin.math.cos(angle - 0.5f),
                      endP.y - arrowLen * kotlin.math.sin(angle - 0.5f)
                    )
                    val arrowP2 = androidx.compose.ui.geometry.Offset(
                      endP.x - arrowLen * kotlin.math.cos(angle + 0.5f),
                      endP.y - arrowLen * kotlin.math.sin(angle + 0.5f)
                    )
                    val arrowPath = Path().apply {
                      moveTo(arrowP1.x, arrowP1.y)
                      lineTo(endP.x, endP.y)
                      lineTo(arrowP2.x, arrowP2.y)
                    }
                    drawPath(
                      path = arrowPath,
                      color = strokeColor,
                      style = Stroke(width = stroke.strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )
                  }
                  "Rainbow" -> {
                    drawPath(
                      path = path,
                      color = strokeColor,
                      style = Stroke(
                        width = stroke.strokeWidth * 1.5f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                      )
                    )
                  }
                  else -> {
                    // Normal Pen
                    drawPath(
                      path = path,
                      color = strokeColor,
                      style = Stroke(
                        width = stroke.strokeWidth,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                      )
                    )
                  }
                }
              }
            }
          }

          // Top Canvas Help Hint
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = Color(0xAA000000),
            modifier = Modifier
              .align(Alignment.TopStart)
              .padding(10.dp)
          ) {
            Text(
              text = "Touch & drag here to draw with $selectedBrush",
              color = Color.White,
              fontSize = 11.sp,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Brush Selection
      Text(
        text = "Brush Style",
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF1F2937)
      )
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(brushTypes) { (brushKey, brushLabel) ->
          val isSel = selectedBrush == brushKey
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = if (isSel) Color(0xFFECFDF5) else Color(0xFFF9FAFB),
            border = BorderStroke(1.5.dp, if (isSel) Color(0xFF10B981) else Color(0xFFE5E7EB)),
            modifier = Modifier
              .clickable { selectedBrush = brushKey }
              .testTag("btn_brush_$brushKey")
          ) {
            Text(
              text = brushLabel,
              fontSize = 12.sp,
              fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
              color = if (isSel) Color(0xFF047857) else Color(0xFF374151),
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Stroke Width Slider
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Stroke Width", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF4B5563))
        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(strokeWidth.dp)
              .background(Color(selectedColor), CircleShape)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text("${strokeWidth.toInt()} px", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
        }
      }
      Slider(
        value = strokeWidth,
        onValueChange = { strokeWidth = it },
        valueRange = 2f..28f,
        colors = SliderDefaults.colors(
          thumbColor = Color(0xFF10B981),
          activeTrackColor = Color(0xFF10B981),
          inactiveTrackColor = Color(0xFFD1FAE5)
        )
      )

      Spacer(modifier = Modifier.height(14.dp))

      // Color Palette
      Text(
        text = "Neon & Vibrant Colors",
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF1F2937)
      )
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        items(colorPresets) { (colHex, colName) ->
          val isSel = selectedColor == colHex
          Surface(
            shape = CircleShape,
            color = Color(colHex),
            border = BorderStroke(if (isSel) 3.dp else 1.dp, if (isSel) Color(0xFF1F2937) else Color(0xFFD1D5DB)),
            modifier = Modifier
              .size(34.dp)
              .clickable { selectedColor = colHex }
              .testTag("btn_color_$colName")
          ) {
            if (isSel) {
              Box(contentAlignment = Alignment.Center) {
                Icon(
                  Icons.Default.Check,
                  contentDescription = null,
                  tint = if (colHex == 0xFFFFFFFFL || colHex == 0xFFFFE600L) Color.Black else Color.White,
                  modifier = Modifier.size(16.dp)
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Quick Stamp Shapes (Arrow, Heart, Star, Circle, Underline)
      Text(
        text = "Quick Neon Stamps",
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF1F2937)
      )
      Spacer(modifier = Modifier.height(6.dp))
      val stamps = listOf(
        "➡️ Right Arrow" to listOf(DoodlePoint(60f, 100f), DoodlePoint(240f, 100f)),
        "❤️ Heart Loop" to listOf(DoodlePoint(150f, 140f), DoodlePoint(120f, 90f), DoodlePoint(150f, 70f), DoodlePoint(180f, 90f), DoodlePoint(150f, 140f)),
        "⭐ Sparkle" to listOf(DoodlePoint(150f, 50f), DoodlePoint(150f, 150f), DoodlePoint(150f, 100f), DoodlePoint(100f, 100f), DoodlePoint(200f, 100f)),
        "⭕ Circle" to listOf(DoodlePoint(150f, 60f), DoodlePoint(200f, 100f), DoodlePoint(150f, 140f), DoodlePoint(100f, 100f), DoodlePoint(150f, 60f)),
        "〰️ Wavy Underline" to listOf(DoodlePoint(50f, 120f), DoodlePoint(90f, 100f), DoodlePoint(130f, 130f), DoodlePoint(170f, 100f), DoodlePoint(210f, 130f), DoodlePoint(250f, 110f))
      )
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(stamps) { (stampName, pts) ->
          OutlinedButton(
            onClick = {
              onAddStroke(
                DoodleStroke(
                  points = pts,
                  color = selectedColor,
                  strokeWidth = strokeWidth,
                  brushType = selectedBrush
                )
              )
            },
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, Color(0xFFD1D5DB)),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Text(stampName, fontSize = 11.sp, color = Color(0xFF374151))
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Done Button
      Button(
        onClick = onDismiss,
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(46.dp)
          .testTag("btn_doodle_done")
      ) {
        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Text("Done (${doodleStrokes.size} Strokes)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
      }

      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

/**
 * 14. Video Collage / Split-Screen Grid Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickCollageSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyCollage: (String, Float, Long, Float) -> Unit,
  onApplyToAll: (String, Float, Long, Float) -> Unit
) {
  var selectedLayout by remember(clip) { mutableStateOf(if (clip.collageLayout == "None") "2_Horizontal" else clip.collageLayout) }
  var borderWidth by remember(clip) { mutableFloatStateOf(clip.collageBorderWidth) }
  var borderColor by remember(clip) { mutableStateOf(clip.collageBorderColor) }
  var cornerRadius by remember(clip) { mutableFloatStateOf(clip.collageCornerRadius) }

  val layouts = listOf(
    "2_Horizontal" to "2 Splits (Top / Bottom)",
    "2_Vertical" to "2 Splits (Side by Side)",
    "3_Columns" to "3 Columns (Triptych)",
    "3_Hero" to "3 Splits (1 Hero + 2 Bottom)",
    "4_Grid" to "4 Grid (2x2 Quad)",
    "None" to "Single Full Screen"
  )

  val borderColors = listOf(
    0xFFFFFFFF to "White",
    0xFF000000 to "Black",
    0xFF00F0FF to "Neon Cyan",
    0xFFFF007F to "Neon Pink",
    0xFFFF5E00 to "Sunset Orange",
    0xFF10B981 to "Emerald",
    0xFF3B82F6 to "Cobalt"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937),
    shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = CircleShape,
            color = Color(0xFFEFF6FF),
            border = BorderStroke(1.dp, Color(0xFFBFDBFE)),
            modifier = Modifier.size(38.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.GridOn,
                contentDescription = null,
                tint = Color(0xFF2563EB),
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "Video Collage / Grid",
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF1F2937)
            )
            Text(
              text = "Multi-screen video layouts & border controls",
              fontSize = 11.sp,
              color = Color(0xFF6B7280)
            )
          }
        }

        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Live Interactive Split-Screen Preview Simulator
      Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        modifier = Modifier
          .fillMaxWidth()
          .height(180.dp)
      ) {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(10.dp)
        ) {
          when (selectedLayout) {
            "2_Horizontal" -> {
              Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                CollageSlotCell(
                  label = "Slot 1 (Top Video)",
                  color = Color(0xFF1E3A8A),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f)
                )
                CollageSlotCell(
                  label = "Slot 2 (Bottom Video)",
                  color = Color(0xFF4C1D95),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f)
                )
              }
            }
            "2_Vertical" -> {
              Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                CollageSlotCell(
                  label = "Left Video",
                  color = Color(0xFF1E3A8A),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f)
                )
                CollageSlotCell(
                  label = "Right Video",
                  color = Color(0xFF065F46),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f)
                )
              }
            }
            "3_Columns" -> {
              Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                CollageSlotCell(
                  label = "Slot A",
                  color = Color(0xFF1E3A8A),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f)
                )
                CollageSlotCell(
                  label = "Slot B",
                  color = Color(0xFF831843),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f)
                )
                CollageSlotCell(
                  label = "Slot C",
                  color = Color(0xFF065F46),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f)
                )
              }
            }
            "3_Hero" -> {
              Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                CollageSlotCell(
                  label = "Top Hero Video",
                  color = Color(0xFF1E3A8A),
                  radius = cornerRadius,
                  borderColor = Color(borderColor),
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1.3f)
                )
                Row(
                  modifier = Modifier.weight(1f),
                  horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
                ) {
                  CollageSlotCell(
                    label = "Bottom Left",
                    color = Color(0xFF831843),
                    radius = cornerRadius,
                    borderColor = Color(borderColor),
                    borderWidth = borderWidth,
                    modifier = Modifier.weight(1f)
                  )
                  CollageSlotCell(
                    label = "Bottom Right",
                    color = Color(0xFF065F46),
                    radius = cornerRadius,
                    borderColor = Color(borderColor),
                    borderWidth = borderWidth,
                    modifier = Modifier.weight(1f)
                  )
                }
              }
            }
            "4_Grid" -> {
              Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                Row(
                  modifier = Modifier.weight(1f),
                  horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
                ) {
                  CollageSlotCell(
                    label = "Quad 1",
                    color = Color(0xFF1E3A8A),
                    radius = cornerRadius,
                    borderColor = Color(borderColor),
                    borderWidth = borderWidth,
                    modifier = Modifier.weight(1f)
                  )
                  CollageSlotCell(
                    label = "Quad 2",
                    color = Color(0xFF831843),
                    radius = cornerRadius,
                    borderColor = Color(borderColor),
                    borderWidth = borderWidth,
                    modifier = Modifier.weight(1f)
                  )
                }
                Row(
                  modifier = Modifier.weight(1f),
                  horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
                ) {
                  CollageSlotCell(
                    label = "Quad 3",
                    color = Color(0xFF065F46),
                    radius = cornerRadius,
                    borderColor = Color(borderColor),
                    borderWidth = borderWidth,
                    modifier = Modifier.weight(1f)
                  )
                  CollageSlotCell(
                    label = "Quad 4",
                    color = Color(0xFF78350F),
                    radius = cornerRadius,
                    borderColor = Color(borderColor),
                    borderWidth = borderWidth,
                    modifier = Modifier.weight(1f)
                  )
                }
              }
            }
            else -> {
              CollageSlotCell(
                label = "Full Screen (Single Clip)",
                color = Color(0xFF1E293B),
                radius = 8f,
                borderColor = Color.Transparent,
                borderWidth = 0f,
                modifier = Modifier.fillMaxSize()
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Layout Presets Selector
      Text(
        text = "Collage Grid Layout",
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF1F2937)
      )
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(layouts) { (layoutKey, layoutTitle) ->
          val isSel = selectedLayout == layoutKey
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = if (isSel) Color(0xFFEFF6FF) else Color(0xFFF9FAFB),
            border = BorderStroke(1.5.dp, if (isSel) Color(0xFF3B82F6) else Color(0xFFE5E7EB)),
            modifier = Modifier
              .clickable { selectedLayout = layoutKey }
              .testTag("btn_collage_layout_$layoutKey")
          ) {
            Text(
              text = layoutTitle,
              fontSize = 12.sp,
              fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
              color = if (isSel) Color(0xFF1D4ED8) else Color(0xFF374151),
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
            )
          }
        }
      }

      if (selectedLayout != "None") {
        Spacer(modifier = Modifier.height(14.dp))

        // Border Width Slider
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Grid Border Width", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF4B5563))
          Text("${borderWidth.toInt()} px", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
        }
        Slider(
          value = borderWidth,
          onValueChange = { borderWidth = it },
          valueRange = 0f..20f,
          colors = SliderDefaults.colors(
            thumbColor = Color(0xFF2563EB),
            activeTrackColor = Color(0xFF2563EB),
            inactiveTrackColor = Color(0xFFDBEAFE)
          )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Corner Radius Slider
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Slot Corner Rounding", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF4B5563))
          Text("${cornerRadius.toInt()} px", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
        }
        Slider(
          value = cornerRadius,
          onValueChange = { cornerRadius = it },
          valueRange = 0f..28f,
          colors = SliderDefaults.colors(
            thumbColor = Color(0xFF2563EB),
            activeTrackColor = Color(0xFF2563EB),
            inactiveTrackColor = Color(0xFFDBEAFE)
          )
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Border Colors
        Text(
          text = "Border & Divider Color",
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1F2937)
        )
        Spacer(modifier = Modifier.height(6.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
          items(borderColors) { (colHex, colName) ->
            val isSel = borderColor == colHex
            Surface(
              shape = CircleShape,
              color = Color(colHex),
              border = BorderStroke(if (isSel) 3.dp else 1.dp, if (isSel) Color(0xFF2563EB) else Color(0xFFD1D5DB)),
              modifier = Modifier
                .size(34.dp)
                .clickable { borderColor = colHex }
                .testTag("btn_collage_color_$colName")
            ) {
              if (isSel) {
                Box(contentAlignment = Alignment.Center) {
                  Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = if (colHex == 0xFFFFFFFFL) Color.Black else Color.White,
                    modifier = Modifier.size(16.dp)
                  )
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Action Buttons: Apply to All & Apply to Clip
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedButton(
          onClick = {
            onApplyToAll(selectedLayout, borderWidth, borderColor, cornerRadius)
            onDismiss()
          },
          border = BorderStroke(1.dp, Color(0xFF2563EB)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .weight(1f)
            .height(46.dp)
            .testTag("btn_collage_apply_to_all")
        ) {
          Text("Apply to All", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF2563EB))
        }

        Button(
          onClick = {
            onApplyCollage(selectedLayout, borderWidth, borderColor, cornerRadius)
            onDismiss()
          },
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .weight(1.3f)
            .height(46.dp)
            .testTag("btn_collage_apply_clip")
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Apply to Clip", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }

      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

@Composable
fun CollageSlotCell(
  label: String,
  color: Color,
  radius: Float,
  borderColor: Color,
  borderWidth: Float,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .clip(RoundedCornerShape(radius.dp))
      .background(color)
      .border(
        width = if (borderWidth > 0f) (borderWidth * 0.6f).dp else 0.dp,
        color = borderColor,
        shape = RoundedCornerShape(radius.dp)
      ),
    contentAlignment = Alignment.Center
  ) {
    Text(
      text = label,
      color = Color.White,
      fontSize = 10.sp,
      fontWeight = FontWeight.Bold,
      textAlign = TextAlign.Center,
      modifier = Modifier.padding(4.dp)
    )
  }
}

/**
 * Step 28: Beat Sync & Auto Beat Detection Bottom Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickBeatSyncSheet(
  beatMarkers: List<Long>,
  isBeatSyncEnabled: Boolean,
  currentBpm: Int,
  sensitivity: Float,
  currentPositionMs: Long,
  totalDurationMs: Long,
  onDismiss: () -> Unit,
  onToggleBeatSync: (Boolean) -> Unit,
  onSetBpm: (Int) -> Unit,
  onAutoDetect: (Float) -> Unit,
  onAddBeatAtPlayhead: () -> Unit,
  onClearBeats: () -> Unit,
  onSplitAtBeats: () -> Unit
) {
  var selectedBpm by remember { mutableIntStateOf(currentBpm) }
  var sensitivityValue by remember { mutableFloatStateOf(sensitivity) }
  var beatSyncOn by remember { mutableStateOf(isBeatSyncEnabled) }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF18181B),
    tonalElevation = 8.dp
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
        .verticalScroll(rememberScrollState())
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(36.dp)
              .clip(CircleShape)
              .background(Color(0xFFF59E0B).copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
          ) {
            Icon(Icons.Default.GraphicEq, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(20.dp))
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Beat Sync & Rhythm Cuts",
              fontSize = 17.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
            Text(
              text = "${beatMarkers.size} Beats Detected • Dynamic Cutpoints",
              fontSize = 12.sp,
              color = Color(0xFF9CA3AF)
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF9CA3AF))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Simulated Neon Audio Beat Waveform Preview
      Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF27272A)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("BEAT WAVEFORM MONITOR", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
            Text(
              text = "${selectedBpm} BPM",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          }

          Spacer(modifier = Modifier.height(10.dp))

          // Waveform bars with beat highlights
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .height(52.dp)
              .clip(RoundedCornerShape(8.dp))
              .background(Color(0xFF09090B))
              .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            val bars = 36
            for (i in 0 until bars) {
              val isBeatBar = (i % 6 == 0) || (i % 9 == 0)
              val barHeight = when {
                isBeatBar -> 0.95f
                i % 2 == 0 -> 0.55f
                else -> 0.35f
              }
              Box(
                modifier = Modifier
                  .width(4.dp)
                  .height((48 * barHeight).dp)
                  .clip(RoundedCornerShape(2.dp))
                  .background(
                    if (isBeatBar) Color(0xFFF59E0B) else Color(0xFF3F3F46)
                  )
              )
            }
          }

          Spacer(modifier = Modifier.height(8.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("00:00", fontSize = 10.sp, color = Color(0xFF71717A))
            Text("● Gold markers = Beat Drops", fontSize = 10.sp, color = Color(0xFFF59E0B), fontWeight = FontWeight.SemiBold)
            Text("End", fontSize = 10.sp, color = Color(0xFF71717A))
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Master Beat Sync Toggle Switch
      Surface(
        color = Color(0xFF27272A),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text("Snap Playhead to Beats", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            Text("Magnetically align cuts with musical rhythm", fontSize = 11.sp, color = Color(0xFF9CA3AF))
          }
          Switch(
            checked = beatSyncOn,
            onCheckedChange = {
              beatSyncOn = it
              onToggleBeatSync(it)
            },
            colors = SwitchDefaults.colors(
              checkedThumbColor = Color.White,
              checkedTrackColor = Color(0xFFF59E0B)
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Tempo BPM Presets
      Text("GENRE TEMPO PRESETS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF))
      Spacer(modifier = Modifier.height(8.dp))
      val presets = listOf(
        Pair("Pop / Dance", 128),
        Pair("Trap / HipHop", 140),
        Pair("House", 120),
        Pair("Lo-Fi Chill", 85)
      )
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        presets.forEach { (name, bpm) ->
          val isSelected = selectedBpm == bpm
          FilterChip(
            selected = isSelected,
            onClick = {
              selectedBpm = bpm
              onSetBpm(bpm)
            },
            label = { Text("$bpm", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = Color(0xFFF59E0B),
              selectedLabelColor = Color.Black,
              containerColor = Color(0xFF27272A),
              labelColor = Color.White
            ),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.weight(1f)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Beat Sensitivity Slider
      Text("DETECTION SENSITIVITY: ${(sensitivityValue * 100).toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF))
      Slider(
        value = sensitivityValue,
        onValueChange = {
          sensitivityValue = it
          onAutoDetect(it)
        },
        valueRange = 0.2f..1.0f,
        colors = SliderDefaults.colors(
          thumbColor = Color(0xFFF59E0B),
          activeTrackColor = Color(0xFFF59E0B),
          inactiveTrackColor = Color(0xFF3F3F46)
        )
      )

      Spacer(modifier = Modifier.height(16.dp))

      // Primary Beat Actions
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedButton(
          onClick = onAddBeatAtPlayhead,
          border = BorderStroke(1.dp, Color(0xFFF59E0B)),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier.weight(1f).height(44.dp)
        ) {
          Icon(Icons.Default.Add, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(4.dp))
          Text("+ Beat Here", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
        }

        OutlinedButton(
          onClick = onClearBeats,
          border = BorderStroke(1.dp, Color(0xFFEF4444)),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier.weight(1f).height(44.dp)
        ) {
          Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFEF4444), modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(4.dp))
          Text("Clear Beats", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEF4444))
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Signature "Auto-Split Clips at Beats" Action Button (Viral Reels feature)
      Button(
        onClick = {
          onSplitAtBeats()
          onDismiss()
        },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("btn_beat_split_clips")
      ) {
        Icon(Icons.Default.ContentCut, contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "Auto-Split Video at Beats (${beatMarkers.size} Cuts)",
          fontSize = 14.sp,
          fontWeight = FontWeight.Bold,
          color = Color.Black
        )
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

/**
 * Step 29: Social Media Safe Zone Guides Bottom Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickSafeZoneSheet(
  currentPlatform: String,
  showSafeZone: Boolean,
  onDismiss: () -> Unit,
  onSelectPlatform: (String, Boolean) -> Unit
) {
  var selectedPlatform by remember { mutableStateOf(currentPlatform) }
  var guideVisible by remember { mutableStateOf(showSafeZone) }

  val platforms = listOf(
    Pair("Instagram Reels", "Like, Comment, Audio Disc right rail + caption safety"),
    Pair("TikTok / Shorts", "Profile avatar, Like/Share column + bottom audio pill"),
    Pair("YouTube 16:9", "Title bar top, scrub timeline bottom controls"),
    Pair("None", "Disable all safe zone guide overlays")
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF18181B),
    tonalElevation = 8.dp
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
        .verticalScroll(rememberScrollState())
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(36.dp)
              .clip(CircleShape)
              .background(Color(0xFF06B6D4).copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
          ) {
            Icon(Icons.Default.Crop, contentDescription = null, tint = Color(0xFF06B6D4), modifier = Modifier.size(20.dp))
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Social Safe Zone Guides",
              fontSize = 17.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
            Text(
              text = "Prevent UI icons from covering captions & faces",
              fontSize = 12.sp,
              color = Color(0xFF9CA3AF)
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF9CA3AF))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Toggle Switch
      Surface(
        color = Color(0xFF27272A),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text("Show Safe Zone Guide in Preview", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            Text("Semi-transparent overlay with Instagram/TikTok controls", fontSize = 11.sp, color = Color(0xFF9CA3AF))
          }
          Switch(
            checked = guideVisible,
            onCheckedChange = {
              guideVisible = it
              onSelectPlatform(selectedPlatform, it)
            },
            colors = SwitchDefaults.colors(
              checkedThumbColor = Color.White,
              checkedTrackColor = Color(0xFF06B6D4)
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      Text("SELECT PLATFORM GUIDELINE", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF))
      Spacer(modifier = Modifier.height(10.dp))

      platforms.forEach { (platform, desc) ->
        val isSelected = selectedPlatform == platform
        Surface(
          color = if (isSelected) Color(0xFF06B6D4).copy(alpha = 0.15f) else Color(0xFF27272A),
          border = BorderStroke(1.dp, if (isSelected) Color(0xFF06B6D4) else Color(0xFF3F3F46)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable {
              selectedPlatform = platform
              val newVisible = if (platform == "None") false else true
              guideVisible = newVisible
              onSelectPlatform(platform, newVisible)
            }
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = platform,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) Color(0xFF06B6D4) else Color.White
              )
              Text(
                text = desc,
                fontSize = 11.sp,
                color = Color(0xFF9CA3AF)
              )
            }
            if (isSelected) {
              Box(
                modifier = Modifier
                  .size(24.dp)
                  .clip(CircleShape)
                  .background(Color(0xFF06B6D4)),
                contentAlignment = Alignment.Center
              ) {
                Icon(Icons.Default.Check, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      Button(
        onClick = {
          onSelectPlatform(selectedPlatform, guideVisible)
          onDismiss()
        },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF06B6D4)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("btn_apply_safe_zone")
      ) {
        Icon(Icons.Default.Check, contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text("Done", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.Black)
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

/**
 * Step 30: Watermark & Branding Bottom Sheet (VFX Pro Studio Style)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickWatermarkSheet(
  watermarkEnabled: Boolean,
  watermarkText: String,
  watermarkPosition: String,
  watermarkOpacity: Float,
  onDismiss: () -> Unit,
  onSaveConfig: (Boolean, String, String, Float) -> Unit,
  onRemoveWatermark: () -> Unit
) {
  var isEnabled by remember { mutableStateOf(watermarkEnabled) }
  var textValue by remember { mutableStateOf(watermarkText) }
  var selectedPosition by remember { mutableStateOf(watermarkPosition) }
  var opacityValue by remember { mutableFloatStateOf(watermarkOpacity) }

  val positions = listOf("Bottom-Right", "Bottom-Left", "Top-Right", "Top-Left")

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF18181B),
    tonalElevation = 8.dp
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
        .verticalScroll(rememberScrollState())
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(36.dp)
              .clip(CircleShape)
              .background(Color(0xFFEC4899).copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
          ) {
            Icon(Icons.Default.Palette, contentDescription = null, tint = Color(0xFFEC4899), modifier = Modifier.size(20.dp))
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Watermark & Branding",
              fontSize = 17.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
            Text(
              text = "Add custom logo or toggle off freely",
              fontSize = 12.sp,
              color = Color(0xFF9CA3AF)
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF9CA3AF))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Enable Watermark Switch
      Surface(
        color = Color(0xFF27272A),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text("Enable Watermark", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            Text("Display watermark tag on preview & export", fontSize = 11.sp, color = Color(0xFF9CA3AF))
          }
          Switch(
            checked = isEnabled,
            onCheckedChange = { isEnabled = it },
            colors = SwitchDefaults.colors(
              checkedThumbColor = Color.White,
              checkedTrackColor = Color(0xFFEC4899)
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Custom Watermark Text Field
      Text("BRAND / CHANNEL NAME", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF))
      Spacer(modifier = Modifier.height(6.dp))
      OutlinedTextField(
        value = textValue,
        onValueChange = { textValue = it },
        placeholder = { Text("e.g. VFX Pro or @username", color = Color(0xFF71717A)) },
        singleLine = true,
        colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
          focusedBorderColor = Color(0xFFEC4899),
          unfocusedBorderColor = Color(0xFF3F3F46),
          focusedTextColor = Color.White,
          unfocusedTextColor = Color.White
        ),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth()
      )

      Spacer(modifier = Modifier.height(16.dp))

      // Position Corner Selector
      Text("WATERMARK POSITION", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF))
      Spacer(modifier = Modifier.height(8.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        positions.forEach { pos ->
          val isSelected = selectedPosition == pos
          FilterChip(
            selected = isSelected,
            onClick = { selectedPosition = pos },
            label = { Text(pos, fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = Color(0xFFEC4899),
              selectedLabelColor = Color.White,
              containerColor = Color(0xFF27272A),
              labelColor = Color.White
            ),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.weight(1f)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Opacity Slider
      Text("OPACITY: ${(opacityValue * 100).toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF))
      Slider(
        value = opacityValue,
        onValueChange = { opacityValue = it },
        valueRange = 0.2f..1.0f,
        colors = SliderDefaults.colors(
          thumbColor = Color(0xFFEC4899),
          activeTrackColor = Color(0xFFEC4899),
          inactiveTrackColor = Color(0xFF3F3F46)
        )
      )

      Spacer(modifier = Modifier.height(18.dp))

      // Action Buttons
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        // Free Remove Watermark Button
        OutlinedButton(
          onClick = {
            isEnabled = false
            onRemoveWatermark()
            onDismiss()
          },
          border = BorderStroke(1.dp, Color(0xFFEC4899)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.weight(1f).height(46.dp).testTag("btn_remove_watermark_free")
        ) {
          Text("Free Remove", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEC4899))
        }

        Button(
          onClick = {
            onSaveConfig(isEnabled, textValue.ifBlank { "VFX Pro" }, selectedPosition, opacityValue)
            onDismiss()
          },
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEC4899)),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.weight(1.2f).height(46.dp).testTag("btn_save_watermark")
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Save Watermark", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }

      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

