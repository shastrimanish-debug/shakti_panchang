package com.example

import android.net.Uri
import android.widget.VideoView
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.AspectRatio
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.example.data.ProjectEntity
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import com.example.ui.theme.WarmPeachAccent
import com.example.ui.theme.WarmEspresso
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Step 20: Track classification for multi-track NLE layers
 */
enum class TrackType {
  MAIN_VIDEO, OVERLAY, AUDIO, TEXT
}

/**
 * Step 19: Timeline Data Model
 * Defines supported clip media types on the multi-track timeline.
 */
enum class ClipType {
  VIDEO, IMAGE, AUDIO, TEXT, VFX
}

/**
 * Step 23: Keyframe Data Model for Property Animations
 *
 * @param timeMs Timeline position in milliseconds relative to the timeline or clip
 * @param value Floating-point value of the animated property at this keyframe
 * @param easing Interpolation curve name (e.g., 'Linear', 'EaseIn', 'EaseOut', 'EaseInOut')
 */
data class Keyframe(
  val timeMs: Long,
  val value: Float,
  val easing: String = "Linear"
)

/**
 * Step 19: Media Clip Data Model
 *
 * @param id Unique identifier for the clip
 * @param type Classification of track/content (VIDEO, AUDIO, TEXT, VFX)
 * @param startTimeMs Offset in milliseconds on the timeline
 * @param durationMs Duration in milliseconds of this clip
 * @param color Primary display tint on the timeline
 * @param title Optional descriptive name or file asset title
 * @param transformKeyframes Animation data for transform properties like 'Scale' or 'Opacity'
 */
data class MediaClip(
  val id: String,
  val type: ClipType,
  val startTimeMs: Long,
  val durationMs: Long,
  val color: Color,
  val title: String = "",
  val transformKeyframes: Map<String, List<Keyframe>> = emptyMap(),
  val uri: String? = null,
  val thumbnailUri: String? = null,
  val speed: Float = 1.0f,
  val volume: Float = 1.0f,
  val rotation: Float = 0f,
  val isFlippedHorizontal: Boolean = false,
  val isReversed: Boolean = false,
  val isFrozen: Boolean = false,
  val speedCurve: String = "Standard",
  val trimStartMs: Long = 0L,
  val trimEndMs: Long = 0L,
  val filterEffect: String = "Normal",
  val bodyEffect: String = "None",
  val bodyEffectColor: Long = 0xFF00E5FF,
  val bodyEffectIntensity: Float = 0.85f,
  val smoothSlowMoEnabled: Boolean = false,
  val smoothSlowMoQuality: String = "Optical Flow",
  val motionBlurEnabled: Boolean = false,
  val motionBlurIntensity: Float = 60f,
  val motionBlurShutterAngle: Int = 180,
  val motionBlurBlendPasses: Int = 4,
  val vfxEffect: String = "None",
  val vfxIntensity: Float = 0.85f,
  val vfxSpeed: Float = 1.0f,
  val vfxColor: Long = 0xFF00E5FF,
  val vfxAtmosphere: Float = 0.5f,
  val fontStyle: String = "Default",
  val textDesign: String = "Classic",
  val cropRatio: String = "Fit",
  val cropZoom: Float = 1.0f,
  val brightness: Float = 0f,
  val contrast: Float = 0f,
  val saturation: Float = 0f,
  val warmth: Float = 0f,
  val bgBlur: Float = 0f,
  val bgColor: Long = 0L,
  val isMuted: Boolean = false,
  val transitionType: String = "None",
  val transitionDurationMs: Long = 500L,
  val chromaKeyEnabled: Boolean = false,
  val chromaKeyColor: Long = 0xFF00FF00,
  val chromaIntensity: Float = 50f,
  val chromaShadow: Float = 30f,
  val chromaSoftness: Float = 20f,
  val voiceEffect: String = "None",
  val voicePitch: Float = 1.0f,
  val noiseReductionEnabled: Boolean = false,
  val isCutoutEnabled: Boolean = false,
  val cutoutStrokeEffect: String = "None",
  val cutoutStrokeColor: Long = 0xFFFFFFFF,
  val cutoutStrokeWidth: Float = 4f,
  val cutoutInverted: Boolean = false,
  val cutoutBgReplacement: String = "Transparent",
  val collageLayout: String = "None",
  val collageBorderWidth: Float = 4f,
  val collageBorderColor: Long = 0xFFFFFFFF,
  val collageCornerRadius: Float = 8f,
  val collageSlotMedia: List<String> = emptyList(),
  val textOffsetX: Float = 0f,
  val textOffsetY: Float = 0f,
  val textScale: Float = 1.0f
) {
  val durationSec: Float get() = durationMs / 1000f
  val startTimeSec: Float get() = startTimeMs / 1000f
}

/**
 * Step 26: Freehand Doodle & Neon Pen Drawing Data Structures
 */
data class DoodlePoint(val x: Float, val y: Float)

data class DoodleStroke(
  val id: String = java.util.UUID.randomUUID().toString(),
  val points: List<DoodlePoint> = emptyList(),
  val color: Long = 0xFF00F0FF,
  val strokeWidth: Float = 6f,
  val brushType: String = "Neon", // "Neon", "Pen", "Arrow", "Highlighter", "Rainbow", "Chalk"
  val isEraser: Boolean = false
)

/**
 * Step 20: MediaTrack Data Class (Multi-Track Layers)
 *
 * @param id Unique track identifier
 * @param name Display title (e.g., "Main Video", "Text Overlay", "Audio")
 * @param type TrackType classification
 * @param clips List of MediaClips residing on this track
 * @param isMutedOrHidden Whether this track is visually hidden or audio muted
 */
data class MediaTrack(
  val id: String,
  val name: String,
  val type: TrackType,
  val clips: List<MediaClip>,
  val isMutedOrHidden: Boolean = false
)

/**
 * Step 18, 19 & 20: Playback State Engine & Multi-Track System ViewModel
 *
 * Holds the current timeline playback state and multi-track layers:
 * - [isPlaying]: Current playback state (true = playing, false = paused)
 * - [currentPositionMs]: Current playhead position in milliseconds
 * - [totalDurationMs]: Total timeline duration in milliseconds
 * - [tracks]: MutableStateFlow containing vertically stacked MediaTracks
 * - [clips]: Computed StateFlow of all clips across tracks
 *
 * Provides thread-safe coroutine updates for smooth playback simulation.
 */
/**
 * Step 24: Snapshot of Timeline State for Undo/Redo History System
 */
data class TimelineSnapshot(
  val tracks: List<MediaTrack>,
  val description: String = ""
)

data class MediaImportItem(
  val uri: String,
  val title: String,
  val isVideo: Boolean,
  val durationMs: Long = 4000L
)

class PlaybackViewModel : ViewModel() {
  private val _isPlaying = MutableStateFlow(false)
  val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

  private val _currentPositionMs = MutableStateFlow(0L)
  val currentPositionMs: StateFlow<Long> = _currentPositionMs.asStateFlow()

  private val _totalDurationMs = MutableStateFlow(30000L) // 30s default timeline
  val totalDurationMs: StateFlow<Long> = _totalDurationMs.asStateFlow()

  // Step 21: Timeline zoom scale state (default 1.0f, range 0.5f to 3.0f)
  private val _timelineScale = MutableStateFlow(1.0f)
  val timelineScale: StateFlow<Float> = _timelineScale.asStateFlow()

  // Step 24: History Stack & Undo/Redo Engine
  private val _historyStack = MutableStateFlow<List<TimelineSnapshot>>(emptyList())
  val historyStack: StateFlow<List<TimelineSnapshot>> = _historyStack.asStateFlow()

  private val _historyIndex = MutableStateFlow<Int>(-1)
  val historyIndex: StateFlow<Int> = _historyIndex.asStateFlow()

  private val _canUndo = MutableStateFlow<Boolean>(false)
  val canUndo: StateFlow<Boolean> = _canUndo.asStateFlow()

  private val _canRedo = MutableStateFlow<Boolean>(false)
  val canRedo: StateFlow<Boolean> = _canRedo.asStateFlow()

  // Step 26: Freehand Doodle & Neon Drawing Stroke Layers
  val doodleStrokes = MutableStateFlow<List<DoodleStroke>>(emptyList())
  val doodleUndoStack = MutableStateFlow<List<DoodleStroke>>(emptyList())

  // Step 20: Multi-Track System state holding 3 mock tracks: Main Video, Text Overlay, and Audio
  val tracks = MutableStateFlow<List<MediaTrack>>(
    listOf(
      MediaTrack(
        id = "track_main_video",
        name = "Main Video",
        type = TrackType.MAIN_VIDEO,
        clips = listOf(
          MediaClip(
            id = "clip_vid_1",
            type = ClipType.VIDEO,
            startTimeMs = 0L,
            durationMs = 8500L,
            color = Color(0xFF0284C7),
            title = "Intro_Cinematic_4K.mp4",
            transformKeyframes = mapOf(
              "Scale" to listOf(
                Keyframe(timeMs = 0L, value = 1.0f, easing = "Linear"),
                Keyframe(timeMs = 3000L, value = 1.65f, easing = "EaseInOut"),
                Keyframe(timeMs = 7000L, value = 1.0f, easing = "Linear")
              ),
              "Opacity" to listOf(
                Keyframe(timeMs = 0L, value = 0f, easing = "Linear"),
                Keyframe(timeMs = 1500L, value = 100f, easing = "EaseIn"),
                Keyframe(timeMs = 7500L, value = 100f, easing = "Linear"),
                Keyframe(timeMs = 8500L, value = 0f, easing = "EaseOut")
              ),
              "Position X" to listOf(
                Keyframe(timeMs = 0L, value = 0f, easing = "Linear"),
                Keyframe(timeMs = 4000L, value = 80f, easing = "EaseOut")
              )
            )
          ),
          MediaClip(
            id = "clip_vid_2",
            type = ClipType.VIDEO,
            startTimeMs = 8500L,
            durationMs = 11200L,
            color = Color(0xFF7C3AED),
            title = "AMV_Action_Drop_60fps.mov"
          ),
          MediaClip(
            id = "clip_vid_3",
            type = ClipType.VIDEO,
            startTimeMs = 19700L,
            durationMs = 9800L,
            color = Color(0xFFD97706),
            title = "Outro_Glow_Grade.mp4"
          )
        )
      ),
      MediaTrack(
        id = "track_text_overlay",
        name = "Text Overlay",
        type = TrackType.TEXT,
        clips = listOf(
          MediaClip(
            id = "clip_txt_1",
            type = ClipType.TEXT,
            startTimeMs = 1000L,
            durationMs = 4500L,
            color = Color(0xFFEC4899),
            title = "Epic Cinematic Title"
          ),
          MediaClip(
            id = "clip_txt_2",
            type = ClipType.TEXT,
            startTimeMs = 21000L,
            durationMs = 6500L,
            color = Color(0xFFF43F5E),
            title = "Credits & Outro"
          )
        )
      ),
      MediaTrack(
        id = "track_audio",
        name = "Audio",
        type = TrackType.AUDIO,
        clips = listOf(
          MediaClip(
            id = "clip_aud_1",
            type = ClipType.AUDIO,
            startTimeMs = 0L,
            durationMs = 15000L,
            color = Color(0xFF10B981),
            title = "Soundtrack_Theme_Stereo.wav"
          ),
          MediaClip(
            id = "clip_aud_2",
            type = ClipType.AUDIO,
            startTimeMs = 15000L,
            durationMs = 15000L,
            color = Color(0xFF059669),
            title = "BeatDrop_BassBoosted.wav"
          )
        )
      )
    )
  )

  /**
   * Computed list of all clips across tracks for backward compatibility and overview canvas.
   */
  val clips: StateFlow<List<MediaClip>> = tracks.map { trackList ->
    trackList.flatMap { it.clips }
  }.stateIn(
    scope = viewModelScope,
    started = SharingStarted.Eagerly,
    initialValue = listOf(
      MediaClip(id = "clip_vid_1", type = ClipType.VIDEO, startTimeMs = 0L, durationMs = 8500L, color = Color(0xFF0284C7), title = "Intro_Cinematic_4K.mp4"),
      MediaClip(id = "clip_vid_2", type = ClipType.VIDEO, startTimeMs = 8500L, durationMs = 11200L, color = Color(0xFF7C3AED), title = "AMV_Action_Drop_60fps.mov"),
      MediaClip(id = "clip_vid_3", type = ClipType.VIDEO, startTimeMs = 19700L, durationMs = 9800L, color = Color(0xFFD97706), title = "Outro_Glow_Grade.mp4"),
      MediaClip(id = "clip_txt_1", type = ClipType.TEXT, startTimeMs = 1000L, durationMs = 4500L, color = Color(0xFFEC4899), title = "Epic Cinematic Title"),
      MediaClip(id = "clip_txt_2", type = ClipType.TEXT, startTimeMs = 21000L, durationMs = 6500L, color = Color(0xFFF43F5E), title = "Credits & Outro"),
      MediaClip(id = "clip_aud_1", type = ClipType.AUDIO, startTimeMs = 0L, durationMs = 15000L, color = Color(0xFF10B981), title = "Soundtrack_Theme_Stereo.wav"),
      MediaClip(id = "clip_aud_2", type = ClipType.AUDIO, startTimeMs = 15000L, durationMs = 15000L, color = Color(0xFF059669), title = "BeatDrop_BassBoosted.wav")
    )
  )

