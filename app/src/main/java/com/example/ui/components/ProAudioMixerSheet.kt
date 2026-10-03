package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.NoiseAware
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.Speaker
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta

/**
 * Data model for mock DSP audio effect cards.
 */
data class MockAudioEffect(
  val id: String,
  val title: String,
  val description: String,
  val icon: ImageVector,
  val accentColor: Color,
  val defaultActive: Boolean = false
)

/**
 * Pro Audio Mixer Modal Bottom Sheet (Step 13)
 *
 * Requirements:
 * 1. Top Bar titled 'Pro Audio Mixer' with 'Close' icon button.
 * 2. Main 'Volume' slider (0% to 200%) and 'Pan' slider (Left to Right).
 * 3. Mock visual Equalizer (EQ) using a Canvas or Row of static vertical bars
 *    with a gradient fill to simulate audio frequencies.
 * 4. 2x2 grid of audio effect toggle cards below the EQ:
 *    'Voice Isolation (AI)', 'Noise Reduction', 'Studio Reverb', 'Bass Boost'.
 * 5. Strictly UI layout only.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProAudioMixerBottomSheet(
  onDismiss: () -> Unit,
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
    modifier = modifier.testTag("audio_mixer_sheet")
  ) {
    ProAudioMixerContent(onDismiss = onDismiss)
  }
}

@Composable
fun ProAudioMixerContent(
  onDismiss: () -> Unit,
  modifier: Modifier = Modifier
) {
  var volumePercent by remember { mutableFloatStateOf(100f) }
  var panPosition by remember { mutableFloatStateOf(0.0f) } // -1f (Left) to +1f (Right)

  // Audio effect toggle states
  var voiceIsolationActive by remember { mutableStateOf(false) }
  var noiseReductionActive by remember { mutableStateOf(true) }
  var studioReverbActive by remember { mutableStateOf(false) }
  var bassBoostActive by remember { mutableStateOf(false) }

  val effects = listOf(
    MockAudioEffect(
      id = "voice_isolation",
      title = "Voice Isolation (AI)",
      description = "Isolate speech & vocals from background",
      icon = Icons.Default.Mic,
      accentColor = Color(0xFF38BDF8),
      defaultActive = voiceIsolationActive
    ),
    MockAudioEffect(
      id = "noise_reduction",
      title = "Noise Reduction",
      description = "Filter room hiss, wind & broadband noise",
      icon = Icons.Default.NoiseAware,
      accentColor = Color(0xFF34D399),
      defaultActive = noiseReductionActive
    ),
    MockAudioEffect(
      id = "studio_reverb",
      title = "Studio Reverb",
      description = "Simulate warm acoustic room reflection",
      icon = Icons.Default.Radio,
      accentColor = Color(0xFFA855F7),
      defaultActive = studioReverbActive
    ),
    MockAudioEffect(
      id = "bass_boost",
      title = "Bass Boost",
      description = "Low-end punch & harmonic sub resonance",
      icon = Icons.Default.Speaker,
      accentColor = Color(0xFFF59E0B),
      defaultActive = bassBoostActive
    )
  )

  Column(
    modifier = modifier
      .fillMaxWidth()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 6.dp)
      .padding(bottom = 28.dp)
      .testTag("audio_mixer_content")
  ) {
    // 1. Top Bar titled 'Pro Audio Mixer' with 'Close' icon button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("audio_mixer_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFF0F2B2B),
          border = BorderStroke(1.dp, Color(0xFF14B8A6).copy(alpha = 0.5f)),
          modifier = Modifier.size(38.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.GraphicEq,
              contentDescription = "Audio Mixer Icon",
              tint = Color(0xFF2DD4BF),
              modifier = Modifier.size(22.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "Pro Audio Mixer",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.testTag("audio_mixer_title")
          )
          Text(
            text = "Multi-Track Levels, EQ & DSP Effects",
            fontSize = 11.sp,
            color = Color(0xFF94A3B8)
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_audio_mixer")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close Audio Mixer",
          tint = MaterialTheme.colorScheme.onSurface
        )
      }
    }

    Spacer(modifier = Modifier.height(14.dp))

    // 2. Mock Visual Equalizer (EQ)
    Card(
      shape = RoundedCornerShape(12.dp),
      colors = CardDefaults.cardColors(containerColor = Color(0xFF080C14)),
      border = BorderStroke(1.dp, Color(0xFF1E293B)),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("visual_eq_container")
    ) {
      Column(modifier = Modifier.padding(12.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "SPECTRUM EQUALIZER (10-BAND)",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            color = Color(0xFF64748B)
          )
          Text(
            text = "48 kHz • 24-bit DSP",
            fontSize = 9.sp,
            fontFamily = FontFamily.Monospace,
            color = Color(0xFF14B8A6)
          )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Visual EQ Bars Canvas
        VisualEqualizerCanvas(
          modifier = Modifier
            .fillMaxWidth()
            .height(95.dp)
            .testTag("canvas_visual_eq")
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Frequency band markings
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          listOf("32Hz", "64Hz", "125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz", "16kHz").forEach { label ->
            Text(
              text = label,
              fontSize = 8.sp,
              fontFamily = FontFamily.Monospace,
              color = Color(0xFF475569)
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 3. Volume and Pan Sliders
    Card(
      shape = RoundedCornerShape(12.dp),
      colors = CardDefaults.cardColors(containerColor = Color(0xFF101726)),
      border = BorderStroke(1.dp, Color(0xFF223048)),
      modifier = Modifier.fillMaxWidth()
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(14.dp)
      ) {
        // Volume Slider (0% to 200%)
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.VolumeUp,
              contentDescription = null,
              tint = Color(0xFF2DD4BF),
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "Volume",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          }
          Text(
            text = "${volumePercent.toInt()}%",
            fontSize = 12.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF2DD4BF),
            modifier = Modifier.testTag("text_volume_val")
          )
        }

        Slider(
          value = volumePercent,
          onValueChange = { volumePercent = it },
          valueRange = 0f..200f,
          colors = SliderDefaults.colors(
            thumbColor = Color(0xFF2DD4BF),
            activeTrackColor = Color(0xFF2DD4BF),
            inactiveTrackColor = Color(0xFF1E293B)
          ),
          modifier = Modifier
            .fillMaxWidth()
            .height(28.dp)
            .testTag("slider_audio_volume")
        )

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Text(text = "Mute (0%)", fontSize = 9.sp, color = Color(0xFF64748B))
          Text(text = "Unity (100%)", fontSize = 9.sp, color = Color(0xFF94A3B8))
          Text(text = "Boost (+6dB / 200%)", fontSize = 9.sp, color = Color(0xFF64748B))
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Pan Slider (Left to Right)
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Stereo Pan",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
          val panLabel = when {
            panPosition < -0.05f -> "L ${(-panPosition * 100).toInt()}%"
            panPosition > 0.05f -> "R ${(panPosition * 100).toInt()}%"
            else -> "Center (C)"
          }
          Text(
            text = panLabel,
            fontSize = 12.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = VfxCyan,
            modifier = Modifier.testTag("text_pan_val")
          )
        }

        Slider(
          value = panPosition,
          onValueChange = { panPosition = it },
          valueRange = -1.0f..1.0f,
          colors = SliderDefaults.colors(
            thumbColor = VfxCyan,
            activeTrackColor = VfxCyan,
            inactiveTrackColor = Color(0xFF1E293B)
          ),
          modifier = Modifier
            .fillMaxWidth()
            .height(28.dp)
            .testTag("slider_audio_pan")
        )

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Text(text = "Left (100L)", fontSize = 9.sp, color = Color(0xFF64748B))
          Text(text = "Center", fontSize = 9.sp, color = Color(0xFF94A3B8))
          Text(text = "Right (100R)", fontSize = 9.sp, color = Color(0xFF64748B))
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 4. 2x2 Grid of Audio Effect Toggle Cards
    Text(
      text = "AUDIO DSP ENHANCEMENTS",
      fontSize = 10.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp,
      color = Color(0xFF64748B)
    )

    Spacer(modifier = Modifier.height(8.dp))

    // 2x2 Grid using 2 Rows of 2 cards
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      AudioEffectCard(
        title = "Voice Isolation (AI)",
        description = "Isolate speech & vocals from background",
        icon = Icons.Default.Mic,
        accentColor = Color(0xFF38BDF8),
        isActive = voiceIsolationActive,
        onToggle = { voiceIsolationActive = !voiceIsolationActive },
        modifier = Modifier
          .weight(1f)
          .testTag("card_fx_voice_isolation")
      )

      AudioEffectCard(
        title = "Noise Reduction",
        description = "Filter room hiss, wind & noise floor",
        icon = Icons.Default.NoiseAware,
        accentColor = Color(0xFF34D399),
        isActive = noiseReductionActive,
        onToggle = { noiseReductionActive = !noiseReductionActive },
        modifier = Modifier
          .weight(1f)
          .testTag("card_fx_noise_reduction")
      )
    }

    Spacer(modifier = Modifier.height(10.dp))

    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      AudioEffectCard(
        title = "Studio Reverb",
        description = "Simulate warm acoustic room reflection",
        icon = Icons.Default.Radio,
        accentColor = Color(0xFFA855F7),
        isActive = studioReverbActive,
        onToggle = { studioReverbActive = !studioReverbActive },
        modifier = Modifier
          .weight(1f)
          .testTag("card_fx_studio_reverb")
      )

      AudioEffectCard(
        title = "Bass Boost",
        description = "Low-end punch & harmonic sub resonance",
        icon = Icons.Default.Speaker,
        accentColor = Color(0xFFF59E0B),
        isActive = bassBoostActive,
        onToggle = { bassBoostActive = !bassBoostActive },
        modifier = Modifier
          .weight(1f)
          .testTag("card_fx_bass_boost")
      )
    }
  }
}

/**
 * Static mock visual equalizer bars with gradient fill simulating audio spectrum.
 */
