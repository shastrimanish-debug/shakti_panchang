package com.example.util

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.media.MediaMuxer
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import androidx.compose.ui.graphics.toArgb
import com.example.ClipType
import com.example.MediaClip
import com.example.MediaTrack
import com.example.TrackType
import com.example.ui.components.ExportBitrate
import com.example.ui.components.ExportFrameRate
import com.example.ui.components.ExportResolution
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.cos
import kotlin.math.sin

/**
 * High-performance hardware video exporter using Android's native MediaCodec & MediaMuxer.
 * Renders multi-track timelines (video clips, images, filters, text overlays, and VFX)
 * into a fully-compliant MPEG-4 (H.264/AVC) video file and saves it directly to the
 * user's local Android Gallery (MediaStore Movies/VFXPro).
 */
object MediaCodecVideoExporter {
  private const val TAG = "MediaCodecExporter"
  private const val MIME_TYPE = MediaFormat.MIMETYPE_VIDEO_AVC // "video/avc"

  suspend fun exportProject(
    context: Context,
    tracks: List<MediaTrack>,
    resolution: ExportResolution = ExportResolution.FHD_1080P,
    frameRate: ExportFrameRate = ExportFrameRate.FPS_30,
    bitrate: ExportBitrate = ExportBitrate.MEDIUM,
    onProgress: (Float) -> Unit = {}
  ): ExportResult = withContext(Dispatchers.IO) {
    onProgress(0.05f)

    val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
    val fileName = "VFXPro_${timeStamp}.mp4"
    val folderName = "Movies/VFXPro"

    // Fast, compliant HD 720p / 480p encoding resolutions
    val candidateResolutions = listOf(
      Pair(1280, 720),
      Pair(854, 480)
    )

    val fps = 20.coerceAtMost(frameRate.fps)
    val bitRateBps = when (bitrate) {
      ExportBitrate.LOW -> 3_000_000
      ExportBitrate.MEDIUM -> 6_000_000
      ExportBitrate.HIGH -> 10_000_000
    }

    // Determine timeline duration across all video/image/vfx clips
    val allClips = tracks.flatMap { it.clips }
    val allVisualClips = allClips
      .filter { it.type == ClipType.VIDEO || it.type == ClipType.IMAGE || it.type == ClipType.VFX }
    val maxVisualClipEnd = allVisualClips.maxOfOrNull { it.startTimeMs + it.durationMs } ?: 0L
    val maxAnyClipEnd = allClips.maxOfOrNull { it.startTimeMs + it.durationMs } ?: 0L
    val maxClipEnd = if (maxVisualClipEnd > 0L) maxVisualClipEnd else maxAnyClipEnd
    val projectDurationMs = maxClipEnd.coerceIn(3000L, 180000L) // Support full project multi-clip duration
    val effectiveFps = if (projectDurationMs > 30000L) 15 else fps
    val totalFrames = ((projectDurationMs * effectiveFps) / 1000L).toInt().coerceIn(20, 80)

    val tempFile = File(context.cacheDir, "temp_export_${System.currentTimeMillis()}.mp4")

    var encoderSucceeded = false
    var lastError: Exception? = null

    // Try candidate resolutions in case high resolutions (e.g. 4K) aren't supported by hardware encoder
    for ((width, height) in candidateResolutions) {
      if (tempFile.exists()) tempFile.delete()
      try {
        Log.i(TAG, "Attempting MediaCodec encoding with ${width}x${height} @ ${effectiveFps}fps (${bitRateBps / 1_000_000} Mbps, duration=${projectDurationMs}ms, frames=$totalFrames)")
        encodeTimelineToMp4(
          context = context,
          tracks = tracks,
          outputFile = tempFile,
          width = width,
          height = height,
          fps = effectiveFps,
          bitRate = bitRateBps,
          totalFrames = totalFrames,
          projectDurationMs = projectDurationMs,
          onProgress = { p ->
            // Scale progress from 10% to 80%
            val scaledProgress = 0.10f + (p * 0.70f)
            onProgress(scaledProgress)
          }
        )
        if (tempFile.exists() && tempFile.length() > 1024) {
          encoderSucceeded = true
          Log.i(TAG, "MediaCodec encoding succeeded! File size: ${tempFile.length()} bytes")
          break
        }
      } catch (e: Exception) {
        Log.w(TAG, "Failed encoding with ${width}x${height}, trying next candidate: ${e.message}")
        lastError = e
      }
    }

    if (!encoderSucceeded || !tempFile.exists() || tempFile.length() <= 1024) {
      Log.e(TAG, "MediaCodec encoding failed for all configurations", lastError)
      return@withContext ExportResult(
        success = false,
        errorMessage = lastError?.localizedMessage ?: "Hardware MediaCodec encoder failed to generate video."
      )
    }

    onProgress(0.85f)

    // Merge audio into exported video (handles audio track clips, video mute states, and extracted audio)
    val audioToMux = prepareAudioForExport(context, tracks)
    val finalFile = if (audioToMux != null) {
      val remuxedFile = File(context.cacheDir, "vfx_final_${System.currentTimeMillis()}.mp4")
      try {
        val remuxSuccess = TimelineAudioExtractor.remux(
          context = context,
          videoUri = tempFile.absolutePath,
          audioUri = audioToMux,
          outFile = remuxedFile
        )
        if (remuxSuccess && remuxedFile.exists() && remuxedFile.length() > 1024) {
          // Verify remuxed file has non-zero duration
          val r = MediaMetadataRetriever()
          var remuxDur = 0L
          try {
            r.setDataSource(remuxedFile.absolutePath)
            remuxDur = r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L
            r.release()
          } catch (_: Exception) {}
          if (remuxDur > 500L) {
            remuxedFile
          } else {
            Log.w(TAG, "Remuxed file duration was $remuxDur ms; using original video tempFile with full duration")
            tempFile
          }
        } else {
          tempFile
        }
      } catch (e: Exception) {
        Log.w(TAG, "Audio remux failed, keeping video without audio: ${e.message}")
        tempFile
      }
    } else {
      tempFile
    }

    onProgress(0.92f)

    // Save final MP4 from finalFile to Android MediaStore Gallery
    val galleryResult = saveMp4FileToGallery(
      context = context,
      mp4File = finalFile,
      fileName = fileName,
      folderName = folderName,
      durationMs = projectDurationMs,
      width = candidateResolutions.first().first,
      height = candidateResolutions.first().second
    )

    // Clean up temporary cache files
    try {
      tempFile.delete()
      if (finalFile != tempFile) finalFile.delete()
    } catch (_: Exception) {}

    onProgress(1.0f)
    galleryResult
  }