  // VFX Pro Canvas & Grading state
  val canvasRatio = MutableStateFlow("16:9")
  val canvasBackground = MutableStateFlow("blur")
  val autoBgBlurEnabled = MutableStateFlow(true)
  val globalBgBlurIntensity = MutableStateFlow(35f) // 0f to 100f
  val activeCaptionStyle = MutableStateFlow("Hormozi Viral")
  val activeFilter = MutableStateFlow("Normal")
  val brightness = MutableStateFlow(0f)
  val contrast = MutableStateFlow(1f)
  val saturation = MutableStateFlow(1f)
  val selectedClipId = MutableStateFlow<String?>("clip_vid_1")
  val currentProject = MutableStateFlow<ProjectEntity?>(null)

  // Project Settings State
  val projectName = MutableStateFlow("VFX Pro Project")
  val projectResolution = MutableStateFlow("1080p FHD")
  val projectFps = MutableStateFlow(60)
  val defaultPhotoDurationSec = MutableStateFlow(3.0f)
  val colorSpace = MutableStateFlow("Rec. 709")

  // Beat Sync & Auto Beat Detection
  val beatMarkers = MutableStateFlow<List<Long>>(listOf(1000L, 2500L, 4000L, 5500L, 7000L, 8500L))
  val isBeatSyncEnabled = MutableStateFlow(false)
  val beatSensitivity = MutableStateFlow(0.75f)
  val beatBpm = MutableStateFlow(128)
  val snapToBeat = MutableStateFlow(true)

  // Safe Zone Guides Overlay
  val showSafeZone = MutableStateFlow(false)
  val safeZonePlatform = MutableStateFlow("Instagram Reels") // "Instagram Reels", "TikTok / Shorts", "YouTube 16:9"

  // Watermark Toggle & Customization
  val watermarkEnabled = MutableStateFlow(true)
  val watermarkText = MutableStateFlow("VFX Pro")
  val watermarkPosition = MutableStateFlow("Bottom-Right") // "Bottom-Right", "Bottom-Left", "Top-Right", "Top-Left"
  val watermarkOpacity = MutableStateFlow(0.85f)

  private var playbackJob: Job? = null

  fun loadProject(project: ProjectEntity) {
    currentProject.value = project
    _totalDurationMs.value = project.durationMs.coerceAtLeast(5000L)
    _currentPositionMs.value = 0L

    val primaryClipUri = project.videoUri ?: project.thumbnailUri
    val primaryClipTitle = if (!primaryClipUri.isNullOrEmpty()) project.name else "Intro_Composition.mp4"
    val isVideo = project.videoUri != null || primaryClipUri?.endsWith(".mp4", ignoreCase = true) == true

    val mainClip = MediaClip(
      id = "clip_proj_${project.id}_1",
      type = if (isVideo) ClipType.VIDEO else ClipType.VFX,
      startTimeMs = 0L,
      durationMs = project.durationMs.coerceAtLeast(5000L),
      color = OrangePrimary,
      title = primaryClipTitle,
      uri = primaryClipUri,
      thumbnailUri = project.thumbnailUri
    )

    tracks.value = listOf(
      MediaTrack(
        id = "track_main_video",
        name = "Main Video",
        type = TrackType.MAIN_VIDEO,
        clips = listOf(mainClip)
      ),
      MediaTrack(
        id = "track_text_overlay",
        name = "Text Overlay",
        type = TrackType.TEXT,
        clips = listOf(
          MediaClip(
            id = "clip_txt_proj_${project.id}",
            type = ClipType.TEXT,
            startTimeMs = 500L,
            durationMs = (project.durationMs / 3).coerceAtLeast(3000L),
            color = WarmPeachAccent,
            title = project.name
          )
        )
      ),
      MediaTrack(
        id = "track_audio",
        name = "Audio Track",
        type = TrackType.AUDIO,
        clips = listOf(
          MediaClip(
            id = "clip_aud_proj_${project.id}",
            type = ClipType.AUDIO,
            startTimeMs = 0L,
            durationMs = project.durationMs.coerceAtLeast(5000L),
            color = Color(0xFF10B981),
            title = "Soundtrack_${project.name}.wav"
          )
        )
      )
    )

    selectedClipId.value = mainClip.id
    saveSnapshot("Opened Project: ${project.name}")
  }

  fun setCanvasRatio(ratio: String) {
    canvasRatio.value = ratio
  }

  fun setCanvasBackground(bg: String) {
    canvasBackground.value = bg
  }

  fun setAutoBgBlur(enabled: Boolean, intensity: Float = globalBgBlurIntensity.value) {
    autoBgBlurEnabled.value = enabled
    globalBgBlurIntensity.value = intensity
    if (enabled) {
      canvasBackground.value = "blur"
    }
    saveSnapshot(if (enabled) "Enabled Auto Background Blur" else "Disabled Auto Background Blur")
  }

  fun setGlobalBgBlurIntensity(intensity: Float) {
    globalBgBlurIntensity.value = intensity
  }

