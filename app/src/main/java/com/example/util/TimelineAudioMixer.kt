package com.example.util

import android.content.Context
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.net.Uri
import android.util.Log
import com.example.ClipType
import com.example.MediaTrack
import com.example.TrackType
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Mixes unmuted video audio and music onto one timeline, with per-clip volume
 * and a short fade in / fade out so cuts do not click.
 */
object TimelineAudioMixer {
  private const val TAG = "TimelineAudioMixer"
  private const val OUT_RATE = 44100
  private const val FADE_MS = 280

  fun mixToM4a(context: Context, tracks: List<MediaTrack>, durationMs: Long): String? {
    if (durationMs < 200L) return null
    val layers = speechAndMusic(tracks)
    if (layers.isEmpty()) return null
    val total = ((durationMs.coerceAtMost(180_000L) * OUT_RATE) / 1000L).toInt()
    val mix = try {
      FloatArray(total * 2)
    } catch (_: OutOfMemoryError) {
      Log.w(TAG, "Not enough memory to mix audio")
      return null
    }
    var wrote = false
    for (layer in layers) {
      val pcm = decode(context, layer.uri, OUT_RATE, stereo = true) ?: continue
      place(mix, pcm, layer, total)
      wrote = true
    }
    if (!wrote) return null
    val out = File(context.cacheDir, "vfx_mix_${System.currentTimeMillis()}.m4a")
    return if (encodeAac(mix, out)) out.toURI().toString() else null
  }

  /** Mono 16 kHz speech from unmuted video clips, for the caption model. */
  fun speechPcm16k(context: Context, tracks: List<MediaTrack>, durationMs: Long): ShortArray? {
    val layers = speechAndMusic(tracks).filter { it.fromVideo }
    if (layers.isEmpty() || durationMs < 400L) return null
    val rate = 16000
    val total = ((durationMs.coerceAtMost(180_000L) * rate) / 1000L).toInt()
    val mix = FloatArray(total)
    var wrote = false
    for (layer in layers) {
      val pcm = decode(context, layer.uri, rate, stereo = false) ?: continue
      val start = ((layer.startMs * rate) / 1000L).toInt().coerceAtLeast(0)
      val speed = layer.speed.coerceIn(0.25f, 4f)
      val count = min(pcm.size, ((layer.durationMs * rate) / 1000L * speed).toInt())
      if (count <= 0) continue
      for (i in 0 until count) {
        val srcIndex = if (layer.reversed) count - 1 - i else i
        val dst = start + (i / speed).toInt()
        if (dst < 0 || dst >= mix.size) continue
        val gain = layer.volume * fade(i, count, rate)
        mix[dst] += pcm[srcIndex.coerceIn(0, pcm.size - 1)] * gain
      }
      wrote = true
    }
    if (!wrote) return null
    return ShortArray(mix.size) { i -> (mix[i] * 32767f).toInt().coerceIn(-32768, 32767).toShort() }
  }

  private data class Layer(
    val uri: String,
    val startMs: Long,
    val durationMs: Long,
    val volume: Float,
    val speed: Float,
    val reversed: Boolean,
    val pitch: Float,
    val fromVideo: Boolean
  )

  private fun speechAndMusic(tracks: List<MediaTrack>): List<Layer> {
    val layers = ArrayList<Layer>()
    for (track in tracks) {
      for (clip in track.clips) {
        val uri = clip.uri ?: continue
        if (clip.isMuted || clip.volume <= 0.01f || clip.isFrozen) continue
        val isVideo = clip.type == ClipType.VIDEO || track.type == TrackType.MAIN_VIDEO && clip.type != ClipType.AUDIO
        val isAudio = clip.type == ClipType.AUDIO || track.type == TrackType.AUDIO
        if (!isVideo && !isAudio) continue
        if (clip.type == ClipType.IMAGE || clip.type == ClipType.TEXT) continue
        layers += Layer(
          uri = uri,
          startMs = clip.startTimeMs,
          durationMs = clip.durationMs.coerceAtLeast(1L),
          volume = clip.volume.coerceIn(0f, 2f),
          speed = clip.speed,
          reversed = clip.isReversed,
          pitch = when (clip.voiceEffect) {
            "Chipmunk" -> 1.6f
            "Deep Male" -> 0.7f
            "Robot" -> 0.85f
            else -> clip.voicePitch.coerceIn(0.5f, 2f)
          },
          fromVideo = clip.type == ClipType.VIDEO
        )
      }
    }
    return layers
  }