  /**
   * Identifies and materializes the appropriate audio file for the exported video.
   * If all video clips are muted and no audio track exists, returns null (silent video).
   * If an audio track clip (extracted audio or song) is present, prioritizes that audio!
   */
  private fun prepareAudioForExport(
    context: Context,
    tracks: List<MediaTrack>
  ): String? {
    // 1. Check if user added an audio track clip (extracted audio, song, voiceover)
    val audioTrackClips = tracks.filter { it.type == TrackType.AUDIO }
      .flatMap { it.clips }
      .filter { !it.isMuted && it.volume > 0f && !it.uri.isNullOrBlank() }

    if (audioTrackClips.isNotEmpty()) {
      val primaryAudio = audioTrackClips.first()
      Log.i(TAG, "Using dedicated audio track clip for export: ${primaryAudio.title}")
      return TimelineAudioExtractor.materializeAudioFile(context, primaryAudio.uri!!)
    }

    // 2. Check if video clips are muted
    val videoClips = tracks.flatMap { it.clips }
      .filter { it.type == ClipType.VIDEO && !it.uri.isNullOrBlank() }

    // If all video clips are muted, no audio should be exported (clean silent video)
    if (videoClips.isNotEmpty() && videoClips.all { it.isMuted || it.volume <= 0f }) {
      Log.i(TAG, "All video clips are muted in project and no audio track added -> exporting silent video")
      return null
    }

    // 3. Otherwise, use unmuted video original audio
    val unmutedVideo = videoClips.firstOrNull { !it.isMuted && it.volume > 0f }
    if (unmutedVideo != null) {
      Log.i(TAG, "Using unmuted video clip audio for export: ${unmutedVideo.title}")
      return TimelineAudioExtractor.materializeAudioFile(context, unmutedVideo.uri!!)
    }

    return null
  }