@Composable
fun VisualEqualizerCanvas(modifier: Modifier = Modifier) {
  Canvas(modifier = modifier) {
    val barCount = 20
    val totalW = size.width
    val h = size.height
    val spacing = 4.dp.toPx()
    val totalSpacing = spacing * (barCount - 1)
    val barWidth = (totalW - totalSpacing) / barCount

    // Mock bar heights representing a realistic audio master frequency response
    val barHeights = floatArrayOf(
      0.35f, 0.55f, 0.78f, 0.92f, 0.85f,
      0.72f, 0.60f, 0.68f, 0.74f, 0.88f,
      0.82f, 0.70f, 0.58f, 0.52f, 0.62f,
      0.68f, 0.54f, 0.46f, 0.38f, 0.28f
    )

    for (i in 0 until barCount) {
      val barH = h * barHeights[i.coerceIn(0, barHeights.size - 1)]
      val x = i * (barWidth + spacing)
      val y = h - barH

      // Gradient bar fill (from cyan base to emerald to yellow/red peaks)
      drawRoundRect(
        brush = Brush.verticalGradient(
          colors = listOf(
            Color(0xFFF43F5E), // Peak warm
            Color(0xFFFBBF24), // High-mid yellow
            Color(0xFF34D399), // Mid green
            Color(0xFF06B6D4)  // Low cyan
          ),
          startY = y,
          endY = h
        ),
        topLeft = Offset(x, y),
        size = Size(barWidth, barH),
        cornerRadius = CornerRadius(3.dp.toPx(), 3.dp.toPx())
      )

      // Peak hold dot
      drawCircle(
        color = Color.White.copy(alpha = 0.8f),
        radius = 1.5.dp.toPx(),
        center = Offset(x + barWidth / 2f, y - 3.dp.toPx())
      )
    }
  }
}