  fun setCaptionStyle(style: String) {
    activeCaptionStyle.value = style
    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.TEXT) {
        track.copy(clips = track.clips.map { it.copy(textDesign = style) })
      } else track
    }
  }

  fun generateAutoCaptions(
    language: String = "English",
    style: String = activeCaptionStyle.value,
    customScript: List<String>? = null
  ) {
    activeCaptionStyle.value = style
    val totalMs = _totalDurationMs.value.coerceAtLeast(6000L)

    val phrases = if (!customScript.isNullOrEmpty()) {
      customScript
    } else when (language) {
      "Hindi / Hinglish" -> listOf(
        "Dosto, aaj ka yeh video bohot special hai!",
        "Dekho kaise VFX Pro me cutting-edge studio features use karte hain.",
        "Auto Background Blur aur Auto Captions ab ek click me!",
        "Timeline par smooth playback aur instant sync.",
        "Agar video acchi lagi toh abhi like aur share karo!",
        "Next tutorial me dekhenge advanced Speed Ramping."
      )
      "Spanish" -> listOf(
        "¡Hola a todos! Bienvenidos a este nuevo video.",
        "Hoy vamos a crear efectos cinematográficos increíbles.",
        "Mira cómo editamos todo en tiempo real con VFX Pro.",
        "Subtítulos automáticos y desenfoque de fondo activo.",
        "¡No olvides suscribirte para más tutoriales geniales!"
      )
      else -> listOf(
        "Hey everyone! Welcome back to another video.",
        "Today we are taking video editing to the next level.",
        "Check out this instant auto-background blur feature!",
        "AI captions automatically synced with the voiceover.",
        "Smooth real-time playback and keyframe precision.",
        "Make sure to smash that like button and subscribe!"
      )
    }

    val phraseDuration = (totalMs / phrases.size).coerceIn(1800L, 4500L)
    val captionClips = phrases.mapIndexed { index, phrase ->
      val startMs = (index * phraseDuration).coerceAtMost((totalMs - 1000L).coerceAtLeast(0L))
      val dur = phraseDuration.coerceAtMost((totalMs - startMs).coerceAtLeast(1000L))
      val clipColor = when (style) {
        "Beast Dynamic", "Beast Pop" -> Color(0xFF22C55E)
        "Cinematic Minimal" -> Color.White
        "Neon Karaoke", "Karaoke Wave" -> Color(0xFF06B6D4)
        "Cyber Boxed" -> Color(0xFFEAB308)
        else -> Color(0xFFFACC15) // Hormozi Yellow
      }
      MediaClip(
        id = "caption_${System.currentTimeMillis()}_$index",
        type = ClipType.TEXT,
        startTimeMs = startMs,
        durationMs = dur,
        color = clipColor,
        title = phrase,
        textDesign = style
      )
    }

    val hasTextTrack = tracks.value.any { it.type == TrackType.TEXT }
    if (hasTextTrack) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.TEXT) {
          track.copy(clips = captionClips)
        } else track
      }
    } else {
      val textTrack = MediaTrack(
        id = "track_text_overlay",
        name = "Auto Captions",
        type = TrackType.TEXT,
        clips = captionClips
      )
      tracks.value = tracks.value + textTrack
    }
    saveSnapshot("Generated Auto Captions ($language, $style)")
  }

  fun updateCaptionText(clipId: String, newText: String) {
    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.TEXT) {
        track.copy(clips = track.clips.map { clip ->
          if (clip.id == clipId) clip.copy(title = newText) else clip
        })
      } else track
    }
  }

  fun updateTextTransform(clipId: String, deltaX: Float, deltaY: Float, deltaScale: Float = 0f) {
    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.TEXT) {
        track.copy(clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            val newX = clip.textOffsetX + deltaX
            val newY = clip.textOffsetY + deltaY
            val newScale = (clip.textScale + deltaScale).coerceIn(0.5f, 3.5f)
            clip.copy(textOffsetX = newX, textOffsetY = newY, textScale = newScale)
          } else clip
        })
      } else track
    }
  }

  fun setTextPosition(clipId: String, x: Float, y: Float, scale: Float = 1.0f) {
    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.TEXT) {
        track.copy(clips = track.clips.map { clip ->
          if (clip.id == clipId) clip.copy(textOffsetX = x, textOffsetY = y, textScale = scale) else clip
        })
      } else track
    }
  }

  fun removeCaption(clipId: String) {
    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.TEXT) {
        track.copy(clips = track.clips.filterNot { it.id == clipId })
      } else track
    }
    saveSnapshot("Removed Caption")
  }

  fun clearAutoCaptions() {
    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.TEXT) {
        track.copy(clips = emptyList())
      } else track
    }
    saveSnapshot("Cleared Auto Captions")
  }

  fun addCustomCaption(text: String, startMs: Long, durMs: Long = 3000L) {
    val newCaption = MediaClip(
      id = "caption_${System.currentTimeMillis()}",
      type = ClipType.TEXT,
      startTimeMs = startMs,
      durationMs = durMs,
      color = when (activeCaptionStyle.value) {
        "Beast Dynamic", "Beast Pop" -> Color(0xFF22C55E)
        "Cinematic Minimal" -> Color.White
        "Neon Karaoke", "Karaoke Wave" -> Color(0xFF06B6D4)
        "Cyber Boxed" -> Color(0xFFEAB308)
        else -> Color(0xFFFACC15)
      },
      title = text,
      textDesign = activeCaptionStyle.value
    )
    val hasTextTrack = tracks.value.any { it.type == TrackType.TEXT }
    if (hasTextTrack) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.TEXT) {
          track.copy(clips = track.clips + newCaption)
        } else track
      }
    } else {
      val textTrack = MediaTrack(
        id = "track_text_overlay",
        name = "Auto Captions",
        type = TrackType.TEXT,
        clips = listOf(newCaption)
      )
      tracks.value = tracks.value + textTrack
    }
    saveSnapshot("Added Caption Line")
  }

  fun setFilter(filter: String) {
    activeFilter.value = filter
  }

  /**
   * Viral Trending Templates: Replace with 3 photos and automatically build a ready-to-export reel
   * with beat-synced cuts, speed ramps, trending music, and transition effects.
   */
  fun applyPhotoTemplate(
    templateId: String,
    templateName: String,
    photos: List<String>, // URIs or titles of 3 photos
    musicStyle: String,
    transitionType: String,
    colorGrade: String,
    bpm: Int,
    aspect: String = "9:16"
  ) {
    val photoCount = photos.size.coerceAtLeast(1)
    val totalMs = 12000L // 12 second reel
    val clipDurationMs = totalMs / photoCount

    val photoClips = photos.mapIndexed { index, photoUri ->
      val startMs = index * clipDurationMs
      val isLast = index == photoCount - 1
      val dur = if (isLast) totalMs - startMs else clipDurationMs
      MediaClip(
        id = "tpl_clip_${System.currentTimeMillis()}_$index",
        type = ClipType.IMAGE,
        startTimeMs = startMs,
        durationMs = dur,
        color = when (index % 3) {
          0 -> Color(0xFFEF4444)
          1 -> Color(0xFF8B5CF6)
          else -> Color(0xFF06B6D4)
        },
        title = if (photoUri.startsWith("content://") || photoUri.startsWith("file://")) {
          "Photo ${index + 1} (${photoUri.substringAfterLast('/').takeLast(16)})"
        } else photoUri,
        uri = photoUri,
        transitionType = transitionType,
        transitionDurationMs = 600L,
        speedCurve = if (index == 1) "Bullet Time" else "Jump Cut",
        filterEffect = colorGrade,
        transformKeyframes = mapOf(
          "Scale" to listOf(
            Keyframe(0L, 1.0f, "Linear"),
            Keyframe(dur, 1.25f, "EaseOut")
          )
        )
      )
    }

    val mainTrack = MediaTrack(
      id = "track_main_video",
      name = "Template Video ($templateName)",
      type = TrackType.MAIN_VIDEO,
      clips = photoClips
    )

    val audioClip = MediaClip(
      id = "tpl_audio_${System.currentTimeMillis()}",
      type = ClipType.AUDIO,
      startTimeMs = 0L,
      durationMs = totalMs,
      color = Color(0xFFF59E0B),
      title = "🎵 $musicStyle (Synced $bpm BPM)"
    )

    val audioTrack = MediaTrack(
      id = "track_audio_${System.currentTimeMillis()}",
      name = "Trending Music",
      type = TrackType.AUDIO,
      clips = listOf(audioClip)
    )

    val captionClip = MediaClip(
      id = "tpl_txt_${System.currentTimeMillis()}",
      type = ClipType.TEXT,
      startTimeMs = 500L,
      durationMs = 4000L,
      color = Color(0xFFFACC15),
      title = "🔥 $templateName",
      textDesign = "Beast Dynamic"
    )

    val textTrack = MediaTrack(
      id = "track_text_overlay",
      name = "Overlay Title",
      type = TrackType.TEXT,
      clips = listOf(captionClip)
    )

    tracks.value = listOf(mainTrack, textTrack, audioTrack)
    canvasRatio.value = aspect
    activeFilter.value = colorGrade
    _totalDurationMs.value = totalMs
    _currentPositionMs.value = 0L

    setBeatBpm(bpm)
    saveSnapshot("Applied 3-Photo Template: $templateName")
  }

  /**
   * Speech-to-Song / AI Voiceover (Text-to-Speech):
   * Converts user written text into realistic AI Voiceover speech clips or rhythmic Speech-to-Song tracks.
   */
  fun generateAiVoiceover(
    text: String,
    voiceName: String,
    speechRate: Float = 1.0f,
    pitch: Float = 1.0f,
    isSpeechToSong: Boolean = false,
    songGenre: String = "Pop",
    atTimeMs: Long = _currentPositionMs.value,
    melodyStyle: String = songGenre
  ) {
    if (text.isBlank()) return

    // Calculate approximate duration based on word count & speech rate (avg 150 words/min = 2.5 words/sec)
    val words = text.trim().split(Regex("\\s+")).filter { it.isNotBlank() }
    val wordCount = words.size.coerceAtLeast(1)
    val estimatedSeconds = ((wordCount / 2.5f) / speechRate.coerceIn(0.5f, 2.0f)).coerceIn(1.5f, 30.0f)
    val durationMs = (estimatedSeconds * 1000L).toLong()

    val effectiveGenre = if (melodyStyle.isNotBlank()) melodyStyle else songGenre
    val clipTitle = if (isSpeechToSong) {
      "🎵 [Song-$effectiveGenre] $voiceName: \"${text.take(24)}...\""
    } else {
      "🎙️ [AI Voice] $voiceName: \"${text.take(24)}...\""
    }

    val voiceClip = MediaClip(
      id = "ai_voice_${System.currentTimeMillis()}",
      type = ClipType.AUDIO,
      startTimeMs = atTimeMs,
      durationMs = durationMs,
      color = if (isSpeechToSong) Color(0xFFEC4899) else Color(0xFF8B5CF6),
      title = clipTitle,
      voiceEffect = if (isSpeechToSong) "Autotune $effectiveGenre" else voiceName,
      voicePitch = pitch
    )

    val hasAudioTrack = tracks.value.any { it.type == TrackType.AUDIO }
    if (hasAudioTrack) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.AUDIO) {
          track.copy(clips = track.clips + voiceClip)
        } else track
      }
    } else {
      val newTrack = MediaTrack(
        id = "track_audio_ai_voice_${System.currentTimeMillis()}",
        name = if (isSpeechToSong) "Speech-to-Song Track" else "AI Voiceover Track",
        type = TrackType.AUDIO,
        clips = listOf(voiceClip)
      )
      tracks.value = tracks.value + newTrack
    }

    // Also optionally generate synchronized auto-caption for this voiceover
    val captionClip = MediaClip(
      id = "caption_voice_${System.currentTimeMillis()}",
      type = ClipType.TEXT,
      startTimeMs = atTimeMs,
      durationMs = durationMs,
      color = Color(0xFFFACC15),
      title = text,
      textDesign = if (isSpeechToSong) "Neon Karaoke" else "Hormozi Yellow"
    )
    val hasTextTrack = tracks.value.any { it.type == TrackType.TEXT }
    if (hasTextTrack) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.TEXT) {
          track.copy(clips = track.clips + captionClip)
        } else track
      }
    } else {
      tracks.value = tracks.value + MediaTrack(
        id = "track_text_voice_${System.currentTimeMillis()}",
        name = "Subtitles",
        type = TrackType.TEXT,
        clips = listOf(captionClip)
      )
    }

    recalculateTotalDuration()
    saveSnapshot(if (isSpeechToSong) "Generated Speech-to-Song ($songGenre)" else "Generated AI Voiceover ($voiceName)")
  }

  fun setBrightness(v: Float) { brightness.value = v }
  fun setContrast(v: Float) { contrast.value = v }
  fun setSaturation(v: Float) { saturation.value = v }

  fun selectClip(id: String?) {
    selectedClipId.value = id
  }

  fun getLastClipEndTime(trackType: TrackType): Long {
    val track = tracks.value.firstOrNull { it.type == trackType } ?: return 0L
    return track.clips.maxOfOrNull { it.startTimeMs + it.durationMs } ?: 0L
  }

  fun addRealClip(uri: String, title: String, durationMs: Long, isVideo: Boolean) {
    val currentClips = tracks.value.flatMap { it.clips }
    val isOnlyMockClips = currentClips.all { it.uri.isNullOrEmpty() }
    val startMs = if (isOnlyMockClips) 0L else getLastClipEndTime(TrackType.MAIN_VIDEO)
    val newId = "clip_${if (isVideo) "vid" else "img"}_${System.currentTimeMillis()}"
    val newClip = MediaClip(
      id = newId,
      type = if (isVideo) ClipType.VIDEO else ClipType.IMAGE,
      startTimeMs = startMs,
      durationMs = durationMs.coerceAtLeast(1000L),
      color = if (isVideo) Color(0xFFFF7A22) else Color(0xFFF59E0B),
      title = title,
      uri = uri
    )
    if (isOnlyMockClips) {
      tracks.value = listOf(
        MediaTrack(id = "track_main_video", name = "Main Video", type = TrackType.MAIN_VIDEO, clips = listOf(newClip)),
        MediaTrack(id = "track_text_overlay", name = "Text Overlay", type = TrackType.TEXT, clips = emptyList()),
        MediaTrack(id = "track_audio", name = "Audio", type = TrackType.AUDIO, clips = emptyList())
      )
    } else {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.MAIN_VIDEO) {
          track.copy(clips = track.clips + newClip)
        } else track
      }
    }
    selectedClipId.value = newId
    _currentPositionMs.value = startMs
    recalculateTotalDuration()
    saveSnapshot("Add Real Media: $title")
  }

  fun addMultipleRealClips(items: List<MediaImportItem>) {
    if (items.isEmpty()) return
    val currentClips = tracks.value.flatMap { it.clips }
    val isOnlyMockClips = currentClips.all { it.uri.isNullOrEmpty() }
    var startMs = if (isOnlyMockClips) 0L else getLastClipEndTime(TrackType.MAIN_VIDEO)
    val newClips = items.mapIndexed { idx, item ->
      val newId = "clip_${if (item.isVideo) "vid" else "img"}_${System.currentTimeMillis()}_$idx"
      val clip = MediaClip(
        id = newId,
        type = if (item.isVideo) ClipType.VIDEO else ClipType.IMAGE,
        startTimeMs = startMs,
        durationMs = item.durationMs.coerceAtLeast(1000L),
        color = if (item.isVideo) Color(0xFFFF7A22) else Color(0xFFF59E0B),
        title = item.title,
        uri = item.uri
      )
      startMs += clip.durationMs
      clip
    }
    if (isOnlyMockClips) {
      tracks.value = listOf(
        MediaTrack(id = "track_main_video", name = "Main Video", type = TrackType.MAIN_VIDEO, clips = newClips),
        MediaTrack(id = "track_text_overlay", name = "Text Overlay", type = TrackType.TEXT, clips = emptyList()),
        MediaTrack(id = "track_audio", name = "Audio", type = TrackType.AUDIO, clips = emptyList())
      )
    } else {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.MAIN_VIDEO) {
          track.copy(clips = track.clips + newClips)
        } else track
      }
    }
    selectedClipId.value = newClips.firstOrNull()?.id
    _currentPositionMs.value = newClips.firstOrNull()?.startTimeMs ?: 0L
    recalculateTotalDuration()
    saveSnapshot("Imported ${items.size} Media Clips")
  }

  fun addRealAudioClip(uri: String, title: String, durationMs: Long = 15000L) {
    val startMs = _currentPositionMs.value
    val newClip = MediaClip(
      id = "audio_${System.currentTimeMillis()}",
      type = ClipType.AUDIO,
      startTimeMs = startMs,
      durationMs = durationMs,
      color = Color(0xFF10B981),
      title = title,
      uri = uri
    )
    val hasAudioTrack = tracks.value.any { it.type == TrackType.AUDIO }
    if (hasAudioTrack) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.AUDIO) {
          track.copy(clips = track.clips + newClip)
        } else track
      }
    } else {
      val newTrack = MediaTrack(
        id = "track_audio_${System.currentTimeMillis()}",
        name = "Audio Track",
        type = TrackType.AUDIO,
        clips = listOf(newClip)
      )
      tracks.value = tracks.value + newTrack
    }
    recalculateTotalDuration()
    saveSnapshot("Add Audio: $title")
  }

  fun replaceAudioClip(clipId: String, uri: String, title: String, durationMs: Long = 15000L) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(
              uri = uri,
              title = title,
              durationMs = if (durationMs > 0L) durationMs else clip.durationMs
            )
          } else clip
        }
      )
    }
    recalculateTotalDuration()
    saveSnapshot("Replace Audio: $title")
  }

  fun deleteAudioClip(clipId: String) {
    removeClip(clipId)
  }

  fun deleteAllAudioClips() {
    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.AUDIO) {
        track.copy(clips = emptyList())
      } else {
        track.copy(clips = track.clips.filterNot { it.type == ClipType.AUDIO })
      }
    }
    recalculateTotalDuration()
    saveSnapshot("Delete All Audio Tracks")
  }

  fun trimClip(clipId: String, newDurationMs: Long) {
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val oldClip = track.clips[index]
        val clampedDuration = newDurationMs.coerceAtLeast(500L)
        val diff = clampedDuration - oldClip.durationMs
        val updated = track.clips.toMutableList()
        updated[index] = oldClip.copy(durationMs = clampedDuration)
        for (i in (index + 1) until updated.size) {
          updated[i] = updated[i].copy(startTimeMs = (updated[i].startTimeMs + diff).coerceAtLeast(0L))
        }
        track.copy(clips = updated)
      } else track
    }
    recalculateTotalDuration()
    saveSnapshot("Trim Clip")
  }

  fun moveClip(clipId: String, direction: Int) {
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      val targetIndex = index + direction
      if (index >= 0 && targetIndex in 0 until track.clips.size) {
        val updated = track.clips.toMutableList()
        val item = updated.removeAt(index)
        updated.add(targetIndex, item)
        var runningStart = 0L
        val resequenced = updated.map { c ->
          val res = c.copy(startTimeMs = runningStart)
          runningStart += c.durationMs
          res
        }
        track.copy(clips = resequenced)
      } else track
    }
    saveSnapshot("Reorder Clips")
  }

  fun updateProjectSettings(name: String, resolution: String, fps: Int, photoDurationSec: Float) {
    projectName.value = name
    projectResolution.value = resolution
    projectFps.value = fps
    defaultPhotoDurationSec.value = photoDurationSec
    saveSnapshot("Updated Project Settings")
  }

  fun resetProject() {
    tracks.value = listOf(
      MediaTrack(
        id = "track_video_main",
        name = "Main Video",
        type = TrackType.MAIN_VIDEO,
        clips = emptyList()
      ),
      MediaTrack(
        id = "track_audio",
        name = "Audio Track",
        type = TrackType.AUDIO,
        clips = emptyList()
      )
    )
    selectedClipId.value = null
    _currentPositionMs.value = 0L
    _totalDurationMs.value = 10000L
    saveSnapshot("Reset Project to Blank Timeline")
  }

  fun setClipSpeed(clipId: String, speed: Float) {
    setClipSpeed(clipId, speed, "Standard")
  }

  fun setClipFilter(clipId: String, filter: String) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map {
        if (it.id == clipId) it.copy(filterEffect = filter) else it
      })
    }
    activeFilter.value = filter
    saveSnapshot("Set Filter $filter")
  }

  fun deleteClip(clipId: String) = removeClip(clipId)

  fun setClipRotation(clipId: String, rot: Float) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map {
        if (it.id == clipId) it.copy(rotation = rot) else it
      })
    }
    saveSnapshot("Rotate Clip to ${rot.toInt()}°")
  }

  fun toggleClipFlip(clipId: String) = flipClipHorizontal(clipId)

  fun addTextOverlay(text: String, color: Color = Color.White) {
    val newClip = MediaClip(
      id = "clip_txt_${System.currentTimeMillis()}",
      type = ClipType.TEXT,
      startTimeMs = _currentPositionMs.value,
      durationMs = 4000L,
      color = color,
      title = text
    )
    addClip(newClip)
    saveSnapshot("Add Text: $text")
  }

  init {
    // Step 24: Initialize history stack with the initial tracks state snapshot
    val initialSnapshot = TimelineSnapshot(
      tracks = deepCopyTracks(tracks.value),
      description = "Initial Project State"
    )
    _historyStack.value = listOf(initialSnapshot)
    _historyIndex.value = 0
    updateUndoRedoAvailability()
  }

  /**
   * Deep copy of tracks and clips to preserve immutable state snapshots for undo/redo.
   */
  private fun deepCopyTracks(source: List<MediaTrack>): List<MediaTrack> {
    return source.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          clip.copy(
            transformKeyframes = clip.transformKeyframes.mapValues { (_, kfList) ->
              kfList.map { it.copy() }
            }
          )
        }
      )
    }
  }

  /**
   * Step 24: Save a new state snapshot on the history stack.
   * Truncates any forward redo states and caps depth (up to 30 snapshots) for lightweight performance.
   */
  fun saveSnapshot(description: String = "") {
    val currentTracks = deepCopyTracks(tracks.value)
    val currentIdx = _historyIndex.value
    val stack = _historyStack.value

    // Do not save duplicate snapshot if tracks haven't changed
    if (currentIdx in stack.indices && stack[currentIdx].tracks == currentTracks) {
      return
    }

    // Truncate redo history beyond current index
    val truncated = if (currentIdx >= 0 && currentIdx < stack.size - 1) {
      stack.subList(0, currentIdx + 1)
    } else {
      stack
    }

    val newSnapshot = TimelineSnapshot(tracks = currentTracks, description = description)
    val updatedStack = (truncated + newSnapshot).takeLast(30)
    _historyStack.value = updatedStack
    _historyIndex.value = updatedStack.size - 1
    updateUndoRedoAvailability()
  }

  /**
   * Step 24: Undo last action by rolling back one snapshot in the history stack.
   */
  fun undo() {
    val currentIdx = _historyIndex.value
    if (currentIdx > 0) {
      val newIdx = currentIdx - 1
      _historyIndex.value = newIdx
      val snapshot = _historyStack.value[newIdx]
      tracks.value = deepCopyTracks(snapshot.tracks)
      updateUndoRedoAvailability()
    }
  }

  /**
   * Step 24: Redo action by stepping forward one snapshot in the history stack.
   */
  fun redo() {
    val currentIdx = _historyIndex.value
    val stack = _historyStack.value
    if (currentIdx in 0 until stack.size - 1) {
      val newIdx = currentIdx + 1
      _historyIndex.value = newIdx
      val snapshot = stack[newIdx]
      tracks.value = deepCopyTracks(snapshot.tracks)
      updateUndoRedoAvailability()
    }
  }

  private fun updateUndoRedoAvailability() {
    val idx = _historyIndex.value
    val size = _historyStack.value.size
    _canUndo.value = idx > 0
    _canRedo.value = idx >= 0 && idx < size - 1
  }

  /**
   * Toggle Mute or Hide for a specific track.
   */
  fun toggleTrackMuteHide(trackId: String) {
    tracks.value = tracks.value.map { track ->
      if (track.id == trackId) {
        track.copy(isMutedOrHidden = !track.isMutedOrHidden)
      } else {
        track
      }
    }
    saveSnapshot("Toggle Track Mute/Hide")
  }

  /**
   * Add a new media clip to the specified track (or first matching track type).
   */
  fun addClip(clip: MediaClip, targetTrackId: String? = null) {
    tracks.value = tracks.value.map { track ->
      val matches = if (targetTrackId != null) {
        track.id == targetTrackId
      } else {
        when (clip.type) {
          ClipType.VIDEO, ClipType.IMAGE -> track.type == TrackType.MAIN_VIDEO || track.type == TrackType.OVERLAY
          ClipType.AUDIO -> track.type == TrackType.AUDIO
          ClipType.TEXT -> track.type == TrackType.TEXT
          ClipType.VFX -> track.type == TrackType.OVERLAY || track.type == TrackType.MAIN_VIDEO
        }
      }
      if (matches) {
        track.copy(clips = track.clips + clip)
      } else {
        track
      }
    }
    saveSnapshot("Add Clip")
  }

  /**
   * Remove a media clip by ID across all tracks.
   */
  fun removeClip(clipId: String) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.filterNot { it.id == clipId })
    }
    saveSnapshot("Remove Clip")
  }

  /**
   * Update an existing media clip.
   */
  fun updateClip(clip: MediaClip) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { if (it.id == clip.id) clip else it })
    }
    saveSnapshot("Update Clip")
  }

  /**
   * Split a clip into two halves at midpoint.
   */
  fun splitClip(clipId: String) {
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val target = track.clips[index]
        val part1Duration = target.durationMs / 2
        val part2Duration = target.durationMs - part1Duration
        val baseTitle = target.title.ifEmpty { "Clip" }.substringBeforeLast('.')
        val ext = if (target.title.contains('.')) target.title.substringAfterLast('.') else "mp4"
        val part1 = target.copy(
          id = "${target.id}_p1_${System.currentTimeMillis()}",
          durationMs = part1Duration,
          title = "${baseTitle}_Part1.$ext"
        )
        val part2 = target.copy(
          id = "${target.id}_p2_${System.currentTimeMillis()}",
          startTimeMs = target.startTimeMs + part1Duration,
          durationMs = part2Duration,
          title = "${baseTitle}_Part2.$ext"
        )
        val updated = track.clips.toMutableList()
        updated.removeAt(index)
        updated.add(index, part1)
        updated.add(index + 1, part2)
        track.copy(clips = updated)
      } else {
        track
      }
    }
    saveSnapshot("Split Clip")
  }

  fun recalculateTotalDuration() {
    val maxClipEnd = tracks.value.flatMap { it.clips }.maxOfOrNull { it.startTimeMs + it.durationMs } ?: 30000L
    val targetDuration = (maxClipEnd + 1000L).coerceAtLeast(30000L)
    if (targetDuration > _totalDurationMs.value) {
      _totalDurationMs.value = targetDuration
    }
  }

  /**
   * Duplicate a clip and insert it immediately after the original.
   */
  fun duplicateClip(clipId: String) {
    var newId: String? = null
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val target = track.clips[index]
        val baseTitle = target.title.ifEmpty { "Clip" }.substringBeforeLast('.')
        val ext = if (target.title.contains('.')) target.title.substringAfterLast('.') else "mp4"
        val createdId = "${target.id}_dup_${System.currentTimeMillis()}"
        newId = createdId
        val duplicated = target.copy(
          id = createdId,
          title = "${baseTitle}_Copy.$ext",
          startTimeMs = target.startTimeMs + target.durationMs
        )
        val updated = track.clips.toMutableList()
        updated.add(index + 1, duplicated)
        for (i in (index + 2) until updated.size) {
          updated[i] = updated[i].copy(startTimeMs = updated[i].startTimeMs + target.durationMs)
        }
        track.copy(clips = updated)
      } else {
        track
      }
    }
    newId?.let { selectedClipId.value = it }
    recalculateTotalDuration()
    saveSnapshot("Duplicate Clip")
  }

  /**
   * Cut/split clip specifically at the current playhead position if within bounds,
   * otherwise splits at midpoint.
   */
  fun splitClipAtPlayhead(clipId: String, playheadMs: Long) {
    var newId: String? = null
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val target = track.clips[index]
        val clipEnd = target.startTimeMs + target.durationMs
        val splitOffset = if (playheadMs > target.startTimeMs + 200L && playheadMs < clipEnd - 200L) {
          playheadMs - target.startTimeMs
        } else {
          target.durationMs / 2
        }
        val part1Duration = splitOffset.coerceIn(200L, target.durationMs - 200L)
        val part2Duration = target.durationMs - part1Duration
        val baseTitle = target.title.ifEmpty { "Clip" }.substringBeforeLast('.')
        val ext = if (target.title.contains('.')) target.title.substringAfterLast('.') else "mp4"
        val part1 = target.copy(
          id = "${target.id}_p1_${System.currentTimeMillis()}",
          durationMs = part1Duration,
          title = "${baseTitle}_Part1.$ext"
        )
        val p2Id = "${target.id}_p2_${System.currentTimeMillis() + 1}"
        newId = p2Id
        val part2 = target.copy(
          id = p2Id,
          startTimeMs = target.startTimeMs + part1Duration,
          durationMs = part2Duration,
          title = "${baseTitle}_Part2.$ext"
        )
        val updated = track.clips.toMutableList()
        updated.removeAt(index)
        updated.add(index, part1)
        updated.add(index + 1, part2)
        track.copy(clips = updated)
      } else {
        track
      }
    }
    newId?.let { selectedClipId.value = it }
    recalculateTotalDuration()
    saveSnapshot("Split at Playhead")
  }

  /**
   * Reverse playback toggle for a clip.
   */
  fun reverseClip(clipId: String) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            val newReversed = !clip.isReversed
            val newTitle = if (newReversed) {
              if (clip.title.contains("[Rev]")) clip.title else "${clip.title} [Rev]"
            } else {
              clip.title.replace(" [Rev]", "")
            }
            clip.copy(isReversed = newReversed, title = newTitle)
          } else clip
        }
      )
    }
    saveSnapshot("Reverse Clip")
  }

  /**
   * Rotate clip by +90 degrees.
   */
  fun rotateClip(clipId: String) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(rotation = (clip.rotation + 90f) % 360f)
          } else clip
        }
      )
    }
    saveSnapshot("Rotate Clip")
  }

  /**
   * Flip clip horizontally.
   */
  fun flipClipHorizontal(clipId: String) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(isFlippedHorizontal = !clip.isFlippedHorizontal)
          } else clip
        }
      )
    }
    saveSnapshot("Flip Clip")
  }

  /**
   * Freeze Frame: Inserts a freeze frame at the current playhead.
   */
  fun freezeFrame(clipId: String, playheadMs: Long, freezeDurationMs: Long = 3000L) {
    var newId: String? = null
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val target = track.clips[index]
        val createdId = "freeze_${System.currentTimeMillis()}"
        newId = createdId
        val freezeClip = MediaClip(
          id = createdId,
          type = target.type,
          startTimeMs = target.startTimeMs + target.durationMs,
          durationMs = freezeDurationMs,
          color = Color(0xFF06B6D4),
          title = "❄️ Freeze_${target.title.substringBeforeLast('.')}.jpg",
          uri = target.uri,
          isFrozen = true
        )
        val updated = track.clips.toMutableList()
        updated.add(index + 1, freezeClip)
        for (i in (index + 2) until updated.size) {
          updated[i] = updated[i].copy(startTimeMs = updated[i].startTimeMs + freezeDurationMs)
        }
        track.copy(clips = updated)
      } else track
    }
    newId?.let { selectedClipId.value = it }
    recalculateTotalDuration()
    saveSnapshot("Freeze Frame")
  }

  /**
   * Extract audio from video clip and place on Audio track.
   */
  fun extractAudioFromClip(clipId: String) {
    var extractedClip: MediaClip? = null
    tracks.value = tracks.value.map { track ->
      val target = track.clips.find { it.id == clipId }
      if (target != null) {
        extractedClip = MediaClip(
          id = "audio_ext_${System.currentTimeMillis()}",
          type = ClipType.AUDIO,
          startTimeMs = target.startTimeMs,
          durationMs = target.durationMs,
          color = Color(0xFF10B981),
          title = "🎵 Audio_${target.title.substringBeforeLast('.')}.wav",
          uri = target.uri
        )
        track.copy(clips = track.clips.map { if (it.id == clipId) it.copy(volume = 0f, isMuted = true) else it })
      } else track
    }

    if (extractedClip != null) {
      val audioTrackExists = tracks.value.any { it.type == TrackType.AUDIO }
      if (audioTrackExists) {
        tracks.value = tracks.value.map { track ->
          if (track.type == TrackType.AUDIO) {
            track.copy(clips = track.clips + extractedClip!!)
          } else track
        }
      } else {
        val newAudioTrack = MediaTrack(
          id = "track_audio_${System.currentTimeMillis()}",
          name = "Audio Track",
          type = TrackType.AUDIO,
          clips = listOf(extractedClip!!)
        )
        tracks.value = tracks.value + newAudioTrack
      }
      recalculateTotalDuration()
      saveSnapshot("Extract Audio")
    }
  }

  fun extractAudioFromExternalVideo(uri: String, title: String, durationMs: Long) {
    val startMs = _currentPositionMs.value
    val newClip = MediaClip(
      id = "audio_ext_${System.currentTimeMillis()}",
      type = ClipType.AUDIO,
      startTimeMs = startMs,
      durationMs = durationMs.coerceAtLeast(2000L),
      color = Color(0xFF10B981),
      title = "🎵 Audio_$title",
      uri = uri
    )
    val hasAudioTrack = tracks.value.any { it.type == TrackType.AUDIO }
    if (hasAudioTrack) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.AUDIO) {
          track.copy(clips = track.clips + newClip)
        } else track
      }
    } else {
      val newTrack = MediaTrack(
        id = "track_audio_${System.currentTimeMillis()}",
        name = "Audio Track",
        type = TrackType.AUDIO,
        clips = listOf(newClip)
      )
      tracks.value = tracks.value + newTrack
    }
    recalculateTotalDuration()
    saveSnapshot("Extracted Audio from Video")
  }

  fun replaceClip(clipId: String, newUri: String, newTitle: String, isVideo: Boolean, newDurationMs: Long) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) {
          clip.copy(
            uri = newUri,
            title = newTitle,
            type = if (isVideo) ClipType.VIDEO else ClipType.IMAGE,
            durationMs = newDurationMs.coerceAtLeast(1000L),
            isFrozen = false
          )
        } else clip
      })
    }
    recalculateTotalDuration()
    saveSnapshot("Replace Clip")
  }

  fun setClipDuration(clipId: String, newDurationMs: Long) {
    val safeDuration = newDurationMs.coerceIn(500L, 180000L)
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index != -1) {
        val oldClip = track.clips[index]
        val diff = safeDuration - oldClip.durationMs
        val updatedClips = track.clips.mapIndexed { idx, clip ->
          when {
            idx == index -> clip.copy(durationMs = safeDuration)
            idx > index -> clip.copy(startTimeMs = (clip.startTimeMs + diff).coerceAtLeast(0L))
            else -> clip
          }
        }
        track.copy(clips = updatedClips)
      } else track
    }
    recalculateTotalDuration()
    saveSnapshot("Adjust Duration")
  }

  fun setClipCrop(clipId: String, cropRatio: String, cropZoom: Float) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) clip.copy(cropRatio = cropRatio, cropZoom = cropZoom) else clip
      })
    }
    saveSnapshot("Set Crop")
  }

  fun setClipEnhance(clipId: String, brightness: Float, contrast: Float, saturation: Float, warmth: Float) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) clip.copy(
          brightness = brightness,
          contrast = contrast,
          saturation = saturation,
          warmth = warmth
        ) else clip
      })
    }
    saveSnapshot("Color Enhance")
  }

  fun setClipBodyEffect(clipId: String, effect: String, color: Long = 0xFF00E5FF, intensity: Float = 0.85f) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) clip.copy(
          bodyEffect = effect,
          bodyEffectColor = color,
          bodyEffectIntensity = intensity
        ) else clip
      })
    }
    saveSnapshot("Set Body Effect: $effect")
  }

  fun setClipSmoothSlowMo(clipId: String, enabled: Boolean, quality: String = "Optical Flow") {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) clip.copy(
          smoothSlowMoEnabled = enabled,
          smoothSlowMoQuality = quality
        ) else clip
      })
    }
    saveSnapshot("Set Smooth Slow-Mo: $enabled")
  }

  fun setClipMotionBlur(
    clipId: String,
    enabled: Boolean,
    intensity: Float = 60f,
    shutterAngle: Int = 180,
    blendPasses: Int = 4
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) clip.copy(
          motionBlurEnabled = enabled,
          motionBlurIntensity = intensity,
          motionBlurShutterAngle = shutterAngle,
          motionBlurBlendPasses = blendPasses
        ) else clip
      })
    }
    saveSnapshot("Set Motion Blur: $enabled")
  }

  fun setClipVfxEffect(
    clipId: String,
    effect: String,
    intensity: Float = 0.85f,
    speed: Float = 1.0f,
    color: Long = 0xFF00E5FF,
    atmosphere: Float = 0.5f
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) clip.copy(
          vfxEffect = effect,
          vfxIntensity = intensity,
          vfxSpeed = speed,
          vfxColor = color,
          vfxAtmosphere = atmosphere
        ) else clip
      })
    }
    saveSnapshot("Set VFX Effect: $effect")
  }

  fun applyVfxToAll(
    effect: String,
    intensity: Float = 0.85f,
    speed: Float = 1.0f,
    color: Long = 0xFF00E5FF,
    atmosphere: Float = 0.5f
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        clip.copy(
          vfxEffect = effect,
          vfxIntensity = intensity,
          vfxSpeed = speed,
          vfxColor = color,
          vfxAtmosphere = atmosphere
        )
      })
    }
    saveSnapshot("Apply VFX to All Clips")
  }

  fun setClipBackground(clipId: String, blur: Float, colorHex: Long) {
    tracks.value = tracks.value.map { track ->
      track.copy(clips = track.clips.map { clip ->
        if (clip.id == clipId) clip.copy(bgBlur = blur, bgColor = colorHex) else clip
      })
    }
    saveSnapshot("Set Clip Background")
  }

  fun addPipOverlayClip(uri: String, title: String, durationMs: Long, isVideo: Boolean, atTimeMs: Long) {
    val newClip = MediaClip(
      id = "pip_${System.currentTimeMillis()}",
      type = if (isVideo) ClipType.VIDEO else ClipType.IMAGE,
      startTimeMs = atTimeMs,
      durationMs = durationMs.coerceAtLeast(2000L),
      color = Color(0xFF8B5CF6),
      title = "PIP: $title",
      uri = uri
    )
    val overlayTrackExists = tracks.value.any { it.type == TrackType.OVERLAY }
    if (overlayTrackExists) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.OVERLAY) {
          track.copy(clips = track.clips + newClip)
        } else track
      }
    } else {
      val newOverlayTrack = MediaTrack(
        id = "track_overlay_${System.currentTimeMillis()}",
        name = "PIP Overlay",
        type = TrackType.OVERLAY,
        clips = listOf(newClip)
      )
      tracks.value = tracks.value + newOverlayTrack
    }
    recalculateTotalDuration()
    saveSnapshot("Add PIP Overlay")
  }

  fun addStickerClip(sticker: String, atTimeMs: Long, durationMs: Long = 4000L) {
    val newClip = MediaClip(
      id = "sticker_${System.currentTimeMillis()}",
      type = ClipType.TEXT,
      startTimeMs = atTimeMs,
      durationMs = durationMs,
      color = Color(0xFFFBBF24),
      title = sticker,
      textDesign = "Sticker"
    )
    val textTrackExists = tracks.value.any { it.type == TrackType.TEXT }
    if (textTrackExists) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.TEXT) {
          track.copy(clips = track.clips + newClip)
        } else track
      }
    } else {
      val newTrack = MediaTrack(
        id = "track_text_${System.currentTimeMillis()}",
        name = "Sticker Overlay",
        type = TrackType.TEXT,
        clips = listOf(newClip)
      )
      tracks.value = tracks.value + newTrack
    }
    recalculateTotalDuration()
    saveSnapshot("Add Sticker: $sticker")
  }

  fun addStyledTextClip(text: String, fontStyle: String, textDesign: String, color: Color, atTimeMs: Long, durationMs: Long = 4000L) {
    val newClip = MediaClip(
      id = "text_${System.currentTimeMillis()}",
      type = ClipType.TEXT,
      startTimeMs = atTimeMs,
      durationMs = durationMs,
      color = color,
      title = text,
      fontStyle = fontStyle,
      textDesign = textDesign
    )
    val textTrackExists = tracks.value.any { it.type == TrackType.TEXT }
    if (textTrackExists) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.TEXT) {
          track.copy(clips = track.clips + newClip)
        } else track
      }
    } else {
      val newTrack = MediaTrack(
        id = "track_text_${System.currentTimeMillis()}",
        name = "Text Overlay",
        type = TrackType.TEXT,
        clips = listOf(newClip)
      )
      tracks.value = tracks.value + newTrack
    }
    recalculateTotalDuration()
    saveSnapshot("Add Styled Text")
  }

  /**
   * Set clip playback speed with optical speed curve preset.
   */
  fun setClipSpeed(
    clipId: String,
    newSpeed: Float,
    speedCurve: String = "Standard",
    smoothSlowMo: Boolean = false,
    slowMoQuality: String = "Optical Flow"
  ) {
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val clip = track.clips[index]
        val oldSpeed = clip.speed.coerceAtLeast(0.1f)
        val originalBaseDuration = (clip.durationMs * oldSpeed).toLong().coerceAtLeast(300L)
        val newDuration = (originalBaseDuration / newSpeed.coerceAtLeast(0.1f)).toLong().coerceAtLeast(300L)
        val diff = newDuration - clip.durationMs
        val updatedClips = track.clips.toMutableList()
        updatedClips[index] = clip.copy(
          speed = newSpeed,
          speedCurve = speedCurve,
          durationMs = newDuration,
          smoothSlowMoEnabled = smoothSlowMo,
          smoothSlowMoQuality = slowMoQuality
        )
        for (i in (index + 1) until updatedClips.size) {
          updatedClips[i] = updatedClips[i].copy(startTimeMs = (updatedClips[i].startTimeMs + diff).coerceAtLeast(0L))
        }
        track.copy(clips = updatedClips)
      } else track
    }
    recalculateTotalDuration()
    saveSnapshot("Change Speed to ${newSpeed}x")
  }

  /**
   * Set clip volume (0.0 to 2.0). Automatically updates isMuted if volume is zero.
   */
  fun setClipVolume(clipId: String, newVolume: Float) {
    val clamped = newVolume.coerceIn(0f, 2f)
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(volume = clamped, isMuted = (clamped == 0f))
          } else clip
        }
      )
    }
  }

  /**
   * Toggle mute state for a clip. If muted, volume is set to 0f. If unmuted, restores to 1.0f or previous volume.
   */
  fun toggleClipMute(clipId: String) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            val newMuted = !clip.isMuted
            val newVolume = if (newMuted) 0f else (if (clip.volume <= 0f) 1.0f else clip.volume)
            clip.copy(isMuted = newMuted, volume = newVolume)
          } else clip
        }
      )
    }
    saveSnapshot("Toggle Clip Mute")
  }

  /**
   * Check if all video clips in the project are currently muted.
   */
  fun areAllVideoClipsMuted(): Boolean {
    val videoClips = tracks.value.flatMap { it.clips }.filter { it.type == ClipType.VIDEO }
    return videoClips.isNotEmpty() && videoClips.all { it.isMuted || it.volume <= 0f }
  }

  /**
   * Mute original audio for ALL video clips in the project.
   */
  fun muteAllVideoClips() {
    tracks.value = tracks.value.map { track ->
      if (track.type != TrackType.AUDIO && track.type != TrackType.TEXT) {
        track.copy(
          clips = track.clips.map { clip ->
            if (clip.type == ClipType.VIDEO) clip.copy(isMuted = true, volume = 0f) else clip
          }
        )
      } else track
    }
    saveSnapshot("Mute All Video Clips")
  }

  /**
   * Restore/unmute original audio for ALL video clips in the project.
   */
  fun unmuteAllVideoClips() {
    tracks.value = tracks.value.map { track ->
      if (track.type != TrackType.AUDIO && track.type != TrackType.TEXT) {
        track.copy(
          clips = track.clips.map { clip ->
            if (clip.type == ClipType.VIDEO) {
              clip.copy(isMuted = false, volume = if (clip.volume <= 0f) 1.0f else clip.volume)
            } else clip
          }
        )
      } else track
    }
    saveSnapshot("Unmute All Video Clips")
  }

  /**
   * 1-Tap toggle to mute or unmute all video clips simultaneously.
   */
  fun toggleMuteAllVideoClips() {
    if (areAllVideoClipsMuted()) {
      unmuteAllVideoClips()
    } else {
      muteAllVideoClips()
    }
  }

  /**
   * Set volume across ALL video clips in the project (Apply to All).
   */
  fun applyVolumeToAllVideoClips(newVolume: Float) {
    val clamped = newVolume.coerceIn(0f, 2f)
    val isMuted = (clamped == 0f)
    tracks.value = tracks.value.map { track ->
      if (track.type != TrackType.AUDIO && track.type != TrackType.TEXT) {
        track.copy(
          clips = track.clips.map { clip ->
            if (clip.type == ClipType.VIDEO) {
              clip.copy(volume = clamped, isMuted = isMuted)
            } else clip
          }
        )
      } else track
    }
    saveSnapshot(if (isMuted) "Mute All Video Clips" else "Set All Clips Volume ${(clamped * 100).toInt()}%")
  }

  /**
   * Insert meme SFX or soundboard effect at playhead position.
   */
  fun insertMemeSfx(sfxTitle: String, atTimeMs: Long, durationMs: Long = 1800L) {
    val sfxClip = MediaClip(
      id = "sfx_${System.currentTimeMillis()}",
      type = ClipType.AUDIO,
      startTimeMs = atTimeMs,
      durationMs = durationMs,
      color = Color(0xFFF59E0B),
      title = "🔊 $sfxTitle"
    )
    val hasAudioTrack = tracks.value.any { it.type == TrackType.AUDIO }
    if (hasAudioTrack) {
      tracks.value = tracks.value.map { track ->
        if (track.type == TrackType.AUDIO) track.copy(clips = track.clips + sfxClip) else track
      }
    } else {
      val newTrack = MediaTrack(
        id = "track_audio_${System.currentTimeMillis()}",
        name = "Sound Effects",
        type = TrackType.AUDIO,
        clips = listOf(sfxClip)
      )
      tracks.value = tracks.value + newTrack
    }
    saveSnapshot("Add SFX: $sfxTitle")
  }

  /**
   * Step 22: Move clip along the timeline by updating its startTimeMs.
   */
  fun moveClip(clipId: String, newStartTimeMs: Long) {
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val target = track.clips[index]
        val maxStart = (_totalDurationMs.value - 200L).coerceAtLeast(0L)
        val clampedStart = newStartTimeMs.coerceIn(0L, maxStart)
        val updated = track.clips.toMutableList()
        updated[index] = target.copy(startTimeMs = clampedStart)
        track.copy(clips = updated)
      } else {
        track
      }
    }
  }

  /**
   * Step 22: Trim a clip by updating its startTimeMs and/or durationMs.
   * Enforces a minimum clip duration (300ms) to ensure clips cannot collapse to 0.
   */
  fun trimClip(clipId: String, newStartTimeMs: Long, newDurationMs: Long) {
    tracks.value = tracks.value.map { track ->
      val index = track.clips.indexOfFirst { it.id == clipId }
      if (index >= 0) {
        val target = track.clips[index]
        val minDuration = 300L
        val clampedDuration = newDurationMs.coerceAtLeast(minDuration)
        val maxStart = (_totalDurationMs.value - clampedDuration).coerceAtLeast(0L)
        val clampedStart = newStartTimeMs.coerceIn(0L, maxStart)
        val updated = track.clips.toMutableList()
        updated[index] = target.copy(
          startTimeMs = clampedStart,
          durationMs = clampedDuration
        )
        track.copy(clips = updated)
      } else {
        track
      }
    }
  }

  /**
   * Step 23: Add or update a keyframe for a specific clip and transform property.
   */
  fun setKeyframe(clipId: String, property: String, timeMs: Long, value: Float, easing: String = "Linear") {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            val existingList = clip.transformKeyframes[property] ?: emptyList()
            val filtered = existingList.filterNot { kotlin.math.abs(it.timeMs - timeMs) <= 150L }
            val updatedList = (filtered + Keyframe(timeMs, value, easing)).sortedBy { it.timeMs }
            clip.copy(transformKeyframes = clip.transformKeyframes + (property to updatedList))
          } else {
            clip
          }
        }
      )
    }
    saveSnapshot("Set Keyframe $property")
  }

  /**
   * Step 23: Remove a keyframe for a specific clip and transform property near timeMs.
   */
  fun removeKeyframe(clipId: String, property: String, timeMs: Long) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            val existingList = clip.transformKeyframes[property] ?: emptyList()
            val updatedList = existingList.filterNot { kotlin.math.abs(it.timeMs - timeMs) <= 150L }
            clip.copy(transformKeyframes = clip.transformKeyframes + (property to updatedList))
          } else {
            clip
          }
        }
      )
    }
    saveSnapshot("Remove Keyframe $property")
  }

  /**
   * Set transition effect and duration for a specific clip
   */
  fun setClipTransition(clipId: String, transitionType: String, durationMs: Long = 500L) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(transitionType = transitionType, transitionDurationMs = durationMs)
          } else {
            clip
          }
        }
      )
    }
    saveSnapshot("Set Transition: $transitionType")
  }

  /**
   * Apply transition effect and duration to all visual clips in the project
   */
  fun applyTransitionToAll(transitionType: String, durationMs: Long = 500L) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.type == ClipType.VIDEO || clip.type == ClipType.IMAGE) {
            clip.copy(transitionType = transitionType, transitionDurationMs = durationMs)
          } else {
            clip
          }
        }
      )
    }
    saveSnapshot("Apply Transition To All: $transitionType")
  }

  /**
   * Clear keyframes for a property or all properties of a clip
   */
  fun clearClipKeyframes(clipId: String, property: String? = null) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            if (property != null) {
              clip.copy(transformKeyframes = clip.transformKeyframes - property)
            } else {
              clip.copy(transformKeyframes = emptyMap())
            }
          } else {
            clip
          }
        }
      )
    }
    saveSnapshot("Clear Keyframes")
  }

  /**
   * Apply popular animation presets using keyframes (Ken Burns Zoom, Pop, Pan, Fade, Spin)
   */
  fun applyKeyframePreset(clipId: String, presetName: String) {
    val targetClip = tracks.value.flatMap { it.clips }.firstOrNull { it.id == clipId } ?: return
    val dur = targetClip.durationMs.coerceAtLeast(1000L)
    val mid = dur / 2L

    val newMap = when (presetName) {
      "Slow Zoom In" -> mapOf(
        "Scale" to listOf(
          Keyframe(0L, 1.0f, "Linear"),
          Keyframe(dur, 1.4f, "EaseOut")
        )
      )
      "Pulse Pop" -> mapOf(
        "Scale" to listOf(
          Keyframe(0L, 1.0f, "Linear"),
          Keyframe(mid, 1.35f, "EaseInOut"),
          Keyframe(dur, 1.0f, "EaseOut")
        )
      )
      "Cinematic Pan" -> mapOf(
        "Position X" to listOf(
          Keyframe(0L, -120f, "Linear"),
          Keyframe(dur, 120f, "EaseInOut")
        )
      )
      "Fade In & Out" -> mapOf(
        "Opacity" to listOf(
          Keyframe(0L, 0f, "EaseIn"),
          Keyframe((dur * 0.2f).toLong(), 100f, "Linear"),
          Keyframe((dur * 0.8f).toLong(), 100f, "Linear"),
          Keyframe(dur, 0f, "EaseOut")
        )
      )
      "Spin Entrance" -> mapOf(
        "Rotation" to listOf(
          Keyframe(0L, 0f, "Linear"),
          Keyframe(dur.coerceAtMost(2500L), 360f, "EaseOut")
        ),
        "Scale" to listOf(
          Keyframe(0L, 0.4f, "EaseIn"),
          Keyframe(dur.coerceAtMost(2500L), 1.0f, "EaseOut")
        )
      )
      "Slide In Left" -> mapOf(
        "Position X" to listOf(
          Keyframe(0L, -300f, "Linear"),
          Keyframe(dur.coerceAtMost(1000L), 0f, "EaseOut")
        )
      )
      else -> emptyMap()
    }

    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(transformKeyframes = clip.transformKeyframes + newMap)
          } else {
            clip
          }
        }
      )
    }
    saveSnapshot("Apply Keyframe Preset: $presetName")
  }

  /**
   * Set Chroma Key (Green/Blue Screen Removal) parameters for a clip
   */
  fun setClipChromaKey(
    clipId: String,
    enabled: Boolean,
    color: Long = 0xFF00FF00,
    intensity: Float = 50f,
    shadow: Float = 30f,
    softness: Float = 20f
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(
              chromaKeyEnabled = enabled,
              chromaKeyColor = color,
              chromaIntensity = intensity,
              chromaShadow = shadow,
              chromaSoftness = softness
            )
          } else clip
        }
      )
    }
    saveSnapshot(if (enabled) "Enable Chroma Key" else "Disable Chroma Key")
  }

  /**
   * Set AI Smart Cutout (Foreground Subject Isolation without green screen)
   */
  fun setClipCutout(
    clipId: String,
    enabled: Boolean,
    strokeEffect: String = "None",
    strokeWidth: Float = 4f,
    inverted: Boolean = false,
    bgReplacement: String = "Transparent"
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(
              isCutoutEnabled = enabled,
              cutoutStrokeEffect = strokeEffect,
              cutoutStrokeWidth = strokeWidth,
              cutoutInverted = inverted,
              cutoutBgReplacement = bgReplacement
            )
          } else clip
        }
      )
    }
    saveSnapshot(if (enabled) "Enable AI Cutout: $strokeEffect" else "Disable AI Cutout")
  }

  /**
   * Apply AI Smart Cutout settings to all visual clips on the timeline
   */
  fun applyCutoutToAll(
    enabled: Boolean,
    strokeEffect: String = "None",
    strokeWidth: Float = 4f,
    inverted: Boolean = false,
    bgReplacement: String = "Transparent"
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.type == ClipType.VIDEO || clip.type == ClipType.IMAGE) {
            clip.copy(
              isCutoutEnabled = enabled,
              cutoutStrokeEffect = strokeEffect,
              cutoutStrokeWidth = strokeWidth,
              cutoutInverted = inverted,
              cutoutBgReplacement = bgReplacement
            )
          } else clip
        }
      )
    }
    saveSnapshot("Apply AI Cutout to All Clips")
  }

  /**
   * Freehand Doodle / Neon Pen Stroke Management
   */
  fun addDoodleStroke(stroke: DoodleStroke) {
    doodleStrokes.value = doodleStrokes.value + stroke
    doodleUndoStack.value = emptyList()
    saveSnapshot("Draw ${stroke.brushType} Doodle")
  }

  fun undoLastDoodle() {
    val current = doodleStrokes.value
    if (current.isNotEmpty()) {
      val last = current.last()
      doodleStrokes.value = current.dropLast(1)
      doodleUndoStack.value = doodleUndoStack.value + last
      saveSnapshot("Undo Doodle Stroke")
    }
  }

  fun redoLastDoodle() {
    val redos = doodleUndoStack.value
    if (redos.isNotEmpty()) {
      val last = redos.last()
      doodleUndoStack.value = redos.dropLast(1)
      doodleStrokes.value = doodleStrokes.value + last
      saveSnapshot("Redo Doodle Stroke")
    }
  }

  fun clearAllDoodles() {
    if (doodleStrokes.value.isNotEmpty()) {
      doodleUndoStack.value = emptyList()
      doodleStrokes.value = emptyList()
      saveSnapshot("Clear All Doodles")
    }
  }

  /**
   * Video Collage / Split-Screen Grid Layout Management
   */
  fun setClipCollage(
    clipId: String,
    layout: String,
    borderWidth: Float = 4f,
    borderColor: Long = 0xFFFFFFFF,
    cornerRadius: Float = 8f,
    slots: List<String> = emptyList()
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(
              collageLayout = layout,
              collageBorderWidth = borderWidth,
              collageBorderColor = borderColor,
              collageCornerRadius = cornerRadius,
              collageSlotMedia = if (slots.isNotEmpty()) slots else clip.collageSlotMedia
            )
          } else clip
        }
      )
    }
    saveSnapshot(if (layout != "None") "Apply Video Collage: $layout" else "Remove Collage Grid")
  }

  fun applyCollageToAll(
    layout: String,
    borderWidth: Float = 4f,
    borderColor: Long = 0xFFFFFFFF,
    cornerRadius: Float = 8f
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.type == ClipType.VIDEO || clip.type == ClipType.IMAGE) {
            clip.copy(
              collageLayout = layout,
              collageBorderWidth = borderWidth,
              collageBorderColor = borderColor,
              collageCornerRadius = cornerRadius
            )
          } else clip
        }
      )
    }
    saveSnapshot("Apply Collage Grid to All Clips")
  }

  /**
   * Set Voice Changer / Voice Effects (Chipmunk, Deep Male, Robot, Echo, Noise Reduction)
   */
  fun setClipVoiceEffect(
    clipId: String,
    effect: String,
    pitch: Float = 1.0f,
    noiseReduction: Boolean = false
  ) {
    tracks.value = tracks.value.map { track ->
      track.copy(
        clips = track.clips.map { clip ->
          if (clip.id == clipId) {
            clip.copy(
              voiceEffect = effect,
              voicePitch = pitch,
              noiseReductionEnabled = noiseReduction
            )
          } else clip
        }
      )
    }
    saveSnapshot("Voice FX: $effect")
  }

  /**
   * Toggle between play and pause states.
   */
  fun togglePlayPause() {
    if (_isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  /**
   * Start playback loop.
   */
  fun play() {
    if (_isPlaying.value) return
    _isPlaying.value = true
    startPlaybackLoop()
  }

  /**
   * Pause playback.
   */
  fun pause() {
    _isPlaying.value = false
    playbackJob?.cancel()
    playbackJob = null
  }

  /**
   * Seek to a specific position in milliseconds.
   */
  fun seekTo(positionMs: Long) {
    val clamped = positionMs.coerceIn(0L, _totalDurationMs.value)
    _currentPositionMs.value = clamped
  }

  /**
   * Update position using a normalized 0.0 - 1.0 progress ratio from timeline scroll/drag.
   */
  fun updateProgressRatio(ratio: Float) {
    val clamped = ratio.coerceIn(0f, 1f)
    val targetMs = (_totalDurationMs.value * clamped).toLong()
    _currentPositionMs.value = targetMs
  }

  /**
   * Update the total timeline duration.
   */
  fun setTotalDuration(durationMs: Long) {
    if (durationMs > 0L) {
      _totalDurationMs.value = durationMs
      if (_currentPositionMs.value > durationMs) {
        _currentPositionMs.value = durationMs
      }
    }
  }

  /**
   * Step 21: Set timeline zoom scale with clamping (0.5f to 3.0f)
   */
  fun setTimelineScale(scale: Float) {
    _timelineScale.value = (Math.round(scale * 100f) / 100f).coerceIn(0.5f, 3.0f)
  }

  /**
   * Step 21: Zoom in the timeline (+25%)
   */
  fun zoomIn() {
    setTimelineScale(_timelineScale.value + 0.25f)
  }

  /**
   * Step 21: Zoom out the timeline (-25%)
   */
  fun zoomOut() {
    setTimelineScale(_timelineScale.value - 0.25f)
  }

  /**
   * Step 21: Reset timeline zoom to standard 1.0f (100%)
   */
  fun toggleBeatSync(enabled: Boolean? = null) {
    val target = enabled ?: !isBeatSyncEnabled.value
    isBeatSyncEnabled.value = target
  }

  fun setBeatBpm(bpm: Int) {
    beatBpm.value = bpm
    val totalMs = _totalDurationMs.value.coerceAtLeast(6000L)
    val intervalMs = (60_000.0 / bpm.coerceIn(40, 240)).toLong().coerceAtLeast(200L)
    val newMarkers = mutableListOf<Long>()
    var t = intervalMs
    while (t < totalMs) {
      newMarkers.add(t)
      t += intervalMs
    }
    beatMarkers.value = newMarkers
    isBeatSyncEnabled.value = true
  }

  fun autoDetectBeats(sensitivity: Float = beatSensitivity.value) {
    beatSensitivity.value = sensitivity
    val totalMs = _totalDurationMs.value.coerceAtLeast(6000L)
    val baseInterval = (60_000.0 / 128.0).toLong()
    val step = (baseInterval * (1.5f - sensitivity * 0.5f)).toLong().coerceAtLeast(300L)
    val generated = mutableListOf<Long>()
    var pos = step
    while (pos < totalMs) {
      generated.add(pos)
      pos += step
    }
    beatMarkers.value = generated
    isBeatSyncEnabled.value = true
    saveSnapshot("Auto-Detected ${generated.size} Beats")
  }

  fun addBeatMarkerAtCurrentPosition() {
    val current = _currentPositionMs.value
    val currentList = beatMarkers.value.toMutableList()
    if (!currentList.contains(current)) {
      currentList.add(current)
      currentList.sort()
      beatMarkers.value = currentList
      isBeatSyncEnabled.value = true
    }
  }

  fun removeBeatMarker(timeMs: Long) {
    beatMarkers.value = beatMarkers.value.filter { kotlin.math.abs(it - timeMs) > 100L }
  }

  fun clearBeats() {
    beatMarkers.value = emptyList()
    isBeatSyncEnabled.value = false
  }

  fun splitClipsAtBeats() {
    val beats = beatMarkers.value
    if (beats.isEmpty()) return

    tracks.value = tracks.value.map { track ->
      if (track.type == TrackType.MAIN_VIDEO) {
        val newClips = mutableListOf<MediaClip>()
        for (clip in track.clips) {
          val clipStart = clip.startTimeMs
          val clipEnd = clipStart + clip.durationMs
          val relevantBeats = beats.filter { it > clipStart + 300L && it < clipEnd - 300L }
          if (relevantBeats.isEmpty()) {
            newClips.add(clip)
          } else {
            var currentStart = clipStart
            val allCutPoints = relevantBeats + listOf(clipEnd)
            allCutPoints.forEachIndexed { idx, cutPoint ->
              val segDuration = cutPoint - currentStart
              if (segDuration > 100L) {
                val baseTitle = clip.title.substringBeforeLast('.')
                newClips.add(
                  clip.copy(
                    id = "${clip.id}_beat_${idx}_${System.currentTimeMillis()}",
                    title = "${baseTitle}_Beat${idx + 1}.mp4",
                    startTimeMs = currentStart,
                    durationMs = segDuration
                  )
                )
                currentStart = cutPoint
              }
            }
          }
        }
        track.copy(clips = newClips)
      } else track
    }
    recalculateTotalDuration()
    saveSnapshot("Split Clips at Beats (${beats.size} points)")
  }

  fun setSafeZone(platform: String, show: Boolean = true) {
    safeZonePlatform.value = platform
    showSafeZone.value = show
  }

  fun toggleSafeZone() {
    showSafeZone.value = !showSafeZone.value
  }

  fun setWatermarkEnabled(enabled: Boolean) {
    watermarkEnabled.value = enabled
    saveSnapshot(if (enabled) "Enabled Watermark" else "Removed Watermark")
  }

  fun setWatermarkConfig(text: String, position: String, opacity: Float) {
    watermarkText.value = text
    watermarkPosition.value = position
    watermarkOpacity.value = opacity
    saveSnapshot("Updated Watermark Config")
  }

  fun resetTimelineScale() {
    _timelineScale.value = 1.0f
  }

  /**
   * Restore default demo clips project for previewing and trying out all features.
   */
  fun restoreDemoProject() {
    tracks.value = listOf(
      MediaTrack(
        id = "track_main_video",
        name = "Main Video",
        type = TrackType.MAIN_VIDEO,
        clips = listOf(
          MediaClip(
            id = "clip_vid_1",
            type = ClipType.VIDEO,
            startTimeMs = 0L,
            durationMs = 8500L,
            color = Color(0xFF0284C7),
            title = "Intro_Cinematic_4K.mp4"
          ),
          MediaClip(
            id = "clip_vid_2",
            type = ClipType.VIDEO,
            startTimeMs = 8500L,
            durationMs = 11200L,
            color = Color(0xFF7C3AED),
            title = "AMV_Action_Drop_60fps.mov"
          ),
          MediaClip(
            id = "clip_vid_3",
            type = ClipType.VIDEO,
            startTimeMs = 19700L,
            durationMs = 9800L,
            color = Color(0xFFD97706),
            title = "Outro_Glow_Grade.mp4"
          )
        )
      ),
      MediaTrack(
        id = "track_text_overlay",
        name = "Text Overlay",
        type = TrackType.TEXT,
        clips = listOf(
          MediaClip(
            id = "clip_txt_1",
            type = ClipType.TEXT,
            startTimeMs = 1000L,
            durationMs = 4500L,
            color = Color(0xFFEC4899),
            title = "Epic Cinematic Title"
          )
        )
      ),
      MediaTrack(
        id = "track_audio_bgm",
        name = "Audio Track",
        type = TrackType.AUDIO,
        clips = listOf(
          MediaClip(
            id = "clip_aud_1",
            type = ClipType.AUDIO,
            startTimeMs = 0L,
            durationMs = 28000L,
            color = Color(0xFF10B981),
            title = "Synthwave_Cyber_Beat.mp3"
          )
        )
      )
    )
    selectedClipId.value = "clip_vid_1"
    _currentPositionMs.value = 0L
    recalculateTotalDuration()
    saveSnapshot("Restore Demo Project")
  }

  private fun startPlaybackLoop() {
    playbackJob?.cancel()
    playbackJob = viewModelScope.launch {
      val frameIntervalMs = 50L // ~20 updates per second for smooth state tick
      while (isActive && _isPlaying.value) {
        delay(frameIntervalMs)
        val nextPos = _currentPositionMs.value + frameIntervalMs
        if (nextPos >= _totalDurationMs.value) {
          _currentPositionMs.value = 0L // loop back to start
        } else {
          _currentPositionMs.value = nextPos
        }
      }
    }
  }

  override fun onCleared() {
    super.onCleared()
    playbackJob?.cancel()
  }

  companion object {
    /**
     * Formats milliseconds to standard SMPTE timecode (HH:MM:SS:FF) at 30 fps.
     * e.g., 00:00:04:15
     */
    fun formatTimecode(positionMs: Long, fps: Int = 30): String {
      val totalSeconds = positionMs / 1000
      val hours = totalSeconds / 3600
      val minutes = (totalSeconds % 3600) / 60
      val seconds = totalSeconds % 60
      val remainderMs = positionMs % 1000
      val frames = ((remainderMs / 1000f) * fps).toInt().coerceIn(0, fps - 1)

      return String.format(
        java.util.Locale.US,
        "%02d:%02d:%02d:%02d",
        hours,
        minutes,
        seconds,
        frames
      )
    }
  }
}

/**
 * Step 18: Video Preview Canvas
 *
 * A 16:9 black box simulating the video player that listens directly to [PlaybackViewModel].
 * Features:
 * - 16:9 aspect ratio pitch-black viewport with safe margin guides
 * - Monospace SMPTE timecode overlay ('00:00:00:00') that updates when scrolled/played
 * - Live playback status indicator ("PLAYING" vs "STANDBY")
 * - Connected interactive Play/Pause action
 */
@Composable
fun VideoPreviewCanvas(
  viewModel: PlaybackViewModel,
  modifier: Modifier = Modifier,
  onPickMediaClick: () -> Unit = {},
  onPlayPauseClick: () -> Unit = { viewModel.togglePlayPause() }
) {
  val isPlaying by viewModel.isPlaying.collectAsState()
  val currentPositionMs by viewModel.currentPositionMs.collectAsState()
  val totalDurationMs by viewModel.totalDurationMs.collectAsState()
  val tracks by viewModel.tracks.collectAsState()
  val canvasRatio by viewModel.canvasRatio.collectAsState()
  val canvasBg by viewModel.canvasBackground.collectAsState()
  val activeFilter by viewModel.activeFilter.collectAsState()
  val brightness by viewModel.brightness.collectAsState()
  val contrast by viewModel.contrast.collectAsState()
  val saturation by viewModel.saturation.collectAsState()

  val mainTrack = tracks.firstOrNull { it.type == TrackType.MAIN_VIDEO }
  val activeClip = mainTrack?.clips?.firstOrNull {
    currentPositionMs >= it.startTimeMs && currentPositionMs < (it.startTimeMs + it.durationMs)
  } ?: mainTrack?.clips?.firstOrNull()

  val textTrack = tracks.firstOrNull { it.type == TrackType.TEXT }
  val activeTextClip = textTrack?.clips?.firstOrNull {
    currentPositionMs >= it.startTimeMs && currentPositionMs < (it.startTimeMs + it.durationMs)
  }

  val formattedTimecode = PlaybackViewModel.formatTimecode(currentPositionMs)
  val progress = if (totalDurationMs > 0L) {
    (currentPositionMs.toFloat() / totalDurationMs.toFloat()).coerceIn(0f, 1f)
  } else 0f

  val infiniteTransition = rememberInfiniteTransition(label = "canvas_trans")
  val pulseAlpha by infiniteTransition.animateFloat(
    initialValue = 0.35f,
    targetValue = 0.85f,
    animationSpec = infiniteRepeatable(
      animation = tween(800),
      repeatMode = RepeatMode.Reverse
    ),
    label = "pulse_alpha"
  )
  val animWave by infiniteTransition.animateFloat(
    initialValue = 0.2f,
    targetValue = 1.0f,
    animationSpec = infiniteRepeatable(
      animation = tween(600),
      repeatMode = RepeatMode.Reverse
    ),
    label = "anim_wave"
  )

  val ratioValue = when (canvasRatio) {
    "9:16" -> 9f / 16f
    "1:1" -> 1f / 1f
    "4:5" -> 4f / 5f
    "4:3" -> 4f / 3f
    else -> 16f / 9f
  }

  Box(
    modifier = modifier
      .fillMaxWidth()
      .aspectRatio(ratioValue)
      .clip(RoundedCornerShape(12.dp))
      .then(
        when (canvasBg) {
          "white" -> Modifier.background(Color.White)
          "gradient" -> Modifier.background(Brush.radialGradient(listOf(Color(0xFF1E1B4B), Color(0xFF0F172A))))
          else -> Modifier.background(Color(0xFF000000))
        }
      )
      .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
      .clickable(onClick = onPlayPauseClick)
      .testTag("video_preview_canvas"),
    contentAlignment = Alignment.Center
  ) {
    if (activeClip?.uri != null) {
      if (activeClip.type == ClipType.VIDEO) {
        AndroidView(
          factory = { ctx ->
            VideoView(ctx).apply {
              setVideoURI(Uri.parse(activeClip.uri))
              setOnPreparedListener { mp ->
                mp.isLooping = false
                try {
                  val pitchVal = when (activeClip.voiceEffect) {
                    "Chipmunk" -> 1.75f
                    "Deep Male" -> 0.65f
                    "Robot" -> 0.9f
                    else -> activeClip.voicePitch
                  }
                  mp.playbackParams = mp.playbackParams
                    .setSpeed(activeClip.speed.coerceIn(0.2f, 3.0f))
                    .setPitch(pitchVal.coerceIn(0.5f, 2.0f))
                } catch (_: Exception) { }
                val rawOffset = (currentPositionMs - activeClip.startTimeMs).coerceAtLeast(0L)
                val offset = if (activeClip.isFrozen) {
                  0
                } else if (activeClip.isReversed) {
                  (activeClip.durationMs - rawOffset).coerceIn(0L, activeClip.durationMs).toInt()
                } else {
                  rawOffset.toInt()
                }
                seekTo(offset)
                if (isPlaying && !activeClip.isFrozen) start() else pause()
              }
              setOnCompletionListener {
                viewModel.pause()
              }
            }
          },
          update = { videoView ->
            if (activeClip.isFrozen) {
              if (videoView.isPlaying) videoView.pause()
            } else {
              val rawOffset = (currentPositionMs - activeClip.startTimeMs).coerceAtLeast(0L)
              val offset = if (activeClip.isReversed) {
                (activeClip.durationMs - rawOffset).coerceIn(0L, activeClip.durationMs).toInt()
              } else {
                rawOffset.toInt()
              }
              if (kotlin.math.abs(videoView.currentPosition - offset) > 600) {
                videoView.seekTo(offset)
              }
              if (isPlaying && !videoView.isPlaying) {
                videoView.start()
              } else if (!isPlaying && videoView.isPlaying) {
                videoView.pause()
              }
            }
          },
          modifier = Modifier
            .fillMaxSize()
            .graphicsLayer {
              rotationZ = activeClip.rotation
              scaleX = if (activeClip.isFlippedHorizontal) -1f else 1f
            }
        )
      } else {
        AsyncImage(
          model = activeClip.uri,
          contentDescription = activeClip.title,
          contentScale = ContentScale.Crop,
          modifier = Modifier
            .fillMaxSize()
            .graphicsLayer {
              rotationZ = activeClip.rotation
              scaleX = if (activeClip.isFlippedHorizontal) -1f else 1f
            }
        )
      }
    } else {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.padding(12.dp)
      ) {
        Row(
          horizontalArrangement = Arrangement.spacedBy(4.dp),
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.height(28.dp)
        ) {
          repeat(7) { index ->
            val factor = if (isPlaying) {
              val s = kotlin.math.sin((animWave * 3.14f) + index)
              kotlin.math.abs(s).coerceIn(0.25f, 1f)
            } else 0.35f
            Box(
              modifier = Modifier
                .width(4.dp)
                .height((24 * factor).dp)
                .clip(RoundedCornerShape(2.dp))
                .background(
                  Brush.verticalGradient(
                    listOf(OrangePrimary, WarmPeachAccent)
                  )
                )
            )
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Box(
          modifier = Modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(
              if (isPlaying) Color(0xFF0284C7).copy(alpha = 0.35f)
              else Color(0xFF1E293B).copy(alpha = 0.7f)
            )
            .border(
              width = 1.5.dp,
              brush = Brush.linearGradient(listOf(Color(0xFF38BDF8), Color(0xFFA855F7))),
              shape = CircleShape
            ),
          contentAlignment = Alignment.Center
        ) {
          IconButton(
            onClick = onPlayPauseClick,
            modifier = Modifier.size(48.dp).testTag("btn_canvas_play_pause")
          ) {
            Icon(
              imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
              contentDescription = if (isPlaying) "Pause video playback" else "Play video playback",
              tint = Color.White,
              modifier = Modifier.size(26.dp)
            )
          }
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = if (isPlaying) "Playing • Live VFX Engine" else (activeClip?.title ?: "Video Preview Canvas"),
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White,
          textAlign = TextAlign.Center,
          modifier = Modifier.testTag("video_preview_canvas_status_label")
        )

        Spacer(modifier = Modifier.height(6.dp))

        Surface(
          shape = RoundedCornerShape(16.dp),
          color = Color(0xFFEC4899).copy(alpha = 0.2f),
          border = BorderStroke(1.dp, Color(0xFFEC4899).copy(alpha = 0.7f)),
          onClick = onPickMediaClick,
          modifier = Modifier.testTag("btn_canvas_pick_media")
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = Icons.Default.AddPhotoAlternate,
              contentDescription = null,
              tint = Color(0xFFF472B6),
              modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "Choose Video / Photo from Phone",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          }
        }
      }
    }

    if (activeTextClip != null && activeTextClip.title.isNotEmpty()) {
      val style = activeTextClip.textDesign
      val isHormozi = style == "Hormozi Viral" || style == "Classic"
      val isBeast = style == "Beast Dynamic" || style == "Beast Pop"
      val isMinimal = style == "Cinematic Minimal"
      val isKaraoke = style == "Neon Karaoke" || style == "Karaoke Wave"

      Box(
        modifier = Modifier
          .align(Alignment.BottomCenter)
          .padding(bottom = 44.dp, start = 16.dp, end = 16.dp)
          .then(
            if (isHormozi) {
              Modifier
                .background(Color.Black.copy(alpha = 0.88f), RoundedCornerShape(8.dp))
                .border(1.5.dp, Color(0xFFFACC15), RoundedCornerShape(8.dp))
                .padding(horizontal = 14.dp, vertical = 6.dp)
            } else if (isBeast) {
              Modifier
                .background(Color(0xFF0F172A).copy(alpha = 0.92f), RoundedCornerShape(12.dp))
                .border(2.dp, Color(0xFF22C55E), RoundedCornerShape(12.dp))
                .padding(horizontal = 14.dp, vertical = 6.dp)
            } else if (isKaraoke) {
              Modifier
                .background(Color(0xFF1E1B4B).copy(alpha = 0.9f), RoundedCornerShape(16.dp))
                .border(1.5.dp, Color(0xFF06B6D4), RoundedCornerShape(16.dp))
                .padding(horizontal = 16.dp, vertical = 6.dp)
            } else if (isMinimal) {
              Modifier
                .background(Color.Black.copy(alpha = 0.45f), RoundedCornerShape(4.dp))
                .padding(horizontal = 10.dp, vertical = 4.dp)
            } else {
              Modifier
                .background(Color.Black.copy(alpha = 0.75f), RoundedCornerShape(8.dp))
                .padding(horizontal = 12.dp, vertical = 6.dp)
            }
          )
      ) {
        Text(
          text = if (isHormozi) activeTextClip.title.uppercase() else activeTextClip.title,
          color = if (isHormozi) Color(0xFFFACC15) else if (isBeast) Color(0xFF4ADE80) else if (isKaraoke) Color(0xFF38BDF8) else activeTextClip.color,
          fontSize = if (isHormozi) 17.sp else if (isBeast) 18.sp else 15.sp,
          fontWeight = FontWeight.Black,
          textAlign = TextAlign.Center
        )
      }
    }

    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(12.dp)
        .border(
          width = 0.75.dp,
          color = Color(0xFF38BDF8).copy(alpha = 0.12f),
          shape = RoundedCornerShape(6.dp)
        )
    )

    Row(
      modifier = Modifier.align(Alignment.TopStart).padding(8.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Surface(
        shape = RoundedCornerShape(4.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.85f),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(
            imageVector = Icons.Default.FiberManualRecord,
            contentDescription = null,
            tint = if (isPlaying) Color(0xFFEF4444).copy(alpha = pulseAlpha) else Color(0xFF10B981),
            modifier = Modifier.size(9.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = if (isPlaying) "LIVE REC" else "STANDBY",
            fontFamily = FontFamily.Monospace,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = if (isPlaying) Color(0xFFF87171) else Color(0xFF34D399)
          )
        }
      }
    }

    Row(
      modifier = Modifier.align(Alignment.TopEnd).padding(8.dp),
      horizontalArrangement = Arrangement.spacedBy(4.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      if (activeClip?.isReversed == true) {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xFFEF4444).copy(alpha = 0.85f)
        ) {
          Text(
            text = "◀ REV",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
          )
        }
      }

      if (activeClip?.chromaKeyEnabled == true) {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xFF10B981).copy(alpha = 0.90f)
        ) {
          Text(
            text = "☷ CHROMA KEY",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
          )
        }
      }

      if (activeClip?.isCutoutEnabled == true) {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xFFEC4899).copy(alpha = 0.90f)
        ) {
          Text(
            text = "✂ CUTOUT: ${activeClip.cutoutStrokeEffect.uppercase()}",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
          )
        }
      }

      if (activeClip != null && activeClip.collageLayout != "None") {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xFF3B82F6).copy(alpha = 0.90f)
        ) {
          Text(
            text = "⊞ COLLAGE: ${activeClip.collageLayout}",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
          )
        }
      }

      if (activeClip != null && activeClip.voiceEffect != "None") {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xFF8B5CF6).copy(alpha = 0.90f)
        ) {
          Text(
            text = "♪ ${activeClip.voiceEffect.uppercase()}",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
          )
        }
      }

      if (activeClip?.isFrozen == true) {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xFF0284C7).copy(alpha = 0.85f)
        ) {
          Text(
            text = "❄ FREEZE",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
          )
        }
      }

      if (activeClip != null && activeClip.speed != 1.0f) {
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = OrangePrimary.copy(alpha = 0.85f)
        ) {
          Text(
            text = "${String.format("%.1f", activeClip.speed)}x",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
          )
        }
      }

      Surface(
        shape = RoundedCornerShape(4.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.85f),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
      ) {
        Text(
          text = "$canvasRatio • 60 FPS",
          fontFamily = FontFamily.Monospace,
          fontSize = 9.sp,
          fontWeight = FontWeight.SemiBold,
          color = Color(0xFF38BDF8),
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
        )
      }
    }

    Row(
      modifier = Modifier.align(Alignment.BottomStart).padding(8.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(5.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.92f),
        border = BorderStroke(1.dp, Color(0xFF0284C7).copy(alpha = 0.6f))
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "TC ",
            fontFamily = FontFamily.Monospace,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF38BDF8)
          )
          Text(
            text = formattedTimecode,
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.testTag("preview_timecode_text")
          )
        }
      }
    }

    Row(
      modifier = Modifier.align(Alignment.BottomEnd).padding(8.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(5.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.92f),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
      ) {
        Text(
          text = String.format(
            java.util.Locale.US,
            "%.1fs / %.1fs",
            currentPositionMs / 1000f,
            totalDurationMs / 1000f
          ),
          fontFamily = FontFamily.Monospace,
          fontSize = 9.sp,
          fontWeight = FontWeight.Medium,
          color = Color(0xFF94A3B8),
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
        )
      }
    }

    Box(
      modifier = Modifier
        .fillMaxWidth()
        .height(3.dp)
        .align(Alignment.BottomCenter)
        .background(Color(0xFF1E293B))
    ) {
      Box(
        modifier = Modifier
          .fillMaxWidth(progress)
          .height(3.dp)
          .background(
            Brush.horizontalGradient(
              listOf(Color(0xFF06B6D4), Color(0xFF3B82F6), Color(0xFFA855F7))
            )
          )
      )
    }
  }
}

