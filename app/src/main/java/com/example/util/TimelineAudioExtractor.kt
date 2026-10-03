package com.example.util

import android.content.Context
import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.util.Log
import android.widget.VideoView
import java.io.File
import java.nio.ByteBuffer

/**
 * Turns a video/audio content URI into a standalone playable audio file in cache.
 * Needed because VideoView already holds the original video file; a second MediaPlayer
 * on the same content:// URI usually fails, so extracted audio never plays.
 */
object TimelineAudioExtractor {
  private const val TAG = "TimelineAudioExtractor"

  fun materializeAudioFile(context: Context, sourceUri: String): String? {
    if (sourceUri.isBlank()) return null
    if (sourceUri.startsWith("asset://") || sourceUri.startsWith("sfx://")) return null

    val lower = sourceUri.lowercase()
    if (sourceUri.startsWith("file://") || sourceUri.startsWith("file:")) {
      val path = sourceUri.removePrefix("file://").removePrefix("file:")
      val file = File(path)
      val alreadyAudio = listOf(".m4a", ".mp3", ".aac", ".wav", ".ogg", ".flac").any { lower.endsWith(it) }
      if (file.exists() && file.length() > 64 && alreadyAudio) return file.toURI().toString()
    }

    val cacheKey = sourceUri.hashCode().toUInt().toString(16)
    val cached = File(context.cacheDir, "vfx_audio_$cacheKey.m4a")
    if (cached.exists() && cached.length() > 64) return cached.toURI().toString()
    return writeAudioTrack(context, sourceUri, cached)
  }

