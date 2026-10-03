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
import com.example.billing.ProAccess
import com.example.ui.components.interpolateKeyframeValue
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
data class BurnedWatermark(
  val text: String,
  val position: String,
  val opacity: Float,
  val logo: Bitmap? = null
)

object MediaCodecVideoExporter {
  private const val TAG = "MediaCodecExporter"
  private const val MIME_TYPE = MediaFormat.MIMETYPE_VIDEO_AVC // "video/avc"

  private fun orientedSize(resolution: ExportResolution, canvasRatio: String): Pair<Int, Int> {
    val longSide = maxOf(resolution.width, resolution.height)
    val shortSide = minOf(resolution.width, resolution.height)
    fun even(v: Int) = (v - (v % 2)).coerceAtLeast(2)
    return when (canvasRatio) {
      "9:16" -> even(shortSide) to even(longSide)
      "1:1" -> even(shortSide) to even(shortSide)
      "4:5" -> even(shortSide) to even((shortSide * 5f / 4f).toInt())
      "3:4" -> even(shortSide) to even((shortSide * 4f / 3f).toInt())
      "4:3" -> even(longSide) to even((longSide * 3f / 4f).toInt())
      "21:9" -> even(longSide) to even((longSide * 9f / 21f).toInt())
      else -> even(longSide) to even(shortSide)
    }
  }