/**
 * Stateless variant of [VideoPreviewCanvas] for testing and flexible composition.
 */
@Composable
fun VideoPreviewCanvas(
  isPlaying: Boolean,
  currentPositionMs: Long,
  totalDurationMs: Long,
  onPlayPauseClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val formattedTimecode = PlaybackViewModel.formatTimecode(currentPositionMs)
  val progress = if (totalDurationMs > 0L) {
    (currentPositionMs.toFloat() / totalDurationMs.toFloat()).coerceIn(0f, 1f)
  } else 0f

  // Subtle pulsing animation when playing
  val infiniteTransition = rememberInfiniteTransition(label = "pulse_trans")
  val pulseAlpha by infiniteTransition.animateFloat(
    initialValue = 0.35f,
    targetValue = 0.85f,
    animationSpec = infiniteRepeatable(
      animation = tween(800),
      repeatMode = RepeatMode.Reverse
    ),
    label = "pulse_alpha"
  )

  Box(
    modifier = modifier
      .fillMaxWidth()
      .aspectRatio(16f / 9f)
      .clip(RoundedCornerShape(12.dp))
      .background(Color(0xFF000000))
      .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
      .clickable(onClick = onPlayPauseClick)
      .testTag("video_preview_canvas"),
    contentAlignment = Alignment.Center
  ) {
    // 1. Safe Title / Safe Action Guides Overlay (90% & 80% boundary lines)
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(14.dp)
        .border(
          width = 0.75.dp,
          color = Color(0xFF38BDF8).copy(alpha = 0.15f),
          shape = RoundedCornerShape(6.dp)
        )
    )

    // 2. Center Viewport Glyph and Play/Pause Overlay
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center,
      modifier = Modifier.padding(12.dp)
    ) {
      Box(
        modifier = Modifier
          .size(52.dp)
          .clip(CircleShape)
          .background(
            if (isPlaying) Color(0xFF0284C7).copy(alpha = 0.25f)
            else Color(0xFF1E293B).copy(alpha = 0.6f)
          )
          .border(
            width = 1.5.dp,
            brush = Brush.linearGradient(
              listOf(Color(0xFF38BDF8), Color(0xFFA855F7))
            ),
            shape = CircleShape
          ),
        contentAlignment = Alignment.Center
      ) {
        IconButton(
          onClick = onPlayPauseClick,
          modifier = Modifier
            .size(52.dp)
            .testTag("btn_canvas_play_pause")
        ) {
          Icon(
            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
            contentDescription = if (isPlaying) "Pause video playback" else "Play video playback",
            tint = Color.White,
            modifier = Modifier.size(28.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      Text(
        text = if (isPlaying) "Playing • 4K Live Render" else "Video Preview Canvas",
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
        textAlign = TextAlign.Center,
        modifier = Modifier.testTag("video_preview_canvas_status_label")
      )

      Text(
        text = if (isPlaying) "Hardware Accelerated Engine" else "Tap screen or playhead to scrub",
        fontSize = 10.sp,
        color = Color(0xFF94A3B8),
        textAlign = TextAlign.Center
      )
    }

    // 3. Top-Left: Program Monitor Status (with live indicator dot)
    Row(
      modifier = Modifier
        .align(Alignment.TopStart)
        .padding(10.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Surface(
        shape = RoundedCornerShape(4.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.85f),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(
            imageVector = Icons.Default.FiberManualRecord,
            contentDescription = null,
            tint = if (isPlaying) Color(0xFFEF4444).copy(alpha = pulseAlpha) else Color(0xFF10B981),
            modifier = Modifier.size(10.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = if (isPlaying) "LIVE REC" else "STANDBY",
            fontFamily = FontFamily.Monospace,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = if (isPlaying) Color(0xFFF87171) else Color(0xFF34D399)
          )
        }
      }
    }

    // 4. Top-Right: Resolution & Color Profile Badge
    Row(
      modifier = Modifier
        .align(Alignment.TopEnd)
        .padding(10.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(4.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.85f),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
      ) {
        Text(
          text = "3840x2160 • 60 FPS",
          fontFamily = FontFamily.Monospace,
          fontSize = 9.sp,
          fontWeight = FontWeight.SemiBold,
          color = Color(0xFF38BDF8),
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
        )
      }
    }

    // 5. Bottom-Left: Overlaid Mock Timecode Text ('00:00:00:00') that updates when timeline is scrolled
    Row(
      modifier = Modifier
        .align(Alignment.BottomStart)
        .padding(10.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(5.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.92f),
        border = BorderStroke(1.dp, Color(0xFF0284C7).copy(alpha = 0.6f))
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "TC ",
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF38BDF8)
          )
          Text(
            text = formattedTimecode,
            fontFamily = FontFamily.Monospace,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.testTag("preview_timecode_text")
          )
        }
      }
    }

    // 6. Bottom-Right: Playhead Progress & Duration Badge
    Row(
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(10.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(5.dp),
        color = Color(0xFF0B1019).copy(alpha = 0.92f),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
      ) {
        Text(
          text = String.format(
            java.util.Locale.US,
            "%.1fs / %.1fs",
            currentPositionMs / 1000f,
            totalDurationMs / 1000f
          ),
          fontFamily = FontFamily.Monospace,
          fontSize = 10.sp,
          fontWeight = FontWeight.Medium,
          color = Color(0xFF94A3B8),
          modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
        )
      }
    }

    // 7. Bottom Linear Progress Bar
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .height(3.dp)
        .align(Alignment.BottomCenter)
        .background(Color(0xFF1E293B))
    ) {
      Box(
        modifier = Modifier
          .fillMaxWidth(progress)
          .height(3.dp)
          .background(
            Brush.horizontalGradient(
              listOf(Color(0xFF06B6D4), Color(0xFF3B82F6), Color(0xFFA855F7))
            )
          )
      )
    }
  }
}