  private fun place(mix: FloatArray, pcm: FloatArray, layer: Layer, totalFrames: Int) {
    val start = ((layer.startMs * OUT_RATE) / 1000L).toInt().coerceAtLeast(0)
    val speed = layer.speed.coerceIn(0.25f, 4f)
    val srcFrames = pcm.size / 2
    val need = min(srcFrames, ((layer.durationMs * OUT_RATE) / 1000L * speed).toInt())
    if (need <= 4) return
    val pitch = layer.pitch.coerceIn(0.5f, 2f)
    for (i in 0 until need) {
      val pitched = (i * pitch).toInt()
      if (pitched >= srcFrames) break
      val src = if (layer.reversed) (srcFrames - 1 - pitched).coerceAtLeast(0) else pitched
      val dst = start + (i / speed).toInt()
      if (dst < 0 || dst >= totalFrames) continue
      val gain = layer.volume * fade(i, need, OUT_RATE)
      val base = src * 2
      if (base + 1 >= pcm.size) continue
      mix[dst * 2] += pcm[base] * gain
      mix[dst * 2 + 1] += pcm[base + 1] * gain
    }
  }

  private fun fade(index: Int, total: Int, rate: Int): Float {
    val fadeSamples = (rate * FADE_MS / 1000).coerceAtLeast(1)
    val inn = if (index < fadeSamples) index / fadeSamples.toFloat() else 1f
    val out = if (index > total - fadeSamples) (total - index) / fadeSamples.toFloat() else 1f
    return (inn * out).coerceIn(0f, 1f)
  }

  private fun decode(context: Context, uri: String, outRate: Int, stereo: Boolean): FloatArray? {
    val extractor = MediaExtractor()
    var codec: MediaCodec? = null
    return try {
      if (uri.startsWith("file://") || uri.startsWith("file:")) {
        extractor.setDataSource(uri.removePrefix("file://").removePrefix("file:"))
      } else {
        val pfd = context.contentResolver.openFileDescriptor(Uri.parse(uri), "r") ?: return null
        extractor.setDataSource(pfd.fileDescriptor)
      }
      var index = -1
      var format: MediaFormat? = null
      for (i in 0 until extractor.trackCount) {
        val track = extractor.getTrackFormat(i)
        val mime = track.getString(MediaFormat.KEY_MIME) ?: continue
        if (mime.startsWith("audio/")) {
          index = i
          format = track
          break
        }
      }
      if (index < 0 || format == null) return null
      extractor.selectTrack(index)
      val mime = format.getString(MediaFormat.KEY_MIME) ?: return null
      codec = MediaCodec.createDecoderByType(mime)
      codec.configure(format, null, null, 0)
      codec.start()
      val info = MediaCodec.BufferInfo()
      val samples = ArrayList<Float>(outRate * 4)
      var inRate = format.getInteger(MediaFormat.KEY_SAMPLE_RATE)
      var channels = format.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
      var inputDone = false
      var outputDone = false
      while (!outputDone) {
        if (!inputDone) {
          val inIndex = codec.dequeueInputBuffer(10_000)
          if (inIndex >= 0) {
            val buffer = codec.getInputBuffer(inIndex)
            val size = if (buffer != null) extractor.readSampleData(buffer, 0) else -1
            if (size < 0 || buffer == null) {
              codec.queueInputBuffer(inIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
              inputDone = true
            } else {
              codec.queueInputBuffer(inIndex, 0, size, extractor.sampleTime.coerceAtLeast(0L), 0)
              extractor.advance()
            }
          }
        }
        val outIndex = codec.dequeueOutputBuffer(info, 10_000)
        if (outIndex >= 0) {
          val outFormat = codec.outputFormat
          if (outFormat.containsKey(MediaFormat.KEY_SAMPLE_RATE)) inRate = outFormat.getInteger(MediaFormat.KEY_SAMPLE_RATE)
          if (outFormat.containsKey(MediaFormat.KEY_CHANNEL_COUNT)) channels = outFormat.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
          val buffer = codec.getOutputBuffer(outIndex)
          if (buffer != null && info.size > 0) {
            buffer.position(info.offset)
            buffer.limit(info.offset + info.size)
            buffer.order(ByteOrder.LITTLE_ENDIAN)
            val shorts = buffer.remaining() / 2
            val frameCh = channels.coerceAtLeast(1)
            var s = 0
            while (s + frameCh <= shorts) {
              var acc = 0f
              for (c in 0 until frameCh) {
                acc += buffer.short.toFloat() / 32768f
              }
              samples.add(acc / frameCh)
              s += frameCh
            }
          }
          codec.releaseOutputBuffer(outIndex, false)
          if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) outputDone = true
        } else if (outIndex == MediaCodec.INFO_TRY_AGAIN_LATER && inputDone) {
          outputDone = true
        }
      }
      if (samples.isEmpty()) return null
      resample(samples.toFloatArray(), inRate, outRate, stereo)
    } catch (e: Exception) {
      Log.w(TAG, "Audio decode failed: ${e.message}")
      null
    } finally {
      try { codec?.stop() } catch (_: Exception) {}
      try { codec?.release() } catch (_: Exception) {}
      try { extractor.release() } catch (_: Exception) {}
    }
  }