/**
 * Individual Audio Effect Toggle Card for the 2x2 grid.
 */
@Composable
fun AudioEffectCard(
  title: String,
  description: String,
  icon: ImageVector,
  accentColor: Color,
  isActive: Boolean,
  onToggle: () -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    onClick = onToggle,
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(
      containerColor = if (isActive) Color(0xFF131B2A) else Color(0xFF0B1019)
    ),
    border = BorderStroke(
      width = if (isActive) 1.5.dp else 1.dp,
      color = if (isActive) accentColor else Color(0xFF1E293B)
    ),
    modifier = modifier.fillMaxWidth()
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = if (isActive) accentColor.copy(alpha = 0.2f) else Color(0xFF1E293B),
          modifier = Modifier.size(32.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = icon,
              contentDescription = title,
              tint = if (isActive) accentColor else Color(0xFF94A3B8),
              modifier = Modifier.size(18.dp)
            )
          }
        }

        // Active indicator pill
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = if (isActive) accentColor.copy(alpha = 0.15f) else Color(0xFF1E293B),
          border = BorderStroke(1.dp, if (isActive) accentColor else Color(0xFF334155))
        ) {
          Text(
            text = if (isActive) "ON" else "OFF",
            fontSize = 8.sp,
            fontWeight = FontWeight.Bold,
            color = if (isActive) accentColor else Color(0xFF64748B),
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      Text(
        text = title,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = description,
        fontSize = 10.sp,
        lineHeight = 13.sp,
        color = Color(0xFF94A3B8),
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
      )
    }
  }
}