  suspend fun exportProject(
    context: Context,
    tracks: List<MediaTrack>,
    resolution: ExportResolution = ExportResolution.FHD_1080P,
    frameRate: ExportFrameRate = ExportFrameRate.FPS_30,
    bitrate: ExportBitrate = ExportBitrate.MEDIUM,
    watermarkEnabled: Boolean = true,
    watermarkText: String = "VFX Pro",
    watermarkPosition: String = "Bottom-Right",
    watermarkOpacity: Float = 0.85f,
    watermarkLogoUri: String? = null,
    canvasRatio: String = "16:9",
    onProgress: (Float) -> Unit = {}
  ): ExportResult = withContext(Dispatchers.IO) {
    onProgress(0.05f)

    val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
    val fileName = "VFXPro_${timeStamp}.mp4"
    val folderName = "Movies/VFXPro"

    val fps = frameRate.fps.coerceIn(8, 60)
    var bitRateBps = when (bitrate) {
      ExportBitrate.LOW -> 3_000_000
      ExportBitrate.MEDIUM -> 6_000_000
      ExportBitrate.HIGH -> 10_000_000
    }
    val resScale = when {
      resolution.width >= 3000 -> 3.2f
      resolution.width >= 1920 -> 1.5f
      else -> 1f
    }
    val fpsScale = if (fps >= 50) 1.5f else 1f
    bitRateBps = (bitRateBps * resScale * fpsScale).toInt()

    // Determine timeline duration across all video/image/vfx clips
    val allClips = tracks.flatMap { it.clips }
    val allVisualClips = allClips
      .filter { it.type == ClipType.VIDEO || it.type == ClipType.IMAGE || it.type == ClipType.VFX }
    val maxVisualClipEnd = allVisualClips.maxOfOrNull { it.startTimeMs + it.durationMs } ?: 0L
    val maxAnyClipEnd = allClips.maxOfOrNull { it.startTimeMs + it.durationMs } ?: 0L
    val maxClipEnd = if (maxVisualClipEnd > 0L) maxVisualClipEnd else maxAnyClipEnd
    val projectDurationMs = maxClipEnd.coerceIn(1000L, 600_000L)
    // Keep the full timeline. If 60fps would create too many frames, drop fps instead of cutting the video.
    var effectiveFps = fps
    var totalFrames = ((projectDurationMs * effectiveFps) / 1000L).toInt()
    if (totalFrames > 12_000) {
      effectiveFps = ((12_000L * 1000L) / projectDurationMs).toInt().coerceIn(12, fps)
      totalFrames = ((projectDurationMs * effectiveFps) / 1000L).toInt().coerceIn(12, 12_000)
    }

    val pro = ProAccess.isPro.value
    val logo = if (pro && watermarkEnabled && !watermarkLogoUri.isNullOrBlank()) {
      decodeBounded(context, watermarkLogoUri, 512)
    } else {
      null
    }
    val stamp = if (pro && !watermarkEnabled) {
      null
    } else {
      BurnedWatermark(
        text = if (pro) watermarkText else "VFX Pro",
        position = if (pro) watermarkPosition else "Bottom-Right",
        opacity = if (pro) watermarkOpacity.coerceIn(0.2f, 1f) else 0.9f,
        logo = logo
      )
    }

    // Try the real chosen size first, in the project canvas ratio.
    val requestedPair = orientedSize(resolution, canvasRatio)
    val fallback1080 = orientedSize(ExportResolution.FHD_1080P, canvasRatio)
    val fallback720 = orientedSize(ExportResolution.HD_720P, canvasRatio)
    val candidateResolutions = listOf(requestedPair, fallback1080, fallback720, Pair(854, 480)).distinct()

    val tempFile = File(context.cacheDir, "temp_export_${System.currentTimeMillis()}.mp4")

    var encoderSucceeded = false
    var lastError: Exception? = null
    var encodedWidth = candidateResolutions.first().first
    var encodedHeight = candidateResolutions.first().second

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
          watermark = stamp,
          onProgress = { p ->
            val scaledProgress = 0.10f + (p * 0.70f)
            onProgress(scaledProgress)
          }
        )
        if (tempFile.exists() && tempFile.length() > 1024) {
          encoderSucceeded = true
          encodedWidth = width
          encodedHeight = height
          Log.i(TAG, "MediaCodec encoding succeeded! File size: ${tempFile.length()} bytes")
          break
        }
      } catch (oom: OutOfMemoryError) {
        Log.w(TAG, "Out of memory at ${width}x${height}, trying a smaller size")
        lastError = RuntimeException("Out of memory at ${width}x${height}", oom)
        System.gc()
      } catch (e: Exception) {
        Log.w(TAG, "Failed encoding with ${width}x${height}, trying next candidate: ${e.message}")
        lastError = e
      }
    }

    logo?.let { if (!it.isRecycled) it.recycle() }

    if (!encoderSucceeded || !tempFile.exists() || tempFile.length() <= 1024) {
      Log.e(TAG, "MediaCodec encoding failed for all configurations", lastError)
      return@withContext ExportResult(
        success = false,
        errorMessage = lastError?.localizedMessage ?: "Hardware MediaCodec encoder failed to generate video."
      )
    }

    onProgress(0.85f)

    // Merge audio into exported video (handles audio track clips, video mute states, and extracted audio)
    val audioToMux = TimelineAudioMixer.mixToM4a(context, tracks, projectDurationMs)
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
      width = encodedWidth,
      height = encodedHeight
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
    watermark: BurnedWatermark?,
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
    val decoders = mutableMapOf<String, FastFrameDecoder>()
    for (clip in visualClips) {
      val uri = clip.uri ?: continue
      if (clip.type == ClipType.VIDEO && !decoders.containsKey(uri)) {
        try {
          decoders[uri] = FastFrameDecoder(context, uri, maxOf(width, height))
        } catch (e: Exception) {
          Log.w(TAG, "Could not open decoder for clip ${clip.id}: ${e.message}")
        }
      }
    }

    // Cache decoded Bitmaps for each image clip URI
    val imageBitmaps = mutableMapOf<String, Bitmap>()
    for (clip in visualClips) {
      val uri = clip.uri ?: continue
      if (clip.type == ClipType.IMAGE && !imageBitmaps.containsKey(uri)) {
        try {
          val bmp = decodeBounded(context, uri, maxOf(width, height))
          if (bmp != null) imageBitmaps[uri] = bmp
        } catch (e: Exception) {
          Log.w(TAG, "Could not decode image clip ${clip.id}: ${e.message}")
        }
      }
    }

    val cachedVideoFrames = mutableMapOf<String, Pair<Long, Bitmap>>()
    var frameBitmap: Bitmap? = null
    var scratchBitmap: Bitmap? = null

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
      frameBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(frameBitmap!!)
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

      scratchBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
      val scratchCanvas = Canvas(scratchBitmap!!)
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
          decoders = decoders,
          imageBitmaps = imageBitmaps,
          cachedVideoFrames = cachedVideoFrames,
          frameBitmap = frameBitmap!!,
          scratch = scratchBitmap!!,
          scratchCanvas = scratchCanvas,
          watermark = watermark
        )

        // 2. Convert ARGB frameBitmap to YUV420 buffer
        convertBitmapToYuv420(
          bitmap = frameBitmap!!,
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
    } finally {
      frameBitmap?.let { if (!it.isRecycled) it.recycle() }
      scratchBitmap?.let { if (!it.isRecycled) it.recycle() }
      for (p in cachedVideoFrames.values) {
        try { if (!p.second.isRecycled) p.second.recycle() } catch (_: Exception) {}
      }
      cachedVideoFrames.clear()
      for (decoder in decoders.values) {
        try { decoder.close() } catch (_: Exception) {}
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
    decoders: Map<String, FastFrameDecoder>,
    imageBitmaps: Map<String, Bitmap>,
    cachedVideoFrames: MutableMap<String, Pair<Long, Bitmap>>,
    frameBitmap: Bitmap,
    scratch: Bitmap,
    scratchCanvas: Canvas,
    watermark: BurnedWatermark?
  ) {
    var mediaDrawn = false
    val mainClips = visualClips.filter { !it.id.startsWith("pip_") }
    val activeClip = mainClips.firstOrNull {
      timeMs >= it.startTimeMs && timeMs < (it.startTimeMs + it.durationMs)
    } ?: mainClips.lastOrNull { timeMs >= it.startTimeMs } ?: mainClips.firstOrNull()

    val transition = findTransition(mainClips, timeMs)
    if (transition != null) {
      val (from, to, progress, kind) = transition
      paintTransition(
        context, canvas, scratchCanvas, scratch, paint, from, to, progress, kind,
        timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames
      )
      mediaDrawn = true
    } else if (activeClip != null && !activeClip.uri.isNullOrEmpty()) {
      mediaDrawn = drawClipMedia(context, canvas, paint, activeClip, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames)
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

    if (activeClip != null && applyGrade(frameBitmap, scratch, activeClip)) {
      val copyPaint = Paint()
      canvas.drawBitmap(scratch, 0f, 0f, copyPaint)
    }

    for (pip in visualClips) {
      if (!pip.id.startsWith("pip_")) continue
      if (timeMs < pip.startTimeMs || timeMs >= pip.startTimeMs + pip.durationMs) continue
      val left = width * 0.64f
      val top = height * 0.06f
      drawClipMedia(
        context, canvas, paint, pip, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames,
        clear = false,
        dest = RectF(left, top, width * 0.96f, top + height * 0.24f)
      )
    }

    val activeTextClips = tracks.flatMap { it.clips }.filter {
      it.type == ClipType.TEXT && timeMs in it.startTimeMs..(it.startTimeMs + it.durationMs)
    }
    for (textClip in activeTextClips) {
      val text = textClip.title
      if (text.isBlank()) continue
      val isSticker = textClip.textDesign == "Sticker" || textClip.id.startsWith("sticker_")
      val x = width / 2f + (textClip.textOffsetX * (width / 400f))
      val y = if (isSticker) {
        height * 0.42f + (textClip.textOffsetY * (height / 400f))
      } else {
        height * 0.82f + (textClip.textOffsetY * (height / 400f))
      }
      try {
        textPaint.typeface = com.example.ui.theme.AppFonts.getTypeface(context, textClip.fontStyle)
      } catch (_: Exception) {}
      try {
        textPaint.color = textClip.color.toArgb()
      } catch (_: Exception) {}
      textPaint.textAlign = Paint.Align.CENTER
      textPaint.textSize = if (isSticker) {
        (height * 0.14f * textClip.textScale).coerceIn(64f, 280f)
      } else {
        (height * 0.045f * textClip.textScale).coerceIn(28f, 96f)
      }
      canvas.drawText(text, x, y, textPaint)
    }

    if (watermark != null) {
      val margin = 36f
      val onLeft = watermark.position.contains("Left")
      val onTop = watermark.position.contains("Top")
      val alpha = (watermark.opacity.coerceIn(0.15f, 1f) * 255f).toInt()
      val logo = watermark.logo
      if (logo != null && !logo.isRecycled) {
        val side = (width * 0.16f).coerceIn(72f, 320f)
        val left = if (onLeft) margin else width - margin - side
        val top = if (onTop) margin else height - margin - side
        val logoPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.alpha = alpha }
        canvas.drawBitmap(logo, null, RectF(left, top, left + side, top + side), logoPaint)
      }
      if (watermark.text.isNotBlank()) {
        watermarkPaint.textAlign = if (onLeft) Paint.Align.LEFT else Paint.Align.RIGHT
        watermarkPaint.alpha = alpha
        val x = if (onLeft) margin else width - margin
        val y = if (onTop) {
          margin + watermarkPaint.textSize + if (logo != null) (width * 0.16f) else 0f
        } else {
          height - margin
        }
        canvas.drawText(watermark.text, x, y, watermarkPaint)
      }
    }
  }

  private data class TransitionHit(
    val from: MediaClip,
    val to: MediaClip,
    val progress: Float,
    val kind: String
  )

  private fun findTransition(clips: List<MediaClip>, timeMs: Long): TransitionHit? {
    if (clips.size < 2) return null
    for (i in 0 until clips.size - 1) {
      val from = clips[i]
      val to = clips[i + 1]
      if (from.transitionType.equals("None", true)) continue
      val boundary = from.startTimeMs + from.durationMs
      val half = from.transitionDurationMs.coerceIn(120L, 2000L)
      val start = boundary - half
      val end = boundary + half
      if (timeMs in start until end && end > start) {
        val progress = (timeMs - start).toFloat() / (end - start).toFloat()
        return TransitionHit(from, to, progress.coerceIn(0f, 1f), from.transitionType)
      }
    }
    return null
  }

  private fun paintTransition(
    context: Context,
    canvas: Canvas,
    scratchCanvas: Canvas,
    scratch: Bitmap,
    paint: Paint,
    from: MediaClip,
    to: MediaClip,
    progress: Float,
    kind: String,
    timeMs: Long,
    width: Int,
    height: Int,
    decoders: Map<String, FastFrameDecoder>,
    imageBitmaps: Map<String, Bitmap>,
    cachedVideoFrames: MutableMap<String, Pair<Long, Bitmap>>
  ) {
    val name = kind.lowercase(Locale.ROOT)
    val blackDip = name.contains("black") || name.contains("dip")
    val slideLeft = name.contains("left") || name.contains("whip")
    val slideRight = name.contains("right")
    val slideUp = name.contains("up")
    val slideDown = name.contains("down")
    canvas.drawColor(Color.BLACK)
    if (blackDip) {
      if (progress < 0.5f) {
        drawClipMedia(context, canvas, paint, from, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = false)
        val cover = (progress * 2f * 255f).toInt().coerceIn(0, 255)
        canvas.drawColor(Color.argb(cover, 0, 0, 0))
      } else {
        drawClipMedia(context, canvas, paint, to, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = false)
        val cover = ((1f - (progress - 0.5f) * 2f) * 255f).toInt().coerceIn(0, 255)
        canvas.drawColor(Color.argb(cover, 0, 0, 0))
      }
      return
    }
    val spin = name.contains("spin")
    val zoom = name.contains("zoom")
    if (spin || zoom) {
      canvas.drawColor(Color.BLACK)
      drawClipMedia(context, canvas, paint, from, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = false)
      canvas.save()
      val scale = 0.35f + 0.65f * progress
      canvas.scale(scale, scale, width / 2f, height / 2f)
      if (spin) canvas.rotate((1f - progress) * 360f, width / 2f, height / 2f)
      paint.alpha = (progress * 255f).toInt().coerceIn(0, 255)
      drawClipMedia(context, canvas, paint, to, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = false)
      paint.alpha = 255
      canvas.restore()
      return
    }
    val dx = when {
      slideLeft -> -width * progress
      slideRight -> width * progress
      else -> 0f
    }
    val dy = when {
      slideUp -> -height * progress
      slideDown -> height * progress
      else -> 0f
    }
    val slideX = when {
      slideRight -> -width.toFloat()
      slideLeft -> width.toFloat()
      else -> 0f
    }
    val slideY = when {
      slideDown -> -height.toFloat()
      slideUp -> height.toFloat()
      else -> 0f
    }
    if (dx != 0f || dy != 0f || slideX != 0f || slideY != 0f) {
      canvas.save()
      canvas.translate(dx, dy)
      drawClipMedia(context, canvas, paint, from, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = false)
      canvas.restore()
      canvas.save()
      canvas.translate(dx + slideX, dy + slideY)
      drawClipMedia(context, canvas, paint, to, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = false)
      canvas.restore()
      return
    }
    drawClipMedia(context, scratchCanvas, paint, from, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = true)
    drawClipMedia(context, canvas, paint, to, timeMs, width, height, decoders, imageBitmaps, cachedVideoFrames, clear = true)
    val fade = Paint().apply { alpha = ((1f - progress) * 255f).toInt().coerceIn(0, 255) }
    canvas.drawBitmap(scratch, 0f, 0f, fade)
  }

  private fun drawClipMedia(
    context: Context,
    canvas: Canvas,
    paint: Paint,
    clip: MediaClip,
    timeMs: Long,
    width: Int,
    height: Int,
    decoders: Map<String, FastFrameDecoder>,
    imageBitmaps: Map<String, Bitmap>,
    cachedVideoFrames: MutableMap<String, Pair<Long, Bitmap>>,
    clear: Boolean = true,
    dest: RectF? = null
  ): Boolean {
    val uri = clip.uri ?: return false
    val frame = if (clip.type == ClipType.IMAGE || clip.isFrozen && imageBitmaps.containsKey(uri)) {
      imageBitmaps[uri]
    } else if (clip.type == ClipType.VIDEO || clip.type == ClipType.VFX) {
      val decoder = decoders[uri] ?: return false
      val frameTimeUs = sourceTimeUs(clip, timeMs)
      val cacheKey = clip.id
      val cached = cachedVideoFrames[cacheKey]
      if (cached != null && kotlin.math.abs(frameTimeUs - cached.first) < 25_000L && !cached.second.isRecycled) {
        cached.second
      } else {
        val raw = decoder.frameAt(frameTimeUs)
        if (raw == null) {
          cached?.second
        } else {
          val safe = raw.copy(Bitmap.Config.ARGB_8888, false)
          val extracted = scaleDown(safe, width, height)
          if (extracted != null) {
            if (cached != null && cached.second != extracted && !cached.second.isRecycled) cached.second.recycle()
            cachedVideoFrames[cacheKey] = Pair(frameTimeUs, extracted)
          }
          extracted ?: cached?.second
        }
      }
    } else {
      imageBitmaps[uri]
    }
    if (frame == null || frame.isRecycled) return false
    val src = cropSourceRect(frame.width, frame.height, clip.cropRatio, clip.cropZoom)
    val dst = dest ?: calculateFitRect(src.width(), src.height(), width, height)
    val kfScale = interpolateKeyframeValue(clip.transformKeyframes["Scale"].orEmpty(), timeMs, 1f).coerceIn(0.05f, 8f)
    val kfX = interpolateKeyframeValue(clip.transformKeyframes["Position X"].orEmpty(), timeMs, 0f)
    val kfY = interpolateKeyframeValue(clip.transformKeyframes["Position Y"].orEmpty(), timeMs, 0f)
    val kfOpacity = (interpolateKeyframeValue(clip.transformKeyframes["Opacity"].orEmpty(), timeMs, 100f) / 100f).coerceIn(0f, 1f)
    val kfRot = interpolateKeyframeValue(clip.transformKeyframes["Rotation"].orEmpty(), timeMs, 0f)
    canvas.save()
    if (clear) canvas.drawColor(Color.BLACK)
    val cx = dst.centerX() + kfX * (width / 720f)
    val cy = dst.centerY() + kfY * (height / 720f)
    canvas.translate(kfX * (width / 720f), kfY * (height / 720f))
    val flip = if (clip.isFlippedHorizontal) -1f else 1f
    val zoom = if (clip.cropZoom > 1.01f && clip.cropRatio == "Fit") clip.cropZoom.coerceIn(1f, 3f) else 1f
    canvas.scale(flip * zoom * kfScale, zoom * kfScale, cx, cy)
    val rot = clip.rotation + kfRot
    if (rot != 0f) canvas.rotate(rot, cx, cy)
    paint.colorFilter = null
    paint.alpha = (kfOpacity * 255f).toInt().coerceIn(0, 255)
    canvas.drawBitmap(frame, src, dst, paint)
    paint.alpha = 255
    canvas.restore()
    return true
  }

  private fun sourceTimeUs(clip: MediaClip, timeMs: Long): Long {
    val speed = clip.speed.coerceIn(0.25f, 4f)
    val local = ((timeMs - clip.startTimeMs).coerceAtLeast(0L) * speed).toLong()
    val start = clip.trimStartMs.coerceAtLeast(0L)
    val end = if (clip.trimEndMs > start) clip.trimEndMs else start + (clip.durationMs * speed).toLong()
    val sourceMs = when {
      clip.isFrozen -> start
      clip.isReversed -> (end - local).coerceAtLeast(start)
      else -> start + local
    }
    return sourceMs * 1000L
  }

  private fun cropSourceRect(bmpW: Int, bmpH: Int, ratio: String, zoom: Float): Rect {
    val aspect = when (ratio) {
      "16:9" -> 16f / 9f
      "9:16" -> 9f / 16f
      "1:1" -> 1f
      "4:5" -> 4f / 5f
      "3:4" -> 3f / 4f
      "2:3" -> 2f / 3f
      "4:3" -> 4f / 3f
      "21:9" -> 21f / 9f
      else -> bmpW.toFloat() / bmpH.toFloat()
    }
    var cropW = bmpW.toFloat()
    var cropH = bmpH.toFloat()
    if (cropW / cropH > aspect) cropW = cropH * aspect else cropH = cropW / aspect
    val z = if (ratio == "Fit") 1f else zoom.coerceIn(1f, 3f)
    cropW /= z
    cropH /= z
    val left = ((bmpW - cropW) / 2f).toInt().coerceAtLeast(0)
    val top = ((bmpH - cropH) / 2f).toInt().coerceAtLeast(0)
    val right = (left + cropW).toInt().coerceAtMost(bmpW).coerceAtLeast(left + 2)
    val bottom = (top + cropH).toInt().coerceAtMost(bmpH).coerceAtLeast(top + 2)
    return Rect(left, top, right, bottom)
  }

  private fun applyGrade(src: Bitmap, dst: Bitmap, clip: MediaClip): Boolean {
    val matrix = gradeMatrix(clip) ?: return false
    val filtered = Canvas(dst)
    val gradePaint = Paint().apply { colorFilter = ColorMatrixColorFilter(matrix) }
    filtered.drawBitmap(src, 0f, 0f, gradePaint)
    return true
  }

  private fun gradeMatrix(clip: MediaClip): ColorMatrix? {
    val name = clip.filterEffect.lowercase(Locale.ROOT)
    val neutralName = name.isBlank() || name == "normal" || name == "none"
    val neutralGrade = clip.brightness == 0f && clip.contrast == 0f && clip.saturation == 0f && clip.warmth == 0f
    if (neutralName && neutralGrade) return null
    val matrix = ColorMatrix()
    when {
      name.contains("b&w") || name.contains("mono") || name.contains("noir") || name.contains("silver") || name.contains("black") ->
        matrix.setSaturation(0f)
      name.contains("sepia") || name.contains("vintage") || name.contains("8mm") || name.contains("vhs") || name.contains("polaroid") || name.contains("lomo") ->
        matrix.set(floatArrayOf(
          0.393f, 0.769f, 0.189f, 0f, 12f,
          0.349f, 0.686f, 0.168f, 0f, 8f,
          0.272f, 0.534f, 0.131f, 0f, 4f,
          0f, 0f, 0f, 1f, 0f
        ))
      name.contains("cyber") || name.contains("neon") || name.contains("glitch") ->
        matrix.set(floatArrayOf(
          1.25f, 0f, 0.35f, 0f, 16f,
          0f, 1.1f, 0.45f, 0f, 8f,
          0.45f, 0f, 1.4f, 0f, 22f,
          0f, 0f, 0f, 1f, 0f
        ))
      name.contains("vivid") || name.contains("punch") || name.contains("pop") -> {
        val sat = ColorMatrix()
        sat.setSaturation(1.55f)
        matrix.postConcat(sat)
      }
      name.contains("cool") || name.contains("teal") || name.contains("cine") ->
        matrix.set(floatArrayOf(
          0.9f, 0f, 0f, 0f, 0f,
          0f, 1.05f, 0.05f, 0f, 4f,
          0.05f, 0.08f, 1.15f, 0f, 10f,
          0f, 0f, 0f, 1f, 0f
        ))
    }
    if (clip.saturation != 0f) {
      val sat = ColorMatrix()
      sat.setSaturation((1f + clip.saturation / 50f).coerceIn(0f, 2.2f))
      matrix.postConcat(sat)
    }
    if (clip.contrast != 0f || clip.brightness != 0f || clip.warmth != 0f) {
      val c = (1f + clip.contrast / 50f).coerceIn(0.4f, 1.8f)
      val b = clip.brightness * 2.2f
      val w = clip.warmth * 1.4f
      val t = 128f * (1f - c)
      val adjust = ColorMatrix(floatArrayOf(
        c, 0f, 0f, 0f, t + b + w,
        0f, c, 0f, 0f, t + b,
        0f, 0f, c, 0f, t + b - w,
        0f, 0f, 0f, 1f, 0f
      ))
      matrix.postConcat(adjust)
    }
    return matrix
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
  private fun scaleDown(source: Bitmap?, maxW: Int, maxH: Int): Bitmap? {
    if (source == null) return null
    if (source.width <= maxW * 2 && source.height <= maxH * 2) return source
    val scaled = Bitmap.createScaledBitmap(source, maxW.coerceAtLeast(2), maxH.coerceAtLeast(2), true)
    if (scaled != source && !source.isRecycled) source.recycle()
    return scaled
  }

  private fun decodeBounded(context: Context, uri: String, maxEdge: Int): Bitmap? {
    return try {
      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      openStream(context, uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
      if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null
      var sample = 1
      while (bounds.outWidth / sample > maxEdge || bounds.outHeight / sample > maxEdge) {
        sample *= 2
      }
      val opts = BitmapFactory.Options().apply { inSampleSize = sample.coerceAtLeast(1) }
      openStream(context, uri)?.use { BitmapFactory.decodeStream(it, null, opts) }
    } catch (e: Exception) {
      Log.w(TAG, "Bounded decode failed: ${e.message}")
      null
    }
  }

  private fun openStream(context: Context, uri: String): java.io.InputStream? {
    return if (uri.startsWith("file://") || uri.startsWith("file:")) {
      java.io.FileInputStream(uri.removePrefix("file://").removePrefix("file:"))
    } else {
      context.contentResolver.openInputStream(Uri.parse(uri))
    }
  }

  private fun convertBitmapToYuv420(
    bitmap: Bitmap,
    outputYuv: ByteArray,
    width: Int,
    height: Int,
    colorFormat: Int
  ) {
    val row = IntArray(width)
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
      bitmap.getPixels(row, 0, width, 0, j, width, 1)
      for (i in 0 until width) {
        val c = row[i]
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