  private fun resample(mono: FloatArray, inRate: Int, outRate: Int, stereo: Boolean): FloatArray {
    if (mono.isEmpty()) return FloatArray(0)
    val outCount = (mono.size.toLong() * outRate / inRate.coerceAtLeast(1)).toInt().coerceAtLeast(1)
    val out = FloatArray(if (stereo) outCount * 2 else outCount)
    for (i in 0 until outCount) {
      val srcPos = i * (inRate.toFloat() / outRate)
      val i0 = srcPos.toInt().coerceIn(0, mono.size - 1)
      val i1 = min(mono.size - 1, i0 + 1)
      val f = srcPos - i0
      val v = mono[i0] * (1f - f) + mono[i1] * f
      if (stereo) {
        out[i * 2] = v
        out[i * 2 + 1] = v
      } else {
        out[i] = v
      }
    }
    return out
  }

  private fun encodeAac(stereo: FloatArray, outFile: File): Boolean {
    val frames = stereo.size / 2
    if (frames < OUT_RATE / 10) return false
    var codec: MediaCodec? = null
    var muxer: MediaMuxer? = null
    return try {
      val format = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC, OUT_RATE, 2)
      format.setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
      format.setInteger(MediaFormat.KEY_BIT_RATE, 128_000)
      format.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, 16_384)
      codec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC)
      codec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
      codec.start()
      if (outFile.exists()) outFile.delete()
      muxer = MediaMuxer(outFile.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
      val info = MediaCodec.BufferInfo()
      var track = -1
      var muxerStarted = false
      val chunk = 1024
      var offset = 0
      var inputDone = false
      var outputDone = false
      while (!outputDone) {
        if (!inputDone) {
          val inIndex = codec.dequeueInputBuffer(10_000)
          if (inIndex >= 0) {
            val buffer = codec.getInputBuffer(inIndex) ?: break
            buffer.clear()
            buffer.order(ByteOrder.LITTLE_ENDIAN)
            val pts = offset * 1_000_000L / OUT_RATE
            if (offset >= frames) {
              codec.queueInputBuffer(inIndex, 0, 0, pts, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
              inputDone = true
            } else {
              val n = min(chunk, frames - offset)
              for (i in 0 until n) {
                val l = (stereo[(offset + i) * 2] * 32767f).roundToInt().coerceIn(-32768, 32767)
                val r = (stereo[(offset + i) * 2 + 1] * 32767f).roundToInt().coerceIn(-32768, 32767)
                buffer.putShort(l.toShort())
                buffer.putShort(r.toShort())
              }
              codec.queueInputBuffer(inIndex, 0, n * 4, pts, 0)
              offset += n
            }
          }
        }
        val outIndex = codec.dequeueOutputBuffer(info, 10_000)
        when {
          outIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
            if (muxerStarted) continue
            track = muxer.addTrack(codec.outputFormat)
            muxer.start()
            muxerStarted = true
          }
          outIndex >= 0 -> {
            val encoded = codec.getOutputBuffer(outIndex)
            if (muxerStarted && encoded != null && info.size > 0 && info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
              encoded.position(info.offset)
              encoded.limit(info.offset + info.size)
              muxer.writeSampleData(track, encoded, info)
            }
            codec.releaseOutputBuffer(outIndex, false)
            if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) outputDone = true
          }
          inputDone && outIndex == MediaCodec.INFO_TRY_AGAIN_LATER -> outputDone = true
        }
      }
      if (muxerStarted) muxer.stop()
      outFile.length() > 64
    } catch (e: Exception) {
      Log.w(TAG, "AAC encode failed: ${e.message}")
      false
    } finally {
      try { codec?.stop() } catch (_: Exception) {}
      try { codec?.release() } catch (_: Exception) {}
      try { muxer?.release() } catch (_: Exception) {}
    }
  }
}