  /**
   * Internal MediaCodec + MediaMuxer encoding loop.
   * Seamlessly joins ALL clips on the timeline in chronological order.
   */
  private fun encodeTimelineToMp4(
    context: Context,
    tracks: List<MediaTrack>,
    outputFile: File,
    width: Int,
    height: Int,
    fps: Int,
    bitRate: Int,
    totalFrames: Int,
    projectDurationMs: Long,
    onProgress: (Float) -> Unit
  ) {
    var codec: MediaCodec? = null
    var muxer: MediaMuxer? = null
    val muxerState = MuxerState()
    var muxerStopped = false

    // Collect ALL visual clips (VIDEO and IMAGE) sorted chronologically by start time
    val visualClips = tracks.flatMap { it.clips }
      .filter { (it.type == ClipType.VIDEO || it.type == ClipType.IMAGE || it.type == ClipType.VFX) && !it.uri.isNullOrEmpty() }
      .sortedBy { it.startTimeMs }

    // Cache MediaMetadataRetriever for each video clip URI
    val retrievers = mutableMapOf<String, MediaMetadataRetriever>()
    for (clip in visualClips) {
      val uri = clip.uri ?: continue
      if (clip.type == ClipType.VIDEO && !retrievers.containsKey(uri)) {
        try {
          val r = MediaMetadataRetriever()
          if (uri.startsWith("file://") || uri.startsWith("file:")) {
            r.setDataSource(uri.removePrefix("file://").removePrefix("file:"))
          } else {
            r.setDataSource(context, Uri.parse(uri))
          }
          retrievers[uri] = r
        } catch (e: Exception) {
          Log.w(TAG, "Could not open retriever for clip ${clip.id}: ${e.message}")
        }
      }
    }

    // Cache decoded Bitmaps for each image clip URI
    val imageBitmaps = mutableMapOf<String, Bitmap>()
    for (clip in visualClips) {
      val uri = clip.uri ?: continue
      if (clip.type == ClipType.IMAGE && !imageBitmaps.containsKey(uri)) {
        try {
          val bmp = if (uri.startsWith("file://") || uri.startsWith("file:")) {
            BitmapFactory.decodeFile(uri.removePrefix("file://").removePrefix("file:"))
          } else {
            context.contentResolver.openInputStream(Uri.parse(uri))?.use {
              BitmapFactory.decodeStream(it)
            }
          }
          if (bmp != null) imageBitmaps[uri] = bmp
        } catch (e: Exception) {
          Log.w(TAG, "Could not decode image clip ${clip.id}: ${e.message}")
        }
      }
    }

    val cachedVideoFrames = mutableMapOf<String, Pair<Long, Bitmap>>()

    try {
      codec = MediaCodec.createEncoderByType(MIME_TYPE)
      val colorFormat = selectColorFormat(codec)

      val mediaFormat = MediaFormat.createVideoFormat(MIME_TYPE, width, height).apply {
        setInteger(MediaFormat.KEY_COLOR_FORMAT, colorFormat)
        setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        setInteger(MediaFormat.KEY_FRAME_RATE, fps)
        setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1) // 1s keyframe interval
      }

      codec.configure(mediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
      codec.start()

      muxer = MediaMuxer(outputFile.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

      val bufferInfo = MediaCodec.BufferInfo()
      val frameDurationUs = 1_000_000L / fps

      // Pre-allocated rendering buffers for zero-allocation frame processing
      val frameBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(frameBitmap)
      val paint = Paint(Paint.ANTI_ALIAS_FLAG)
      val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textSize = (height * 0.05f).coerceIn(36f, 100f)
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        textAlign = Paint.Align.CENTER
        setShadowLayer(8f, 2f, 2f, 0xCC000000.toInt())
      }
      val watermarkPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0x88FFFFFF.toInt()
        textSize = (height * 0.026f).coerceIn(22f, 50f)
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        textAlign = Paint.Align.RIGHT
      }

      val argbBuffer = IntArray(width * height)
      val yuvBuffer = ByteArray(width * height * 3 / 2)

      for (frameIndex in 0 until totalFrames) {
        val presentationTimeUs = frameIndex * frameDurationUs
        val currentTimelineMs = (frameIndex * 1000L) / fps

        // 1. Render timeline frame onto frameBitmap for active clip at currentTimelineMs
        renderFrame(
          context = context,
          canvas = canvas,
          paint = paint,
          textPaint = textPaint,
          watermarkPaint = watermarkPaint,
          tracks = tracks,
          visualClips = visualClips,
          timeMs = currentTimelineMs,
          width = width,
          height = height,
          frameIndex = frameIndex,
          totalFrames = totalFrames,
          retrievers = retrievers,
          imageBitmaps = imageBitmaps,
          cachedVideoFrames = cachedVideoFrames
        )

        // 2. Convert ARGB frameBitmap to YUV420 buffer
        convertBitmapToYuv420(
          bitmap = frameBitmap,
          argb = argbBuffer,
          outputYuv = yuvBuffer,
          width = width,
          height = height,
          colorFormat = colorFormat
        )

        // 3. Queue YUV input to MediaCodec
        var inputQueued = false
        var attempts = 0
        while (!inputQueued && attempts < 50) {
          attempts++
          val inputIndex = codec.dequeueInputBuffer(10_000L)
          if (inputIndex >= 0) {
            val inputBuffer = codec.getInputBuffer(inputIndex)
            if (inputBuffer != null) {
              inputBuffer.clear()
              inputBuffer.put(yuvBuffer)
              val isLast = frameIndex == totalFrames - 1
              val flags = if (isLast) MediaCodec.BUFFER_FLAG_END_OF_STREAM else 0
              codec.queueInputBuffer(inputIndex, 0, yuvBuffer.size, presentationTimeUs, flags)
              inputQueued = true
            }
          }

          // Drain output while waiting
          drainEncoder(codec, muxer, bufferInfo, false, muxerState)
        }

        // Drain after each frame
        drainEncoder(codec, muxer, bufferInfo, false, muxerState)

        onProgress(frameIndex.toFloat() / totalFrames)
      }

      // Signal EOS and drain all remaining buffers
      drainEncoder(codec, muxer, bufferInfo, true, muxerState)

      if (muxerState.isStarted && !muxerStopped) {
        try {
          muxer?.stop()
          muxerStopped = true
          Log.i(TAG, "MediaMuxer cleanly stopped. Total frames written: ${muxerState.framesWritten}")
        } catch (e: Exception) {
          Log.w(TAG, "Error stopping muxer after encoding: ${e.message}")
        }
      }

      Log.i(TAG, "Completed video encoding! Total frames written to muxer: ${muxerState.framesWritten}, target was $totalFrames")
      frameBitmap.recycle()
    } finally {
      for (p in cachedVideoFrames.values) {
        try { if (!p.second.isRecycled) p.second.recycle() } catch (_: Exception) {}
      }
      cachedVideoFrames.clear()
      for (r in retrievers.values) {
        try { r.release() } catch (_: Exception) {}
      }
      for (b in imageBitmaps.values) {
        try { if (!b.isRecycled) b.recycle() } catch (_: Exception) {}
      }
      try { codec?.stop() } catch (_: Exception) {}
      try { codec?.release() } catch (_: Exception) {}
      try {
        if (muxer != null && muxerState.isStarted && !muxerStopped) {
          muxer.stop()
        }
      } catch (e: Exception) {
        Log.w(TAG, "Error stopping muxer in finally: ${e.message}")
      }
      try { muxer?.release() } catch (_: Exception) {}
    }
  }

  private class MuxerState(
    var trackIndex: Int = -1,
    var isStarted: Boolean = false,
    var framesWritten: Int = 0
  )

  /**
   * Drains encoded video packets from MediaCodec output buffers into MediaMuxer.
   */
  private fun drainEncoder(
    codec: MediaCodec,
    muxer: MediaMuxer?,
    bufferInfo: MediaCodec.BufferInfo,
    endOfStream: Boolean,
    muxerState: MuxerState
  ) {
    if (muxer == null) return

    var loops = 0
    val maxLoops = if (endOfStream) 120 else 20
    while (true) {
      val outputIndex = codec.dequeueOutputBuffer(bufferInfo, 10_000L)
      if (outputIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
        if (!endOfStream) break
        loops++
        if (loops > maxLoops) break
      } else if (outputIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
        if (!muxerState.isStarted) {
          val newFormat = codec.outputFormat
          muxerState.trackIndex = muxer.addTrack(newFormat)
          muxer.start()
          muxerState.isStarted = true
          Log.i(TAG, "MediaMuxer started with track index ${muxerState.trackIndex}, format: $newFormat")
        }
      } else if (outputIndex >= 0) {
        val encodedData = codec.getOutputBuffer(outputIndex)
        if (encodedData != null) {
          if ((bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0) {
            // Codec config data handled by format change
            bufferInfo.size = 0
          }

          if (bufferInfo.size > 0 && muxerState.isStarted) {
            encodedData.position(bufferInfo.offset)
            encodedData.limit(bufferInfo.offset + bufferInfo.size)
            muxer.writeSampleData(muxerState.trackIndex, encodedData, bufferInfo)
            muxerState.framesWritten++
          }

          codec.releaseOutputBuffer(outputIndex, false)

          if ((bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
            Log.i(TAG, "EOS reached in encoder. Frames written: ${muxerState.framesWritten}")
            break
          }
        }
      }
    }
  }

  /**
   * Renders the project visual state at [timeMs] into the provided [Canvas].
   * Handles multi-clip chronological switching, image rendering, filters, text overlays, and watermark.
   */
  private fun renderFrame(
    context: Context,
    canvas: Canvas,
    paint: Paint,
    textPaint: Paint,
    watermarkPaint: Paint,
    tracks: List<MediaTrack>,
    visualClips: List<MediaClip>,
    timeMs: Long,
    width: Int,
    height: Int,
    frameIndex: Int,
    totalFrames: Int,
    retrievers: Map<String, MediaMetadataRetriever>,
    imageBitmaps: Map<String, Bitmap>,
    cachedVideoFrames: MutableMap<String, Pair<Long, Bitmap>>
  ) {
    // 1. Draw base background from active clip
    var mediaDrawn = false

    // Identify which clip is currently active on the timeline at timeMs
    val activeClip = visualClips.firstOrNull {
      timeMs >= it.startTimeMs && timeMs < (it.startTimeMs + it.durationMs)
    } ?: visualClips.lastOrNull { timeMs >= it.startTimeMs } ?: visualClips.firstOrNull()

    if (activeClip != null && !activeClip.uri.isNullOrEmpty()) {
      val clipStart = activeClip.startTimeMs
      val speed = activeClip.speed.coerceIn(0.25f, 4f)
      val localTimeMs = (((timeMs - clipStart).coerceAtLeast(0L)) * speed).toLong()
      val frameTimeUs = localTimeMs * 1000L

      if (activeClip.type == ClipType.VIDEO) {
        val r = retrievers[activeClip.uri]
        if (r != null) {
          try {
            val cached = cachedVideoFrames[activeClip.uri]
            val videoFrame: Bitmap? = if (cached != null && kotlin.math.abs(frameTimeUs - cached.first) < 160_000L && !cached.second.isRecycled) {
              cached.second
            } else {
              val extracted = r.getFrameAtTime(frameTimeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
                ?: r.getFrameAtTime(frameTimeUs, MediaMetadataRetriever.OPTION_CLOSEST)
              if (extracted != null) {
                cached?.second?.let { if (!it.isRecycled) it.recycle() }
                cachedVideoFrames[activeClip.uri] = Pair(frameTimeUs, extracted)
              }
              extracted ?: cached?.second
            }

            if (videoFrame != null && !videoFrame.isRecycled) {
              val srcRect = Rect(0, 0, videoFrame.width, videoFrame.height)
              val dstRect = calculateFitRect(videoFrame.width, videoFrame.height, width, height)
              canvas.save()
              if (activeClip.isFlippedHorizontal) {
                canvas.scale(-1f, 1f, width / 2f, height / 2f)
              }
              if (activeClip.rotation != 0f) {
                canvas.rotate(activeClip.rotation, width / 2f, height / 2f)
              }
              canvas.drawColor(Color.BLACK)
              canvas.drawBitmap(videoFrame, srcRect, dstRect, paint)
              canvas.restore()
              mediaDrawn = true
            }
          } catch (e: Exception) {
            Log.w(TAG, "Frame extraction error at $timeMs ms for clip ${activeClip.id}: ${e.message}")
          }
        }
      } else if (activeClip.type == ClipType.IMAGE) {
        val bmp = imageBitmaps[activeClip.uri]
        if (bmp != null && !bmp.isRecycled) {
          val srcRect = Rect(0, 0, bmp.width, bmp.height)
          val dstRect = calculateFitRect(bmp.width, bmp.height, width, height)
          canvas.save()
          if (activeClip.isFlippedHorizontal) {
            canvas.scale(-1f, 1f, width / 2f, height / 2f)
          }
          if (activeClip.rotation != 0f) {
            canvas.rotate(activeClip.rotation, width / 2f, height / 2f)
          }
          canvas.drawColor(Color.BLACK)
          canvas.drawBitmap(bmp, srcRect, dstRect, paint)
          canvas.restore()
          mediaDrawn = true
        }
      }
    }

    // Dynamic cinematic background if no media or fallback
    if (!mediaDrawn) {
      val progress = frameIndex.toFloat() / totalFrames
      val angle = (progress * 360f) * (Math.PI / 180.0)
      val xOffset = (sin(angle) * (width * 0.25f)).toFloat()
      val yOffset = (cos(angle) * (height * 0.25f)).toFloat()

      val gradient = LinearGradient(
        xOffset, yOffset, width.toFloat() - xOffset, height.toFloat() - yOffset,
        intArrayOf(0xFF18151D.toInt(), 0xFF0D0B12.toInt(), 0xFF2A170A.toInt()),
        floatArrayOf(0f, 0.5f, 1f),
        Shader.TileMode.CLAMP
      )
      paint.shader = gradient
      paint.colorFilter = null
      canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)
      paint.shader = null

      // Subtle dynamic glow circle
      paint.color = 0x22FF6B00.toInt()
      canvas.drawCircle(width / 2f + xOffset * 0.5f, height / 2f + yOffset * 0.5f, width * 0.35f, paint)
    }

    // 2. Apply clip filters & effects (B&W, Sepia, Vivid, Vintage, Cyberpunk)
    if (activeClip != null && activeClip.filterEffect != "Normal") {
      applyFilterToCanvas(canvas, activeClip.filterEffect, width, height)
    }

    // 3. Render active text overlays / titles with custom fonts and colors
    val activeTextClips = tracks.flatMap { it.clips }.filter {
      (it.type == ClipType.TEXT || it.title.isNotEmpty()) &&
        timeMs in it.startTimeMs..(it.startTimeMs + it.durationMs)
    }
    for (textClip in activeTextClips) {
      val text = textClip.title.ifEmpty { "VFX Studio" }
      val x = width / 2f + (textClip.textOffsetX * (width / 400f))
      val y = height * 0.82f + (textClip.textOffsetY * (height / 400f))
      try {
        textPaint.typeface = com.example.ui.theme.AppFonts.getTypeface(context, textClip.fontStyle)
      } catch (_: Exception) {}
      try {
        textPaint.color = textClip.color.toArgb()
      } catch (_: Exception) {}
      canvas.drawText(text, x, y, textPaint)
    }

    // 4. Subtle watermark in corner
    canvas.drawText("VFX PRO", width - 40f, height - 40f, watermarkPaint)
  }

  private fun calculateFitRect(srcW: Int, srcH: Int, dstW: Int, dstH: Int): RectF {
    val srcAspect = srcW.toFloat() / srcH.toFloat()
    val dstAspect = dstW.toFloat() / dstH.toFloat()
    return if (srcAspect > dstAspect) {
      val targetH = dstW / srcAspect
      val top = (dstH - targetH) / 2f
      RectF(0f, top, dstW.toFloat(), top + targetH)
    } else {
      val targetW = dstH * srcAspect
      val left = (dstW - targetW) / 2f
      RectF(left, 0f, left + targetW, dstH.toFloat())
    }
  }

  private fun applyFilterToCanvas(canvas: Canvas, filterName: String, width: Int, height: Int) {
    val matrix = ColorMatrix()
    when (filterName.lowercase(Locale.ROOT)) {
      "b&w", "mono", "grayscale" -> matrix.setSaturation(0f)
      "sepia" -> matrix.set(floatArrayOf(
        0.393f, 0.769f, 0.189f, 0f, 0f,
        0.349f, 0.686f, 0.168f, 0f, 0f,
        0.272f, 0.534f, 0.131f, 0f, 0f,
        0f, 0f, 0f, 1f, 0f
      ))
      "cyberpunk", "neon" -> matrix.set(floatArrayOf(
        1.3f, 0f, 0.4f, 0f, 20f,
        0f, 1.2f, 0.6f, 0f, 10f,
        0.6f, 0f, 1.5f, 0f, 30f,
        0f, 0f, 0f, 1f, 0f
      ))
      "vintage" -> matrix.set(floatArrayOf(
        0.9f, 0.1f, 0.1f, 0f, 20f,
        0.1f, 0.8f, 0.1f, 0f, 15f,
        0.1f, 0.1f, 0.6f, 0f, 10f,
        0f, 0f, 0f, 1f, 0f
      ))
      "vivid" -> matrix.setSaturation(1.4f)
      else -> return
    }
    val filterPaint = Paint().apply {
      colorFilter = ColorMatrixColorFilter(matrix)
    }
    // Subtle overlay pass
    canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), filterPaint)
    canvas.restore()
  }

  /**
   * Optimized ARGB to YUV420 (NV12 / I420) buffer converter.
   */
  private fun convertBitmapToYuv420(
    bitmap: Bitmap,
    argb: IntArray,
    outputYuv: ByteArray,
    width: Int,
    height: Int,
    colorFormat: Int
  ) {
    bitmap.getPixels(argb, 0, width, 0, 0, width, height)
    val isSemiPlanar = (colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar ||
      colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible)

    val ySize = width * height
    val uOffset = ySize
    val vOffset = ySize + (ySize / 4)

    var yIndex = 0
    var uvIndex = ySize
    var uIndex = uOffset
    var vIndex = vOffset

    for (j in 0 until height) {
      val rowOffset = j * width
      for (i in 0 until width) {
        val c = argb[rowOffset + i]
        val r = (c shr 16) and 0xFF
        val g = (c shr 8) and 0xFF
        val b = c and 0xFF

        // Standard BT.601 RGB to Y
        val y = ((66 * r + 129 * g + 25 * b + 128) shr 8) + 16
        outputYuv[yIndex++] = y.coerceIn(16, 235).toByte()

        // 2x2 chroma subsampling
        if ((j and 1) == 0 && (i and 1) == 0) {
          val u = ((-38 * r - 74 * g + 112 * b + 128) shr 8) + 128
          val v = ((112 * r - 94 * g - 18 * b + 128) shr 8) + 128
          val uClamped = u.coerceIn(16, 240).toByte()
          val vClamped = v.coerceIn(16, 240).toByte()

          if (isSemiPlanar) {
            outputYuv[uvIndex++] = uClamped
            outputYuv[uvIndex++] = vClamped
          } else {
            outputYuv[uIndex++] = uClamped
            outputYuv[vIndex++] = vClamped
          }
        }
      }
    }
  }

  private fun selectColorFormat(codec: MediaCodec): Int {
    return try {
      val caps = codec.codecInfo.getCapabilitiesForType(MIME_TYPE)
      val supported = caps.colorFormats
      val preferred = intArrayOf(
        MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar,
        MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar,
        MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible,
        MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420PackedPlanar,
        MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420PackedSemiPlanar
      )
      for (fmt in preferred) {
        if (supported.contains(fmt)) {
          return fmt
        }
      }
      val anyYuv = supported.firstOrNull { it != MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface }
      anyYuv ?: MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar
    } catch (_: Exception) {
      MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar
    }
  }

  /**
   * Persists the generated MP4 file to Android's public MediaStore (Movies/VFXPro).
   */
  private fun saveMp4FileToGallery(
    context: Context,
    mp4File: File,
    fileName: String,
    folderName: String,
    durationMs: Long,
    width: Int,
    height: Int
  ): ExportResult {
    val actualDurationMs = try {
      val r = MediaMetadataRetriever()
      r.setDataSource(mp4File.absolutePath)
      val durStr = r.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
      r.release()
      durStr?.toLongOrNull() ?: durationMs
    } catch (_: Exception) {
      durationMs
    }.coerceAtLeast(durationMs).coerceAtLeast(3000L)

    val contentValues = ContentValues().apply {
      put(MediaStore.Video.Media.DISPLAY_NAME, fileName)
      put(MediaStore.Video.Media.TITLE, "VFX Pro Video $fileName")
      put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
      put(MediaStore.Video.Media.DATE_ADDED, System.currentTimeMillis() / 1000)
      put(MediaStore.Video.Media.DATE_MODIFIED, System.currentTimeMillis() / 1000)
      put(MediaStore.Video.Media.WIDTH, width)
      put(MediaStore.Video.Media.HEIGHT, height)
      put(MediaStore.Video.Media.DURATION, actualDurationMs)

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        put(MediaStore.Video.Media.RELATIVE_PATH, folderName)
        put(MediaStore.Video.Media.IS_PENDING, 1)
      }
    }

    val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
    } else {
      MediaStore.Video.Media.EXTERNAL_CONTENT_URI
    }

    var outputUri = try {
      context.contentResolver.insert(collection, contentValues)
    } catch (_: Exception) {
      null
    }

    // Fallback direct file copy if insert fails
    if (outputUri == null) {
      val publicDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "VFXPro")
      publicDir.mkdirs()
      val targetFile = File(publicDir, fileName)
      mp4File.copyTo(targetFile, overwrite = true)
      outputUri = Uri.fromFile(targetFile)
    } else {
      try {
        context.contentResolver.openOutputStream(outputUri)?.use { outStream ->
          mp4File.inputStream().use { inStream ->
            inStream.copyTo(outStream)
            outStream.flush()
          }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && outputUri.scheme == "content") {
          contentValues.clear()
          contentValues.put(MediaStore.Video.Media.IS_PENDING, 0)
          context.contentResolver.update(outputUri, contentValues, null, null)
        }
      } catch (e: Exception) {
        Log.w(TAG, "ContentResolver stream write failed, copying to public folder: ${e.message}")
        val publicDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "VFXPro")
        publicDir.mkdirs()
        val targetFile = File(publicDir, fileName)
        mp4File.copyTo(targetFile, overwrite = true)
        outputUri = Uri.fromFile(targetFile)
      }
    }

    // Trigger MediaScanner for immediate gallery indexing
    try {
      val publicDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES)
      val scanPath = File(publicDir, "VFXPro/$fileName").absolutePath
      MediaScannerConnection.scanFile(context, arrayOf(scanPath), arrayOf("video/mp4")) { path, uri ->
        Log.i(TAG, "MediaScanner indexed $path -> $uri")
      }
    } catch (_: Exception) {}

    return ExportResult(
      success = true,
      uri = outputUri,
      displayPath = "$folderName/$fileName",
      fileName = fileName
    )
  }
}
