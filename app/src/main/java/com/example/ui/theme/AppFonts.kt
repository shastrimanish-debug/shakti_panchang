package com.example.ui.theme

import android.content.Context
import android.graphics.Typeface
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.core.content.res.ResourcesCompat
import com.example.R

object AppFonts {
  val BebasNeue: FontFamily by lazy { FontFamily(Font(R.font.bebas_neue, FontWeight.Normal)) }
  val Anton: FontFamily by lazy { FontFamily(Font(R.font.anton, FontWeight.Normal)) }
  val Montserrat: FontFamily by lazy { FontFamily(Font(R.font.montserrat, FontWeight.Normal)) }
  val Pacifico: FontFamily by lazy { FontFamily(Font(R.font.pacifico, FontWeight.Normal)) }
  val Cinzel: FontFamily by lazy { FontFamily(Font(R.font.cinzel, FontWeight.Normal)) }
  val Bangers: FontFamily by lazy { FontFamily(Font(R.font.bangers, FontWeight.Normal)) }
  val Oswald: FontFamily by lazy { FontFamily(Font(R.font.oswald, FontWeight.Normal)) }

  data class FontItem(
    val id: String,
    val displayName: String,
    val description: String,
    val fontFamily: FontFamily,
    val previewSample: String = "VFX PRO"
  )

  val AvailableFonts: List<FontItem> by lazy {
    listOf(
      FontItem("Bebas Viral", "Bebas Viral", "Bold viral YouTube/Reels title", BebasNeue, "VIRAL TITLE"),
      FontItem("Anton Grotesk", "Anton Grotesk", "Heavy high-impact headline", Anton, "HEADLINE"),
      FontItem("Montserrat Clean", "Montserrat Clean", "Modern geometric sans-serif", Montserrat, "Minimal Clean"),
      FontItem("Brush Script", "Brush Script", "Stylish signature handwritten script", Pacifico, "Signature"),
      FontItem("Cinematic Serif", "Cinematic Serif", "Luxury editorial cinematic serif", Cinzel, "CINEMATIC"),
      FontItem("Comic Pop", "Comic Pop", "Bold playful comic cartoon style", Bangers, "COMIC POP!"),
      FontItem("Impact Bold", "Impact Bold", "Ultra-condensed punchy font", Oswald, "IMPACT BOLD"),
      FontItem("Monospace Code", "Monospace Code", "Terminal developer tech font", FontFamily.Monospace, "code_01")
    )
  }

  fun getFontFamily(fontName: String?): FontFamily {
    if (fontName.isNullOrBlank()) return BebasNeue
    return when (fontName.lowercase().trim()) {
      "bebas viral", "bebas neue", "bebas" -> BebasNeue
      "anton grotesk", "anton" -> Anton
      "montserrat clean", "montserrat" -> Montserrat
      "brush script", "pacifico", "cursive" -> Pacifico
      "cinematic serif", "cinzel", "editorial" -> Cinzel
      "comic pop", "bangers", "comic" -> Bangers
      "impact bold", "oswald", "impact" -> Oswald
      "monospace code", "monospace" -> FontFamily.Monospace
      else -> BebasNeue
    }
  }

  fun getTypeface(context: Context, fontName: String?): Typeface {
    val resId = when (fontName?.lowercase()?.trim()) {
      "bebas viral", "bebas neue", "bebas" -> R.font.bebas_neue
      "anton grotesk", "anton" -> R.font.anton
      "montserrat clean", "montserrat" -> R.font.montserrat
      "brush script", "pacifico", "cursive" -> R.font.pacifico
      "cinematic serif", "cinzel", "editorial" -> R.font.cinzel
      "comic pop", "bangers", "comic" -> R.font.bangers
      "impact bold", "oswald", "impact" -> R.font.oswald
      else -> R.font.bebas_neue
    }
    return try {
      ResourcesCompat.getFont(context, resId) ?: Typeface.DEFAULT_BOLD
    } catch (_: Exception) {
      Typeface.DEFAULT_BOLD
    }
  }
}