  /**
   * Copies only the audio samples. Never copies the video file, because that
   * locks the clip the preview is playing and the picture freezes.
   */
  private fun writeAudioTrack(context: Context, sourceUri: String, outFile: File): String? {
    val extractor = MediaExtractor()
    var muxer: MediaMuxer? = null
    var pfd: ParcelFileDescriptor? = null
    return try {
      if (sourceUri.startsWith("file://") || sourceUri.startsWith("file:")) {
        extractor.setDataSource(sourceUri.removePrefix("file://").removePrefix("file:"))
      } else {
        pfd = context.contentResolver.openFileDescriptor(Uri.parse(sourceUri), "r") ?: return null
        extractor.setDataSource(pfd.fileDescriptor)
      }
      var audioIndex = -1
      var format: MediaFormat? = null
      for (i in 0 until extractor.trackCount) {
        val trackFormat = extractor.getTrackFormat(i)
        val mime = trackFormat.getString(MediaFormat.KEY_MIME) ?: continue
        if (mime.startsWith("audio/")) {
          audioIndex = i
          format = trackFormat
          break
        }
      }
      if (audioIndex < 0 || format == null) return null
      extractor.selectTrack(audioIndex)
      if (outFile.exists()) outFile.delete()
      muxer = MediaMuxer(outFile.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
      val dst = muxer.addTrack(format)
      muxer.start()
      val buffer = ByteBuffer.allocate(256 * 1024)
      val info = MediaCodec.BufferInfo()
      var samples = 0
      while (true) {
        val size = extractor.readSampleData(buffer, 0)
        if (size < 0) break
        info.offset = 0
        info.size = size
        info.presentationTimeUs = extractor.sampleTime.coerceAtLeast(0L)
        info.flags = extractor.sampleFlags
        muxer.writeSampleData(dst, buffer, info)
        extractor.advance()
        samples++
      }
      muxer.stop()
      if (samples == 0 || outFile.length() < 64) {
        outFile.delete()
        null
      } else {
        Log.i(TAG, "Audio only $samples samples -> ${outFile.length()} bytes")
        outFile.toURI().toString()
      }
    } catch (e: Exception) {
      Log.w(TAG, "Audio demux failed: ${e.message}")
      outFile.delete()
      null
    } finally {
      try { muxer?.release() } catch (_: Exception) {}
      try { extractor.release() } catch (_: Exception) {}
      try { pfd?.close() } catch (_: Exception) {}
    }
  }

  fun remux(context: Context, videoUri: String, audioUri: String?, outFile: File): Boolean {
    val videoExtractor = MediaExtractor()
    val audioExtractor = MediaExtractor()
    var muxer: MediaMuxer? = null
    var videoPfd: ParcelFileDescriptor? = null
    var audioPfd: ParcelFileDescriptor? = null
    return try {
      videoPfd = openFd(context, videoUri)
      if (videoPfd != null) videoExtractor.setDataSource(videoPfd.fileDescriptor)
      else videoExtractor.setDataSource(filePath(videoUri))

      var videoIndex = -1
      var videoFormat: MediaFormat? = null
      for (i in 0 until videoExtractor.trackCount) {
        val format = videoExtractor.getTrackFormat(i)
        val mime = format.getString(MediaFormat.KEY_MIME) ?: continue
        if (mime.startsWith("video/")) {
          videoIndex = i
          videoFormat = format
          break
        }
      }
      if (videoIndex < 0 || videoFormat == null) return false
      videoExtractor.selectTrack(videoIndex)

      var audioIndex = -1
      var audioFormat: MediaFormat? = null
      if (!audioUri.isNullOrBlank()) {
        audioPfd = openFd(context, audioUri)
        if (audioPfd != null) audioExtractor.setDataSource(audioPfd.fileDescriptor)
        else audioExtractor.setDataSource(filePath(audioUri))
        for (i in 0 until audioExtractor.trackCount) {
          val format = audioExtractor.getTrackFormat(i)
          val mime = format.getString(MediaFormat.KEY_MIME) ?: continue
          if (mime.startsWith("audio/")) {
            audioIndex = i
            audioFormat = format
            break
          }
        }
        if (audioIndex >= 0) audioExtractor.selectTrack(audioIndex)
      }

      if (outFile.exists()) outFile.delete()
      muxer = MediaMuxer(outFile.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
      val outVideo = muxer.addTrack(videoFormat)
      val outAudio = if (audioIndex >= 0 && audioFormat != null) muxer.addTrack(audioFormat) else -1
      muxer.start()
      val buffer = ByteBuffer.allocate(512 * 1024)
      val info = MediaCodec.BufferInfo()

      if (outAudio < 0) {
        // Video only
        while (true) {
          val size = videoExtractor.readSampleData(buffer, 0)
          if (size < 0) break
          info.offset = 0
          info.size = size
          info.presentationTimeUs = videoExtractor.sampleTime.coerceAtLeast(0L)
          info.flags = videoExtractor.sampleFlags
          muxer.writeSampleData(outVideo, buffer, info)
          videoExtractor.advance()
        }
      } else {
        // Interleaved writing based on sampleTime to keep timestamps monotonic
        var lastVideoPts = -1L
        var lastAudioPts = -1L
        var audioDone = (outAudio < 0)
        var videoDone = false
        var videoFramesWritten = 0
        while (!videoDone) {
          val vPts = videoExtractor.sampleTime
          val aPts = if (!audioDone) audioExtractor.sampleTime else -1L

          if (vPts < 0) {
            videoDone = true
            break
          }

          if (audioDone || aPts < 0 || vPts <= aPts) {
            val size = videoExtractor.readSampleData(buffer, 0)
            if (size >= 0) {
              val pts = vPts.coerceAtLeast(lastVideoPts + 1L)
              lastVideoPts = pts
              info.offset = 0
              info.size = size
              info.presentationTimeUs = pts
              info.flags = videoExtractor.sampleFlags
              muxer.writeSampleData(outVideo, buffer, info)
              videoExtractor.advance()
              videoFramesWritten++
            } else {
              videoDone = true
            }
          } else {
            val size = audioExtractor.readSampleData(buffer, 0)
            if (size >= 0) {
              val pts = aPts.coerceAtLeast(lastAudioPts + 1L)
              lastAudioPts = pts
              info.offset = 0
              info.size = size
              info.presentationTimeUs = pts
              info.flags = audioExtractor.sampleFlags
              muxer.writeSampleData(outAudio, buffer, info)
              audioExtractor.advance()
            } else {
              audioDone = true // Audio track finished, continue processing remaining video
            }
          }
        }
        Log.i(TAG, "Remux finished: $videoFramesWritten video frames written")
      }

      muxer.stop()
      muxer.release()
      muxer = null
      outFile.length() > 64
    } catch (e: Exception) {
      Log.e(TAG, "Remux failed: ${e.message}")
      try { muxer?.release() } catch (_: Exception) {}
      outFile.delete()
      false
    } finally {
      try { videoExtractor.release() } catch (_: Exception) {}
      try { audioExtractor.release() } catch (_: Exception) {}
      try { videoPfd?.close() } catch (_: Exception) {}
      try { audioPfd?.close() } catch (_: Exception) {}
    }
  }

  private fun copySamples(extractor: MediaExtractor, muxer: MediaMuxer, track: Int) {
    val buffer = ByteBuffer.allocate(512 * 1024)
    val info = MediaCodec.BufferInfo()
    while (true) {
      val size = extractor.readSampleData(buffer, 0)
      if (size < 0) break
      info.offset = 0
      info.size = size
      info.presentationTimeUs = extractor.sampleTime.coerceAtLeast(0L)
      info.flags = extractor.sampleFlags
      muxer.writeSampleData(track, buffer, info)
      extractor.advance()
    }
  }

  private fun openFd(context: Context, uri: String): ParcelFileDescriptor? {
    if (uri.startsWith("file://") || uri.startsWith("file:")) return null
    return context.contentResolver.openFileDescriptor(Uri.parse(uri), "r")
  }

  private fun filePath(uri: String): String = uri.removePrefix("file://").removePrefix("file:")

  const val PLAYER_TAG: Int = 0x56465831

  fun rememberPreparedPlayer(videoView: VideoView, player: android.media.MediaPlayer) {
    videoView.setTag(PLAYER_TAG, player)
  }

  fun applyVideoViewVolume(videoView: VideoView, volume: Float) {
    val vol = volume.coerceIn(0f, 1f)
    val tagged = videoView.getTag(PLAYER_TAG) as? android.media.MediaPlayer
    if (tagged != null) {
      try { tagged.setVolume(vol, vol) } catch (_: Exception) {}
    }
    try {
      val field = VideoView::class.java.getDeclaredField("mMediaPlayer")
      field.isAccessible = true
      val player = field.get(videoView) as? android.media.MediaPlayer
      player?.setVolume(vol, vol)
    } catch (_: Exception) {}
  }
}
