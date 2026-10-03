package com.example.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.ImageFormat
import android.media.Image
import android.media.ImageReader
import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import java.io.Closeable
import java.util.concurrent.atomic.AtomicReference
import kotlin.math.max
import kotlin.math.min

/**
 * Sequential MediaCodec decode. Random getFrameAtTime seeks every frame and is
 * the reason exports felt slow. Falls back to MediaMetadataRetriever if the
 * device decoder will not render into an ImageReader.
 */
class FastFrameDecoder(
  context: Context,
  private val uri: String,
  private val maxEdge: Int
) : Closeable {
  private val retriever = MediaMetadataRetriever()
  private var sequential: Sequential? = null
  private var sequentialBroken = false

  init {
    try {
      if (uri.startsWith("file://") || uri.startsWith("file:")) {
        retriever.setDataSource(uri.removePrefix("file://").removePrefix("file:"))
      } else {
        retriever.setDataSource(context, Uri.parse(uri))
      }
    } catch (e: Exception) {
      Log.w(TAG, "Retriever open failed: ${e.message}")
    }
    try {
      sequential = Sequential.open(context, uri, maxEdge)
      if (sequential == null) sequentialBroken = true
    } catch (e: Exception) {
      Log.w(TAG, "Sequential decoder unavailable: ${e.message}")
      sequentialBroken = true
    }
  }

  fun frameAt(timeUs: Long): Bitmap? {
    if (!sequentialBroken) {
      try {
        val frame = sequential?.frameAt(timeUs)
        if (frame != null) return frame
      } catch (e: Exception) {
        Log.w(TAG, "Sequential decode failed, switching to retriever: ${e.message}")
        sequentialBroken = true
        sequential?.close()
        sequential = null
      }
    }
    return try {
      val edge = maxEdge.coerceAtLeast(2)
      if (android.os.Build.VERSION.SDK_INT >= 27) {
        retriever.getScaledFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST, edge, edge)
          ?: retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST)
      } else {
        retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
          ?: retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST)
      }
    } catch (_: Exception) {
      null
    }
  }

  override fun close() {
    try { sequential?.close() } catch (_: Exception) {}
    try { retriever.release() } catch (_: Exception) {}
  }

  private class Sequential(
    private val extractor: MediaExtractor,
    private val codec: MediaCodec,
    private val imageReader: ImageReader,
    private val thread: HandlerThread,
    private val pending: AtomicReference<Image?>,
    private val maxEdge: Int
  ) : Closeable {
    private var decodedPts = -1L
    private var inputEos = false
    private var lastBitmap: Bitmap? = null
    private val bufferInfo = MediaCodec.BufferInfo()

    fun frameAt(targetUs: Long): Bitmap? {
      if (decodedPts >= 0 && targetUs + 40_000 < decodedPts) {
        extractor.seekTo(targetUs.coerceAtLeast(0L), MediaExtractor.SEEK_TO_PREVIOUS_SYNC)
        codec.flush()
        decodedPts = -1L
        inputEos = false
        pending.getAndSet(null)?.close()
      }
      val deadline = System.nanoTime() + 80_000_000L
      while (decodedPts < targetUs - 15_000L && System.nanoTime() < deadline) {
        if (!pump()) break
      }
      return lastBitmap
    }

    private fun pump(): Boolean {
      if (!inputEos) {
        val inIndex = codec.dequeueInputBuffer(8_000)
        if (inIndex >= 0) {
          val buffer = codec.getInputBuffer(inIndex) ?: return false
          val size = extractor.readSampleData(buffer, 0)
          if (size < 0) {
            codec.queueInputBuffer(inIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
            inputEos = true
          } else {
            val pts = extractor.sampleTime.coerceAtLeast(0L)
            codec.queueInputBuffer(inIndex, 0, size, pts, 0)
            extractor.advance()
          }
        }
      }
      val outIndex = codec.dequeueOutputBuffer(bufferInfo, 8_000)
      if (outIndex >= 0) {
        val render = bufferInfo.size > 0
        codec.releaseOutputBuffer(outIndex, render)
        if (render) {
          val image = awaitImage()
          if (image != null) {
            try {
              val bmp = yuvToBitmap(image, maxEdge)
              lastBitmap?.recycle()
              lastBitmap = bmp
              decodedPts = bufferInfo.presentationTimeUs
            } finally {
              image.close()
            }
          }
        }
        if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) return false
      }
      return true
    }

    private fun awaitImage(): Image? {
      val start = System.nanoTime()
      while (System.nanoTime() - start < 25_000_000L) {
        val image = pending.getAndSet(null)
        if (image != null) return image
        try { Thread.sleep(2) } catch (_: InterruptedException) { return null }
      }
      return pending.getAndSet(null)
    }

    override fun close() {
      pending.getAndSet(null)?.close()
      lastBitmap?.recycle()
      try { codec.stop() } catch (_: Exception) {}
      try { codec.release() } catch (_: Exception) {}
      try { imageReader.close() } catch (_: Exception) {}
      try { extractor.release() } catch (_: Exception) {}
      thread.quitSafely()
    }

    companion object {
      fun open(context: Context, uri: String, maxEdge: Int): Sequential? {
        val extractor = MediaExtractor()
        if (uri.startsWith("file://") || uri.startsWith("file:")) {
          extractor.setDataSource(uri.removePrefix("file://").removePrefix("file:"))
        } else {
          val pfd = context.contentResolver.openFileDescriptor(Uri.parse(uri), "r") ?: return null
          extractor.setDataSource(pfd.fileDescriptor)
        }
        var videoIndex = -1
        var format: MediaFormat? = null
        for (i in 0 until extractor.trackCount) {
          val track = extractor.getTrackFormat(i)
          val mime = track.getString(MediaFormat.KEY_MIME) ?: continue
          if (mime.startsWith("video/")) {
            videoIndex = i
            format = track
            break
          }
        }
        if (videoIndex < 0 || format == null) {
          extractor.release()
          return null
        }
        extractor.selectTrack(videoIndex)
        val width = format.getInteger(MediaFormat.KEY_WIDTH)
        val height = format.getInteger(MediaFormat.KEY_HEIGHT)
        val thread = HandlerThread("vfx-decode").also { it.start() }
        val handler = Handler(thread.looper)
        val pending = AtomicReference<Image?>(null)
        val reader = ImageReader.newInstance(width, height, ImageFormat.YUV_420_888, 3)
        reader.setOnImageAvailableListener({ r ->
          val image = try { r.acquireLatestImage() } catch (_: Exception) { null } ?: return@setOnImageAvailableListener
          pending.getAndSet(image)?.close()
        }, handler)
        val mime = format.getString(MediaFormat.KEY_MIME) ?: "video/avc"
        val codec = MediaCodec.createDecoderByType(mime)
        codec.configure(format, reader.surface, null, 0)
        codec.start()
        return Sequential(extractor, codec, reader, thread, pending, maxEdge)
      }
    }
  }

  companion object {
    private const val TAG = "FastFrameDecoder"

    private fun yuvToBitmap(image: Image, maxEdge: Int): Bitmap {
      val width = image.width
      val height = image.height
      val step = max(1, max(width, height) / maxEdge.coerceAtLeast(2))
      val outW = max(2, width / step) and 1.inv()
      val outH = max(2, height / step) and 1.inv()
      val yPlane = image.planes[0]
      val uPlane = image.planes[1]
      val vPlane = image.planes[2]
      val yBuf = yPlane.buffer
      val uBuf = uPlane.buffer
      val vBuf = vPlane.buffer
      val yRow = yPlane.rowStride
      val yPix = yPlane.pixelStride
      val uRow = uPlane.rowStride
      val vRow = vPlane.rowStride
      val uPix = uPlane.pixelStride
      val vPix = vPlane.pixelStride
      val pixels = IntArray(outW * outH)
      var p = 0
      for (j in 0 until outH) {
        val sy = min(height - 1, j * step)
        val yBase = sy * yRow
        val uvBaseU = (sy / 2) * uRow
        val uvBaseV = (sy / 2) * vRow
        for (i in 0 until outW) {
          val sx = min(width - 1, i * step)
          val y = yBuf.get(yBase + sx * yPix).toInt() and 0xFF
          val u = (uBuf.get(uvBaseU + (sx / 2) * uPix).toInt() and 0xFF) - 128
          val v = (vBuf.get(uvBaseV + (sx / 2) * vPix).toInt() and 0xFF) - 128
          val r = (y + (1.402f * v)).toInt().coerceIn(0, 255)
          val g = (y - (0.344f * u) - (0.714f * v)).toInt().coerceIn(0, 255)
          val b = (y + (1.772f * u)).toInt().coerceIn(0, 255)
          pixels[p++] = (0xFF shl 24) or (r shl 16) or (g shl 8) or b
        }
      }
      return Bitmap.createBitmap(pixels, outW, outH, Bitmap.Config.ARGB_8888)
    }
  }
}
