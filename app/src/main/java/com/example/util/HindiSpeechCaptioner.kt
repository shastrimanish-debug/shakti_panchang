package com.example.util

import android.content.Context
import android.util.Log
import com.example.MediaTrack
import org.json.JSONObject
import org.vosk.LibVosk
import org.vosk.LogLevel
import org.vosk.Model
import org.vosk.Recognizer
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipInputStream

/**
 * On-device speech captions. Hindi uses the Vosk small Hindi model, downloaded
 * once into app storage. English and Spanish use their small models the same way.
 */
object HindiSpeechCaptioner {
  private const val TAG = "HindiSpeechCaptioner"

  @Volatile
  var lastError: String? = null

  data class Line(val text: String, val startMs: Long, val durationMs: Long)

  fun transcribe(context: Context, tracks: List<MediaTrack>, durationMs: Long, language: String): List<Line> {
    lastError = null
    val pcm = TimelineAudioMixer.speechPcm16k(context, tracks, durationMs)
    if (pcm == null || pcm.size < 16000 / 2) {
      lastError = "Video mein bolne wali awaaz nahi mili. Music-only clip pe caption nahi banta."
      return emptyList()
    }
    val spec = modelFor(language)
    val dir = try {
      ensureModel(context, spec)
    } catch (e: Exception) {
      lastError = e.message ?: "Speech model download fail"
      Log.w(TAG, "model", e)
      return emptyList()
    }
    return try {
      LibVosk.setLogLevel(LogLevel.WARNINGS)
      val model = Model(dir.absolutePath)
      val recognizer = Recognizer(model, 16000f)
      recognizer.setWords(true)
      val bytes = ByteArray(pcm.size * 2)
      var o = 0
      for (s in pcm) {
        bytes[o++] = (s.toInt() and 0xFF).toByte()
        bytes[o++] = ((s.toInt() shr 8) and 0xFF).toByte()
      }
      val words = ArrayList<Triple<String, Float, Float>>()
      var offset = 0
      val chunk = 8000
      while (offset < bytes.size) {
        val n = minOf(chunk, bytes.size - offset)
        val slice = bytes.copyOfRange(offset, offset + n)
        if (recognizer.acceptWaveForm(slice, slice.size)) {
          collect(recognizer.getResult(), words)
        }
        offset += n
      }
      collect(recognizer.getFinalResult(), words)
      recognizer.close()
      model.close()
      val lines = group(words)
      if (lines.isEmpty()) lastError = "Awaaz suni, lekin words clear nahi the. Thodi saaf recording try karo."
      lines
    } catch (e: Exception) {
      lastError = e.message ?: "Caption engine fail"
      Log.w(TAG, "vosk", e)
      emptyList()
    }
  }

  private data class Spec(val folder: String, val url: String)

  private fun modelFor(language: String): Spec {
    val key = language.lowercase()
    return when {
      key.contains("hindi") || key.contains("hinglish") -> Spec(
        "vosk-model-small-hi-0.22",
        "https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip"
      )
      key.contains("spanish") -> Spec(
        "vosk-model-small-es-0.42",
        "https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip"
      )
      else -> Spec(
        "vosk-model-small-en-us-0.15",
        "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
      )
    }
  }

  private fun ensureModel(context: Context, spec: Spec): File {
    val root = File(context.filesDir, "vosk")
    val dir = File(root, spec.folder)
    if (File(dir, "am").exists() || File(dir, "conf").exists()) return dir
    root.mkdirs()
    val zip = File(root, spec.folder + ".zip")
    download(spec.url, zip)
    unzip(zip, root)
    zip.delete()
    if (!dir.exists()) {
      val nested = root.listFiles()?.firstOrNull { it.isDirectory && it.name.contains("vosk-model") }
      if (nested != null && nested.name != spec.folder) nested.renameTo(dir)
    }
    if (!dir.exists()) throw IllegalStateException("Model folder missing after unzip")
    return dir
  }

  private fun download(url: String, dest: File) {
    val connection = (URL(url).openConnection() as HttpURLConnection).apply {
      connectTimeout = 20_000
      readTimeout = 120_000
      instanceFollowRedirects = true
    }
    try {
      if (connection.responseCode !in 200..299) {
        throw IllegalStateException("Model download HTTP ${connection.responseCode}")
      }
      connection.inputStream.use { input ->
        FileOutputStream(dest).use { output -> input.copyTo(output) }
      }
    } finally {
      connection.disconnect()
    }
    if (dest.length() < 1_000_000) {
      dest.delete()
      throw IllegalStateException("Model download incomplete")
    }
  }

  private fun unzip(zip: File, destDir: File) {
    ZipInputStream(zip.inputStream()).use { zipIn ->
      var entry = zipIn.nextEntry
      while (entry != null) {
        val out = File(destDir, entry.name)
        if (!out.canonicalPath.startsWith(destDir.canonicalPath)) {
          zipIn.closeEntry()
          entry = zipIn.nextEntry
          continue
        }
        if (entry.isDirectory) {
          out.mkdirs()
        } else {
          out.parentFile?.mkdirs()
          FileOutputStream(out).use { zipIn.copyTo(it) }
        }
        zipIn.closeEntry()
        entry = zipIn.nextEntry
      }
    }
  }

  private fun collect(json: String, words: MutableList<Triple<String, Float, Float>>) {
    try {
      val result = JSONObject(json).optJSONArray("result") ?: return
      for (i in 0 until result.length()) {
        val w = result.getJSONObject(i)
        val text = w.optString("word")
        if (text.isBlank()) continue
        words += Triple(text, w.optDouble("start").toFloat(), w.optDouble("end").toFloat())
      }
    } catch (_: Exception) {
    }
  }

  private fun group(words: List<Triple<String, Float, Float>>): List<Line> {
    if (words.isEmpty()) return emptyList()
    val lines = ArrayList<Line>()
    var start = words.first().second
    val phrase = StringBuilder()
    var count = 0
    for (word in words) {
      if (phrase.isNotEmpty()) phrase.append(' ')
      phrase.append(word.first)
      count++
      val longEnough = word.second - start > 2.4f || count >= 6
      if (longEnough) {
        val end = word.third
        lines += Line(phrase.toString(), (start * 1000).toLong(), ((end - start) * 1000).toLong().coerceAtLeast(700L))
        phrase.clear()
        count = 0
        start = end
      }
    }
    if (phrase.isNotEmpty()) {
      val end = words.last().third
      lines += Line(phrase.toString(), (start * 1000).toLong(), ((end - start) * 1000).toLong().coerceAtLeast(700L))
    }
    return lines
  }
}
