package com.example.ui.components

import com.example.billing.ProAccess

import android.net.Uri
import android.widget.VideoView
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.offset
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.IntOffset
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.width
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.asImageBitmap
import com.example.DoodleStroke
import com.example.MediaImportItem
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.automirrored.filled.VolumeOff
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.AspectRatio
import androidx.compose.material.icons.filled.Audiotrack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ClosedCaption
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Crop
import androidx.compose.material.icons.filled.CropFree
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.EmojiEmotions
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.Flip
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.GridOn
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PermMedia
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.RecordVoiceOver
import androidx.compose.material.icons.filled.RotateRight
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SlowMotionVideo
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Wallpaper
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Transform
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
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
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import coil.compose.AsyncImage
import com.example.ClipType
import com.example.Keyframe
import com.example.MediaClip
import com.example.MediaTrack
import com.example.PlaybackViewModel
import com.example.TrackType
import com.example.ui.theme.CreamBackground
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamSurface
import com.example.ui.theme.CreamSurfaceVariant
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangeLight
import com.example.ui.theme.OrangeOnContainer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.WarmMuted
import java.util.Locale

/**
 * VFX Pro Streamlined Studio Workspace:
 * - Clean, distraction-free preview player
 * - Horizontal Storyboard Clip Strip (add, delete, reorder, select clips directly)
 * - 1-tap quick action ribbon (Trim, Split, Speed, Filter, Music, Canvas, Text, Rotate, Flip, Delete)
 * - Smooth integration with the same PlaybackViewModel
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickStudioWorkspace(
  viewModel: PlaybackViewModel,
  clips: List<MediaClip>,
  tracks: List<MediaTrack>,
  selectedClipId: String?,
  isPlaying: Boolean,
  currentPositionMs: Long,
  totalDurationMs: Long,
  canUndo: Boolean,
  canRedo: Boolean,
  onOpenSettings: () -> Unit,
  onOpenMediaPicker: () -> Unit,
  onSwitchToProMode: () -> Unit,
  onExportProject: () -> Unit,
  onBackToHome: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val visualClips = remember(clips) {
    clips.filter { it.type == ClipType.VIDEO || it.type == ClipType.IMAGE || it.type == ClipType.VFX }
  }
  val audioClips = remember(clips) {
    clips.filter { it.type == ClipType.AUDIO }
  }
  val currentTheme by com.example.ui.theme.AppThemeManager.currentTheme.collectAsState()
  val clipUnderPlayhead = remember(visualClips, currentPositionMs) {
    visualClips.firstOrNull {
      currentPositionMs in it.startTimeMs until (it.startTimeMs + it.durationMs)
    } ?: visualClips.firstOrNull {
      currentPositionMs in it.startTimeMs..(it.startTimeMs + it.durationMs)
    } ?: visualClips.lastOrNull { currentPositionMs >= it.startTimeMs }
  }
  val activeClip = remember(selectedClipId, clips, clipUnderPlayhead) {
    clipUnderPlayhead ?: clips.firstOrNull { it.id == selectedClipId } ?: visualClips.firstOrNull()
  }

  val canvasRatio by viewModel.canvasRatio.collectAsState()
  val autoBgBlurEnabled by viewModel.autoBgBlurEnabled.collectAsState()
  val globalBgBlurIntensity by viewModel.globalBgBlurIntensity.collectAsState()
  val activeCaptionStyle by viewModel.activeCaptionStyle.collectAsState()
  val captionStatus by viewModel.captionStatus.collectAsState()
  val doodleStrokes by viewModel.doodleStrokes.collectAsState()
  val beatMarkers by viewModel.beatMarkers.collectAsState()
  val isBeatSyncEnabled by viewModel.isBeatSyncEnabled.collectAsState()
  val beatSensitivity by viewModel.beatSensitivity.collectAsState()
  val beatBpm by viewModel.beatBpm.collectAsState()
  val showSafeZone by viewModel.showSafeZone.collectAsState()
  val safeZonePlatform by viewModel.safeZonePlatform.collectAsState()
  val watermarkEnabled by viewModel.watermarkEnabled.collectAsState()
  val watermarkText by viewModel.watermarkText.collectAsState()
  val watermarkPosition by viewModel.watermarkPosition.collectAsState()
  val watermarkOpacity by viewModel.watermarkOpacity.collectAsState()
  val watermarkLogoUri by viewModel.watermarkLogoUri.collectAsState()
  val isLifetime by ProAccess.isPro.collectAsState()
  val shownWatermark = !isLifetime || watermarkEnabled
  val shownWatermarkText = if (isLifetime) watermarkText else "VFX Pro"
  val shownWatermarkPosition = if (isLifetime) watermarkPosition else "Bottom-Right"
  val shownWatermarkOpacity = if (isLifetime) watermarkOpacity else 0.9f
  val shownWatermarkLogo = if (isLifetime && watermarkEnabled) watermarkLogoUri else null
  val textClips = remember(tracks) {
    tracks.firstOrNull { it.type == TrackType.TEXT }?.clips ?: emptyList()
  }
  var activeSheet by remember { mutableStateOf<QuickSheetType?>(null) }
  var showLifetimeSheet by remember { mutableStateOf(false) }
  var showAddTextDialog by remember { mutableStateOf(false) }
  var showAddMediaPickerSheet by remember { mutableStateOf(false) }
  var showThemePickerSheet by remember { mutableStateOf(false) }
  var audioToReplaceId by remember { mutableStateOf<String?>(null) }
  var selectedAudioClipId by remember { mutableStateOf<String?>(null) }
  val selectedAudioClip = remember(selectedAudioClipId, audioClips) {
    audioClips.firstOrNull { it.id == selectedAudioClipId }
  }

  val context = LocalContext.current

  // Helper to extract clean metadata and accurately detect video vs image
  fun processImportUri(uri: Uri, forcedIsVideo: Boolean? = null): MediaImportItem {
    try {
      context.contentResolver.takePersistableUriPermission(
        uri,
        android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
      )
    } catch (_: Exception) {}

    val mime = try { context.contentResolver.getType(uri) } catch (_: Exception) { null } ?: ""
    val uriStr = uri.toString().lowercase()

    val isVideo = if (forcedIsVideo != null) {
      forcedIsVideo
    } else if (mime.startsWith("video/")) {
      true
    } else if (mime.startsWith("image/")) {
      false
    } else if (uriStr.endsWith(".mp4") || uriStr.endsWith(".mkv") || uriStr.endsWith(".mov") || uriStr.endsWith(".webm") || uriStr.endsWith(".3gp") || uriStr.contains("video")) {
      true
    } else if (uriStr.endsWith(".jpg") || uriStr.endsWith(".jpeg") || uriStr.endsWith(".png") || uriStr.endsWith(".webp") || uriStr.contains("image")) {
      false
    } else {
      try {
        val retriever = android.media.MediaMetadataRetriever()
        retriever.setDataSource(context, uri)
        val hasVideo = retriever.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_HAS_VIDEO)
        retriever.release()
        hasVideo == "yes"
      } catch (_: Exception) {
        false
      }
    }

    var durationMs = if (isVideo) 6000L else 3500L
    if (isVideo) {
      try {
        val retriever = android.media.MediaMetadataRetriever()
        retriever.setDataSource(context, uri)
        val durStr = retriever.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_DURATION)
        if (durStr != null) {
          val parsed = durStr.toLongOrNull()
          if (parsed != null && parsed > 500L) {
            durationMs = parsed
          }
        }
        retriever.release()
      } catch (_: Exception) {}
    }

    val fileName = try {
      context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
        if (cursor.moveToFirst() && nameIndex >= 0) cursor.getString(nameIndex) else null
      }
    } catch (_: Exception) { null } ?: if (isVideo) "Video_${System.currentTimeMillis() % 1000}.mp4" else "Photo_${System.currentTimeMillis() % 1000}.jpg"

    return MediaImportItem(
      uri = uri.toString(),
      title = fileName,
      isVideo = isVideo,
      durationMs = durationMs
    )
  }

  // 1. Pick Videos Only Launcher
  val videoOnlyLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 50)
  ) { uris: List<Uri> ->
    if (uris.isNotEmpty()) {
      val items = uris.map { processImportUri(it, forcedIsVideo = true) }
      viewModel.addMultipleRealClips(items)
    }
  }

  // 2. Pick Photos Only Launcher
  val photoOnlyLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 50)
  ) { uris: List<Uri> ->
    if (uris.isNotEmpty()) {
      val items = uris.map { processImportUri(it, forcedIsVideo = false) }
      viewModel.addMultipleRealClips(items)
    }
  }

  // 3. Pick Both Launcher
  val allMediaLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 50)
  ) { uris: List<Uri> ->
    if (uris.isNotEmpty()) {
      val items = uris.map { processImportUri(it) }
      viewModel.addMultipleRealClips(items)
    }
  }

  // 4. System Documents / File Picker Launcher
  val systemFilesLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.OpenMultipleDocuments()
  ) { uris: List<Uri> ->
    if (uris.isNotEmpty()) {
      val items = uris.map { processImportUri(it) }
      viewModel.addMultipleRealClips(items)
    }
  }

  // Dedicated Audio/Music file picker for selecting audio from phone storage
  val audioLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent()
  ) { uri: Uri? ->
    if (uri != null) {
      val fileName = try {
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
          val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
          if (cursor.moveToFirst() && nameIndex >= 0) cursor.getString(nameIndex) else null
        }
      } catch (_: Exception) { null } ?: "Audio_Track.mp3"
      if (audioToReplaceId != null) {
        viewModel.replaceAudioClip(audioToReplaceId!!, uri.toString(), fileName)
        audioToReplaceId = null
      } else {
        viewModel.addRealAudioClip(uri.toString(), fileName)
      }
      activeSheet = null
    }
  }

  // System Document Audio Picker for MP3, WAV, AAC, M4A, OGG, FLAC
  val audioFilesLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.OpenDocument()
  ) { uri: Uri? ->
    if (uri != null) {
      val fileName = try {
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
          val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
          if (cursor.moveToFirst() && nameIndex >= 0) cursor.getString(nameIndex) else null
        }
      } catch (_: Exception) { null } ?: "Audio_Track.mp3"
      if (audioToReplaceId != null) {
        viewModel.replaceAudioClip(audioToReplaceId!!, uri.toString(), fileName)
        audioToReplaceId = null
      } else {
        viewModel.addRealAudioClip(uri.toString(), fileName)
      }
      activeSheet = null
    }
  }

  // Video to Audio Extraction Launcher
  val videoToAudioExtractLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    if (uri != null) {
      val item = processImportUri(uri, forcedIsVideo = true)
      if (audioToReplaceId != null) {
        viewModel.replaceAudioClip(audioToReplaceId!!, item.uri, "Audio: ${item.title}", item.durationMs)
        audioToReplaceId = null
      } else {
        viewModel.extractAudioFromExternalVideo(item.uri, item.title, item.durationMs)
      }
      activeSheet = null
    }
  }

  // Replace Clip Launcher
  val replaceClipLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    if (uri != null) {
      activeClip?.let { currentClip ->
        val item = processImportUri(uri)
        viewModel.replaceClip(currentClip.id, item.uri, item.title, item.isVideo, item.durationMs)
      }
    }
  }

  // PIP Overlay Launcher
  val pipOverlayLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    if (uri != null) {
      val item = processImportUri(uri)
      viewModel.addPipOverlayClip(item.uri, item.title, item.durationMs, item.isVideo, currentPositionMs)
    }
  }

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(currentTheme.backgroundColor)
      .statusBarsPadding()
      .navigationBarsPadding()
  ) {
    // Synchronized Background Audio Engine for Timeline Audio Tracks (imported music & extracted audio)
    com.example.util.TimelineAudioController(
      tracks = tracks,
      isPlaying = isPlaying,
      currentPositionMs = currentPositionMs
    )

    // 1. Top Bar with Mode Switcher & Quick Actions
    QuickTopBar(
      canUndo = canUndo,
      canRedo = canRedo,
      onUndo = { viewModel.undo() },
      onRedo = { viewModel.redo() },
      onOpenSettings = onOpenSettings,
      onOpenThemePicker = { showThemePickerSheet = true },
      onSwitchToProMode = onSwitchToProMode,
      onExportProject = onExportProject,
      onBackToHome = onBackToHome
    )

    // 2. Video Preview Area with Aspect Ratio & Controls
    BoxWithConstraints(
      modifier = Modifier
        .fillMaxWidth()
        .weight(1f)
        .padding(horizontal = 12.dp, vertical = 6.dp),
      contentAlignment = Alignment.Center
    ) {
      val ratioFloat = when (canvasRatio) {
        "9:16" -> 9f / 16f
        "1:1" -> 1f
        "4:5" -> 4f / 5f
        "3:4" -> 3f / 4f
        "2:3" -> 2f / 3f
        "4:3" -> 4f / 3f
        "21:9" -> 21f / 9f
        else -> 16f / 9f
      }

      val previewModifier = if (maxHeight > 0.dp && maxWidth > 0.dp && (maxWidth / maxHeight) > ratioFloat) {
        Modifier
          .fillMaxHeight()
          .aspectRatio(ratioFloat)
      } else {
        Modifier
          .fillMaxWidth()
          .aspectRatio(ratioFloat)
      }

      QuickPreviewPlayer(
        modifier = previewModifier,
        activeClip = activeClip,
        clips = clips,
        canvasRatio = canvasRatio,
        isPlaying = isPlaying,
        currentPositionMs = currentPositionMs,
        totalDurationMs = totalDurationMs,
        hasVisualClips = visualClips.isNotEmpty(),
        autoBgBlur = autoBgBlurEnabled,
        bgBlurIntensity = if ((activeClip?.bgBlur ?: 0f) > 0f) activeClip!!.bgBlur else globalBgBlurIntensity,
        activeCaptions = textClips,
        captionStyle = activeCaptionStyle,
        doodleStrokes = doodleStrokes,
        beatMarkers = beatMarkers,
        showSafeZone = showSafeZone,
        safeZonePlatform = safeZonePlatform,
        watermarkEnabled = shownWatermark,
        watermarkText = shownWatermarkText,
        watermarkPosition = shownWatermarkPosition,
        watermarkOpacity = shownWatermarkOpacity,
        watermarkLogoUri = shownWatermarkLogo,
        onWatermarkClick = { activeSheet = QuickSheetType.WATERMARK },
        onUpdateTextTransform = { id, dx, dy -> viewModel.updateTextTransform(id, dx, dy) },
        onTogglePlayPause = { viewModel.togglePlayPause() },
        onSeek = { viewModel.seekTo(it) },
        onPickBoth = { allMediaLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)) },
        onPickVideos = { videoOnlyLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)) },
        onPickPhotos = { photoOnlyLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
        onBrowseFiles = { systemFilesLauncher.launch(arrayOf("video/*", "image/*")) },
        onRestoreDemoProject = { viewModel.restoreDemoProject() },
        onToggleClipMute = { clipId -> viewModel.toggleClipMute(clipId) }
      )
    }

    val onRibbonAction: (QuickAction) -> Unit = { action ->
      when (action) {
        QuickAction.TRIM -> activeSheet = QuickSheetType.TRIM
        QuickAction.SPLIT -> {
          if (selectedAudioClip != null) {
            viewModel.splitClipAtPlayhead(selectedAudioClip.id, currentPositionMs)
          } else {
            activeClip?.let {
              viewModel.splitClipAtPlayhead(it.id, currentPositionMs)
            }
          }
        }
        QuickAction.SPEED -> activeSheet = QuickSheetType.SPEED
        QuickAction.DURATION -> activeSheet = QuickSheetType.DURATION
        QuickAction.CROP -> activeSheet = QuickSheetType.CROP
        QuickAction.VOLUME -> activeSheet = QuickSheetType.VOLUME
        QuickAction.MUTE -> {
          val target = selectedAudioClip ?: activeClip
          if (target != null) {
            viewModel.toggleClipMute(target.id)
          }
        }
        QuickAction.MUTE_ALL -> {
          viewModel.toggleMuteAllVideoClips()
        }
        QuickAction.EXTRACT_AUDIO -> {
          activeClip?.let {
            viewModel.extractAudioFromClip(it.id)
          }
        }
        QuickAction.MUSIC -> activeSheet = QuickSheetType.MUSIC
        QuickAction.TEXT -> activeSheet = QuickSheetType.TEXT
        QuickAction.STICKER -> activeSheet = QuickSheetType.STICKER
        QuickAction.EFFECTS -> activeSheet = QuickSheetType.EFFECTS
        QuickAction.BODY_EFFECT -> activeSheet = QuickSheetType.BODY_EFFECT
        QuickAction.MOTION_BLUR -> activeSheet = QuickSheetType.MOTION_BLUR
        QuickAction.FILTER -> activeSheet = QuickSheetType.FILTER
        QuickAction.ENHANCE -> activeSheet = QuickSheetType.ENHANCE
        QuickAction.OVERLAY -> {
          pipOverlayLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo))
        }
        QuickAction.BACKGROUND -> activeSheet = QuickSheetType.BACKGROUND
        QuickAction.CANVAS -> activeSheet = QuickSheetType.CANVAS
        QuickAction.REPLACE -> {
          if (selectedAudioClip != null) {
            audioToReplaceId = selectedAudioClip.id
            audioFilesLauncher.launch(
              arrayOf(
                "audio/*",
                "audio/mpeg",
                "audio/mp3",
                "audio/wav",
                "audio/ogg",
                "audio/aac",
                "audio/x-m4a",
                "audio/flac",
                "*/*"
              )
            )
          } else {
            replaceClipLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo))
          }
        }
        QuickAction.DUPLICATE -> {
          activeClip?.let {
            viewModel.duplicateClip(it.id)
          }
        }
        QuickAction.FREEZE -> {
          activeClip?.let {
            viewModel.freezeFrame(it.id, currentPositionMs)
          }
        }
        QuickAction.CAPTURE -> {
          activeClip?.let {
            viewModel.saveSnapshot("Snapshot Frame Captured at ${formatTimecode(currentPositionMs)}")
          }
        }
        QuickAction.ROTATE -> {
          activeClip?.let {
            val newRot = (it.rotation + 90f) % 360f
            viewModel.setClipRotation(it.id, newRot)
          }
        }
        QuickAction.FLIP -> {
          activeClip?.let {
            viewModel.toggleClipFlip(it.id)
          }
        }
        QuickAction.DELETE -> {
          if (selectedAudioClip != null) {
            viewModel.deleteClip(selectedAudioClip.id)
            selectedAudioClipId = null
          } else {
            activeClip?.let {
              viewModel.deleteClip(it.id)
            }
          }
        }
        QuickAction.TRANSITION -> activeSheet = QuickSheetType.TRANSITION
        QuickAction.KEYFRAME -> activeSheet = QuickSheetType.KEYFRAME
        QuickAction.REVERSE -> {
          activeClip?.let {
            viewModel.reverseClip(it.id)
          }
        }
        QuickAction.CHROMA_KEY -> activeSheet = QuickSheetType.CHROMA_KEY
        QuickAction.VOICE_EFFECTS -> activeSheet = QuickSheetType.VOICE_EFFECTS
        QuickAction.AUTO_CAPTIONS -> activeSheet = QuickSheetType.AUTO_CAPTIONS
        QuickAction.SMART_CUTOUT -> activeSheet = QuickSheetType.SMART_CUTOUT
        QuickAction.DOODLE -> activeSheet = QuickSheetType.DOODLE
        QuickAction.COLLAGE -> activeSheet = QuickSheetType.COLLAGE
        QuickAction.BEAT_SYNC -> activeSheet = QuickSheetType.BEAT_SYNC
        QuickAction.SAFE_ZONE -> activeSheet = QuickSheetType.SAFE_ZONE
        QuickAction.WATERMARK -> activeSheet = QuickSheetType.WATERMARK
      }
    }

    // 3. Sub-preview Transport Controls Row (Screenshot 1: Undo/Redo, Timecode, Center Play/Pause, Split, Keyframe, Fullscreen)
    Surface(
      color = Color(0xFF141414),
      modifier = Modifier.fillMaxWidth()
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 10.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Left: Undo, Redo, and Timecode (e.g. 00:03 / 00:15)
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(3.dp)
        ) {
          IconButton(
            onClick = { viewModel.undo() },
            enabled = canUndo,
            modifier = Modifier.size(32.dp).testTag("btn_transport_undo")
          ) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.Undo,
              contentDescription = "Undo",
              tint = if (canUndo) Color.White else Color(0xFF555555),
              modifier = Modifier.size(18.dp)
            )
          }

          IconButton(
            onClick = { viewModel.redo() },
            enabled = canRedo,
            modifier = Modifier.size(32.dp).testTag("btn_transport_redo")
          ) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.Redo,
              contentDescription = "Redo",
              tint = if (canRedo) Color.White else Color(0xFF555555),
              modifier = Modifier.size(18.dp)
            )
          }

          Spacer(modifier = Modifier.width(2.dp))

          Text(
            text = "${formatTimecode(currentPositionMs)} / ${formatTimecode(totalDurationMs)}",
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color.White.copy(alpha = 0.85f),
            modifier = Modifier.testTag("txt_transport_timecode")
          )
        }

        // Center: Large Play / Pause button
        IconButton(
          onClick = { viewModel.togglePlayPause() },
          modifier = Modifier
            .size(38.dp)
            .testTag("btn_transport_play_pause")
        ) {
          Icon(
            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
            contentDescription = if (isPlaying) "Pause" else "Play",
            tint = Color.White,
            modifier = Modifier.size(28.dp)
          )
        }

        // Right: Split & Keyframe & Fullscreen buttons
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(3.dp)
        ) {
          IconButton(
            onClick = {
              if (selectedAudioClip != null) {
                viewModel.splitClipAtPlayhead(selectedAudioClip.id, currentPositionMs)
              } else {
                activeClip?.let { viewModel.splitClipAtPlayhead(it.id, currentPositionMs) }
              }
            },
            modifier = Modifier.size(32.dp).testTag("btn_transport_split")
          ) {
            Icon(
              imageVector = Icons.Default.ContentCut,
              contentDescription = "Split Clip",
              tint = Color.White.copy(alpha = 0.85f),
              modifier = Modifier.size(18.dp)
            )
          }

          IconButton(
            onClick = { activeSheet = QuickSheetType.KEYFRAME },
            modifier = Modifier.size(32.dp).testTag("btn_transport_keyframe")
          ) {
            Icon(
              imageVector = Icons.Default.Diamond,
              contentDescription = "Keyframes",
              tint = Color.White.copy(alpha = 0.85f),
              modifier = Modifier.size(18.dp)
            )
          }

          IconButton(
            onClick = { viewModel.togglePlayPause() },
            modifier = Modifier.size(32.dp).testTag("btn_transport_fullscreen")
          ) {
            Icon(
              imageVector = Icons.Default.CropFree,
              contentDescription = "Fullscreen Preview",
              tint = Color.White.copy(alpha = 0.85f),
              modifier = Modifier.size(20.dp)
            )
          }
        }
      }
    }

    // 4. Quick Action Ribbon (directly below transport controls, above timeline)
    QuickToolRibbon(
      hasSelectedClip = activeClip != null,
      hasAudioClip = selectedAudioClip != null || audioClips.isNotEmpty(),
      isClipMuted = (selectedAudioClip ?: activeClip)?.isMuted == true,
      areAllClipsMuted = viewModel.areAllVideoClipsMuted(),
      onAction = onRibbonAction
    )

    // 5. Timeline Strip: Horizontal list of clips with '+' button on left
    Surface(
      color = Color(0xFF141414),
      border = BorderStroke(1.dp, Color(0xFF222222)),
      modifier = Modifier.fillMaxWidth()
    ) {
      Column(modifier = Modifier.padding(vertical = 4.dp)) {
        if (activeClip != null) {
          val totalKf = activeClip.transformKeyframes.values.sumOf { it.size }
          val allKfTimes = activeClip.transformKeyframes.values.flatten().map { it.timeMs }.distinct().sorted()
          val isAtAnyKf = allKfTimes.any { kotlin.math.abs(it - currentPositionMs) <= 150L }

          Surface(
            color = Color(0xFF1E1E1E),
            shape = RoundedCornerShape(8.dp),
            border = BorderStroke(1.dp, if (isAtAnyKf) OrangePrimary else Color(0xFF333333)),
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 10.dp, vertical = 2.dp)
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 4.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.clickable { activeSheet = QuickSheetType.KEYFRAME }
              ) {
                Icon(
                  imageVector = Icons.Default.Diamond,
                  contentDescription = null,
                  tint = if (isAtAnyKf) OrangePrimary else Color(0xFF94A3B8),
                  modifier = Modifier.size(15.dp)
                )
                Text(
                  text = if (totalKf > 0) "Keyframe ($totalKf)" else "Keyframe",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = if (isAtAnyKf) OrangePrimary else Color.White
                )
              }

              Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                val prevKf = allKfTimes.lastOrNull { it < currentPositionMs - 100L }
                IconButton(
                  onClick = { prevKf?.let { viewModel.seekTo(it) } },
                  enabled = prevKf != null,
                  modifier = Modifier.size(24.dp)
                ) {
                  Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Prev Keyframe", tint = Color.White, modifier = Modifier.size(12.dp))
                }

                if (isAtAnyKf) {
                  Button(
                    onClick = {
                      listOf("Scale", "Position X", "Position Y", "Opacity", "Rotation").forEach { prop ->
                        viewModel.removeKeyframe(activeClip.id, prop, currentPositionMs)
                      }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                    modifier = Modifier.height(24.dp)
                  ) {
                    Text("- Delete", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
                  }
                } else {
                  Button(
                    onClick = {
                      viewModel.setKeyframe(activeClip.id, "Scale", currentPositionMs, 1.25f)
                      viewModel.setKeyframe(activeClip.id, "Position X", currentPositionMs, 0f)
                      viewModel.setKeyframe(activeClip.id, "Position Y", currentPositionMs, 0f)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                    modifier = Modifier.height(24.dp)
                  ) {
                    Text("+ Add ◆", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
                  }
                }

                val nextKf = allKfTimes.firstOrNull { it > currentPositionMs + 100L }
                IconButton(
                  onClick = { nextKf?.let { viewModel.seekTo(it) } },
                  enabled = nextKf != null,
                  modifier = Modifier.size(24.dp)
                ) {
                  Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Next Keyframe", tint = Color.White, modifier = Modifier.size(12.dp))
                }
              }
            }
          }
        }

        // Timeline Row: Round '+' pink button on left, filmstrip LazyRow on right (Screenshot 1)
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Vibrant circular '+' button
          Surface(
            shape = CircleShape,
            color = currentTheme.primaryColor,
            shadowElevation = 3.dp,
            modifier = Modifier
              .padding(start = 10.dp, end = 6.dp)
              .size(42.dp)
              .clickable { showAddMediaPickerSheet = true }
              .testTag("btn_storyboard_add_media_round")
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Add Media to Timeline",
                tint = Color.Black,
                modifier = Modifier.size(24.dp)
              )
            }
          }

          // Filmstrip LazyRow of clips with Studio amber selection & handles
          LazyRow(
            contentPadding = PaddingValues(end = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(2.dp),
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .weight(1f)
              .testTag("quick_storyboard_row")
          ) {
            // 1-Tap Master Mute Toggle for ALL Video Clips
            item(key = "btn_quick_master_mute_all") {
              val allMuted = viewModel.areAllVideoClipsMuted()
              Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (allMuted) Color(0xFFEF4444) else currentTheme.surfaceRaised,
                border = BorderStroke(
                  width = 1.dp,
                  color = if (allMuted) Color(0xFFFCA5A5) else currentTheme.primaryColor.copy(alpha = 0.5f)
                ),
                modifier = Modifier
                  .width(58.dp)
                  .height(84.dp)
                  .clickable { viewModel.toggleMuteAllVideoClips() }
                  .testTag("btn_master_mute_all_clips")
              ) {
                Column(
                  modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 4.dp, vertical = 6.dp),
                  horizontalAlignment = Alignment.CenterHorizontally,
                  verticalArrangement = Arrangement.SpaceBetween
                ) {
                  Icon(
                    imageVector = if (allMuted) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
                    contentDescription = null,
                    tint = if (allMuted) Color.White else currentTheme.primaryColor,
                    modifier = Modifier.size(20.dp)
                  )
                  Text(
                    text = if (allMuted) "MUTED ALL" else "MUTE ALL\nSOUND",
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                    color = currentTheme.textColor,
                    textAlign = TextAlign.Center,
                    lineHeight = 10.sp
                  )
                }
              }
            }

            visualClips.forEachIndexed { index, clip ->
              if (index > 0) {
                item(key = "trans_${clip.id}") {
                  val hasTrans = clip.transitionType != "None"
                  Box(
                    modifier = Modifier
                      .width(16.dp)
                      .height(84.dp)
                      .clickable {
                        viewModel.selectClip(clip.id)
                        activeSheet = QuickSheetType.TRANSITION
                      }
                      .testTag("btn_transition_connector_$index"),
                    contentAlignment = Alignment.Center
                  ) {
                    Box(
                      modifier = Modifier
                        .width(if (hasTrans) 4.dp else 2.dp)
                        .fillMaxHeight(0.6f)
                        .background(if (hasTrans) currentTheme.primaryColor else Color(0xFF404040), RoundedCornerShape(2.dp))
                    )
                  }
                }
              }

              item(key = "clip_${clip.id}") {
                val isSelected = clip.id == activeClip?.id
                StoryboardClipCard(
                  clip = clip,
                  index = index,
                  isSelected = isSelected,
                  onSelect = { viewModel.selectClip(clip.id) },
                  onDelete = { viewModel.deleteClip(clip.id) },
                  onMoveLeft = if (index > 0) { { viewModel.moveClip(clip.id, -1) } } else null,
                  onMoveRight = if (index < visualClips.size - 1) { { viewModel.moveClip(clip.id, 1) } } else null
                )
              }
            }

            item(key = "add_clip_btn") {
              AddClipButtonCard(onClick = { showAddMediaPickerSheet = true })
            }
          }
        }

        // Multi-Track Layer Visualization (Blue Text, Green Audio, Purple Effects tracks)
        QuickMultiTrackLayerStrip(
          totalDurationMs = totalDurationMs,
          currentPositionMs = currentPositionMs,
          audioClips = audioClips,
          textClips = textClips,
          activeClip = activeClip,
          selectedAudioClipId = selectedAudioClipId,
          onSelectAudioClip = { id ->
            selectedAudioClipId = if (selectedAudioClipId == id) null else id
          },
          onOpenAudio = { activeSheet = QuickSheetType.MUSIC },
          onOpenText = { activeSheet = QuickSheetType.TEXT },
          onOpenEffects = { activeSheet = QuickSheetType.EFFECTS },
          onSeek = { viewModel.seekTo(it) }
        )

        // If an audio clip is selected on the timeline, show prominent Audio Action Bar
        selectedAudioClip?.let { audioClip ->
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = Color(0xFF064E3B),
            border = BorderStroke(1.5.dp, Color(0xFF10B981)),
            modifier = Modifier
              .fillMaxWidth()
              .padding(top = 4.dp)
              .testTag("bar_quick_audio_control")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Surface(shape = CircleShape, color = Color(0xFF10B981), modifier = Modifier.size(22.dp)) {
                  Box(contentAlignment = Alignment.Center) {
                    Text("♪", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                  }
                }
                Spacer(modifier = Modifier.width(6.dp))
                Column {
                  Text(
                    text = audioClip.title,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                  )
                  Text(
                    text = "${formatTimecode(audioClip.durationMs)} • Vol ${(audioClip.volume * 100).toInt()}%",
                    color = Color(0xFF6EE7B7),
                    fontSize = 9.sp
                  )
                }
              }

              Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Button(
                  onClick = {
                    audioToReplaceId = audioClip.id
                    activeSheet = QuickSheetType.MUSIC
                  },
                  colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                  shape = RoundedCornerShape(6.dp),
                  contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                  modifier = Modifier.height(28.dp).testTag("btn_audio_bar_change")
                ) {
                  Icon(Icons.Default.Sync, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
                  Spacer(modifier = Modifier.width(3.dp))
                  Text("Change", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                  onClick = {
                    viewModel.deleteClip(audioClip.id)
                    selectedAudioClipId = null
                  },
                  colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                  shape = RoundedCornerShape(6.dp),
                  contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                  modifier = Modifier.height(28.dp).testTag("btn_audio_bar_delete")
                ) {
                  Icon(Icons.Default.Delete, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
                  Spacer(modifier = Modifier.width(3.dp))
                  Text("Delete", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }

                IconButton(
                  onClick = { selectedAudioClipId = null },
                  modifier = Modifier.size(24.dp)
                ) {
                  Icon(Icons.Default.Close, contentDescription = "Deselect", tint = Color(0xFF94A3B8), modifier = Modifier.size(14.dp))
                }
              }
            }
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(4.dp))
  }

  // Active Bottom Sheets for Quick Edits
  when (activeSheet) {
    QuickSheetType.TRIM -> {
      activeClip?.let { clip ->
        QuickTrimSheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyTrim = { newDurationMs ->
            viewModel.trimClip(clip.id, newDurationMs)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.SPEED -> {
      activeClip?.let { clip ->
        QuickSpeedSheet(
          currentSpeed = clip.speed,
          currentCurve = clip.speedCurve,
          smoothSlowMo = clip.smoothSlowMoEnabled,
          smoothSlowMoQuality = clip.smoothSlowMoQuality,
          onDismiss = { activeSheet = null },
          onApplySpeed = { speed, curve, slowMo, quality ->
            viewModel.setClipSpeed(clip.id, speed, curve, slowMo, quality)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.DURATION -> {
      activeClip?.let { clip ->
        QuickDurationSheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyDuration = { durMs ->
            viewModel.setClipDuration(clip.id, durMs)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.CROP -> {
      activeClip?.let { clip ->
        QuickCropSheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyCrop = { ratio, zoom ->
            viewModel.setClipCrop(clip.id, ratio, zoom)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.FILTER -> {
      activeClip?.let { clip ->
        QuickFilterSheet(
          currentFilter = clip.filterEffect,
          onDismiss = { activeSheet = null },
          onApplyFilter = { filter ->
            viewModel.setClipFilter(clip.id, filter)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.ENHANCE -> {
      activeClip?.let { clip ->
        QuickEnhanceSheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyEnhance = { b, c, s, w ->
            viewModel.setClipEnhance(clip.id, b, c, s, w)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.EFFECTS -> {
      activeClip?.let { clip ->
        QuickEffectsSheet(
          currentEffect = clip.vfxEffect,
          currentIntensity = clip.vfxIntensity,
          currentSpeed = clip.vfxSpeed,
          currentColor = clip.vfxColor,
          currentAtmosphere = clip.vfxAtmosphere,
          onDismiss = { activeSheet = null },
          onApplyEffect = { effect, intensity, speed, color, atmosphere ->
            viewModel.setClipVfxEffect(clip.id, effect, intensity, speed, color, atmosphere)
            activeSheet = null
          },
          onApplyToAll = { effect, intensity, speed, color, atmosphere ->
            viewModel.applyVfxToAll(effect, intensity, speed, color, atmosphere)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.BODY_EFFECT -> {
      activeClip?.let { clip ->
        QuickBodyEffectSheet(
          currentBodyEffect = clip.bodyEffect,
          currentEffectColor = clip.bodyEffectColor,
          currentIntensity = clip.bodyEffectIntensity,
          onDismiss = { activeSheet = null },
          onApplyBodyEffect = { effect, color, intensity ->
            viewModel.setClipBodyEffect(clip.id, effect, color, intensity)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.MOTION_BLUR -> {
      activeClip?.let { clip ->
        QuickMotionBlurSheet(
          motionBlurEnabled = clip.motionBlurEnabled,
          intensity = clip.motionBlurIntensity,
          shutterAngle = clip.motionBlurShutterAngle,
          blendPasses = clip.motionBlurBlendPasses,
          smoothSlowMoEnabled = clip.smoothSlowMoEnabled,
          smoothSlowMoQuality = clip.smoothSlowMoQuality,
          onDismiss = { activeSheet = null },
          onApply = { enabled, intensity, shutterAngle, passes, slowMo, quality ->
            viewModel.setClipMotionBlur(clip.id, enabled, intensity, shutterAngle, passes)
            viewModel.setClipSmoothSlowMo(clip.id, slowMo, quality)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.BACKGROUND -> {
      activeClip?.let { clip ->
        QuickBackgroundSheet(
          clip = clip,
          initialAutoBlur = autoBgBlurEnabled,
          onToggleAutoBlur = { enabled ->
            viewModel.setAutoBgBlur(enabled)
          },
          onDismiss = { activeSheet = null },
          onApplyBackground = { blur, colorHex ->
            viewModel.setClipBackground(clip.id, blur, colorHex)
            viewModel.setCanvasBackground(if (blur > 0f) "blur" else "black")
            viewModel.setGlobalBgBlurIntensity(blur)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.CANVAS -> {
      QuickCanvasSheet(
        currentRatio = canvasRatio,
        autoBlurEnabled = autoBgBlurEnabled,
        blurIntensity = globalBgBlurIntensity,
        onToggleAutoBlur = { enabled ->
          viewModel.setAutoBgBlur(enabled)
        },
        onSelectBlurIntensity = { intensity ->
          viewModel.setGlobalBgBlurIntensity(intensity)
          if (intensity > 0f) {
            viewModel.setAutoBgBlur(true)
            viewModel.setCanvasBackground("blur")
          }
        },
        onDismiss = { activeSheet = null },
        onApplyRatio = { ratio ->
          viewModel.canvasRatio.value = ratio
          activeSheet = null
        }
      )
    }
    QuickSheetType.STICKER -> {
      QuickStickerSheet(
        onDismiss = { activeSheet = null },
        onAddSticker = { sticker ->
          viewModel.addStickerClip(sticker, currentPositionMs)
          activeSheet = null
        }
      )
    }
    QuickSheetType.TEXT -> {
      QuickTextDesignerSheet(
        onDismiss = { activeSheet = null },
        onApplyText = { text, font, style, color ->
          val newClip = MediaClip(
            id = "clip_txt_${System.currentTimeMillis()}",
            type = ClipType.TEXT,
            startTimeMs = currentPositionMs,
            durationMs = 4000L,
            color = color,
            title = text,
            fontStyle = font,
            textDesign = style
          )
          viewModel.addClip(newClip)
          activeSheet = null
        }
      )
    }
    QuickSheetType.MUSIC -> {
      QuickMusicSheet(
        audioClips = audioClips,
        selectedVisualClip = activeClip,
        audioToReplaceId = audioToReplaceId,
        onStartReplacing = { id -> audioToReplaceId = id },
        onCancelReplacing = { audioToReplaceId = null },
        onDismiss = {
          audioToReplaceId = null
          activeSheet = null
        },
        onPickDeviceAudio = {
          audioFilesLauncher.launch(
            arrayOf(
              "audio/*",
              "audio/mpeg",
              "audio/mp3",
              "audio/wav",
              "audio/ogg",
              "audio/aac",
              "audio/x-m4a",
              "audio/flac",
              "*/*"
            )
          )
        },
        onPickVideoToExtractAudio = {
          videoToAudioExtractLauncher.launch(
            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
          )
        },
        onExtractAudio = {
          activeClip?.let {
            viewModel.extractAudioFromClip(it.id)
            audioToReplaceId = null
            activeSheet = null
          }
        },
        onAddPresetMusic = { title, durMs ->
          if (audioToReplaceId != null) {
            viewModel.replaceAudioClip(audioToReplaceId!!, "asset://$title", title, durMs)
            audioToReplaceId = null
          } else {
            viewModel.addRealAudioClip("asset://$title", title)
          }
          activeSheet = null
        },
        onAddSfx = { sfxTitle ->
          if (audioToReplaceId != null) {
            viewModel.replaceAudioClip(audioToReplaceId!!, "sfx://$sfxTitle", sfxTitle, 5000L)
            audioToReplaceId = null
          } else {
            viewModel.insertMemeSfx(sfxTitle, currentPositionMs)
          }
          activeSheet = null
        },
        onSetAudioVolume = { id, vol ->
          viewModel.setClipVolume(id, vol)
        },
        onDeleteAudioClip = { id ->
          if (selectedAudioClipId == id) selectedAudioClipId = null
          if (audioToReplaceId == id) audioToReplaceId = null
          viewModel.deleteClip(id)
        },
        onDeleteAllAudio = {
          selectedAudioClipId = null
          audioToReplaceId = null
          viewModel.deleteAllAudioClips()
        }
      )
    }
    QuickSheetType.VOLUME -> {
      val targetVolumeClip = selectedAudioClip ?: activeClip
      targetVolumeClip?.let { clip ->
        QuickVolumeSheet(
          currentVolume = clip.volume,
          isAudioClip = (clip.type == ClipType.AUDIO),
          areAllVideoClipsMuted = viewModel.areAllVideoClipsMuted(),
          onDismiss = { activeSheet = null },
          onApplyVolume = { vol ->
            viewModel.setClipVolume(clip.id, vol)
            activeSheet = null
          },
          onApplyToAllClips = { vol ->
            viewModel.applyVolumeToAllVideoClips(vol)
            activeSheet = null
          },
          onToggleMuteAllClips = {
            viewModel.toggleMuteAllVideoClips()
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.TRANSITION -> {
      activeClip?.let { clip ->
        QuickTransitionSheet(
          currentTransition = clip.transitionType,
          currentDurationMs = clip.transitionDurationMs,
          onDismiss = { activeSheet = null },
          onApplyTransition = { type, durMs ->
            viewModel.setClipTransition(clip.id, type, durMs)
            activeSheet = null
          },
          onApplyToAll = { type, durMs ->
            viewModel.applyTransitionToAll(type, durMs)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.KEYFRAME -> {
      activeClip?.let { clip ->
        QuickKeyframeSheet(
          clip = clip,
          currentPositionMs = currentPositionMs,
          onDismiss = { activeSheet = null },
          onSetKeyframe = { prop, timeMs, value, easing ->
            viewModel.setKeyframe(clip.id, prop, timeMs, value, easing)
          },
          onRemoveKeyframe = { prop, timeMs ->
            viewModel.removeKeyframe(clip.id, prop, timeMs)
          },
          onApplyPreset = { preset ->
            viewModel.applyKeyframePreset(clip.id, preset)
            activeSheet = null
          },
          onClearKeyframes = { prop ->
            viewModel.clearClipKeyframes(clip.id, prop)
          }
        )
      }
    }
    QuickSheetType.CHROMA_KEY -> {
      activeClip?.let { clip ->
        QuickChromaKeySheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyChromaKey = { enabled, color, intensity, shadow, softness ->
            viewModel.setClipChromaKey(clip.id, enabled, color, intensity, shadow, softness)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.VOICE_EFFECTS -> {
      activeClip?.let { clip ->
        QuickVoiceEffectsSheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyVoiceEffect = { effect, pitch, noiseReduction ->
            viewModel.setClipVoiceEffect(clip.id, effect, pitch, noiseReduction)
            activeSheet = null
          },
          onApplyToAll = { effect, pitch, noiseReduction ->
            clips.forEach { c ->
              viewModel.setClipVoiceEffect(c.id, effect, pitch, noiseReduction)
            }
            activeSheet = null
          },
          onGenerateVoiceover = { text, voiceName, isSpeechToSong, melodyStyle ->
            viewModel.generateAiVoiceover(
              text = text,
              voiceName = voiceName,
              atTimeMs = currentPositionMs,
              isSpeechToSong = isSpeechToSong,
              melodyStyle = melodyStyle
            )
          }
        )
      }
    }
    QuickSheetType.AUTO_CAPTIONS -> {
      val textTrack = tracks.firstOrNull { it.type == TrackType.TEXT }
      val captionClips = textTrack?.clips ?: emptyList()
      QuickAutoCaptionsSheet(
        captions = captionClips,
        activeStyle = activeCaptionStyle,
        totalDurationMs = totalDurationMs,
        onDismiss = { activeSheet = null },
        onGenerateCaptions = { lang, style ->
          viewModel.generateAutoCaptions(language = lang, style = style)
        },
        onUpdateCaptionText = { clipId, text ->
          viewModel.updateCaptionText(clipId, text)
        },
        onRemoveCaption = { clipId ->
          viewModel.removeCaption(clipId)
        },
        onAddCustomCaption = { text, startMs ->
          viewModel.addCustomCaption(text, startMs)
        },
        onApplyStyle = { style ->
          viewModel.setCaptionStyle(style)
        },
        onClearAll = {
          viewModel.clearAutoCaptions()
        },
        statusMessage = captionStatus
      )
    }
    QuickSheetType.SMART_CUTOUT -> {
      activeClip?.let { clip ->
        QuickSmartCutoutSheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyCutout = { enabled, stroke, width, inverted, bg ->
            viewModel.setClipCutout(clip.id, enabled, stroke, width, inverted, bg)
          },
          onApplyToAll = { enabled, stroke, width, inverted, bg ->
            viewModel.applyCutoutToAll(enabled, stroke, width, inverted, bg)
          }
        )
      }
    }
    QuickSheetType.DOODLE -> {
      QuickDoodleSheet(
        doodleStrokes = doodleStrokes,
        onDismiss = { activeSheet = null },
        onAddStroke = { stroke -> viewModel.addDoodleStroke(stroke) },
        onUndo = { viewModel.undoLastDoodle() },
        onRedo = { viewModel.redoLastDoodle() },
        onClear = { viewModel.clearAllDoodles() }
      )
    }
    QuickSheetType.COLLAGE -> {
      activeClip?.let { clip ->
        QuickCollageSheet(
          clip = clip,
          onDismiss = { activeSheet = null },
          onApplyCollage = { layout, width, color, radius ->
            viewModel.setClipCollage(clip.id, layout, width, color, radius)
            activeSheet = null
          },
          onApplyToAll = { layout, width, color, radius ->
            viewModel.applyCollageToAll(layout, width, color, radius)
            activeSheet = null
          }
        )
      }
    }
    QuickSheetType.BEAT_SYNC -> {
      QuickBeatSyncSheet(
        beatMarkers = beatMarkers,
        isBeatSyncEnabled = isBeatSyncEnabled,
        currentBpm = beatBpm,
        sensitivity = beatSensitivity,
        currentPositionMs = currentPositionMs,
        totalDurationMs = totalDurationMs,
        onDismiss = { activeSheet = null },
        onToggleBeatSync = { viewModel.toggleBeatSync(it) },
        onSetBpm = { viewModel.setBeatBpm(it) },
        onAutoDetect = { viewModel.autoDetectBeats(it) },
        onAddBeatAtPlayhead = { viewModel.addBeatMarkerAtCurrentPosition() },
        onClearBeats = { viewModel.clearBeats() },
        onSplitAtBeats = { viewModel.splitClipsAtBeats() }
      )
    }
    QuickSheetType.SAFE_ZONE -> {
      QuickSafeZoneSheet(
        currentPlatform = safeZonePlatform,
        showSafeZone = showSafeZone,
        onDismiss = { activeSheet = null },
        onSelectPlatform = { platform, show ->
          viewModel.setSafeZone(platform, show)
        }
      )
    }
    QuickSheetType.WATERMARK -> {
      QuickWatermarkSheet(
        watermarkEnabled = watermarkEnabled,
        watermarkText = watermarkText,
        watermarkPosition = watermarkPosition,
        watermarkOpacity = watermarkOpacity,
        watermarkLogoUri = watermarkLogoUri,
        isPro = isLifetime,
        onDismiss = { activeSheet = null },
        onSaveConfig = { enabled, text, pos, opacity ->
          viewModel.setWatermarkEnabled(enabled)
          viewModel.setWatermarkConfig(text, pos, opacity)
        },
        onRemoveWatermark = {
          viewModel.setWatermarkEnabled(false)
        },
        onRequestUnlock = {
          activeSheet = null
          showLifetimeSheet = true
        },
        onLogoChange = { viewModel.setWatermarkLogo(it) }
      )
    }
    null -> {}
  }

  if (showLifetimeSheet) {
    LifetimeUnlockSheet(onDismiss = { showLifetimeSheet = false })
  }

  // Add Text Caption Dialog
  if (showAddTextDialog) {
    QuickAddTextDialog(
      onDismiss = { showAddTextDialog = false },
      onAddText = { text ->
        viewModel.addTextOverlay(text)
        showAddTextDialog = false
      }
    )
  }

  // Add Media Options Bottom Sheet
  if (showAddMediaPickerSheet) {
    ModalBottomSheet(
      onDismissRequest = { showAddMediaPickerSheet = false },
      containerColor = currentTheme.surfaceColor,
      contentColor = currentTheme.textColor
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 20.dp, vertical = 8.dp)
          .navigationBarsPadding()
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Add Media to Project",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = currentTheme.textColor
          )
          IconButton(onClick = { showAddMediaPickerSheet = false }) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = currentTheme.textColor.copy(alpha = 0.6f))
          }
        }
        Text(
          text = "Select videos or photos to include on your timeline",
          fontSize = 12.sp,
          color = currentTheme.textColor.copy(alpha = 0.6f)
        )
        Spacer(modifier = Modifier.height(16.dp))

        // 1. Choose Both (Videos & Photos Together) - PRIMARY PROMINENT
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = currentTheme.surfaceRaised),
          border = BorderStroke(1.5.dp, currentTheme.primaryColor),
          onClick = {
            showAddMediaPickerSheet = false
            allMediaLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo))
          },
          modifier = Modifier
            .fillMaxWidth()
            .testTag("btn_sheet_pick_both")
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              shape = CircleShape,
              color = currentTheme.primaryColor,
              modifier = Modifier.size(44.dp)
            ) {
              Box(contentAlignment = Alignment.Center) {
                Icon(Icons.Default.PermMedia, contentDescription = null, tint = Color.Black, modifier = Modifier.size(24.dp))
              }
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
              Text("🌟 Select Videos & Photos Together", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = currentTheme.primaryColor)
              Text("Pick both videos and photos in one single session", fontSize = 11.sp, color = currentTheme.textColor.copy(alpha = 0.75f))
            }
          }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 2. Choose Videos Only
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = currentTheme.surfaceRaised),
          border = BorderStroke(1.dp, currentTheme.sheetBorder),
          onClick = {
            showAddMediaPickerSheet = false
            videoOnlyLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly))
          },
          modifier = Modifier
            .fillMaxWidth()
            .testTag("btn_sheet_pick_videos")
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              shape = CircleShape,
              color = currentTheme.primaryColor.copy(alpha = 0.15f),
              modifier = Modifier.size(42.dp)
            ) {
              Box(contentAlignment = Alignment.Center) {
                Icon(Icons.Default.Movie, contentDescription = null, tint = currentTheme.primaryColor, modifier = Modifier.size(22.dp))
              }
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
              Text("Choose Videos Only", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = currentTheme.textColor)
              Text("Browse recorded clips, reels & camera albums", fontSize = 11.sp, color = currentTheme.textColor.copy(alpha = 0.6f))
            }
          }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 3. Choose Photos Only
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = currentTheme.surfaceRaised),
          border = BorderStroke(1.dp, currentTheme.sheetBorder),
          onClick = {
            showAddMediaPickerSheet = false
            photoOnlyLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
          },
          modifier = Modifier
            .fillMaxWidth()
            .testTag("btn_sheet_pick_photos")
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              shape = CircleShape,
              color = currentTheme.accentColor.copy(alpha = 0.15f),
              modifier = Modifier.size(42.dp)
            ) {
              Box(contentAlignment = Alignment.Center) {
                Icon(Icons.Default.Image, contentDescription = null, tint = currentTheme.accentColor, modifier = Modifier.size(22.dp))
              }
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
              Text("Choose Photos Only", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = currentTheme.textColor)
              Text("Add still photos, slides & wallpaper frames", fontSize = 11.sp, color = currentTheme.textColor.copy(alpha = 0.6f))
            }
          }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 4. Browse Device Storage / Files
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = currentTheme.surfaceRaised),
          border = BorderStroke(1.dp, currentTheme.sheetBorder),
          onClick = {
            showAddMediaPickerSheet = false
            systemFilesLauncher.launch(arrayOf("video/*", "image/*"))
          },
          modifier = Modifier
            .fillMaxWidth()
            .testTag("btn_sheet_pick_storage")
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              shape = CircleShape,
              color = currentTheme.primaryDark.copy(alpha = 0.2f),
              modifier = Modifier.size(42.dp)
            ) {
              Box(contentAlignment = Alignment.Center) {
                Icon(Icons.Default.FolderOpen, contentDescription = null, tint = currentTheme.primaryDark, modifier = Modifier.size(22.dp))
              }
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
              Text("Browse Device Files / Folders", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = currentTheme.textColor)
              Text("Pick from Downloads, WhatsApp, or SD storage", fontSize = 11.sp, color = currentTheme.textColor.copy(alpha = 0.6f))
            }
          }
        }

        Spacer(modifier = Modifier.height(24.dp))
      }
    }
  }

  // 1-Tap Pro Studio Theme Picker Sheet (10 Themes)
  if (showThemePickerSheet) {
    com.example.ui.theme.StudioThemePickerSheet(
      onDismiss = { showThemePickerSheet = false }
    )
  }
}

enum class QuickSheetType {
  TRIM, SPEED, FILTER, CANVAS, MUSIC, VOLUME, DURATION, CROP, ENHANCE, STICKER, TEXT, EFFECTS, BODY_EFFECT, MOTION_BLUR, BACKGROUND, TRANSITION, KEYFRAME, CHROMA_KEY, VOICE_EFFECTS, AUTO_CAPTIONS, SMART_CUTOUT, DOODLE, COLLAGE, BEAT_SYNC, SAFE_ZONE, WATERMARK
}

enum class QuickAction {
  TRIM, SPLIT, SPEED, DURATION, CROP, VOLUME, MUTE, MUTE_ALL, EXTRACT_AUDIO, MUSIC, TEXT, STICKER, EFFECTS, BODY_EFFECT, MOTION_BLUR, FILTER, ENHANCE, OVERLAY, BACKGROUND, CANVAS, REPLACE, DUPLICATE, FREEZE, CAPTURE, ROTATE, FLIP, DELETE, TRANSITION, KEYFRAME, REVERSE, CHROMA_KEY, VOICE_EFFECTS, AUTO_CAPTIONS, SMART_CUTOUT, DOODLE, COLLAGE, BEAT_SYNC, SAFE_ZONE, WATERMARK
}

/**
 * VFX Pro Studio Top Bar:
 * - Pure Dark background
 * - Left: Back arrow '<' and Help '?'
 * - Center: VFX PRO STUDIO brand badge and mode toggle
 * - Right: Settings gear & prominent coral "SAVE" button
 */
@Composable
private fun QuickTopBar(
  canUndo: Boolean,
  canRedo: Boolean,
  onUndo: () -> Unit,
  onRedo: () -> Unit,
  onOpenSettings: () -> Unit,
  onOpenThemePicker: () -> Unit = {},
  onSwitchToProMode: () -> Unit,
  onExportProject: () -> Unit,
  onBackToHome: () -> Unit = {}
) {
  val currentTheme by com.example.ui.theme.AppThemeManager.currentTheme.collectAsState()

  Surface(
    color = currentTheme.surfaceColor,
    border = BorderStroke(1.dp, currentTheme.surfaceRaised),
    modifier = Modifier.fillMaxWidth()
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 8.dp, vertical = 6.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      // Left: Back button to Projects & Help Question Mark
      Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton(
          onClick = onBackToHome,
          modifier = Modifier.size(38.dp).testTag("btn_top_back_to_home")
        ) {
          Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Back to Projects",
            tint = Color.White,
            modifier = Modifier.size(22.dp)
          )
        }

        IconButton(
          onClick = onOpenSettings,
          modifier = Modifier.size(38.dp).testTag("btn_top_help")
        ) {
          Icon(
            imageVector = Icons.Default.Info,
            contentDescription = "Help & Tutorial",
            tint = Color.White.copy(alpha = 0.85f),
            modifier = Modifier.size(20.dp)
          )
        }
      }

      // Center: VFX Pro Studio branding & Pro mode toggle
      Surface(
        shape = RoundedCornerShape(16.dp),
        color = currentTheme.surfaceRaised,
        border = BorderStroke(1.dp, currentTheme.primaryColor.copy(alpha = 0.5f)),
        modifier = Modifier
          .clickable { onSwitchToProMode() }
          .testTag("btn_switch_to_pro")
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "VFX",
            fontSize = 11.sp,
            fontWeight = FontWeight.Black,
            color = Color.White
          )
          Text(
            text = "PRO",
            fontSize = 11.sp,
            fontWeight = FontWeight.Black,
            color = currentTheme.primaryColor
          )
          Spacer(modifier = Modifier.width(5.dp))
          Surface(
            shape = RoundedCornerShape(4.dp),
            color = currentTheme.primaryColor
          ) {
            Text(
              text = "STUDIO",
              fontSize = 8.sp,
              fontWeight = FontWeight.ExtraBold,
              color = Color.Black,
              modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
            )
          }
        }
      }

      // Right: Theme Palette Switcher, Settings gear & prominent Pro Studio "SAVE" Button
      Row(verticalAlignment = Alignment.CenterVertically) {
        // Theme Selector button (10 custom themes)
        IconButton(
          onClick = onOpenThemePicker,
          modifier = Modifier.size(36.dp).testTag("btn_top_theme_picker")
        ) {
          Icon(
            imageVector = Icons.Default.Palette,
            contentDescription = "Change Theme",
            tint = currentTheme.primaryColor,
            modifier = Modifier.size(20.dp)
          )
        }

        IconButton(
          onClick = onOpenSettings,
          modifier = Modifier.size(36.dp).testTag("btn_top_settings")
        ) {
          Icon(
            imageVector = Icons.Default.Settings,
            contentDescription = "Project Settings",
            tint = Color.White.copy(alpha = 0.75f),
            modifier = Modifier.size(18.dp)
          )
        }

        Spacer(modifier = Modifier.width(4.dp))

        // Prominent Theme Primary Pro Studio SAVE button
        Button(
          onClick = onExportProject,
          colors = ButtonDefaults.buttonColors(
            containerColor = currentTheme.primaryColor,
            contentColor = Color.Black
          ),
          shape = RoundedCornerShape(18.dp),
          contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
          elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp),
          modifier = Modifier
            .height(34.dp)
            .testTag("btn_quick_export")
        ) {
          Text(
            text = "SAVE",
            fontSize = 12.sp,
            fontWeight = FontWeight.Black,
            color = Color.Black,
            letterSpacing = 0.5.sp
          )
          Spacer(modifier = Modifier.width(4.dp))
          Surface(
            shape = RoundedCornerShape(4.dp),
            color = Color.Black.copy(alpha = 0.2f)
          ) {
            Text(
              text = "1080P",
              fontSize = 9.sp,
              fontWeight = FontWeight.Bold,
              color = Color.Black,
              modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
            )
          }
        }
      }
    }
  }
}

/**
 * Preview Player Canvas with Aspect Ratio framing, Live Play/Pause, and scrub bar
 */
@Composable
private fun QuickPreviewPlayer(
  activeClip: MediaClip?,
  clips: List<MediaClip>,
  canvasRatio: String,
  isPlaying: Boolean,
  currentPositionMs: Long,
  totalDurationMs: Long,
  hasVisualClips: Boolean,
  autoBgBlur: Boolean = true,
  bgBlurIntensity: Float = 35f,
  activeCaptions: List<MediaClip> = emptyList(),
  captionStyle: String = "Hormozi Viral",
  doodleStrokes: List<DoodleStroke> = emptyList(),
  beatMarkers: List<Long> = emptyList(),
  showSafeZone: Boolean = false,
  safeZonePlatform: String = "Instagram Reels",
  watermarkEnabled: Boolean = true,
  watermarkText: String = "VFX Pro",
  watermarkPosition: String = "Bottom-Right",
  watermarkOpacity: Float = 0.85f,
  watermarkLogoUri: String? = null,
  onWatermarkClick: () -> Unit = {},
  onUpdateTextTransform: (String, Float, Float) -> Unit = { _, _, _ -> },
  onTogglePlayPause: () -> Unit,
  onSeek: (Long) -> Unit,
  onPickBoth: () -> Unit,
  onPickVideos: () -> Unit,
  onPickPhotos: () -> Unit,
  onBrowseFiles: () -> Unit,
  onRestoreDemoProject: () -> Unit = {},
  onToggleClipMute: ((String) -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val ratioFloat = when (canvasRatio) {
    "9:16" -> 9f / 16f
    "1:1" -> 1f
    "4:5" -> 4f / 5f
    "3:4" -> 3f / 4f
    "2:3" -> 2f / 3f
    "4:3" -> 4f / 3f
    "21:9" -> 21f / 9f
    else -> 16f / 9f
  }

  val infiniteTransition = rememberInfiniteTransition(label = "quick_preview_infinite")
  val animWave by infiniteTransition.animateFloat(
    initialValue = 0.2f,
    targetValue = 1.0f,
    animationSpec = infiniteRepeatable(
      animation = tween(650),
      repeatMode = RepeatMode.Reverse
    ),
    label = "preview_wave"
  )
  val pulseGlow by infiniteTransition.animateFloat(
    initialValue = 0.65f,
    targetValue = 1.0f,
    animationSpec = infiniteRepeatable(
      animation = tween(900),
      repeatMode = RepeatMode.Reverse
    ),
    label = "pulse_glow"
  )

  Card(
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = Color.Black),
    border = BorderStroke(1.5.dp, Color(0xFFE2E8F0)),
    modifier = modifier.testTag("quick_preview_card")
  ) {
    Box(modifier = Modifier.fillMaxSize()) {
      val previewAudio = clips.filter { it.type == ClipType.AUDIO && !it.uri.isNullOrBlank() }
      OverlayTimelineAudioPlayer(
        audioClips = previewAudio,
        audioTracksMuted = false,
        isPlaying = isPlaying,
        currentPositionMs = currentPositionMs,
        occupiedVideoUri = activeClip?.uri
      )
      // 1. STUDIO AUTO BACKGROUND BLUR LAYER:
      // Scaled, cropped, frosted blurred background behind the main video
      if (hasVisualClips && activeClip != null) {
        val uri = activeClip.uri ?: ""
        val isRealUri = uri.startsWith("content://") || uri.startsWith("file://") || uri.startsWith("http://") || uri.startsWith("https://")
        val isVideoFormat = activeClip.type == ClipType.VIDEO ||
          uri.endsWith(".mp4", ignoreCase = true) ||
          uri.endsWith(".mov", ignoreCase = true) ||
          uri.endsWith(".mkv", ignoreCase = true) ||
          uri.endsWith(".webm", ignoreCase = true) ||
          uri.contains("video", ignoreCase = true) ||
          activeClip.title.endsWith(".mp4", ignoreCase = true) ||
          activeClip.title.endsWith(".mov", ignoreCase = true)

        val shouldBlur = autoBgBlur || activeClip.bgBlur > 0f
        if (shouldBlur) {
          val blurLevel = if (activeClip.bgBlur > 0f) activeClip.bgBlur else bgBlurIntensity
          Box(
            modifier = Modifier
              .fillMaxSize()
              .graphicsLayer {
                scaleX = 1.45f
                scaleY = 1.45f
                alpha = 0.88f
              }
          ) {
            if (isRealUri) {
              if (isVideoFormat) {
                VideoThumbnailView(
                  uri = uri,
                  modifier = Modifier.fillMaxSize()
                )
              } else {
                AsyncImage(
                  model = uri,
                  contentDescription = null,
                  contentScale = ContentScale.Crop,
                  modifier = Modifier.fillMaxSize()
                )
              }
            } else {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(
                    androidx.compose.ui.graphics.Brush.radialGradient(
                      listOf(
                        activeClip.color.copy(alpha = 0.85f),
                        Color(0xFF0F172A),
                        Color.Black
                      )
                    )
                  )
              )
            }

            // Translucent frosted glass blur tint
            Box(
              modifier = Modifier
                .fillMaxSize()
                .background(
                  Color.Black.copy(
                    alpha = (0.22f + (100f - blurLevel.coerceIn(0f, 100f)) * 0.0035f).coerceIn(0.2f, 0.7f)
                  )
                )
            )
          }
        } else if (activeClip.bgColor != 0L) {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .background(Color(activeClip.bgColor))
          )
        }
      }

      // Visual Media Rendering
      if (hasVisualClips && activeClip != null) {
        val uri = activeClip.uri ?: ""
        val isRealUri = uri.startsWith("content://") || uri.startsWith("file://") || uri.startsWith("http://") || uri.startsWith("https://")
        val isVideoFormat = activeClip.type == ClipType.VIDEO ||
          uri.endsWith(".mp4", ignoreCase = true) ||
          uri.endsWith(".mov", ignoreCase = true) ||
          uri.endsWith(".mkv", ignoreCase = true) ||
          uri.endsWith(".webm", ignoreCase = true) ||
          uri.contains("video", ignoreCase = true) ||
          activeClip.title.endsWith(".mp4", ignoreCase = true) ||
          activeClip.title.endsWith(".mov", ignoreCase = true)

        val kfScale = interpolateKeyframeValue(activeClip.transformKeyframes["Scale"] ?: emptyList(), currentPositionMs, 1.0f)
        val kfPosX = interpolateKeyframeValue(activeClip.transformKeyframes["Position X"] ?: emptyList(), currentPositionMs, 0f)
        val kfPosY = interpolateKeyframeValue(activeClip.transformKeyframes["Position Y"] ?: emptyList(), currentPositionMs, 0f)
        val kfOpacity = (interpolateKeyframeValue(activeClip.transformKeyframes["Opacity"] ?: emptyList(), currentPositionMs, 100f) / 100f).coerceIn(0f, 1f)
        val kfRotation = interpolateKeyframeValue(activeClip.transformKeyframes["Rotation"] ?: emptyList(), currentPositionMs, 0f)

        val relTimeMs = currentPositionMs - activeClip.startTimeMs
        val isTransitionActive = activeClip.transitionType != "None" && relTimeMs in 0L..activeClip.transitionDurationMs
        val transProgress = if (isTransitionActive && activeClip.transitionDurationMs > 0L) {
          (relTimeMs.toFloat() / activeClip.transitionDurationMs).coerceIn(0f, 1f)
        } else {
          1.0f
        }

        val transScale = when (if (isTransitionActive) activeClip.transitionType else "None") {
          "Zoom In" -> 0.35f + (0.65f * transProgress)
          "Spin & Zoom" -> 0.4f + (0.6f * transProgress)
          else -> 1.0f
        }

        val transAlpha = when (if (isTransitionActive) activeClip.transitionType else "None") {
          "Crossfade", "Dissolve", "Zoom In" -> transProgress
          "Fade to Black" -> transProgress
          else -> 1.0f
        }

        val transTranslationX = when (if (isTransitionActive) activeClip.transitionType else "None") {
          "Slide Left", "Whip Pan" -> (1f - transProgress) * 500f
          "Slide Right" -> -(1f - transProgress) * 500f
          "Glitch" -> if (transProgress < 0.85f && (relTimeMs / 60) % 2 == 0L) ((relTimeMs / 60) % 7 - 3) * 4f else 0f
          else -> 0f
        }

        val transRotation = when (if (isTransitionActive) activeClip.transitionType else "None") {
          "Spin & Zoom" -> (1f - transProgress) * 360f
          else -> 0f
        }

        val finalScaleX = (if (activeClip.isFlippedHorizontal) -1f else 1f) * activeClip.cropZoom * kfScale * transScale
        val finalScaleY = activeClip.cropZoom * kfScale * transScale
        val finalTranslationX = kfPosX + transTranslationX
        val finalTranslationY = kfPosY
        val finalAlpha = kfOpacity * transAlpha
        val finalRotation = (activeClip.rotation + kfRotation + transRotation) % 360f

        val previewPitch = when (activeClip.voiceEffect) {
          "Chipmunk" -> 1.6f
          "Deep Male" -> 0.7f
          "Robot" -> 0.85f
          else -> activeClip.voicePitch.coerceIn(0.5f, 2f)
        }

        if (isRealUri && isVideoFormat) {
          Box(modifier = Modifier.fillMaxSize()) {
            TimelineVideoSurface(
              uri = uri,
              isPlaying = isPlaying,
              timelinePositionMs = currentPositionMs,
              clipStartMs = activeClip.startTimeMs,
              clipDurationMs = activeClip.durationMs,
              isReversed = activeClip.isReversed,
              volume = if (activeClip.isMuted) 0f else activeClip.volume,
              speed = activeClip.speed,
              pitch = previewPitch,
              trimStartMs = activeClip.trimStartMs,
              isFrozen = activeClip.isFrozen,
              modifier = Modifier
                .fillMaxSize()
                .clickable { onTogglePlayPause() }
                .graphicsLayer {
                  rotationZ = finalRotation
                  scaleX = finalScaleX
                  scaleY = finalScaleY
                  translationX = finalTranslationX
                  translationY = finalTranslationY
                  alpha = finalAlpha
                }
            )

            if (isTransitionActive && activeClip.transitionType == "Fade to Black") {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(Color.Black.copy(alpha = (1f - transProgress).coerceIn(0f, 1f)))
              )
            }
            if (isTransitionActive && activeClip.transitionType == "Glitch" && (relTimeMs / 70) % 2 == 0L) {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(Color(0x3500FFFF))
              )
            }
          }
        } else if (isRealUri && !isVideoFormat) {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .background(Color.Black),
            contentAlignment = Alignment.Center
          ) {
            AsyncImage(
              model = uri,
              contentDescription = activeClip.title,
              contentScale = ContentScale.Fit,
              colorFilter = computeClipColorFilter(activeClip),
              modifier = Modifier
                .fillMaxSize()
                .clickable { onTogglePlayPause() }
                .graphicsLayer {
                  rotationZ = finalRotation
                  scaleX = finalScaleX
                  scaleY = finalScaleY
                  translationX = finalTranslationX
                  translationY = finalTranslationY
                  alpha = finalAlpha
                }
            )

            if (isTransitionActive && activeClip.transitionType == "Fade to Black") {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(Color.Black.copy(alpha = (1f - transProgress).coerceIn(0f, 1f)))
              )
            }
            if (isTransitionActive && activeClip.transitionType == "Glitch" && (relTimeMs / 70) % 2 == 0L) {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(Color(0x3500FFFF))
              )
            }
          }
        } else {
          // Dynamic Motion Graphics Preview for demo/placeholder clips or fallback
          val clipProgress = if (activeClip.durationMs > 0L) {
            ((currentPositionMs - activeClip.startTimeMs).toFloat() / activeClip.durationMs.toFloat()).coerceIn(0f, 1f)
          } else 0.5f
          val displayProgress = if (activeClip.isReversed) (1f - clipProgress) else clipProgress

          Box(
            modifier = Modifier
              .fillMaxSize()
              .background(
                Brush.radialGradient(
                  listOf(
                    activeClip.color.copy(alpha = 0.85f * pulseGlow),
                    Color(0xFF0F172A),
                    Color(0xFF030712)
                  )
                )
              )
              .clickable { onTogglePlayPause() }
              .graphicsLayer {
                rotationZ = finalRotation
                scaleX = finalScaleX
                scaleY = finalScaleY
                translationX = finalTranslationX
                translationY = finalTranslationY
                alpha = finalAlpha
              },
            contentAlignment = Alignment.Center
          ) {
            // Background studio grid lines
            Column(
              modifier = Modifier.fillMaxSize(),
              verticalArrangement = Arrangement.SpaceEvenly
            ) {
              repeat(5) {
                HorizontalDivider(
                  thickness = 0.5.dp,
                  color = Color.White.copy(alpha = 0.05f)
                )
              }
            }

            // Live Animated Soundwave / Motion Equalizer reacting when playing
            Row(
              horizontalArrangement = Arrangement.spacedBy(4.dp),
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier
                .align(Alignment.Center)
                .padding(bottom = 90.dp)
            ) {
              repeat(15) { idx ->
                val barScale = if (isPlaying) {
                  val sinVal = kotlin.math.sin((animWave * 6.28f) + (idx * 0.45f))
                  kotlin.math.abs(sinVal).coerceIn(0.2f, 1.0f)
                } else {
                  0.35f
                }
                Box(
                  modifier = Modifier
                    .width(3.dp)
                    .height((32 * barScale).dp)
                    .clip(RoundedCornerShape(1.5.dp))
                    .background(
                      Brush.verticalGradient(
                        listOf(Color.White.copy(alpha = 0.9f), activeClip.color)
                      )
                    )
                )
              }
            }

            // Center: Clip Emblem, Title & Tags
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.Center,
              modifier = Modifier.padding(16.dp)
            ) {
              Surface(
                shape = CircleShape,
                color = activeClip.color.copy(alpha = 0.35f),
                border = BorderStroke(2.dp, activeClip.color),
                modifier = Modifier.size(56.dp)
              ) {
                Box(contentAlignment = Alignment.Center) {
                  Icon(
                    imageVector = if (isPlaying) Icons.Default.SlowMotionVideo else Icons.Default.Movie,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(30.dp)
                  )
                }
              }

              Spacer(modifier = Modifier.height(10.dp))

              Text(
                text = activeClip.title.ifEmpty { "Clip ${activeClip.id}" },
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center
              )

              Spacer(modifier = Modifier.height(4.dp))

              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Surface(
                  shape = RoundedCornerShape(4.dp),
                  color = Color.Black.copy(alpha = 0.65f),
                  border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f))
                ) {
                  Text(
                    text = if (isPlaying) "PLAYING • ${(displayProgress * 100).toInt()}%" else "PAUSED",
                    color = if (isPlaying) Color(0xFF34D399) else Color(0xFFFBBF24),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                  )
                }

                Surface(
                  shape = RoundedCornerShape(4.dp),
                  color = Color.Black.copy(alpha = 0.65f),
                  border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f))
                ) {
                  Text(
                    text = "4K • 60 FPS",
                    color = Color(0xFF93C5FD),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                  )
                }

                if (activeClip.isReversed) {
                  Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = Color(0xFFEF4444)
                  ) {
                    Text(
                      text = "◀ REV",
                      color = Color.White,
                      fontSize = 9.sp,
                      fontWeight = FontWeight.Bold,
                      modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                    )
                  }
                }

                if (activeClip.speed != 1.0f) {
                  Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = OrangePrimary
                  ) {
                    Text(
                      text = "${activeClip.speed}x",
                      color = Color.White,
                      fontSize = 9.sp,
                      fontWeight = FontWeight.Bold,
                      modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                    )
                  }
                }
              }
            }

            if (isTransitionActive && activeClip.transitionType == "Fade to Black") {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(Color.Black.copy(alpha = (1f - transProgress).coerceIn(0f, 1f)))
              )
            }
            if (isTransitionActive && activeClip.transitionType == "Glitch" && (relTimeMs / 70) % 2 == 0L) {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(Color(0x3500FFFF))
              )
            }
          }
        }
      } else {
        // Clean empty canvas state when timeline has no clips
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A)),
          contentAlignment = Alignment.Center
        ) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(16.dp)
          ) {
            Surface(
              shape = CircleShape,
              color = OrangeContainer,
              border = BorderStroke(1.5.dp, OrangePrimary),
              modifier = Modifier.size(56.dp)
            ) {
              Box(contentAlignment = Alignment.Center) {
                Icon(
                  imageVector = Icons.Default.Movie,
                  contentDescription = "Add Media",
                  tint = OrangePrimary,
                  modifier = Modifier.size(28.dp)
                )
              }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
              text = "No Clips on Timeline",
              color = Color.White,
              fontSize = 15.sp,
              fontWeight = FontWeight.Bold
            )
            Text(
              text = "Import videos or photos to start editing",
              color = Color(0xFF94A3B8),
              fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(14.dp))
            Button(
              onClick = onPickBoth,
              colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
              shape = RoundedCornerShape(10.dp),
              contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
              modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .testTag("btn_empty_add_both")
            ) {
              Icon(Icons.Default.PermMedia, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color.White)
              Spacer(modifier = Modifier.width(6.dp))
              Text("Select Videos & Photos", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
              horizontalArrangement = Arrangement.spacedBy(8.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              OutlinedButton(
                onClick = onPickVideos,
                shape = RoundedCornerShape(10.dp),
                border = BorderStroke(1.dp, Color(0xFF334155)),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 5.dp),
                modifier = Modifier.testTag("btn_empty_add_videos")
              ) {
                Icon(Icons.Default.Movie, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Videos", fontSize = 11.sp, color = Color.White)
              }
              OutlinedButton(
                onClick = onPickPhotos,
                shape = RoundedCornerShape(10.dp),
                border = BorderStroke(1.dp, Color(0xFF334155)),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 5.dp),
                modifier = Modifier.testTag("btn_empty_add_photos")
              ) {
                Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Photos", fontSize = 11.sp, color = Color.White)
              }
            }
            Spacer(modifier = Modifier.height(6.dp))
            TextButton(
              onClick = onBrowseFiles,
              modifier = Modifier.testTag("btn_empty_browse_files")
            ) {
              Icon(Icons.Default.FolderOpen, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color(0xFF818CF8))
              Spacer(modifier = Modifier.width(4.dp))
              Text("Browse Device Files", fontSize = 11.sp, color = Color(0xFF818CF8), fontWeight = FontWeight.Medium)
            }
            TextButton(
              onClick = onRestoreDemoProject,
              modifier = Modifier.testTag("btn_empty_load_demo")
            ) {
              Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color(0xFF34D399))
              Spacer(modifier = Modifier.width(4.dp))
              Text("Load Sample Project", fontSize = 11.sp, color = Color(0xFF34D399), fontWeight = FontWeight.Medium)
            }
          }
        }
      }

      // Filter & Color Tuning Overlay (applies to VideoView & Image preview)
      val activeFilter = activeClip?.filterEffect
      val warmthTint = activeClip?.warmth ?: 0f
      val brightnessAdj = activeClip?.brightness ?: 0f
      val contrastAdj = activeClip?.contrast ?: 1f

      if ((activeFilter != null && activeFilter != "Normal") || warmthTint != 0f || brightnessAdj != 0f || contrastAdj != 1f) {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(
              when {
                activeFilter in listOf("Warm Glow", "Sunset Amber", "Golden Hour", "Desert Sun", "Honey Haze") -> Color(0x35FF9800)
                activeFilter in listOf("Teal & Orange", "Cinema Gold") -> Color(0x2800E5FF)
                activeFilter in listOf("Cyberpunk", "Neon Violet", "Ultraviolet", "Soft Dream") -> Color(0x38E040FB)
                activeFilter in listOf("B&W Retro", "Monochrome Punch", "Film Noir") -> Color(0x5A000000)
                activeFilter in listOf("Silver Tone", "Matte Charcoal") -> Color(0x451E293B)
                activeFilter in listOf("Vintage Film", "Vintage Sepia", "Old 8mm") -> Color(0x35795548)
                activeFilter in listOf("VHS 1980s", "35mm Grain", "Super 8") -> Color(0x2810B981)
                activeFilter in listOf("Tokyo Pastel", "Candy Pop", "Hollywood Glam") -> Color(0x28F472B6)
                activeFilter in listOf("Emerald Boost", "Mint Glow", "Fuji Clean") -> Color(0x2810B981)
                activeFilter in listOf("Vivid Sun", "Dune Warmth", "Kodachrome", "Lomo Retro") -> Color(0x32F59E0B)
                activeFilter in listOf("Nordic Frost") -> Color(0x250284C7)
                activeFilter in listOf("Polaroid 1990") -> Color(0x2DFDE68A)
                activeFilter in listOf("Matrix Green") -> Color(0x3015803D)
                activeFilter in listOf("Bleach Bypass") -> Color(0x2B94A3B8)
                warmthTint > 0f -> Color(0xFFFF9800).copy(alpha = (warmthTint / 100f * 0.25f).coerceIn(0f, 0.35f))
                warmthTint < 0f -> Color(0xFF00B0FF).copy(alpha = ((-warmthTint) / 100f * 0.25f).coerceIn(0f, 0.35f))
                brightnessAdj > 0f -> Color.White.copy(alpha = (brightnessAdj / 100f * 0.3f).coerceIn(0f, 0.4f))
                brightnessAdj < 0f -> Color.Black.copy(alpha = ((-brightnessAdj) / 100f * 0.4f).coerceIn(0f, 0.5f))
                contrastAdj < 1f -> Color.Gray.copy(alpha = ((1f - contrastAdj) * 0.3f).coerceIn(0f, 0.4f))
                else -> Color.Transparent
              }
            )
        )
      }

      // AI Body Tracking Overlay (Glowing Halo, Angel/Cyber Wings, Lightning Stroke, Aura, Laser Eyes)
      if (activeClip?.bodyEffect != null && activeClip.bodyEffect != "None") {
        val effectName = activeClip.bodyEffect
        val effectColor = Color(activeClip.bodyEffectColor)
        val effectIntensity = activeClip.bodyEffectIntensity.coerceIn(0.2f, 1f)

        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
          val w = size.width
          val h = size.height

          when (effectName) {
            "Glowing Halo" -> {
              val haloCenter = androidx.compose.ui.geometry.Offset(w * 0.5f, h * 0.22f)
              val haloRadiusX = w * 0.22f
              val haloRadiusY = h * 0.045f

              drawOval(
                color = effectColor.copy(alpha = 0.35f * effectIntensity),
                topLeft = androidx.compose.ui.geometry.Offset(haloCenter.x - haloRadiusX - 10f, haloCenter.y - haloRadiusY - 8f),
                size = androidx.compose.ui.geometry.Size((haloRadiusX + 10f) * 2f, (haloRadiusY + 8f) * 2f),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 16f)
              )
              drawOval(
                color = effectColor.copy(alpha = 0.95f * effectIntensity),
                topLeft = androidx.compose.ui.geometry.Offset(haloCenter.x - haloRadiusX, haloCenter.y - haloRadiusY),
                size = androidx.compose.ui.geometry.Size(haloRadiusX * 2f, haloRadiusY * 2f),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 6f)
              )
              drawLine(
                brush = Brush.verticalGradient(
                  listOf(effectColor.copy(alpha = 0.4f * effectIntensity), Color.Transparent),
                  startY = haloCenter.y,
                  endY = h * 0.6f
                ),
                start = androidx.compose.ui.geometry.Offset(w * 0.5f, haloCenter.y),
                end = androidx.compose.ui.geometry.Offset(w * 0.5f, h * 0.6f),
                strokeWidth = 12f
              )
            }
            "Angel Wings", "Cyber Wings" -> {
              val isCyber = effectName == "Cyber Wings"
              val strokeW = if (isCyber) 5.5f else 4f
              val leftPath = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.42f, h * 0.48f)
                cubicTo(w * 0.30f, h * 0.32f, w * 0.12f, h * 0.28f, w * 0.05f, h * 0.36f)
                cubicTo(w * 0.14f, h * 0.44f, w * 0.18f, h * 0.54f, w * 0.38f, h * 0.60f)
                close()
              }
              val leftFeather2 = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.40f, h * 0.52f)
                cubicTo(w * 0.25f, h * 0.42f, w * 0.10f, h * 0.45f, w * 0.08f, h * 0.52f)
                cubicTo(w * 0.16f, h * 0.58f, w * 0.26f, h * 0.62f, w * 0.36f, h * 0.65f)
                close()
              }
              val rightPath = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.58f, h * 0.48f)
                cubicTo(w * 0.70f, h * 0.32f, w * 0.88f, h * 0.28f, w * 0.95f, h * 0.36f)
                cubicTo(w * 0.86f, h * 0.44f, w * 0.82f, h * 0.54f, w * 0.62f, h * 0.60f)
                close()
              }
              val rightFeather2 = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.60f, h * 0.52f)
                cubicTo(w * 0.75f, h * 0.42f, w * 0.90f, h * 0.45f, w * 0.92f, h * 0.52f)
                cubicTo(w * 0.84f, h * 0.58f, w * 0.74f, h * 0.62f, w * 0.64f, h * 0.65f)
                close()
              }

              drawPath(leftPath, color = effectColor.copy(alpha = 0.25f * effectIntensity))
              drawPath(leftPath, color = effectColor.copy(alpha = 0.9f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeW))
              drawPath(leftFeather2, color = effectColor.copy(alpha = 0.2f * effectIntensity))
              drawPath(leftFeather2, color = effectColor.copy(alpha = 0.85f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeW * 0.8f))

              drawPath(rightPath, color = effectColor.copy(alpha = 0.25f * effectIntensity))
              drawPath(rightPath, color = effectColor.copy(alpha = 0.9f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeW))
              drawPath(rightFeather2, color = effectColor.copy(alpha = 0.2f * effectIntensity))
              drawPath(rightFeather2, color = effectColor.copy(alpha = 0.85f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeW * 0.8f))
            }
            "Lightning Stroke", "Thunder Bolt" -> {
              val lightningPath = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.48f, h * 0.15f)
                lineTo(w * 0.42f, h * 0.28f)
                lineTo(w * 0.52f, h * 0.35f)
                lineTo(w * 0.38f, h * 0.48f)
                lineTo(w * 0.46f, h * 0.55f)
                lineTo(w * 0.32f, h * 0.72f)
                lineTo(w * 0.40f, h * 0.76f)
                lineTo(w * 0.26f, h * 0.92f)
              }
              val branch2 = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.52f, h * 0.35f)
                lineTo(w * 0.64f, h * 0.42f)
                lineTo(w * 0.58f, h * 0.52f)
                lineTo(w * 0.72f, h * 0.65f)
                lineTo(w * 0.62f, h * 0.75f)
                lineTo(w * 0.75f, h * 0.88f)
              }
              drawPath(lightningPath, color = effectColor.copy(alpha = 0.4f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = 14f))
              drawPath(lightningPath, color = Color.White.copy(alpha = 0.95f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = 4f))
              drawPath(branch2, color = effectColor.copy(alpha = 0.4f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = 10f))
              drawPath(branch2, color = Color.White.copy(alpha = 0.95f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = 3f))
            }
            "Laser Eyes" -> {
              val eyeLeft = androidx.compose.ui.geometry.Offset(w * 0.43f, h * 0.35f)
              val eyeRight = androidx.compose.ui.geometry.Offset(w * 0.57f, h * 0.35f)
              drawLine(
                color = effectColor.copy(alpha = 0.5f * effectIntensity),
                start = eyeLeft,
                end = androidx.compose.ui.geometry.Offset(0f, h * 0.65f),
                strokeWidth = 14f
              )
              drawLine(
                color = Color.White.copy(alpha = 0.95f * effectIntensity),
                start = eyeLeft,
                end = androidx.compose.ui.geometry.Offset(0f, h * 0.65f),
                strokeWidth = 4f
              )
              drawLine(
                color = effectColor.copy(alpha = 0.5f * effectIntensity),
                start = eyeRight,
                end = androidx.compose.ui.geometry.Offset(w, h * 0.65f),
                strokeWidth = 14f
              )
              drawLine(
                color = Color.White.copy(alpha = 0.95f * effectIntensity),
                start = eyeRight,
                end = androidx.compose.ui.geometry.Offset(w, h * 0.65f),
                strokeWidth = 4f
              )
              drawCircle(effectColor.copy(alpha = 0.8f * effectIntensity), radius = 12f, center = eyeLeft)
              drawCircle(Color.White, radius = 6f, center = eyeLeft)
              drawCircle(effectColor.copy(alpha = 0.8f * effectIntensity), radius = 12f, center = eyeRight)
              drawCircle(Color.White, radius = 6f, center = eyeRight)
            }
            "Super Saiyan Aura" -> {
              val auraPath = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.25f, h * 0.85f)
                lineTo(w * 0.28f, h * 0.60f)
                lineTo(w * 0.22f, h * 0.50f)
                lineTo(w * 0.32f, h * 0.40f)
                lineTo(w * 0.28f, h * 0.25f)
                lineTo(w * 0.45f, h * 0.16f)
                lineTo(w * 0.50f, h * 0.10f)
                lineTo(w * 0.55f, h * 0.16f)
                lineTo(w * 0.72f, h * 0.25f)
                lineTo(w * 0.68f, h * 0.40f)
                lineTo(w * 0.78f, h * 0.50f)
                lineTo(w * 0.72f, h * 0.60f)
                lineTo(w * 0.75f, h * 0.85f)
                close()
              }
              drawPath(
                auraPath,
                brush = Brush.verticalGradient(
                  listOf(effectColor.copy(alpha = 0.65f * effectIntensity), effectColor.copy(alpha = 0.15f * effectIntensity)),
                  startY = h * 0.10f,
                  endY = h * 0.85f
                )
              )
              drawPath(auraPath, color = effectColor.copy(alpha = 0.9f * effectIntensity), style = androidx.compose.ui.graphics.drawscope.Stroke(width = 6f))
            }
            "Ghost Clone Trail" -> {
              drawRect(
                color = Color(0xFFFF007F).copy(alpha = 0.25f * effectIntensity),
                topLeft = androidx.compose.ui.geometry.Offset(w * 0.28f, h * 0.22f),
                size = androidx.compose.ui.geometry.Size(w * 0.44f, h * 0.60f),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 4f)
              )
              drawRect(
                color = Color(0xFF00E5FF).copy(alpha = 0.35f * effectIntensity),
                topLeft = androidx.compose.ui.geometry.Offset(w * 0.24f, h * 0.18f),
                size = androidx.compose.ui.geometry.Size(w * 0.44f, h * 0.60f),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 4f)
              )
            }
            "Cyber Edge" -> {
              val bSize = 30f
              val bW = 5f
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.2f), androidx.compose.ui.geometry.Offset(w * 0.2f + bSize, h * 0.2f), bW)
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.2f), androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.2f + bSize), bW)
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.8f, h * 0.2f), androidx.compose.ui.geometry.Offset(w * 0.8f - bSize, h * 0.2f), bW)
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.8f, h * 0.2f), androidx.compose.ui.geometry.Offset(w * 0.8f, h * 0.2f + bSize), bW)
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.8f), androidx.compose.ui.geometry.Offset(w * 0.2f + bSize, h * 0.8f), bW)
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.8f), androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.8f - bSize), bW)
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.8f, h * 0.8f), androidx.compose.ui.geometry.Offset(w * 0.8f - bSize, h * 0.8f), bW)
              drawLine(effectColor, androidx.compose.ui.geometry.Offset(w * 0.8f, h * 0.8f), androidx.compose.ui.geometry.Offset(w * 0.8f, h * 0.8f - bSize), bW)
            }
            "Cosmic Nebula" -> {
              drawCircle(
                brush = Brush.radialGradient(
                  listOf(effectColor.copy(alpha = 0.5f * effectIntensity), Color.Transparent),
                  center = androidx.compose.ui.geometry.Offset(w * 0.5f, h * 0.45f),
                  radius = w * 0.5f
                ),
                radius = w * 0.5f,
                center = androidx.compose.ui.geometry.Offset(w * 0.5f, h * 0.45f)
              )
            }
            else -> {
              drawRoundRect(
                color = effectColor.copy(alpha = 0.85f * effectIntensity),
                topLeft = androidx.compose.ui.geometry.Offset(w * 0.22f, h * 0.16f),
                size = androidx.compose.ui.geometry.Size(w * 0.56f, h * 0.68f),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(24f, 24f),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 6f)
              )
            }
          }
        }
      }

      // Optical Flow Smooth Slow-Mo & Motion Blur Overlay
      if (activeClip?.smoothSlowMoEnabled == true || activeClip?.motionBlurEnabled == true) {
        val hasSlowMo = activeClip.smoothSlowMoEnabled
        val hasBlur = activeClip.motionBlurEnabled
        val blurAlpha = if (hasBlur) (activeClip.motionBlurIntensity / 100f * 0.35f).coerceIn(0.05f, 0.45f) else 0.15f

        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
          val w = size.width
          val h = size.height

          if (hasSlowMo) {
            drawRect(
              brush = Brush.radialGradient(
                listOf(Color(0x180284C7), Color(0x300284C7), Color.Transparent),
                center = androidx.compose.ui.geometry.Offset(w * 0.5f, h * 0.5f),
                radius = w * 0.7f
              )
            )
          }

          if (hasBlur) {
            val passes = activeClip.motionBlurBlendPasses.coerceIn(2, 6)
            val spread = (activeClip.motionBlurShutterAngle / 180f) * 12f
            for (p in 1..passes) {
              val offset = (p - passes / 2f) * spread
              drawLine(
                color = Color.White.copy(alpha = blurAlpha / passes),
                start = androidx.compose.ui.geometry.Offset(0f, (h * (p / (passes + 1f)) + offset).coerceIn(0f, h)),
                end = androidx.compose.ui.geometry.Offset(w, (h * (p / (passes + 1f)) + offset).coerceIn(0f, h)),
                strokeWidth = spread * 2f
              )
            }
          }
        }
      }

      // VFX Effects Overlay (68+ dynamic GPU shaders)
      if (activeClip?.vfxEffect != null && activeClip.vfxEffect != "None") {
        val effect = activeClip.vfxEffect
        val vfxIntensity = activeClip.vfxIntensity.coerceIn(0.1f, 1f)
        val vfxColor = Color(activeClip.vfxColor)
        val effAlpha = (0.28f * vfxIntensity).coerceIn(0.05f, 0.75f)

        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(
              when (effect) {
                "Glitch RGB", "RGB Split Shift" -> Color(0xFFFF0055).copy(alpha = effAlpha)
                "White Strobe", "Optical Flash" -> if (animWave > 0.6f) Color.White.copy(alpha = 0.5f * vfxIntensity) else Color.Transparent
                "Camera Shake", "Action Impact Blast" -> Color(0xFFEF4444).copy(alpha = effAlpha)
                "Zoom Blur", "Blur Fade Reveal" -> Color(0xFF3B82F6).copy(alpha = effAlpha)
                "Sparkles", "Cosmic Stardust" -> Color(0xFFFBBF24).copy(alpha = effAlpha)
                "VHS 1980s", "Super 8 Dust", "90s Camcorder" -> Color(0xFF10B981).copy(alpha = effAlpha)
                "Film Grain", "Vintage 8mm", "Polaroid Fade" -> Color(0xFF78350F).copy(alpha = effAlpha)
                "Retro TV Noise", "TV CRT Scan", "Bad Signal Jammer" -> Color(0xFF64748B).copy(alpha = effAlpha)
                "Matrix Glow", "Night Vision Gen-3" -> Color(0xFF22C55E).copy(alpha = effAlpha)
                "Lens Flare", "Golden Hour Ray", "Light Leak 70s" -> Color(0xFFF59E0B).copy(alpha = effAlpha)
                "Neon Bloom", "Cyber Laser Beams", "Neon Cyber Outline" -> vfxColor.copy(alpha = effAlpha)
                "Heart Bokeh" -> Color(0xFFF43F5E).copy(alpha = effAlpha)
                "Wave Warp", "Underwater Ripple", "Underwater Bubbles" -> Color(0xFF0284C7).copy(alpha = effAlpha)
                "Radial Fish Eye", "Swirl Vortex", "Black Hole Pull" -> Color(0xFF1E293B).copy(alpha = effAlpha)
                "Mirror Reflection", "Kaleidoscope 8-Way" -> Color(0xFF8B5CF6).copy(alpha = effAlpha)
                "Smoke Fog" -> Color(0xFF94A3B8).copy(alpha = effAlpha)
                "Rain Drops" -> Color(0xFF38BDF8).copy(alpha = effAlpha)
                "Snow Winter" -> Color(0xFFE0F2FE).copy(alpha = effAlpha)
                "Fire Embers" -> Color(0xFFEA580C).copy(alpha = effAlpha)
                "Manga Speed Lines", "Super Saiyan Aura" -> Color(0xFFFFD700).copy(alpha = effAlpha)
                "Cyber Thermal Vision" -> Color(0xFFFF007F).copy(alpha = (effAlpha * 1.4f).coerceAtMost(0.7f))
                "Inverted Negative" -> Color(0x33FFFFFF)
                "Cinematic Letterbox" -> Color.Transparent
                else -> vfxColor.copy(alpha = effAlpha)
              }
            )
        ) {
          androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height
            when (effect) {
              "VHS 1980s", "90s Camcorder", "Interlaced Wave" -> {
                var y = 0f
                while (y < h) {
                  drawLine(
                    color = Color.Black.copy(alpha = (0.22f * vfxIntensity).coerceIn(0.05f, 0.6f)),
                    start = androidx.compose.ui.geometry.Offset(0f, y),
                    end = androidx.compose.ui.geometry.Offset(w, y),
                    strokeWidth = 2f
                  )
                  y += 6f
                }
              }
              "Glitch RGB", "RGB Split Shift", "Cyber Glitch Byte", "Pixel Sorter" -> {
                val sliceY1 = (h * (animWave * 0.7f)).coerceIn(0f, h - 20f)
                val sliceY2 = (h * (1f - animWave * 0.5f)).coerceIn(0f, h - 15f)
                drawRect(
                  color = vfxColor.copy(alpha = 0.5f * vfxIntensity),
                  topLeft = androidx.compose.ui.geometry.Offset(10f, sliceY1),
                  size = androidx.compose.ui.geometry.Size(w - 20f, 18f)
                )
                drawRect(
                  color = Color(0xFFFF007A).copy(alpha = 0.5f * vfxIntensity),
                  topLeft = androidx.compose.ui.geometry.Offset(-8f, sliceY2),
                  size = androidx.compose.ui.geometry.Size(w, 14f)
                )
              }
              "Sparkles", "Cosmic Stardust" -> {
                val stars = listOf(
                  androidx.compose.ui.geometry.Offset(w * 0.25f, h * 0.3f),
                  androidx.compose.ui.geometry.Offset(w * 0.75f, h * 0.25f),
                  androidx.compose.ui.geometry.Offset(w * 0.5f, h * 0.7f),
                  androidx.compose.ui.geometry.Offset(w * 0.82f, h * 0.65f),
                  androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.8f),
                  androidx.compose.ui.geometry.Offset(w * 0.4f, h * 0.2f),
                  androidx.compose.ui.geometry.Offset(w * 0.65f, h * 0.85f)
                )
                stars.forEachIndexed { i, center ->
                  val starSize = 14f * (0.6f + (animWave + i * 0.2f) % 0.8f) * vfxIntensity
                  drawLine(
                    color = Color(0xFFFFD700).copy(alpha = 0.85f),
                    start = androidx.compose.ui.geometry.Offset(center.x - starSize, center.y),
                    end = androidx.compose.ui.geometry.Offset(center.x + starSize, center.y),
                    strokeWidth = 2.5f
                  )
                  drawLine(
                    color = Color(0xFFFFD700).copy(alpha = 0.85f),
                    start = androidx.compose.ui.geometry.Offset(center.x, center.y - starSize),
                    end = androidx.compose.ui.geometry.Offset(center.x, center.y + starSize),
                    strokeWidth = 2.5f
                  )
                }
              }
              "Rain Drops" -> {
                for (i in 0..30) {
                  val rx = (w * ((i * 37) % 100) / 100f)
                  val ry = (h * (((i * 47) + animWave * 100) % 100) / 100f)
                  drawLine(
                    color = Color(0x9993C5FD),
                    start = androidx.compose.ui.geometry.Offset(rx, ry),
                    end = androidx.compose.ui.geometry.Offset(rx - 4f, ry + 22f),
                    strokeWidth = 1.8f * vfxIntensity
                  )
                }
              }
              "Snow Winter" -> {
                for (i in 0..35) {
                  val sx = (w * ((i * 29) % 100) / 100f)
                  val sy = (h * (((i * 53) + animWave * 60) % 100) / 100f)
                  drawCircle(
                    color = Color.White.copy(alpha = 0.8f),
                    radius = (if (i % 3 == 0) 3.5f else 2f) * vfxIntensity,
                    center = androidx.compose.ui.geometry.Offset(sx, sy)
                  )
                }
              }
              "Neon Bloom", "Edge Glow Pulse" -> {
                drawRect(
                  color = vfxColor.copy(alpha = 0.7f * animWave * vfxIntensity),
                  topLeft = androidx.compose.ui.geometry.Offset(4f, 4f),
                  size = androidx.compose.ui.geometry.Size(w - 8f, h - 8f),
                  style = androidx.compose.ui.graphics.drawscope.Stroke(width = 8f * vfxIntensity)
                )
              }
              "Manga Speed Lines" -> {
                val center = androidx.compose.ui.geometry.Offset(w / 2f, h / 2f)
                val lineCount = 36
                for (i in 0 until lineCount) {
                  val angle = (i * (360f / lineCount) + animWave * 20f) * (Math.PI / 180.0)
                  val rOuter = Math.max(w, h)
                  val rInner = (Math.min(w, h) * 0.32f * (1f - 0.1f * animWave))
                  val startX = (center.x + Math.cos(angle) * rInner).toFloat()
                  val startY = (center.y + Math.sin(angle) * rInner).toFloat()
                  val endX = (center.x + Math.cos(angle) * rOuter).toFloat()
                  val endY = (center.y + Math.sin(angle) * rOuter).toFloat()
                  drawLine(
                    color = Color.White.copy(alpha = 0.55f * vfxIntensity),
                    start = androidx.compose.ui.geometry.Offset(startX, startY),
                    end = androidx.compose.ui.geometry.Offset(endX, endY),
                    strokeWidth = (if (i % 2 == 0) 3.5f else 1.8f) * vfxIntensity
                  )
                }
              }
              "Cinematic Letterbox" -> {
                val barHeight = h * 0.14f * vfxIntensity
                drawRect(
                  color = Color.Black,
                  topLeft = androidx.compose.ui.geometry.Offset(0f, 0f),
                  size = androidx.compose.ui.geometry.Size(w, barHeight)
                )
                drawRect(
                  color = Color.Black,
                  topLeft = androidx.compose.ui.geometry.Offset(0f, h - barHeight),
                  size = androidx.compose.ui.geometry.Size(w, barHeight)
                )
              }
              "Super Saiyan Aura" -> {
                val center = androidx.compose.ui.geometry.Offset(w / 2f, h / 2f)
                for (r in 1..4) {
                  val ringRadius = (minOf(w, h) * 0.28f + r * 16f * animWave)
                  drawCircle(
                    color = Color(0xFFFFD700).copy(alpha = (0.5f / r) * vfxIntensity),
                    radius = ringRadius,
                    center = center,
                    style = androidx.compose.ui.graphics.drawscope.Stroke(width = 6f * vfxIntensity)
                  )
                }
              }
              "Cyber Laser Beams" -> {
                val y1 = h * (animWave * 0.8f + 0.1f)
                val y2 = h * (1f - animWave * 0.7f)
                drawLine(
                  color = vfxColor.copy(alpha = 0.9f),
                  start = androidx.compose.ui.geometry.Offset(0f, y1),
                  end = androidx.compose.ui.geometry.Offset(w, y1 + 10f),
                  strokeWidth = 3f * vfxIntensity
                )
                drawLine(
                  color = Color(0xFFFF1744).copy(alpha = 0.9f),
                  start = androidx.compose.ui.geometry.Offset(0f, y2),
                  end = androidx.compose.ui.geometry.Offset(w, y2 - 15f),
                  strokeWidth = 2.5f * vfxIntensity
                )
              }
              "Lightning Strike" -> {
                if (animWave > 0.55f) {
                  val xStart = w * 0.45f
                  val xMid = w * 0.52f
                  val xEnd = w * 0.48f
                  drawLine(color = Color.White, start = androidx.compose.ui.geometry.Offset(xStart, 0f), end = androidx.compose.ui.geometry.Offset(xMid, h * 0.5f), strokeWidth = 4f)
                  drawLine(color = Color.White, start = androidx.compose.ui.geometry.Offset(xMid, h * 0.5f), end = androidx.compose.ui.geometry.Offset(xEnd, h), strokeWidth = 3.5f)
                  drawCircle(color = Color.White.copy(alpha = 0.4f), radius = w * 0.8f, center = androidx.compose.ui.geometry.Offset(w / 2f, h / 2f))
                }
              }
              "Lens Flare", "Golden Hour Ray" -> {
                val cy = h * 0.4f
                drawLine(
                  color = Color(0xFFFFD700).copy(alpha = 0.8f * vfxIntensity),
                  start = androidx.compose.ui.geometry.Offset(0f, cy),
                  end = androidx.compose.ui.geometry.Offset(w, cy),
                  strokeWidth = 4f * vfxIntensity
                )
                drawCircle(
                  color = Color(0xFFFFFBEB).copy(alpha = 0.6f * vfxIntensity),
                  radius = 32f * vfxIntensity,
                  center = androidx.compose.ui.geometry.Offset(w * 0.55f, cy)
                )
              }
              "Heart Bokeh" -> {
                val bokehOffsets = listOf(
                  androidx.compose.ui.geometry.Offset(w * 0.2f, h * 0.25f),
                  androidx.compose.ui.geometry.Offset(w * 0.8f, h * 0.35f),
                  androidx.compose.ui.geometry.Offset(w * 0.4f, h * 0.75f),
                  androidx.compose.ui.geometry.Offset(w * 0.7f, h * 0.8f)
                )
                bokehOffsets.forEachIndexed { idx, pt ->
                  drawCircle(
                    color = Color(0xFFFF69B4).copy(alpha = (0.45f + 0.2f * animWave) * vfxIntensity),
                    radius = (20f + idx * 8f) * vfxIntensity,
                    center = pt
                  )
                }
              }
              "Fire Embers" -> {
                for (i in 0..24) {
                  val ex = (w * ((i * 41) % 100) / 100f)
                  val ey = (h * (100 - ((i * 59) + animWave * 80).toInt() % 100) / 100f)
                  drawCircle(
                    color = Color(0xFFFF5722).copy(alpha = 0.85f),
                    radius = (if (i % 2 == 0) 3.5f else 2f) * vfxIntensity,
                    center = androidx.compose.ui.geometry.Offset(ex, ey)
                  )
                }
              }
            }
          }
        }
      }

      // Chroma Key Transparent Overlay Simulation
      if (activeClip?.chromaKeyEnabled == true) {
        val selectedColor = Color(activeClip.chromaKeyColor)
        val alphaIntensity = (activeClip.chromaIntensity / 100f).coerceIn(0.1f, 0.95f)

        Box(
          modifier = Modifier
            .fillMaxSize()
            .border(2.dp, selectedColor.copy(alpha = 0.6f), RoundedCornerShape(8.dp))
            .background(
              Brush.radialGradient(
                listOf(
                  Color.Transparent,
                  selectedColor.copy(alpha = 0.2f * (1f - alphaIntensity)),
                  Color(0x66000000)
                )
              )
            )
        )
      }

      // AI Smart Cutout Transparent & Sticker Simulation
      if (activeClip?.isCutoutEnabled == true) {
        val strokeEffect = activeClip.cutoutStrokeEffect
        val strokeColor = when (strokeEffect) {
          "White Sticker" -> Color.White
          "Neon Cyan" -> Color(0xFF06B6D4)
          "Neon Orange" -> Color(0xFFFF7A22)
          "Neon Purple" -> Color(0xFFA855F7)
          "Shadow Glow" -> Color(0xFF0F172A)
          else -> Color.Transparent
        }
        val bgReplacement = activeClip.cutoutBgReplacement
        val bgBrush = when (bgReplacement) {
          "Dark Studio" -> Brush.radialGradient(listOf(Color(0xFF334155), Color(0xFF0F172A)))
          "Cyber Grid" -> Brush.linearGradient(listOf(Color(0xFF020617), Color(0xFF1E1B4B)))
          "Neon Gradient" -> Brush.linearGradient(listOf(Color(0xFFFF007A), Color(0xFF7928CA), Color(0xFF0070F3)))
          "Frosted Blur" -> Brush.verticalGradient(listOf(Color(0x88000000), Color(0xBB1E293B)))
          else -> Brush.verticalGradient(listOf(Color.Transparent, Color.Transparent))
        }

        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(bgBrush)
        )

        if (strokeEffect != "None") {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .padding(14.dp)
              .border(
                width = activeClip.cutoutStrokeWidth.dp,
                color = strokeColor,
                shape = RoundedCornerShape(20.dp)
              )
          )
        }
      }

      // PIP Overlay Clips
      val activePips = remember(clips, currentPositionMs) {
        clips.filter {
          (it.type == ClipType.VIDEO || it.type == ClipType.IMAGE) &&
            it.id.startsWith("pip_") &&
            currentPositionMs in it.startTimeMs..(it.startTimeMs + it.durationMs)
        }
      }
      activePips.forEach { pip ->
        Surface(
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.5.dp, Color.White),
          modifier = Modifier
            .align(Alignment.TopEnd)
            .padding(12.dp)
            .size(width = 110.dp, height = 70.dp)
        ) {
          if (!pip.uri.isNullOrEmpty()) {
            AsyncImage(
              model = pip.uri,
              contentDescription = "PIP Overlay",
              contentScale = ContentScale.Crop,
              modifier = Modifier.fillMaxSize()
            )
          }
        }
      }

      // Video Collage / Split-Screen Grid Layout Overlay
      if (activeClip?.collageLayout != null && activeClip.collageLayout != "None") {
        val borderWidth = activeClip.collageBorderWidth
        val borderColor = Color(activeClip.collageBorderColor)
        val cornerRadius = activeClip.collageCornerRadius
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(4.dp)
        ) {
          when (activeClip.collageLayout) {
            "2_Horizontal" -> {
              Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                CollageSlotCell(
                  label = "1: Main Video",
                  color = Color(0x661E3A8A),
                  radius = cornerRadius,
                  borderColor = borderColor,
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f).fillMaxWidth()
                )
                CollageSlotCell(
                  label = "2: Split Clip",
                  color = Color(0x664C1D95),
                  radius = cornerRadius,
                  borderColor = borderColor,
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f).fillMaxWidth()
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
                  color = Color(0x661E3A8A),
                  radius = cornerRadius,
                  borderColor = borderColor,
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f).fillMaxHeight()
                )
                CollageSlotCell(
                  label = "Right Video",
                  color = Color(0x66065F46),
                  radius = cornerRadius,
                  borderColor = borderColor,
                  borderWidth = borderWidth,
                  modifier = Modifier.weight(1f).fillMaxHeight()
                )
              }
            }
            "3_Columns" -> {
              Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                CollageSlotCell("Col 1", Color(0x661E3A8A), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                CollageSlotCell("Col 2", Color(0x66065F46), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                CollageSlotCell("Col 3", Color(0x667C2D12), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
              }
            }
            "3_Hero" -> {
              Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                CollageSlotCell("Hero Video (Top)", Color(0x661E3A8A), cornerRadius, borderColor, borderWidth, Modifier.weight(1.3f).fillMaxWidth())
                Row(
                  modifier = Modifier.weight(1f).fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
                ) {
                  CollageSlotCell("Split Left", Color(0x664C1D95), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                  CollageSlotCell("Split Right", Color(0x66065F46), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                }
              }
            }
            "4_Grid" -> {
              Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(borderWidth.dp)
              ) {
                Row(
                  modifier = Modifier.weight(1f).fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
                ) {
                  CollageSlotCell("Quad 1", Color(0x661E3A8A), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                  CollageSlotCell("Quad 2", Color(0x66831843), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                }
                Row(
                  modifier = Modifier.weight(1f).fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(borderWidth.dp)
                ) {
                  CollageSlotCell("Quad 3", Color(0x66065F46), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                  CollageSlotCell("Quad 4", Color(0x6678350F), cornerRadius, borderColor, borderWidth, Modifier.weight(1f).fillMaxHeight())
                }
              }
            }
          }
        }
      }

      // Live Freehand Doodle Overlay Rendering on Preview Canvas
      if (doodleStrokes.isNotEmpty()) {
        Canvas(modifier = Modifier.fillMaxSize()) {
          val canvasW = size.width
          val canvasH = size.height
          for (stroke in doodleStrokes) {
            if (stroke.points.size < 2) continue
            val strokePath = Path().apply {
              val first = stroke.points.first()
              moveTo(first.x * canvasW, first.y * canvasH)
              for (i in 1 until stroke.points.size) {
                val pt = stroke.points[i]
                lineTo(pt.x * canvasW, pt.y * canvasH)
              }
            }
            val color = Color(stroke.color)
            val baseWidth = (stroke.strokeWidth * (canvasW / 400f)).coerceAtLeast(2f)

            when (stroke.brushType) {
              "Neon" -> {
                drawPath(
                  path = strokePath,
                  color = color.copy(alpha = 0.35f),
                  style = Stroke(width = baseWidth * 2.6f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
                drawPath(
                  path = strokePath,
                  color = color.copy(alpha = 0.65f),
                  style = Stroke(width = baseWidth * 1.5f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
                drawPath(
                  path = strokePath,
                  color = Color.White,
                  style = Stroke(width = baseWidth * 0.5f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
              }
              "Highlighter" -> {
                drawPath(
                  path = strokePath,
                  color = color.copy(alpha = 0.4f),
                  style = Stroke(width = baseWidth * 2.2f, cap = StrokeCap.Square, join = StrokeJoin.Bevel)
                )
              }
              else -> {
                drawPath(
                  path = strokePath,
                  color = color,
                  style = Stroke(width = baseWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
              }
            }
          }
        }
      }

      // Top-Right: Quick 1-tap Mute/Unmute Button for Active Video Clip
      if (hasVisualClips && activeClip != null && onToggleClipMute != null) {
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = if (activeClip.isMuted) Color(0xFFDC2626) else Color(0xAA000000),
          border = BorderStroke(1.dp, if (activeClip.isMuted) Color.White else Color(0x66FFFFFF)),
          modifier = Modifier
            .align(Alignment.TopEnd)
            .padding(10.dp)
            .clickable { onToggleClipMute(activeClip.id) }
            .testTag("btn_preview_quick_mute")
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = if (activeClip.isMuted) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
              contentDescription = if (activeClip.isMuted) "Unmute Video Clip" else "Mute Video Clip",
              tint = Color.White,
              modifier = Modifier.size(15.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = if (activeClip.isMuted) "MUTED" else "MUTE",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          }
        }
      }

      // Top-Left: Timecode Pill and Active Effect Badges
      if (hasVisualClips) {
        Column(
          modifier = Modifier
            .align(Alignment.TopStart)
            .padding(10.dp),
          verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = Color(0xAA000000)
          ) {
            Text(
              text = "${formatTimecode(currentPositionMs)} / ${formatTimecode(totalDurationMs)}",
              fontFamily = FontFamily.Monospace,
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }

          Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            if (activeClip?.isReversed == true) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFFEF4444)
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
                color = Color(0xFF10B981)
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
                color = Color(0xFFEC4899)
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

            if (activeClip != null && activeClip.voiceEffect != "None") {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF8B5CF6)
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

            if (activeClip?.collageLayout != null && activeClip.collageLayout != "None") {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF3B82F6)
              ) {
                Text(
                  text = "⊞ COLLAGE: ${activeClip.collageLayout.uppercase()}",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
              }
            }

            if (doodleStrokes.isNotEmpty()) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF10B981)
              ) {
                Text(
                  text = "✏ DOODLE (${doodleStrokes.size})",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
              }
            }

            if (beatMarkers.isNotEmpty()) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFFF59E0B)
              ) {
                Text(
                  text = "♫ BEATS (${beatMarkers.size})",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.Black,
                  modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
              }
            }

            if (showSafeZone && safeZonePlatform != "None") {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF06B6D4)
              ) {
                Text(
                  text = "◱ SAFE ZONE: $safeZonePlatform",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.Black,
                  modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
              }
            }

            if (activeClip?.bodyEffect != null && activeClip.bodyEffect != "None") {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF8B5CF6)
              ) {
                Text(
                  text = "★ BODY FX: ${activeClip.bodyEffect.uppercase()}",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
              }
            }

            if (activeClip?.smoothSlowMoEnabled == true) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF0284C7)
              ) {
                Text(
                  text = "⚡ OPTICAL FLOW: 120FPS",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
              }
            }

            if (activeClip?.motionBlurEnabled == true) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF16A34A)
              ) {
                Text(
                  text = "🌊 MOTION BLUR (${activeClip.motionBlurShutterAngle}°)",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
              }
            }
          }
        }
      }

      // Center: Floating Play/Pause Button (shows when paused and has clips)
      if (hasVisualClips && !isPlaying) {
        Surface(
          shape = CircleShape,
          color = OrangePrimary.copy(alpha = 0.9f),
          modifier = Modifier
            .align(Alignment.Center)
            .size(48.dp)
            .clickable { onTogglePlayPause() }
            .testTag("btn_quick_play_pause")
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.PlayArrow,
              contentDescription = "Play",
              tint = Color.White,
              modifier = Modifier.size(28.dp)
            )
          }
        }
      }

      // Live Text, Auto-Captions & Sticker Overlays at current position
      val currentCaptions = remember(clips, activeCaptions, currentPositionMs) {
        val fromTextTrack = activeCaptions.filter { currentPositionMs in it.startTimeMs..(it.startTimeMs + it.durationMs) }
        val fromClips = clips.filter { it.type == ClipType.TEXT && currentPositionMs in it.startTimeMs..(it.startTimeMs + it.durationMs) }
        (fromTextTrack + fromClips).distinctBy { it.id }
      }

      // Safe Zone Guides Overlay (Instagram Reels / TikTok / YouTube Safe Margin UI)
      if (showSafeZone && safeZonePlatform != "None") {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 6.dp, vertical = 10.dp)
        ) {
          when (safeZonePlatform) {
            "Instagram Reels" -> {
              Text(
                text = "INSTAGRAM REELS SAFE ZONE (Keep text inside)",
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF06B6D4),
                modifier = Modifier
                  .align(Alignment.TopCenter)
                  .background(Color(0x99000000), RoundedCornerShape(4.dp))
                  .padding(horizontal = 6.dp, vertical = 2.dp)
              )

              // Right side engagement rail (Like, Comment, Share, Audio Disc)
              Column(
                modifier = Modifier
                  .align(Alignment.CenterEnd)
                  .padding(end = 4.dp, bottom = 48.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Surface(shape = CircleShape, color = Color(0x66000000), modifier = Modifier.size(28.dp)) {
                  Box(contentAlignment = Alignment.Center) { Text("♥", color = Color.White, fontSize = 14.sp) }
                }
                Text("128K", color = Color.White.copy(alpha = 0.8f), fontSize = 8.sp, fontWeight = FontWeight.Bold)

                Surface(shape = CircleShape, color = Color(0x66000000), modifier = Modifier.size(28.dp)) {
                  Box(contentAlignment = Alignment.Center) { Text("💬", color = Color.White, fontSize = 12.sp) }
                }
                Text("2.4K", color = Color.White.copy(alpha = 0.8f), fontSize = 8.sp, fontWeight = FontWeight.Bold)

                Surface(shape = CircleShape, color = Color(0x66000000), modifier = Modifier.size(28.dp)) {
                  Box(contentAlignment = Alignment.Center) { Text("↗", color = Color.White, fontSize = 12.sp) }
                }

                Surface(shape = CircleShape, color = Color(0xFF06B6D4).copy(alpha = 0.4f), modifier = Modifier.size(24.dp)) {
                  Box(contentAlignment = Alignment.Center) { Text("♪", color = Color.White, fontSize = 10.sp) }
                }
              }

              // Bottom Caption & User info area
              Column(
                modifier = Modifier
                  .align(Alignment.BottomStart)
                  .padding(start = 6.dp, bottom = 42.dp, end = 52.dp),
                verticalArrangement = Arrangement.spacedBy(2.dp)
              ) {
                Text("@creator • Original audio", color = Color.White.copy(alpha = 0.9f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Surface(
                  color = Color(0x3306B6D4),
                  border = BorderStroke(1.dp, Color(0x6606B6D4)),
                  shape = RoundedCornerShape(4.dp),
                  modifier = Modifier.fillMaxWidth().height(16.dp)
                ) {
                  Box(contentAlignment = Alignment.CenterStart, modifier = Modifier.padding(start = 4.dp)) {
                    Text("SafeArea: Captions/Text here won't be covered", fontSize = 7.sp, color = Color(0xFFE0F2FE))
                  }
                }
              }
            }
            "TikTok / Shorts" -> {
              Text(
                text = "TIKTOK / SHORTS SAFE ZONE",
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFEC4899),
                modifier = Modifier
                  .align(Alignment.TopCenter)
                  .background(Color(0x99000000), RoundedCornerShape(4.dp))
                  .padding(horizontal = 6.dp, vertical = 2.dp)
              )
              Column(
                modifier = Modifier
                  .align(Alignment.CenterEnd)
                  .padding(end = 4.dp, bottom = 44.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Surface(shape = CircleShape, color = Color(0xFFEF4444).copy(alpha = 0.8f), modifier = Modifier.size(26.dp)) {
                  Box(contentAlignment = Alignment.Center) { Text("+", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold) }
                }
                Text("♥", color = Color.White, fontSize = 14.sp)
                Text("💬", color = Color.White, fontSize = 12.sp)
                Text("★", color = Color.White, fontSize = 12.sp)
              }
              Column(
                modifier = Modifier
                  .align(Alignment.BottomStart)
                  .padding(start = 6.dp, bottom = 42.dp, end = 48.dp)
              ) {
                Text("@creator #viral", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                Surface(
                  color = Color(0x33EC4899),
                  border = BorderStroke(1.dp, Color(0x66EC4899)),
                  shape = RoundedCornerShape(4.dp),
                  modifier = Modifier.fillMaxWidth().height(16.dp)
                ) {
                  Box(contentAlignment = Alignment.CenterStart, modifier = Modifier.padding(start = 4.dp)) {
                    Text("TikTok safe area (Engage bar avoids this)", fontSize = 7.sp, color = Color(0xFFFCE7F3))
                  }
                }
              }
            }
            "YouTube 16:9" -> {
              Text(
                text = "YOUTUBE 16:9 SAFE AREA",
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFEF4444),
                modifier = Modifier
                  .align(Alignment.TopCenter)
                  .background(Color(0x99000000), RoundedCornerShape(4.dp))
                  .padding(horizontal = 6.dp, vertical = 2.dp)
              )
              Box(
                modifier = Modifier
                  .align(Alignment.BottomEnd)
                  .padding(end = 8.dp, bottom = 40.dp)
                  .background(Color(0x66EF4444), RoundedCornerShape(4.dp))
                  .padding(horizontal = 6.dp, vertical = 2.dp)
              ) {
                Text("Channel Watermark Safe", fontSize = 8.sp, color = Color.White, fontWeight = FontWeight.Bold)
              }
            }
          }
        }
      }

      // Watermark Overlay Badge (VFX Pro Signature Style with 'x' button)
      if (watermarkEnabled && (watermarkText.isNotBlank() || !watermarkLogoUri.isNullOrBlank())) {
        val wmAlign = when (watermarkPosition) {
          "Bottom-Left" -> Alignment.BottomStart
          "Top-Right" -> Alignment.TopEnd
          "Top-Left" -> Alignment.TopStart
          else -> Alignment.BottomEnd
        }
        Surface(
          shape = RoundedCornerShape(6.dp),
          color = Color.Black.copy(alpha = 0.65f * watermarkOpacity),
          border = BorderStroke(1.dp, Color.White.copy(alpha = 0.35f * watermarkOpacity)),
          modifier = Modifier
            .align(wmAlign)
            .padding(
              start = if (watermarkPosition.contains("Left")) 10.dp else 0.dp,
              end = if (watermarkPosition.contains("Right")) 10.dp else 0.dp,
              top = if (watermarkPosition.contains("Top")) 38.dp else 0.dp,
              bottom = if (watermarkPosition.contains("Bottom")) 36.dp else 0.dp
            )
            .clickable { onWatermarkClick() }
            .testTag("watermark_tag_preview")
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
          ) {
            if (!watermarkLogoUri.isNullOrBlank()) {
              AsyncImage(
                model = watermarkLogoUri,
                contentDescription = "Watermark logo",
                modifier = Modifier.size(22.dp).clip(RoundedCornerShape(3.dp))
              )
              Spacer(modifier = Modifier.width(4.dp))
            }
            if (watermarkText.isNotBlank()) {
              Box(
                modifier = Modifier
                  .size(7.dp)
                  .clip(CircleShape)
                  .background(Color(0xFFEC4899).copy(alpha = watermarkOpacity))
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = watermarkText,
                color = Color.White.copy(alpha = watermarkOpacity),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
              )
            }
            Spacer(modifier = Modifier.width(5.dp))
            Text(
              text = "×",
              color = Color(0xFF9CA3AF).copy(alpha = watermarkOpacity),
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              modifier = Modifier.clickable { onWatermarkClick() }
            )
          }
        }
      }
      currentCaptions.forEach { txt ->
        val isSticker = txt.textDesign == "Sticker" || txt.id.startsWith("sticker_")
        if (isSticker) {
          Text(
            text = txt.title,
            fontSize = (38 * txt.textScale).sp,
            textAlign = TextAlign.Center,
            modifier = Modifier
              .align(Alignment.Center)
              .offset { IntOffset(txt.textOffsetX.toInt(), txt.textOffsetY.toInt()) }
              .pointerInput(txt.id) {
                detectDragGestures { change, dragAmount ->
                  change.consume()
                  onUpdateTextTransform(txt.id, dragAmount.x, dragAmount.y)
                }
              }
              .padding(bottom = 20.dp)
          )
        } else {
          val style = if (txt.textDesign.isNotEmpty() && txt.textDesign != "Classic") txt.textDesign else captionStyle
          val isHormozi = style == "Hormozi Viral" || style == "Classic"
          val isBeast = style == "Beast Pop" || style == "Beast Dynamic"
          val isKaraoke = style == "Karaoke Wave" || style == "Neon Karaoke"
          val isCyber = style == "Cyber Boxed"
          val isMinimal = style == "Cinematic Minimal"

          Box(
            modifier = Modifier
              .align(Alignment.BottomCenter)
              .offset { IntOffset(txt.textOffsetX.toInt(), txt.textOffsetY.toInt()) }
              .pointerInput(txt.id) {
                detectDragGestures { change, dragAmount ->
                  change.consume()
                  onUpdateTextTransform(txt.id, dragAmount.x, dragAmount.y)
                }
              }
              .padding(bottom = 54.dp, start = 14.dp, end = 14.dp)
              .then(
                if (isHormozi) {
                  Modifier
                    .background(Color.Black.copy(alpha = 0.9f), RoundedCornerShape(8.dp))
                    .border(2.dp, Color(0xFFFACC15), RoundedCornerShape(8.dp))
                    .padding(horizontal = 14.dp, vertical = 7.dp)
                } else if (isBeast) {
                  Modifier
                    .background(Color(0xFF0F172A).copy(alpha = 0.94f), RoundedCornerShape(12.dp))
                    .border(2.5.dp, Color(0xFF22C55E), RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp, vertical = 7.dp)
                } else if (isKaraoke) {
                  Modifier
                    .background(Color(0xFF1E1B4B).copy(alpha = 0.92f), RoundedCornerShape(16.dp))
                    .border(2.dp, Color(0xFF06B6D4), RoundedCornerShape(16.dp))
                    .padding(horizontal = 16.dp, vertical = 7.dp)
                } else if (isCyber) {
                  Modifier
                    .background(Color(0xFF18181B).copy(alpha = 0.95f), RoundedCornerShape(4.dp))
                    .border(1.5.dp, Color(0xFFEAB308), RoundedCornerShape(4.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
                } else if (isMinimal) {
                  Modifier
                    .background(Color.Black.copy(alpha = 0.55f), RoundedCornerShape(6.dp))
                    .padding(horizontal = 12.dp, vertical = 5.dp)
                } else {
                  Modifier
                    .background(Color(0xBB000000), RoundedCornerShape(8.dp))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
                }
              )
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.Center
            ) {
              if (isHormozi) {
                Surface(
                  shape = RoundedCornerShape(4.dp),
                  color = Color(0xFFFACC15),
                  modifier = Modifier.padding(end = 6.dp)
                ) {
                  Text(
                    text = "AI",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.Black,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                  )
                }
              }
              val textFontFamily = com.example.ui.theme.AppFonts.getFontFamily(txt.fontStyle)
              Text(
                text = if (isHormozi) txt.title.uppercase() else txt.title,
                color = if (isHormozi) Color(0xFFFACC15) else if (isBeast) Color(0xFF4ADE80) else if (isKaraoke) Color(0xFF38BDF8) else if (isCyber) Color(0xFFFDE047) else txt.color,
                fontFamily = textFontFamily,
                fontSize = if (isHormozi) (17 * txt.textScale).sp else if (isBeast) (18 * txt.textScale).sp else (16 * txt.textScale).sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
              )
            }
          }
        }
      }

      // Bottom: Scrub Slider Bar
      if (hasVisualClips) {
        Column(
          modifier = Modifier
            .align(Alignment.BottomCenter)
            .fillMaxWidth()
            .background(
              Brush.verticalGradient(
                listOf(Color.Transparent, Color(0xDD000000))
              )
            )
            .padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
          val safeTotal = totalDurationMs.coerceAtLeast(1000L).toFloat()
          val safeCurrent = currentPositionMs.coerceIn(0L, totalDurationMs).toFloat()

          // Beat Markers Row on scrub slider
          if (beatMarkers.isNotEmpty()) {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .padding(horizontal = 6.dp)
            ) {
              val totalF = totalDurationMs.coerceAtLeast(1000L).toFloat()
              beatMarkers.forEach { beatMs ->
                val fraction = (beatMs.toFloat() / totalF).coerceIn(0f, 1f)
                Box(
                  modifier = Modifier
                    .align(Alignment.CenterStart)
                    .padding(start = (fraction * 280).dp)
                    .size(4.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF59E0B))
                )
              }
            }
          }

          Slider(
            value = safeCurrent,
            onValueChange = { onSeek(it.toLong()) },
            valueRange = 0f..safeTotal,
            colors = SliderDefaults.colors(
              thumbColor = OrangePrimary,
              activeTrackColor = OrangePrimary,
              inactiveTrackColor = Color.White.copy(alpha = 0.3f)
            ),
            modifier = Modifier
              .fillMaxWidth()
              .height(24.dp)
              .testTag("quick_scrub_slider")
          )
        }
      }
    }
  }
}

@Composable
private fun VideoThumbnailView(
  uri: String?,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var bitmap by remember(uri) { mutableStateOf<android.graphics.Bitmap?>(null) }

  androidx.compose.runtime.LaunchedEffect(uri) {
    if (uri.isNullOrEmpty()) return@LaunchedEffect
    kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
      try {
        val parsedUri = Uri.parse(uri)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q && uri.startsWith("content://")) {
          try {
            val thumb = context.contentResolver.loadThumbnail(parsedUri, android.util.Size(480, 480), null)
            bitmap = thumb
            return@withContext
          } catch (_: Exception) {}
        }

        if (uri.startsWith("content://") || uri.startsWith("file://")) {
          val retriever = android.media.MediaMetadataRetriever()
          retriever.setDataSource(context, parsedUri)
          val frame = retriever.getFrameAtTime(100000, android.media.MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
            ?: retriever.getFrameAtTime(0)
          retriever.release()
          bitmap = frame
        }
      } catch (_: Exception) {}
    }
  }

  if (bitmap != null) {
    Image(
      bitmap = bitmap!!.asImageBitmap(),
      contentDescription = null,
      contentScale = ContentScale.Crop,
      modifier = modifier
    )
  } else if (!uri.isNullOrEmpty() && (uri.startsWith("http") || uri.startsWith("content://") || uri.startsWith("file://"))) {
    AsyncImage(
      model = uri,
      contentDescription = null,
      contentScale = ContentScale.Crop,
      modifier = modifier
    )
  } else {
    Box(
      modifier = modifier.background(Color(0xFF1E293B))
    )
  }
}

/**
 * Storyboard Clip Card with real video thumbnail, selection state, direct delete, and reorder arrows
 */
@Composable
private fun StoryboardClipCard(
  clip: MediaClip,
  index: Int,
  isSelected: Boolean,
  onSelect: () -> Unit,
  onDelete: () -> Unit,
  onMoveLeft: (() -> Unit)?,
  onMoveRight: (() -> Unit)?
) {
  Card(
    onClick = onSelect,
    shape = RoundedCornerShape(8.dp),
    colors = CardDefaults.cardColors(
      containerColor = Color(0xFF1E1E1E)
    ),
    border = BorderStroke(
      width = if (isSelected) 2.5.dp else 1.dp,
      color = if (isSelected) Color(0xFF00E5FF) else Color(0xFF333333)
    ),
    modifier = Modifier
      .width(108.dp)
      .height(84.dp)
      .testTag("storyboard_clip_$index")
  ) {
    Box(modifier = Modifier.fillMaxSize()) {
      // Real video thumbnail
      VideoThumbnailView(
        uri = clip.uri,
        modifier = Modifier.fillMaxSize()
      )

      // Studio Electric Cyan trim handles when selected
      if (isSelected) {
        Box(
          modifier = Modifier
            .align(Alignment.CenterStart)
            .fillMaxHeight()
            .width(8.dp)
            .background(Color(0xFF00E5FF)),
          contentAlignment = Alignment.Center
        ) {
          Box(modifier = Modifier.width(2.dp).height(14.dp).background(Color.Black.copy(alpha = 0.5f)))
        }
        Box(
          modifier = Modifier
            .align(Alignment.CenterEnd)
            .fillMaxHeight()
            .width(8.dp)
            .background(Color(0xFF00E5FF)),
          contentAlignment = Alignment.Center
        ) {
          Box(modifier = Modifier.width(2.dp).height(14.dp).background(Color.Black.copy(alpha = 0.5f)))
        }
      }

      // Translucent dark gradient overlay for high contrast
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(
            Brush.verticalGradient(
              listOf(
                Color(0xAA000000),
                Color(0x22000000),
                Color(0xDD000000)
              )
            )
          )
      )

      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(6.dp),
        verticalArrangement = Arrangement.SpaceBetween
      ) {
        // Top row: Index badge, effect indicators, and Delete button
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            horizontalArrangement = Arrangement.spacedBy(3.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              shape = RoundedCornerShape(4.dp),
              color = if (isSelected) OrangePrimary else Color(0xAA000000)
            ) {
              Text(
                text = "#${index + 1}",
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
              )
            }

            if (clip.isReversed) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFFEF4444)
              ) {
                Text(
                  text = "◀",
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 3.dp, vertical = 1.dp)
                )
              }
            }

            if (clip.chromaKeyEnabled) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF10B981)
              ) {
                Text(
                  text = "☷",
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 3.dp, vertical = 1.dp)
                )
              }
            }

            if (clip.isCutoutEnabled) {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFFEC4899)
              ) {
                Text(
                  text = "✂",
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 3.dp, vertical = 1.dp)
                )
              }
            }

            if (clip.collageLayout != "None") {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF3B82F6)
              ) {
                Text(
                  text = "⊞",
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 3.dp, vertical = 1.dp)
                )
              }
            }

            if (clip.voiceEffect != "None") {
              Surface(
                shape = RoundedCornerShape(4.dp),
                color = Color(0xFF8B5CF6)
              ) {
                Text(
                  text = "♪",
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  modifier = Modifier.padding(horizontal = 3.dp, vertical = 1.dp)
                )
              }
            }
          }

          IconButton(
            onClick = onDelete,
            modifier = Modifier
              .size(20.dp)
              .testTag("btn_delete_clip_$index")
          ) {
            Icon(
              imageVector = Icons.Default.Close,
              contentDescription = "Delete Clip",
              tint = Color.White,
              modifier = Modifier.size(13.dp)
            )
          }
        }

        // Clip Title
        Text(
          text = clip.title,
          fontSize = 10.sp,
          fontWeight = FontWeight.SemiBold,
          color = Color.White,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )

        // Bottom row: Duration and Reorder arrows
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "%.1fs".format(clip.durationMs / 1000f),
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = OrangeLight
          )

          Row {
            if (onMoveLeft != null) {
              Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Move Left",
                tint = Color.White.copy(alpha = 0.8f),
                modifier = Modifier
                  .size(14.dp)
                  .clickable { onMoveLeft() }
              )
            }
            if (onMoveRight != null) {
              Spacer(modifier = Modifier.width(4.dp))
              Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Move Right",
                tint = Color.White.copy(alpha = 0.8f),
                modifier = Modifier
                  .size(14.dp)
                  .clickable { onMoveRight() }
              )
            }
          }
        }
      }
    }
  }
}

/**
 * Multi-Track Layer Visualization Strip
 * Displays distinct colored layer tracks for Audio (Green), Text/Captions (Cyan/Blue), and VFX Effects (Purple)
 * with playhead alignment and direct tapping to open their respective editors.
 */
@Composable
private fun QuickMultiTrackLayerStrip(
  totalDurationMs: Long,
  currentPositionMs: Long,
  audioClips: List<MediaClip>,
  textClips: List<MediaClip>,
  activeClip: MediaClip?,
  selectedAudioClipId: String? = null,
  onSelectAudioClip: ((String) -> Unit)? = null,
  onOpenAudio: () -> Unit,
  onOpenText: () -> Unit,
  onOpenEffects: () -> Unit,
  onSeek: (Long) -> Unit
) {
  val safeDuration = totalDurationMs.coerceAtLeast(1000L).toFloat()
  val playheadProgress = (currentPositionMs.toFloat() / safeDuration).coerceIn(0f, 1f)

  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 12.dp, vertical = 6.dp)
  ) {
    // Header for Tracks
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 4.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Text("MULTI-TRACK LAYERS", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Color(0xFF64748B), letterSpacing = 0.5.sp)
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color(0xFF10B981)))
        Text("Audio", fontSize = 8.sp, color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color(0xFF0284C7)))
        Text("Text", fontSize = 8.sp, color = Color(0xFF0284C7), fontWeight = FontWeight.Bold)
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color(0xFF8B5CF6)))
        Text("Effects", fontSize = 8.sp, color = Color(0xFF8B5CF6), fontWeight = FontWeight.Bold)
      }

      Text(
        text = "Tap audio to change/delete",
        fontSize = 8.sp,
        color = Color(0xFF94A3B8)
      )
    }

    // Timeline Container with White background and Playhead Scrubber line
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(8.dp))
        .background(Color(0xFF0F172A))
        .padding(horizontal = 8.dp, vertical = 6.dp)
        .testTag("quick_multi_track_container")
    ) {
      Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        // Track 1: Text & Captions Layer Line (Cyan / Blue Bar)
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .height(20.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .width(42.dp)
              .clickable { onOpenText() },
            contentAlignment = Alignment.CenterStart
          ) {
            Text("T Text", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8))
          }

          Box(
            modifier = Modifier
              .weight(1f)
              .fillMaxHeight()
              .clip(RoundedCornerShape(4.dp))
              .background(Color(0xFF1E293B))
              .clickable { onOpenText() }
          ) {
            if (textClips.isNotEmpty()) {
              val firstText = textClips.firstOrNull()
              val startF = if (firstText != null) (firstText.startTimeMs.toFloat() / safeDuration).coerceIn(0f, 1f) else 0f
              val durF = if (firstText != null) (firstText.durationMs.toFloat() / safeDuration).coerceIn(0.1f, 1f) else 0.5f
              Box(
                modifier = Modifier
                  .fillMaxHeight()
                  .fillMaxWidth(fraction = (startF + durF).coerceAtMost(1f))
                  .padding(start = (startF * 200).dp)
                  .clip(RoundedCornerShape(3.dp))
                  .background(Color(0xFF0284C7))
                  .padding(horizontal = 4.dp),
                contentAlignment = Alignment.CenterStart
              ) {
                Text(
                  text = firstText?.title?.ifEmpty { "Text Layer" } ?: "Text Layer (${textClips.size})",
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis
                )
              }
            } else {
              // Empty placeholder state allowing user to tap to add text
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .padding(horizontal = 6.dp),
                contentAlignment = Alignment.CenterStart
              ) {
                Text("+ Add Title & Typography Track", fontSize = 8.sp, color = Color(0xFF64748B), fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
              }
            }
          }
        }

        // Track 2: Audio & Music Layer Line (Emerald Green Bar with Clickable Selection)
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .height(20.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .width(42.dp)
              .clickable { onOpenAudio() },
            contentAlignment = Alignment.CenterStart
          ) {
            Text("♪ Audio", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF34D399))
          }

          Box(
            modifier = Modifier
              .weight(1f)
              .fillMaxHeight()
              .clip(RoundedCornerShape(4.dp))
              .background(if (selectedAudioClipId != null) Color(0xFF064E3B) else Color(0xFF1E293B))
              .clickable {
                if (audioClips.isNotEmpty()) {
                  val first = audioClips.firstOrNull()
                  if (first != null) {
                    onSelectAudioClip?.invoke(first.id)
                  } else {
                    onOpenAudio()
                  }
                } else {
                  onOpenAudio()
                }
              }
          ) {
            if (audioClips.isNotEmpty()) {
              val firstAudio = audioClips.firstOrNull()
              val isSelected = firstAudio?.id == selectedAudioClipId
              val startF = if (firstAudio != null) (firstAudio.startTimeMs.toFloat() / safeDuration).coerceIn(0f, 1f) else 0f
              val durF = if (firstAudio != null) (firstAudio.durationMs.toFloat() / safeDuration).coerceIn(0.1f, 1f) else 0.8f
              Box(
                modifier = Modifier
                  .fillMaxHeight()
                  .fillMaxWidth(fraction = (startF + durF).coerceAtMost(1f))
                  .padding(start = (startF * 200).dp)
                  .clip(RoundedCornerShape(3.dp))
                  .background(if (isSelected) Color(0xFF059669) else Color(0xFF10B981))
                  .border(
                    width = if (isSelected) 1.5.dp else 0.dp,
                    color = if (isSelected) Color.White else Color.Transparent,
                    shape = RoundedCornerShape(3.dp)
                  )
                  .clickable {
                    firstAudio?.let { onSelectAudioClip?.invoke(it.id) }
                  }
                  .padding(horizontal = 4.dp),
                contentAlignment = Alignment.CenterStart
              ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Text(if (isSelected) "✓ ♫" else "♫", fontSize = 8.sp, color = Color.White)
                  Spacer(modifier = Modifier.width(3.dp))
                  Text(
                    text = firstAudio?.title?.ifEmpty { "Background Music" } ?: "Audio Track",
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                  )
                  if (isSelected) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("(Selected - Tap Change/Delete)", fontSize = 7.sp, color = Color(0xFFA7F3D0))
                  }
                }
              }
            } else {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .padding(horizontal = 6.dp),
                contentAlignment = Alignment.CenterStart
              ) {
                Text("+ Add Background Music / Sound FX Track", fontSize = 8.sp, color = Color(0xFF64748B), fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
              }
            }
          }
        }

        // Track 3: VFX Effects & Filters Layer Line (Violet / Purple Bar)
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .height(20.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .width(42.dp)
              .clickable { onOpenEffects() },
            contentAlignment = Alignment.CenterStart
          ) {
            Text("★ VFX", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
          }

          Box(
            modifier = Modifier
              .weight(1f)
              .fillMaxHeight()
              .clip(RoundedCornerShape(4.dp))
              .background(Color(0xFF1E293B))
              .clickable { onOpenEffects() }
          ) {
            val vfxName = activeClip?.vfxEffect
            if (vfxName != null && vfxName != "None") {
              val startF = ((activeClip.startTimeMs).toFloat() / safeDuration).coerceIn(0f, 1f)
              val durF = (activeClip.durationMs.toFloat() / safeDuration).coerceIn(0.1f, 1f)
              Box(
                modifier = Modifier
                  .fillMaxHeight()
                  .fillMaxWidth(fraction = (startF + durF).coerceAtMost(1f))
                  .padding(start = (startF * 200).dp)
                  .clip(RoundedCornerShape(3.dp))
                  .background(Color(0xFF8B5CF6))
                  .padding(horizontal = 4.dp),
                contentAlignment = Alignment.CenterStart
              ) {
                Text(
                  text = "FX: $vfxName",
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis
                )
              }
            } else {
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .padding(horizontal = 6.dp),
                contentAlignment = Alignment.CenterStart
              ) {
                Text("+ Apply VFX Pro Cinema Shaders & Optical FX", fontSize = 8.sp, color = Color(0xFF64748B), fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
              }
            }
          }
        }
      }

      // Vertical Orange Playhead line scrub indicator across all layers
      Box(
        modifier = Modifier
          .padding(start = (42 + playheadProgress * 260).dp)
          .width(2.dp)
          .height(72.dp)
          .background(OrangePrimary)
      )
    }
  }
}

/**
 * Add Video/Photo Card at the end of the storyboard
 */
@Composable
private fun AddClipButtonCard(onClick: () -> Unit) {
  Card(
    onClick = onClick,
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(containerColor = Color.White),
    border = BorderStroke(1.5.dp, OrangePrimary),
    modifier = Modifier
      .width(96.dp)
      .height(88.dp)
      .testTag("btn_storyboard_add_media")
  ) {
    Column(
      modifier = Modifier.fillMaxSize(),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      Icon(
        imageVector = Icons.Default.AddPhotoAlternate,
        contentDescription = "Add Media",
        tint = OrangePrimary,
        modifier = Modifier.size(24.dp)
      )
      Spacer(modifier = Modifier.height(4.dp))
      Text(
        text = "+ Add Media",
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = OrangePrimary
      )
    }
  }
}

/**
 * Quick Tool Ribbon (Sleek dark theme, clean icons and labels)
 */
@Composable
private fun QuickToolRibbon(
  hasSelectedClip: Boolean,
  hasAudioClip: Boolean = false,
  isClipMuted: Boolean = false,
  areAllClipsMuted: Boolean = false,
  onAction: (QuickAction) -> Unit
) {
  Surface(
    color = Color(0xFF161616),
    border = BorderStroke(1.dp, Color(0xFF262626)),
    modifier = Modifier.fillMaxWidth()
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .horizontalScroll(rememberScrollState())
        .padding(horizontal = 8.dp, vertical = 8.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      // 1. Canvas (Ratio / Fit / Format) - Primary Studio Tool
      ToolRibbonButton(
        icon = Icons.Default.AspectRatio,
        label = "Canvas",
        enabled = true,
        onClick = { onAction(QuickAction.CANVAS) },
        tint = OrangePrimary,
        testTag = "btn_ribbon_canvas"
      )

      // 2. Music & Sound FX - Primary Studio Tool
      ToolRibbonButton(
        icon = Icons.Default.Audiotrack,
        label = "Music",
        enabled = true,
        onClick = { onAction(QuickAction.MUSIC) },
        tint = Color(0xFF10B981),
        testTag = "btn_ribbon_music"
      )

      // 2b. 1-Tap Quick Mute / Unmute
      ToolRibbonButton(
        icon = if (isClipMuted) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
        label = if (isClipMuted) "Unmute" else "Mute Clip",
        enabled = hasSelectedClip || hasAudioClip,
        tint = if (isClipMuted) Color(0xFFEF4444) else OrangePrimary,
        onClick = { onAction(QuickAction.MUTE) },
        testTag = "btn_ribbon_mute_toggle"
      )

      // 2b-2. 1-Tap Mute / Unmute ALL Video Clips in Project
      ToolRibbonButton(
        icon = if (areAllClipsMuted) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
        label = if (areAllClipsMuted) "Unmute All" else "Mute All",
        enabled = true,
        tint = if (areAllClipsMuted) Color(0xFFEF4444) else Color(0xFFDC2626),
        onClick = { onAction(QuickAction.MUTE_ALL) },
        testTag = "btn_ribbon_mute_all"
      )

      // 2c. 1-Tap Extract Audio
      ToolRibbonButton(
        icon = Icons.Default.Audiotrack,
        label = "Extract Sound",
        enabled = hasSelectedClip,
        tint = Color(0xFF10B981),
        onClick = { onAction(QuickAction.EXTRACT_AUDIO) },
        testTag = "btn_ribbon_extract_audio"
      )

      // 3. Stickers & Emojis
      ToolRibbonButton(
        icon = Icons.Default.EmojiEmotions,
        label = "Sticker",
        enabled = true,
        onClick = { onAction(QuickAction.STICKER) },
        tint = Color(0xFFF59E0B),
        testTag = "btn_ribbon_sticker"
      )

      // 4. Text & Subtitles
      ToolRibbonButton(
        icon = Icons.Default.TextFields,
        label = "Text",
        enabled = true,
        onClick = { onAction(QuickAction.TEXT) },
        tint = Color(0xFF3B82F6),
        testTag = "btn_ribbon_text"
      )

      // 5. Filters & Color Grade
      ToolRibbonButton(
        icon = Icons.Default.ColorLens,
        label = "Filter",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.FILTER) },
        tint = Color(0xFF8B5CF6),
        testTag = "btn_ribbon_filter"
      )

      // 6. PIP / Overlay
      ToolRibbonButton(
        icon = Icons.Default.Layers,
        label = "PIP",
        enabled = true,
        onClick = { onAction(QuickAction.OVERLAY) },
        tint = Color(0xFFEC4899),
        testTag = "btn_ribbon_overlay"
      )

      // 7. Split / Cut at Playhead
      ToolRibbonButton(
        icon = Icons.Default.ContentCut,
        label = "Split",
        enabled = hasSelectedClip || hasAudioClip,
        onClick = { onAction(QuickAction.SPLIT) },
        testTag = "btn_ribbon_split"
      )

      // 8. Delete Selected Clip or Audio
      ToolRibbonButton(
        icon = Icons.Default.Delete,
        label = "Delete",
        enabled = hasSelectedClip || hasAudioClip,
        onClick = { onAction(QuickAction.DELETE) },
        tint = Color(0xFFDC2626),
        testTag = "btn_ribbon_delete"
      )

      // 9. Background Blur & Colors
      ToolRibbonButton(
        icon = Icons.Default.Wallpaper,
        label = "Background",
        enabled = true,
        onClick = { onAction(QuickAction.BACKGROUND) },
        testTag = "btn_ribbon_background"
      )

      // 10. Speed Control & Curves
      ToolRibbonButton(
        icon = Icons.Default.Speed,
        label = "Speed",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.SPEED) },
        testTag = "btn_ribbon_speed"
      )

      // 11. Crop
      ToolRibbonButton(
        icon = Icons.Default.Crop,
        label = "Crop",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.CROP) },
        testTag = "btn_ribbon_crop"
      )

      // 12. Volume (Mute / Amplify)
      ToolRibbonButton(
        icon = Icons.AutoMirrored.Filled.VolumeUp,
        label = "Volume",
        enabled = hasSelectedClip || hasAudioClip,
        onClick = { onAction(QuickAction.VOLUME) },
        testTag = "btn_ribbon_volume"
      )

      // 13. Voice Effects
      ToolRibbonButton(
        icon = Icons.Default.RecordVoiceOver,
        label = "Voice FX",
        enabled = hasSelectedClip || hasAudioClip,
        onClick = { onAction(QuickAction.VOICE_EFFECTS) },
        tint = Color(0xFF8B5CF6),
        testTag = "btn_ribbon_voice_fx"
      )

      // 14. Rotate 90°
      ToolRibbonButton(
        icon = Icons.Default.RotateRight,
        label = "Rotate",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.ROTATE) },
        testTag = "btn_ribbon_rotate"
      )

      // 15. Flip Horizontal
      ToolRibbonButton(
        icon = Icons.Default.Flip,
        label = "Flip",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.FLIP) },
        testTag = "btn_ribbon_flip"
      )

      // 16. Trim Handles
      ToolRibbonButton(
        icon = Icons.Default.ContentCut,
        label = "Trim",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.TRIM) },
        testTag = "btn_ribbon_trim"
      )

      // 17. Duplicate Clip
      ToolRibbonButton(
        icon = Icons.Default.ContentCopy,
        label = "Duplicate",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.DUPLICATE) },
        testTag = "btn_ribbon_duplicate"
      )

      // 18. Replace Media or Audio
      ToolRibbonButton(
        icon = Icons.Default.SwapHoriz,
        label = "Replace",
        enabled = hasSelectedClip || hasAudioClip,
        onClick = { onAction(QuickAction.REPLACE) },
        testTag = "btn_ribbon_replace"
      )

      // 19. Freeze Frame
      ToolRibbonButton(
        icon = Icons.Default.SlowMotionVideo,
        label = "Freeze",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.FREEZE) },
        testTag = "btn_ribbon_freeze"
      )

      // 20. Reverse Playback
      ToolRibbonButton(
        icon = Icons.Default.History,
        label = "Reverse",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.REVERSE) },
        tint = Color(0xFFEF4444),
        testTag = "btn_ribbon_reverse"
      )

      // 21. Transitions
      ToolRibbonButton(
        icon = Icons.Default.Transform,
        label = "Transition",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.TRANSITION) },
        testTag = "btn_ribbon_transition"
      )

      // 22. Motion Keyframe
      ToolRibbonButton(
        icon = Icons.Default.Diamond,
        label = "Keyframe",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.KEYFRAME) },
        testTag = "btn_ribbon_keyframe"
      )

      // 23. Chroma Key / Green Screen
      ToolRibbonButton(
        icon = Icons.Default.ColorLens,
        label = "Chroma Key",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.CHROMA_KEY) },
        tint = Color(0xFF10B981),
        testTag = "btn_ribbon_chroma_key"
      )

      // 24. Auto Subtitles / Captions
      ToolRibbonButton(
        icon = Icons.Default.ClosedCaption,
        label = "Captions",
        enabled = true,
        onClick = { onAction(QuickAction.AUTO_CAPTIONS) },
        tint = Color(0xFFF59E0B),
        testTag = "btn_ribbon_auto_captions"
      )

      // 25. Effects
      ToolRibbonButton(
        icon = Icons.Default.AutoAwesome,
        label = "Effects",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.EFFECTS) },
        testTag = "btn_ribbon_effects"
      )

      // 26. AI Body FX
      ToolRibbonButton(
        icon = Icons.Default.Face,
        label = "AI Body FX",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.BODY_EFFECT) },
        tint = Color(0xFF8B5CF6),
        testTag = "btn_ribbon_body_effect"
      )

      // 27. Motion Blur
      ToolRibbonButton(
        icon = Icons.Default.Speed,
        label = "Motion Blur",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.MOTION_BLUR) },
        tint = Color(0xFF0284C7),
        testTag = "btn_ribbon_motion_blur"
      )

      // 28. Enhance
      ToolRibbonButton(
        icon = Icons.Default.Tune,
        label = "Enhance",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.ENHANCE) },
        testTag = "btn_ribbon_enhance"
      )

      // 29. Smart AI Cutout
      ToolRibbonButton(
        icon = Icons.Default.ContentCut,
        label = "Cutout",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.SMART_CUTOUT) },
        tint = Color(0xFFEC4899),
        testTag = "btn_ribbon_smart_cutout"
      )

      // 30. Doodle Painting
      ToolRibbonButton(
        icon = Icons.Default.Brush,
        label = "Doodle",
        enabled = true,
        onClick = { onAction(QuickAction.DOODLE) },
        tint = Color(0xFF10B981),
        testTag = "btn_ribbon_doodle"
      )

      // 31. Video Collage
      ToolRibbonButton(
        icon = Icons.Default.GridOn,
        label = "Collage",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.COLLAGE) },
        tint = Color(0xFF3B82F6),
        testTag = "btn_ribbon_collage"
      )

      // 32. Duration
      ToolRibbonButton(
        icon = Icons.Default.Timer,
        label = "Duration",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.DURATION) },
        testTag = "btn_ribbon_duration"
      )

      // 33. Capture Still Frame
      ToolRibbonButton(
        icon = Icons.Default.CameraAlt,
        label = "Capture",
        enabled = hasSelectedClip,
        onClick = { onAction(QuickAction.CAPTURE) },
        testTag = "btn_ribbon_capture"
      )

      // 34. Beat Sync
      ToolRibbonButton(
        icon = Icons.Default.GraphicEq,
        label = "Beat Sync",
        enabled = true,
        onClick = { onAction(QuickAction.BEAT_SYNC) },
        tint = Color(0xFFF59E0B),
        testTag = "btn_ribbon_beat_sync"
      )

      // 35. Safe Zone Guides
      ToolRibbonButton(
        icon = Icons.Default.Crop,
        label = "Safe Zone",
        enabled = true,
        onClick = { onAction(QuickAction.SAFE_ZONE) },
        tint = Color(0xFF06B6D4),
        testTag = "btn_ribbon_safe_zone"
      )

      // 36. Watermark
      ToolRibbonButton(
        icon = Icons.Default.Palette,
        label = "Watermark",
        enabled = true,
        onClick = { onAction(QuickAction.WATERMARK) },
        tint = Color(0xFFEC4899),
        testTag = "btn_ribbon_watermark"
      )
    }
  }
}

@Composable
private fun ToolRibbonButton(
  icon: ImageVector,
  label: String,
  enabled: Boolean,
  onClick: () -> Unit,
  tint: Color = Color.White,
  testTag: String
) {
  Surface(
    shape = RoundedCornerShape(10.dp),
    color = if (enabled) Color(0xFF222222) else Color(0xFF181818),
    border = BorderStroke(1.dp, if (enabled) Color(0xFF333333) else Color.Transparent),
    modifier = Modifier
      .clickable(enabled = enabled) { onClick() }
      .testTag(testTag)
  ) {
    Column(
      modifier = Modifier
        .width(58.dp)
        .padding(vertical = 7.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Icon(
        imageVector = icon,
        contentDescription = label,
        tint = if (enabled) tint else Color(0xFF555555),
        modifier = Modifier.size(20.dp)
      )
      Spacer(modifier = Modifier.height(4.dp))
      Text(
        text = label,
        fontSize = 10.sp,
        fontWeight = FontWeight.Medium,
        color = if (enabled) Color(0xFFE5E7EB) else Color(0xFF6B7280),
        textAlign = TextAlign.Center,
        maxLines = 1
      )
    }
  }
}

/**
 * 1-Tap Quick Trim Sheet with live slider & presets
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickTrimSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyTrim: (Long) -> Unit
) {
  val originalDurationSec = remember(clip) { (clip.durationMs / 1000f).coerceAtLeast(1.0f) }
  var durationSec by remember { mutableFloatStateOf(clip.durationMs / 1000f) }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Trim Clip",
          fontSize = 16.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1F2937)
        )
        Text(
          text = "Original: %.1fs".format(originalDurationSec),
          fontSize = 12.sp,
          color = Color(0xFF6B7280)
        )
      }

      Spacer(modifier = Modifier.height(12.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("New Duration", fontSize = 13.sp, color = Color(0xFF4B5563))
        Text(
          text = "%.1f seconds".format(durationSec),
          fontSize = 15.sp,
          fontWeight = FontWeight.Bold,
          color = OrangePrimary
        )
      }

      Slider(
        value = durationSec.coerceIn(0.5f, originalDurationSec.coerceAtLeast(1f)),
        onValueChange = { durationSec = it },
        valueRange = 0.5f..originalDurationSec.coerceAtLeast(1f),
        colors = SliderDefaults.colors(
          thumbColor = OrangePrimary,
          activeTrackColor = OrangePrimary
        ),
        modifier = Modifier.fillMaxWidth().testTag("slider_quick_trim")
      )

      // Quick Duration Presets
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        OutlinedButton(
          onClick = { durationSec = (originalDurationSec * 0.5f).coerceAtLeast(0.5f) },
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
          contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
          modifier = Modifier.weight(1f)
        ) {
          Text("50% (Half)", fontSize = 11.sp, color = Color(0xFF1F2937))
        }
        OutlinedButton(
          onClick = { durationSec = 3.0f.coerceAtMost(originalDurationSec) },
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
          contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
          modifier = Modifier.weight(1f)
        ) {
          Text("3 Seconds", fontSize = 11.sp, color = Color(0xFF1F2937))
        }
        OutlinedButton(
          onClick = { durationSec = originalDurationSec },
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
          contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
          modifier = Modifier.weight(1f)
        ) {
          Text("Reset", fontSize = 11.sp, color = Color(0xFF1F2937))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      Button(
        onClick = { onApplyTrim((durationSec * 1000).toLong()) },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().height(46.dp).testTag("btn_apply_trim")
      ) {
        Text("Apply Trim", fontWeight = FontWeight.Bold, fontSize = 14.sp)
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

/**
 * Quick Speed & Ease Curves Sheet (0.2x to 5.0x + Ease in/out/montage)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickSpeedSheet(
  currentSpeed: Float,
  currentCurve: String = "Standard",
  smoothSlowMo: Boolean = false,
  smoothSlowMoQuality: String = "Optical Flow",
  onDismiss: () -> Unit,
  onApplySpeed: (Float, String, Boolean, String) -> Unit
) {
  var speed by remember { mutableFloatStateOf(currentSpeed) }
  var selectedCurve by remember { mutableStateOf(currentCurve) }
  var isSlowMoEnabled by remember { mutableStateOf(smoothSlowMo || speed < 1.0f) }
  var slowMoQuality by remember { mutableStateOf(smoothSlowMoQuality) }
  val speedPresets = listOf(0.1f, 0.2f, 0.5f, 1.0f, 1.5f, 2.0f, 3.0f, 5.0f, 10.0f)
  val curvePresets = listOf(
    "Standard" to "Linear Speed",
    "Ease In" to "Slow to Fast",
    "Ease Out" to "Fast to Slow",
    "Montage" to "Dynamic Wave",
    "Bullet Time" to "Slow-Mo Peak",
    "Flash Zoom" to "Sudden Burst",
    "Hero" to "Action Hero Accent",
    "Jump Cut" to "High-Paced Snappy"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Speed & Ease Curves",
          fontSize = 17.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1F2937)
        )
        Text(
          text = "${String.format(java.util.Locale.US, "%.2f", speed)}x",
          fontSize = 15.sp,
          fontWeight = FontWeight.Bold,
          color = OrangePrimary
        )
      }

      Spacer(modifier = Modifier.height(10.dp))

      Slider(
        value = speed,
        onValueChange = { speed = it },
        valueRange = 0.1f..10.0f,
        colors = SliderDefaults.colors(
          thumbColor = OrangePrimary,
          activeTrackColor = OrangePrimary
        ),
        modifier = Modifier.fillMaxWidth()
      )

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        speedPresets.forEach { preset ->
          val isSelected = kotlin.math.abs(speed - preset) < 0.05f
          FilterChip(
            selected = isSelected,
            onClick = { speed = preset },
            label = { Text("${preset}x", fontSize = 11.sp) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangeContainer,
              selectedLabelColor = OrangePrimary,
              containerColor = Color(0xFFF3F4F6),
              labelColor = Color(0xFF1F2937)
            ),
            modifier = Modifier.weight(1f)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      Text(
        text = "Ease Curve",
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF1F2937)
      )
      Spacer(modifier = Modifier.height(8.dp))

      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(curvePresets.size) { idx ->
          val (curveName, curveDesc) = curvePresets[idx]
          val isSelected = selectedCurve == curveName
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = if (isSelected) OrangeContainer else Color(0xFFF9FAFB),
            border = BorderStroke(1.5.dp, if (isSelected) OrangePrimary else Color(0xFFE5E7EB)),
            onClick = { selectedCurve = curveName },
            modifier = Modifier.width(115.dp)
          ) {
            Column(modifier = Modifier.padding(8.dp)) {
              Text(curveName, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = if (isSelected) OrangePrimary else Color(0xFF1F2937))
              Text(curveDesc, fontSize = 9.sp, color = Color(0xFF6B7280), maxLines = 1)
            }
          }
        }
      }

      // Optical Flow Smooth Slow-Mo toggle
      if (speed < 1.0f || isSlowMoEnabled) {
        Spacer(modifier = Modifier.height(14.dp))
        Card(
          shape = RoundedCornerShape(10.dp),
          colors = CardDefaults.cardColors(containerColor = if (isSlowMoEnabled) Color(0xFFE0F2FE) else Color(0xFFF3F4F6)),
          border = BorderStroke(1.dp, if (isSlowMoEnabled) Color(0xFF0284C7) else Color(0xFFE5E7EB)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(10.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Icon(Icons.Default.Speed, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Column {
                  Text("Make it smoother (Optical Flow)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF0F172A))
                  Text("VFX Pro AI frame blending: Silky 120fps slow-mo", fontSize = 9.5.sp, color = Color(0xFF64748B))
                }
              }
              Switch(
                checked = isSlowMoEnabled,
                onCheckedChange = { isSlowMoEnabled = it },
                colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFF0284C7), checkedTrackColor = Color(0xFFBAE6FD))
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      Button(
        onClick = { onApplySpeed(speed, selectedCurve, isSlowMoEnabled, slowMoQuality) },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(46.dp)
      ) {
        Text("Apply Speed & Curve", fontWeight = FontWeight.Bold, color = Color.White)
      }

      Spacer(modifier = Modifier.height(12.dp))
    }
  }
}

/**
 * Quick Filter Presets Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickFilterSheet(
  currentFilter: String,
  onDismiss: () -> Unit,
  onApplyFilter: (String) -> Unit
) {
  var selectedFilter by remember { mutableStateOf(currentFilter) }
  var filterIntensity by remember { mutableFloatStateOf(80f) }
  var selectedCategory by remember { mutableStateOf("All") }

  data class FilterDef(
    val name: String,
    val category: String,
    val colorBadge: Color,
    val description: String
  )

  val allFilters = remember {
    listOf(
      FilterDef("Normal", "All", Color(0xFF6B7280), "Original"),
      // Cinema
      FilterDef("Teal & Orange", "Cinema", Color(0xFF00E5FF), "Blockbuster contrast"),
      FilterDef("Cinema Gold", "Cinema", Color(0xFFFFD700), "Golden cinematic mood"),
      FilterDef("Hollywood Glam", "Cinema", Color(0xFFFDA4AF), "Soft glam portrait"),
      FilterDef("Dune Warmth", "Cinema", Color(0xFFD97706), "Desert cinematic tone"),
      FilterDef("Bleach Bypass", "Cinema", Color(0xFF94A3B8), "Gritty high-contrast action"),
      FilterDef("Kodachrome", "Cinema", Color(0xFFEA580C), "Classic 1970s film stock"),
      // Vintage
      FilterDef("VHS 1980s", "Vintage", Color(0xFF10B981), "Retro analog cassette tone"),
      FilterDef("Vintage Film", "Vintage", Color(0xFF795548), "Warm analog print"),
      FilterDef("35mm Grain", "Vintage", Color(0xFFA8A29E), "35mm camera texture"),
      FilterDef("Polaroid 1990", "Vintage", Color(0xFFFDE68A), "Instant faded print"),
      FilterDef("Vintage Sepia", "Vintage", Color(0xFF92400E), "Antique nostalgic brown"),
      FilterDef("Old 8mm", "Vintage", Color(0xFFB45309), "Flickering silent projector"),
      FilterDef("Super 8", "Vintage", Color(0xFF65A30D), "Classic holiday reel"),
      FilterDef("Lomo Retro", "Vintage", Color(0xFFC2410C), "Vivid vignetted toy camera"),
      // Retro
      FilterDef("Warm Glow", "Retro", Color(0xFFFF9800), "Cozy sunset ambience"),
      FilterDef("Sunset Amber", "Retro", Color(0xFFF59E0B), "Deep dusk radiance"),
      FilterDef("Golden Hour", "Retro", Color(0xFFFBBF24), "Magical afternoon light"),
      FilterDef("Desert Sun", "Retro", Color(0xFFCA8A04), "High noon sun warmth"),
      FilterDef("Honey Haze", "Retro", Color(0xFFEAB308), "Golden honey glow"),
      // Fresh
      FilterDef("Tokyo Pastel", "Fresh", Color(0xFFF472B6), "Soft Japanese anime wash"),
      FilterDef("Emerald Boost", "Fresh", Color(0xFF10B981), "Lush botanical greens"),
      FilterDef("Vivid Sun", "Fresh", Color(0xFF06B6D4), "High vibrancy travel pop"),
      FilterDef("Fuji Clean", "Fresh", Color(0xFF2DD4BF), "Clean natural skin tone"),
      FilterDef("Mint Glow", "Fresh", Color(0xFF34D399), "Refreshing cool green"),
      FilterDef("Candy Pop", "Fresh", Color(0xFFFB7185), "Playful bubblegum sweetness"),
      FilterDef("Nordic Frost", "Fresh", Color(0xFF38BDF8), "Crisp Scandinavian cool"),
      // B&W
      FilterDef("B&W Retro", "B&W", Color(0xFF1F2937), "Classic black & white"),
      FilterDef("Monochrome Punch", "B&W", Color(0xFF111827), "Deep dynamic blacks"),
      FilterDef("Silver Tone", "B&W", Color(0xFF64748B), "High-key silver gelatin"),
      FilterDef("Matte Charcoal", "B&W", Color(0xFF334155), "Soft editorial gray tones"),
      FilterDef("Film Noir", "B&W", Color(0xFF030712), "Dramatic 1940s mystery"),
      // Glow & Cyber
      FilterDef("Cyberpunk", "Glow", Color(0xFFE040FB), "Neon futuristic city"),
      FilterDef("Neon Violet", "Glow", Color(0xFF8B5CF6), "Electric violet backlight"),
      FilterDef("Ultraviolet", "Glow", Color(0xFFA855F7), "Deep UV blacklight pop"),
      FilterDef("Matrix Green", "Glow", Color(0xFF15803D), "Digital cyberpunk code"),
      FilterDef("Soft Dream", "Glow", Color(0xFFC084FC), "Ethereal dreamy bloom")
    )
  }

  val categories = listOf("All", "Cinema", "Vintage", "Retro", "Fresh", "B&W", "Glow")
  val displayedFilters = remember(selectedCategory) {
    if (selectedCategory == "All") allFilters else allFilters.filter { it.category == selectedCategory || it.name == "Normal" }
  }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 10.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.ColorLens, contentDescription = null, tint = OrangePrimary)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "Filters & Color Grade",
              fontSize = 17.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF1F2937)
            )
          }
          Text(
            text = "Selected: $selectedFilter (${filterIntensity.toInt()}%)",
            fontSize = 12.sp,
            color = Color(0xFF6B7280)
          )
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
          }
          Button(
            onClick = {
              onApplyFilter(selectedFilter)
            },
            colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
          ) {
            Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("Apply", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Category Selector Chips
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(categories) { cat ->
          val isSelected = selectedCategory == cat
          FilterChip(
            selected = isSelected,
            onClick = { selectedCategory = cat },
            label = { Text(cat, fontSize = 11.sp) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangePrimary,
              selectedLabelColor = Color.White,
              containerColor = Color(0xFFF3F4F6),
              labelColor = Color(0xFF4B5563)
            )
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Intensity Slider if filter is not Normal
      if (selectedFilter != "Normal") {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Filter Strength", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
          Text("${filterIntensity.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
        }
        Slider(
          value = filterIntensity,
          onValueChange = { filterIntensity = it },
          valueRange = 10f..100f,
          colors = SliderDefaults.colors(
            thumbColor = OrangePrimary,
            activeTrackColor = OrangePrimary
          ),
          modifier = Modifier.fillMaxWidth()
        )
      }

      // Filter Thumbnails Horizontal Scroll
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        items(displayedFilters) { fDef ->
          val isSel = selectedFilter == fDef.name
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = if (isSel) OrangeContainer else Color(0xFFF9FAFB),
            border = BorderStroke(
              width = if (isSel) 2.dp else 1.dp,
              color = if (isSel) OrangePrimary else Color(0xFFE5E7EB)
            ),
            modifier = Modifier
              .width(90.dp)
              .clickable {
                selectedFilter = fDef.name
                onApplyFilter(fDef.name)
              }
              .padding(vertical = 4.dp)
          ) {
            Column(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 8.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              // Color Swatch Preview Circle
              Surface(
                shape = CircleShape,
                color = fDef.colorBadge,
                border = BorderStroke(1.dp, Color.White),
                modifier = Modifier.size(34.dp)
              ) {
                if (isSel) {
                  Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                  }
                }
              }
              Spacer(modifier = Modifier.height(6.dp))
              Text(
                text = fDef.name,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                color = if (isSel) OrangePrimary else Color(0xFF1F2937),
                textAlign = TextAlign.Center
              )
              Text(
                text = fDef.description,
                fontSize = 9.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                color = Color(0xFF9CA3AF),
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
 * Quick Aspect Ratio / Canvas Sheet with Studio Auto Background Blur
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickCanvasSheet(
  currentRatio: String = "9:16",
  autoBlurEnabled: Boolean = true,
  blurIntensity: Float = 35f,
  onToggleAutoBlur: (Boolean) -> Unit = {},
  onSelectBlurIntensity: (Float) -> Unit = {},
  onDismiss: () -> Unit,
  onApplyRatio: (String) -> Unit
) {
  val ratios = listOf(
    "9:16" to "Reels / TikTok / Shorts",
    "16:9" to "YouTube / Widescreen",
    "1:1" to "Square Post",
    "4:5" to "Instagram Portrait",
    "3:4" to "iPad / Tablet",
    "2:3" to "Photo Portrait",
    "4:3" to "Classic Display",
    "21:9" to "Cinematic Ultrawide"
  )

  val blurPresets = listOf(
    "Off" to 0f,
    "Soft" to 15f,
    "Studio Pro" to 35f,
    "Deep" to 65f,
    "Heavy" to 90f
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Canvas & Background",
          fontSize = 17.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1F2937)
        )
        IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      Text(
        text = "ASPECT RATIO",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF9CA3AF)
      )
      Spacer(modifier = Modifier.height(8.dp))

      Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        ratios.forEach { (ratio, desc) ->
          val isSelected = currentRatio == ratio
          OutlinedButton(
            onClick = { onApplyRatio(ratio) },
            border = BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) OrangePrimary else Color(0xFFE5E7EB)),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(
              containerColor = if (isSelected) OrangeContainer else Color.Transparent
            ),
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                if (isSelected) {
                  Icon(Icons.Default.Check, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(16.dp))
                  Spacer(modifier = Modifier.width(6.dp))
                }
                Text(ratio, fontWeight = FontWeight.Bold, color = if (isSelected) OrangePrimary else Color(0xFF1F2937))
              }
              Text(desc, fontSize = 11.sp, color = if (isSelected) OrangePrimary else Color(0xFF6B7280))
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Studio Signature Auto Background Blur
      Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF7ED)),
        border = BorderStroke(1.dp, OrangeLight),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Surface(
                shape = RoundedCornerShape(8.dp),
                color = OrangePrimary,
                modifier = Modifier.size(32.dp)
              ) {
                Box(contentAlignment = Alignment.Center) {
                  Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                }
              }
              Spacer(modifier = Modifier.width(10.dp))
              Column {
                Text("Auto Background Blur", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF9A3412))
                Text("Studio cinematic blurred video borders", fontSize = 10.sp, color = Color(0xFFC2410C))
              }
            }

            androidx.compose.material3.Switch(
              checked = autoBlurEnabled,
              onCheckedChange = { onToggleAutoBlur(it) },
              colors = androidx.compose.material3.SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = OrangePrimary
              )
            )
          }

          if (autoBlurEnabled) {
            Spacer(modifier = Modifier.height(10.dp))
            Text("Blur Intensity Presets:", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF9A3412))
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              items(blurPresets.size) { idx ->
                val (name, level) = blurPresets[idx]
                val isLevelSelected = kotlin.math.abs(blurIntensity.toDouble() - level.toDouble()) < 8.0
                FilterChip(
                  selected = isLevelSelected,
                  onClick = { onSelectBlurIntensity(level) },
                  label = { Text("$name (${level.toInt()}%)", fontSize = 11.sp, fontWeight = if (isLevelSelected) FontWeight.Bold else FontWeight.Normal) },
                  colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = OrangePrimary,
                    selectedLabelColor = Color.White
                  )
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

/**
 * Add Text Caption Dialog
 */
@Composable
private fun QuickAddTextDialog(
  onDismiss: () -> Unit,
  onAddText: (String) -> Unit
) {
  var caption by remember { mutableStateOf("") }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("Add Text Overlay", fontWeight = FontWeight.Bold, color = Color(0xFF1F2937)) },
    text = {
      OutlinedTextField(
        value = caption,
        onValueChange = { caption = it },
        placeholder = { Text("Enter caption or subtitle...") },
        singleLine = true,
        modifier = Modifier.fillMaxWidth()
      )
    },
    confirmButton = {
      Button(
        onClick = { if (caption.isNotBlank()) onAddText(caption) },
        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
      ) {
        Text("Add to Video", color = Color.White)
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Cancel", color = Color(0xFF6B7280))
      }
    },
    containerColor = Color.White
  )
}

/**
 * Quick Clip Volume Sheet (Mute, 100%, 200% boost)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickVolumeSheet(
  currentVolume: Float,
  isAudioClip: Boolean = false,
  areAllVideoClipsMuted: Boolean = false,
  onDismiss: () -> Unit,
  onApplyVolume: (Float) -> Unit,
  onApplyToAllClips: ((Float) -> Unit)? = null,
  onToggleMuteAllClips: (() -> Unit)? = null
) {
  var volume by remember { mutableFloatStateOf(currentVolume) }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      Text(
        text = if (isAudioClip) "Audio Track Volume" else "Clip Audio Volume",
        fontSize = 16.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF1F2937)
      )
      Spacer(modifier = Modifier.height(14.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Volume Level", fontSize = 13.sp, color = Color(0xFF4B5563))
        Text(
          text = if (volume == 0f) "MUTED (0%)" else "${(volume * 100).toInt()}%",
          fontSize = 15.sp,
          fontWeight = FontWeight.Bold,
          color = if (volume == 0f) Color(0xFFEF4444) else OrangePrimary
        )
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Direct Mute/Unmute Switch Card for This Clip
      Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(
          containerColor = if (volume == 0f) Color(0xFFFEF2F2) else Color(0xFFF9FAFB)
        ),
        border = BorderStroke(1.dp, if (volume == 0f) Color(0xFFFCA5A5) else Color(0xFFE5E7EB)),
        modifier = Modifier
          .fillMaxWidth()
          .clickable { volume = if (volume > 0f) 0f else 1.0f }
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = if (volume == 0f) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
              contentDescription = null,
              tint = if (volume == 0f) Color(0xFFEF4444) else OrangePrimary,
              modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Text(
                text = "Mute This Clip",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = if (volume == 0f) Color(0xFFB91C1C) else Color(0xFF1F2937)
              )
              Text(
                text = if (volume == 0f) "Clip sound is completely muted" else "Original audio is active",
                fontSize = 11.sp,
                color = Color(0xFF6B7280)
              )
            }
          }
          Switch(
            checked = (volume == 0f),
            onCheckedChange = { isMutedChecked ->
              volume = if (isMutedChecked) 0f else 1.0f
            },
            colors = SwitchDefaults.colors(
              checkedThumbColor = Color.White,
              checkedTrackColor = Color(0xFFEF4444)
            )
          )
        }
      }

      // Master 1-Tap Toggle for ALL Video Clips in Project
      if (!isAudioClip && onToggleMuteAllClips != null) {
        Spacer(modifier = Modifier.height(8.dp))
        Card(
          shape = RoundedCornerShape(10.dp),
          colors = CardDefaults.cardColors(
            containerColor = if (areAllVideoClipsMuted) Color(0xFFFEF2F2) else Color(0xFFF8FAFC)
          ),
          border = BorderStroke(1.dp, if (areAllVideoClipsMuted) Color(0xFFEF4444) else Color(0xFFCBD5E1)),
          modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggleMuteAllClips() }
            .testTag("btn_toggle_mute_all_clips_sheet")
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = if (areAllVideoClipsMuted) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
                contentDescription = null,
                tint = if (areAllVideoClipsMuted) Color(0xFFDC2626) else Color(0xFF334155),
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.width(10.dp))
              Column {
                Text(
                  text = if (areAllVideoClipsMuted) "All Clips Are Muted (✓ Muted)" else "Mute All Video Clips (1-Tap)",
                  fontWeight = FontWeight.Bold,
                  fontSize = 12.sp,
                  color = if (areAllVideoClipsMuted) Color(0xFF991B1B) else Color(0xFF1E293B)
                )
                Text(
                  text = "Mutes or unmutes all clips across the entire project",
                  fontSize = 10.sp,
                  color = Color(0xFF64748B)
                )
              }
            }
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = if (areAllVideoClipsMuted) Color(0xFFDC2626) else Color(0xFF334155)
            ) {
              Text(
                text = if (areAllVideoClipsMuted) "Unmute All" else "Mute All",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      Slider(
        value = volume,
        onValueChange = { volume = it },
        valueRange = 0.0f..2.0f,
        colors = SliderDefaults.colors(
          thumbColor = if (volume == 0f) Color(0xFFEF4444) else OrangePrimary,
          activeTrackColor = if (volume == 0f) Color(0xFFEF4444) else OrangePrimary
        ),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("slider_quick_volume")
      )

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        OutlinedButton(
          onClick = { volume = 0f },
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, if (volume == 0f) Color(0xFFEF4444) else Color(0xFFE5E7EB)),
          colors = ButtonDefaults.outlinedButtonColors(
            containerColor = if (volume == 0f) Color(0xFFFEE2E2) else Color.Transparent
          ),
          modifier = Modifier.weight(1f)
        ) {
          Icon(Icons.AutoMirrored.Filled.VolumeOff, contentDescription = null, tint = if (volume == 0f) Color(0xFFDC2626) else Color(0xFF1F2937), modifier = Modifier.size(15.dp))
          Spacer(modifier = Modifier.width(3.dp))
          Text("Mute", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (volume == 0f) Color(0xFFDC2626) else Color(0xFF1F2937))
        }
        OutlinedButton(
          onClick = { volume = 0.5f },
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
          modifier = Modifier.weight(1f)
        ) {
          Text("50%", fontSize = 11.sp, color = Color(0xFF1F2937))
        }
        OutlinedButton(
          onClick = { volume = 1f },
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
          modifier = Modifier.weight(1f)
        ) {
          Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = null, tint = Color(0xFF1F2937), modifier = Modifier.size(15.dp))
          Spacer(modifier = Modifier.width(3.dp))
          Text("100%", fontSize = 11.sp, color = Color(0xFF1F2937))
        }
        OutlinedButton(
          onClick = { volume = 2f },
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
          modifier = Modifier.weight(1f)
        ) {
          Text("200%", fontSize = 11.sp, color = Color(0xFF1F2937))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        if (!isAudioClip && onApplyToAllClips != null) {
          OutlinedButton(
            onClick = { onApplyToAllClips(volume) },
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.5.dp, OrangePrimary),
            colors = ButtonDefaults.outlinedButtonColors(
              containerColor = Color.White,
              contentColor = OrangePrimary
            ),
            modifier = Modifier
              .weight(1f)
              .height(46.dp)
              .testTag("btn_apply_volume_to_all")
          ) {
            Text("✓✓ Apply to All", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = OrangePrimary)
          }
        }

        Button(
          onClick = { onApplyVolume(volume) },
          colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .weight(1f)
            .height(46.dp)
            .testTag("btn_save_volume")
        ) {
          Text(if (!isAudioClip && onApplyToAllClips != null) "This Clip" else "Save Volume", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

/**
 * VFX Pro Quick Music & Sound Effects Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickMusicSheet(
  audioClips: List<MediaClip>,
  selectedVisualClip: MediaClip?,
  audioToReplaceId: String? = null,
  onStartReplacing: ((String) -> Unit)? = null,
  onCancelReplacing: (() -> Unit)? = null,
  onDismiss: () -> Unit,
  onPickDeviceAudio: () -> Unit,
  onPickVideoToExtractAudio: () -> Unit,
  onExtractAudio: () -> Unit,
  onAddPresetMusic: (title: String, durationMs: Long) -> Unit,
  onAddSfx: (title: String) -> Unit,
  onSetAudioVolume: (clipId: String, volume: Float) -> Unit,
  onDeleteAudioClip: (clipId: String) -> Unit,
  onDeleteAllAudio: () -> Unit
) {
  var selectedTab by remember { mutableIntStateOf(if (audioToReplaceId != null) 0 else if (audioClips.isNotEmpty()) 3 else 0) }
  val tabs = listOf("Music", "Device Audio", "Sound FX", "Timeline")

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 10.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.Audiotrack, contentDescription = null, tint = OrangePrimary)
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = if (audioToReplaceId != null) "Change / Replace Audio" else "Music & Sound Effects",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1F2937)
          )
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      // If in Replace Mode, show a highlighted guidance banner
      if (audioToReplaceId != null) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = Color(0xFFFEF3C7),
          border = BorderStroke(1.5.dp, Color(0xFFF59E0B)),
          modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
        ) {
          Row(
            modifier = Modifier.padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
              Icon(Icons.Default.Sync, contentDescription = null, tint = Color(0xFFB45309), modifier = Modifier.size(20.dp))
              Spacer(modifier = Modifier.width(8.dp))
              Column {
                Text("Replacing Selected Track", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF92400E))
                Text("Pick any music track, device song, or SFX to replace it", fontSize = 10.sp, color = Color(0xFFB45309))
              }
            }
            TextButton(
              onClick = { onCancelReplacing?.invoke() },
              colors = ButtonDefaults.textButtonColors(contentColor = Color(0xFFB45309))
            ) {
              Text("Cancel", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
          }
        }
      } else {
        Spacer(modifier = Modifier.height(6.dp))
      }

      // Segmented Tabs
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        tabs.forEachIndexed { index, tabName ->
          val isSelected = selectedTab == index
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isSelected) OrangeContainer else Color(0xFFF3F4F6),
            border = BorderStroke(1.dp, if (isSelected) OrangePrimary else Color(0xFFE5E7EB)),
            onClick = { selectedTab = index },
            modifier = Modifier.weight(1f)
          ) {
            Text(
              text = tabName,
              fontSize = 11.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
              color = if (isSelected) OrangeOnContainer else Color(0xFF4B5563),
              textAlign = TextAlign.Center,
              modifier = Modifier.padding(vertical = 8.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      when (selectedTab) {
        // Tab 0: Royalty-Free Music Library
        0 -> {
          val presetSongs = remember {
            listOf(
              Pair("Lo-Fi Sunset Chill", 165000L),
              Pair("Summer Vlog Upbeat", 130000L),
              Pair("Cinematic Trailer Orchestral", 100000L),
              Pair("Neon Cyber Synthwave", 180000L),
              Pair("Acoustic Coffee Morning", 140000L),
              Pair("Phonk Drift Beat", 135000L),
              Pair("Happy Sunshine Ukulele", 120000L),
              Pair("Midnight Study Beats", 155000L),
              Pair("Rainy Window Lo-Fi", 175000L),
              Pair("Tokyo Night City Lights", 145000L),
              Pair("Epic Adventure Rise", 110000L),
              Pair("Action Chase Hybrid EDM", 125000L),
              Pair("Daily Vlog Bossa Nova", 135000L),
              Pair("Hyperpop Glitch Beat", 115000L),
              Pair("Deep Space Ambient Drone", 190000L),
              Pair("Romantic Piano Serenade", 140000L),
              Pair("Bass Drop Festival Hype", 130000L),
              Pair("Chillhop Warm Breeze", 160000L),
              Pair("Latin Groove Fiesta", 125000L),
              Pair("Travel Story Indie Pop", 150000L)
            )
          }
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            presetSongs.forEach { (songTitle, durMs) ->
              Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF9FAFB)),
                border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
                modifier = Modifier.fillMaxWidth()
              ) {
                Row(
                  modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                      shape = CircleShape,
                      color = OrangeContainer,
                      modifier = Modifier.size(36.dp)
                    ) {
                      Box(contentAlignment = Alignment.Center) {
                        Icon(
                          imageVector = Icons.Default.Audiotrack,
                          contentDescription = null,
                          tint = OrangePrimary,
                          modifier = Modifier.size(20.dp)
                        )
                      }
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                      Text(songTitle, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF1F2937))
                      Text("Royalty-free • ${formatTimecode(durMs)}", fontSize = 11.sp, color = Color(0xFF6B7280))
                    }
                  }
                  Button(
                    onClick = { onAddPresetMusic(songTitle, durMs) },
                    colors = ButtonDefaults.buttonColors(containerColor = if (audioToReplaceId != null) Color(0xFF059669) else OrangePrimary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                  ) {
                    Text(if (audioToReplaceId != null) "Replace" else "Add", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                  }
                }
              }
            }
          }
        }

        // Tab 1: Device Audio & Extract from Video
        1 -> {
          Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Card(
              shape = RoundedCornerShape(12.dp),
              colors = CardDefaults.cardColors(containerColor = OrangeContainer),
              border = BorderStroke(1.5.dp, OrangePrimary),
              onClick = onPickDeviceAudio,
              modifier = Modifier
                .fillMaxWidth()
                .testTag("btn_pick_device_audio")
            ) {
              Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  imageVector = Icons.Default.Audiotrack,
                  contentDescription = null,
                  tint = OrangePrimary,
                  modifier = Modifier.size(30.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                  Text(
                    text = "Choose Audio from Phone Storage",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = OrangeOnContainer
                  )
                  Text(
                    text = "Pick MP3, WAV, AAC, M4A, FLAC songs or audio files",
                    fontSize = 11.sp,
                    color = OrangeOnContainer.copy(alpha = 0.8f)
                  )
                }
              }
            }

            Card(
              shape = RoundedCornerShape(12.dp),
              colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
              border = BorderStroke(1.5.dp, Color(0xFF3B82F6)),
              onClick = onPickVideoToExtractAudio,
              modifier = Modifier
                .fillMaxWidth()
                .testTag("btn_extract_audio_from_any_video")
            ) {
              Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  imageVector = Icons.Default.VideoLibrary,
                  contentDescription = null,
                  tint = Color(0xFF2563EB),
                  modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                  Text(
                    text = "Extract Audio from Any Video",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = Color(0xFF1E3A8A)
                  )
                  Text(
                    text = "Pick any video file on phone to extract & use its sound",
                    fontSize = 11.sp,
                    color = Color(0xFF2563EB)
                  )
                }
              }
            }

            if (selectedVisualClip != null) {
              Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF9FAFB)),
                border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
                onClick = onExtractAudio,
                modifier = Modifier
                  .fillMaxWidth()
                  .testTag("btn_extract_audio")
              ) {
                Row(
                  modifier = Modifier.padding(14.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Icon(
                    imageVector = Icons.Default.ContentCut,
                    contentDescription = null,
                    tint = OrangePrimary,
                    modifier = Modifier.size(24.dp)
                  )
                  Spacer(modifier = Modifier.width(12.dp))
                  Column {
                    Text(
                      text = "Extract Audio from '${selectedVisualClip.title}'",
                      fontWeight = FontWeight.Bold,
                      fontSize = 13.sp,
                      color = Color(0xFF1F2937)
                    )
                    Text(
                      text = "Separate video sound into its own timeline audio track",
                      fontSize = 11.sp,
                      color = Color(0xFF6B7280)
                    )
                  }
                }
              }
            }
          }
        }

        // Tab 2: SFX & Memes
        2 -> {
          val sfxList = remember {
            listOf(
              "Whoosh Transition",
              "Deep Swoosh Air",
              "Glitch Hit",
              "Ding Bell",
              "Camera Shutter Click",
              "Film Projector Click",
              "Applause & Cheers",
              "Record Scratch",
              "Airhorn Blast",
              "Pop Bubble",
              "Message Ping Chime",
              "Coin Collect Level Up",
              "Success Fanfare",
              "Sad Trombone Fail",
              "Dramatic Dun Dun Dun",
              "Bruh Sound Effect",
              "Heavy Bass Sub Impact",
              "Cinematic Boom Hit",
              "Sword Slash Clang",
              "Punch Impact Hit",
              "Crowd Laugh Laughing",
              "Cartoon Boing Spring",
              "Tape Rewind Fast",
              "Clock Ticking Countdown",
              "Thunder Crack Boom",
              "Laser Beam Zap"
            )
          }
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            sfxList.forEach { sfxTitle ->
              Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF9FAFB)),
                border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
                modifier = Modifier.fillMaxWidth()
              ) {
                Row(
                  modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(sfxTitle, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color(0xFF1F2937))
                  Button(
                    onClick = { onAddSfx(sfxTitle) },
                    colors = ButtonDefaults.buttonColors(containerColor = if (audioToReplaceId != null) Color(0xFF059669) else OrangePrimary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp)
                  ) {
                    Text(if (audioToReplaceId != null) "Replace" else "Insert", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                  }
                }
              }
            }
          }
        }

        // Tab 3: Timeline Audio
        3 -> {
          if (audioClips.isEmpty()) {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
              contentAlignment = Alignment.Center
            ) {
              Text("No audio clips on timeline yet", color = Color(0xFF9CA3AF), fontSize = 13.sp)
            }
          } else {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
              verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              audioClips.forEach { aClip ->
                Card(
                  shape = RoundedCornerShape(10.dp),
                  colors = CardDefaults.cardColors(containerColor = Color(0xFFF9FAFB)),
                  border = BorderStroke(1.dp, Color(0xFFE5E7EB)),
                  modifier = Modifier.fillMaxWidth()
                ) {
                  Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                      modifier = Modifier.fillMaxWidth(),
                      horizontalArrangement = Arrangement.SpaceBetween,
                      verticalAlignment = Alignment.CenterVertically
                    ) {
                      Column(modifier = Modifier.weight(1f)) {
                        Text(aClip.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF1F2937))
                        Text("Duration: ${formatTimecode(aClip.durationMs)}", fontSize = 11.sp, color = Color(0xFF6B7280))
                      }
                      Row(verticalAlignment = Alignment.CenterVertically) {
                        // Change / Replace Audio Track
                        Button(
                          onClick = {
                            onStartReplacing?.invoke(aClip.id)
                            selectedTab = 0
                          },
                          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                          shape = RoundedCornerShape(6.dp),
                          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                          modifier = Modifier.height(30.dp)
                        ) {
                          Icon(Icons.Default.Sync, contentDescription = null, tint = Color.White, modifier = Modifier.size(13.dp))
                          Spacer(modifier = Modifier.width(3.dp))
                          Text("Change", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        // Delete Audio Track
                        IconButton(onClick = { onDeleteAudioClip(aClip.id) }) {
                          Icon(Icons.Default.Delete, contentDescription = "Delete Track", tint = Color(0xFFDC2626))
                        }
                      }
                    }
                    Row(
                      modifier = Modifier.fillMaxWidth(),
                      verticalAlignment = Alignment.CenterVertically
                    ) {
                      Text("Vol: ${(aClip.volume * 100).toInt()}%", fontSize = 11.sp, color = Color(0xFF6B7280), modifier = Modifier.width(60.dp))
                      Slider(
                        value = aClip.volume,
                        onValueChange = { onSetAudioVolume(aClip.id, it) },
                        valueRange = 0f..2f,
                        modifier = Modifier.weight(1f)
                      )
                    }
                  }
                }
              }

              // Delete All Audio Button
              OutlinedButton(
                onClick = onDeleteAllAudio,
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFDC2626)),
                border = BorderStroke(1.dp, Color(0xFFFCA5A5)),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(top = 4.dp)
              ) {
                Icon(Icons.Default.DeleteSweep, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Delete All Audio Tracks", fontSize = 12.sp, fontWeight = FontWeight.Bold)
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))
    }
  }
}

private fun formatTimecode(ms: Long): String {
  val totalSec = ms / 1000
  val min = totalSec / 60
  val sec = totalSec % 60
  return String.format(Locale.US, "%02d:%02d", min, sec)
}

/**
 * Transitions Between Clips Sheet
 * Supports Crossfade, Zoom In, Whip Pan, Dissolve, Glitch, Slide, and Spin animations at cut marks
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickTransitionSheet(
  currentTransition: String,
  currentDurationMs: Long,
  onDismiss: () -> Unit,
  onApplyTransition: (type: String, durMs: Long) -> Unit,
  onApplyToAll: (type: String, durMs: Long) -> Unit
) {
  var selectedTransition by remember { mutableStateOf(currentTransition) }
  var durationMs by remember { mutableFloatStateOf(currentDurationMs.coerceIn(200L, 2000L).toFloat()) }

  data class TransitionItem(
    val id: String,
    val name: String,
    val desc: String,
    val icon: ImageVector
  )

  val transitions = listOf(
    TransitionItem("Crossfade", "Crossfade", "Smooth dissolve blend", Icons.Default.SwapHoriz),
    TransitionItem("Flash White", "Flash White", "High-energy white flash burst", Icons.Default.AutoAwesome),
    TransitionItem("Zoom In", "Zoom In", "Dynamic zoom into clip", Icons.Default.AspectRatio),
    TransitionItem("Zoom Out", "Zoom Out", "Pull out transition reveal", Icons.Default.AspectRatio),
    TransitionItem("Whip Pan", "Whip Pan", "High-speed camera whip", Icons.Default.Speed),
    TransitionItem("Dissolve", "Dissolve", "Soft optical blend", Icons.Default.AutoAwesome),
    TransitionItem("Glitch", "Glitch", "Chromatic RGB split", Icons.Default.Tune),
    TransitionItem("Slide Left", "Slide Left", "Directional horizontal push", Icons.AutoMirrored.Filled.ArrowBack),
    TransitionItem("Slide Right", "Slide Right", "Directional horizontal push", Icons.AutoMirrored.Filled.ArrowForward),
    TransitionItem("Push Up", "Push Up", "Vertical upwards slide push", Icons.Default.Layers),
    TransitionItem("Push Down", "Push Down", "Vertical downwards slide push", Icons.Default.Layers),
    TransitionItem("Spin & Zoom", "Spin & Zoom", "Vortex 360° spin & pop", Icons.Default.RotateRight),
    TransitionItem("Film Roll", "Film Roll", "Vertical vintage film frame roll", Icons.Default.Movie),
    TransitionItem("Blur Dissolve", "Blur Dissolve", "Optically blurred cross dissolve", Icons.Default.Wallpaper),
    TransitionItem("Fade to Black", "Fade Black", "Classic cinema dip to black", Icons.Default.Movie),
    TransitionItem("None", "None", "Direct hard cut", Icons.Default.Close)
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "Clip Transitions ⧓",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1F2937)
          )
          Text(
            text = "Smooth cinematic cut animations between clips",
            fontSize = 12.sp,
            color = Color(0xFF6B7280)
          )
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Transition Duration Slider
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Transition Duration",
          fontSize = 13.sp,
          fontWeight = FontWeight.SemiBold,
          color = Color(0xFF374151)
        )
        Text(
          text = String.format(Locale.US, "%.1fs", durationMs / 1000f),
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          color = OrangePrimary
        )
      }

      Slider(
        value = durationMs,
        onValueChange = { durationMs = it },
        valueRange = 200f..2000f,
        steps = 17,
        colors = SliderDefaults.colors(
          thumbColor = OrangePrimary,
          activeTrackColor = OrangePrimary
        ),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("slider_transition_duration")
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Transitions Grid / Row
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("row_transitions_list")
      ) {
        itemsIndexed(transitions) { _, item ->
          val isSelected = selectedTransition == item.id
          Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
              containerColor = if (isSelected) OrangeContainer else Color(0xFFF9FAFB)
            ),
            border = BorderStroke(
              1.5.dp,
              if (isSelected) OrangePrimary else Color(0xFFE5E7EB)
            ),
            modifier = Modifier
              .width(105.dp)
              .clickable { selectedTransition = item.id }
              .testTag("card_transition_${item.id.replace(" ", "_")}")
          ) {
            Column(
              modifier = Modifier.padding(10.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Box(
                modifier = Modifier
                  .size(36.dp)
                  .background(
                    if (isSelected) OrangePrimary else Color(0xFFE2E8F0),
                    CircleShape
                  ),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = item.icon,
                  contentDescription = item.name,
                  tint = if (isSelected) Color.White else Color(0xFF475569),
                  modifier = Modifier.size(20.dp)
                )
              }
              Spacer(modifier = Modifier.height(6.dp))
              Text(
                text = item.name,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) OrangePrimaryDark else Color(0xFF1E293B),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
              Text(
                text = item.desc,
                fontSize = 9.sp,
                color = Color(0xFF64748B),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Action Buttons: Apply to Cut & Apply to All
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedButton(
          onClick = { onApplyToAll(selectedTransition, durationMs.toLong()) },
          colors = ButtonDefaults.outlinedButtonColors(contentColor = OrangePrimary),
          border = BorderStroke(1.dp, OrangePrimary),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1f)
            .height(44.dp)
            .testTag("btn_apply_transition_all")
        ) {
          Text("Apply to All", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        }

        Button(
          onClick = { onApplyTransition(selectedTransition, durationMs.toLong()) },
          colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1.2f)
            .height(44.dp)
            .testTag("btn_apply_transition")
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Apply to Cut", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }
    }
  }
}

/**
 * Keyframe Animation Sheet (VFX Pro Diamond Keyframes)
 * Controls timeline diamond keyframes for Scale (size), Position X, Position Y, Rotation, and Opacity
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickKeyframeSheet(
  clip: MediaClip,
  currentPositionMs: Long,
  onDismiss: () -> Unit,
  onSetKeyframe: (property: String, timeMs: Long, value: Float, easing: String) -> Unit,
  onRemoveKeyframe: (property: String, timeMs: Long) -> Unit,
  onApplyPreset: (preset: String) -> Unit,
  onClearKeyframes: (property: String?) -> Unit
) {
  var selectedProperty by remember { mutableStateOf("Scale") }
  var selectedEasing by remember { mutableStateOf("Linear") }

  data class PropertyDef(
    val name: String,
    val minVal: Float,
    val maxVal: Float,
    val defaultVal: Float,
    val unit: String
  )

  val properties = listOf(
    PropertyDef("Scale", 0.2f, 3.0f, 1.0f, "x"),
    PropertyDef("Position X", -400f, 400f, 0f, "px"),
    PropertyDef("Position Y", -400f, 400f, 0f, "px"),
    PropertyDef("Rotation", -180f, 180f, 0f, "°"),
    PropertyDef("Opacity", 0f, 100f, 100f, "%")
  )

  val activePropDef = properties.firstOrNull { it.name == selectedProperty } ?: properties[0]
  val currentKeyframes = clip.transformKeyframes[selectedProperty] ?: emptyList()
  val isAtKf = isAtKeyframe(currentKeyframes, currentPositionMs, toleranceMs = 200L)
  val currentValue = interpolateKeyframeValue(currentKeyframes, currentPositionMs, activePropDef.defaultVal)

  val presets = listOf(
    "Slow Zoom In",
    "Pulse Pop",
    "Cinematic Pan",
    "Fade In & Out",
    "Spin Entrance",
    "Slide In Left"
  )

  val easings = listOf("Linear", "EaseIn", "EaseOut", "EaseInOut")

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF1F2937)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .navigationBarsPadding()
        .verticalScroll(rememberScrollState())
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(Icons.Default.Diamond, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(20.dp))
            Text(
              text = "Keyframe Animation (◆)",
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF1F2937)
            )
          }
          Text(
            text = "Animate size, position, rotation & opacity at ${formatTimecode(currentPositionMs)}",
            fontSize = 12.sp,
            color = Color(0xFF6B7280)
          )
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF6B7280))
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // VFX Pro Motion Presets Row (1-tap Motion Animation)
      Text(
        text = "Motion Presets (1-Tap Animate)",
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = Color(0xFF4B5563)
      )
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        itemsIndexed(presets) { _, preset ->
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFFFFF7ED),
            border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.5f)),
            modifier = Modifier
              .clickable { onApplyPreset(preset) }
              .testTag("preset_$preset")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(13.dp))
              Text(preset, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = OrangePrimaryDark)
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Transform Property Selector Tabs
      Text(
        text = "Select Transform Property",
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = Color(0xFF4B5563)
      )
      Spacer(modifier = Modifier.height(6.dp))
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        itemsIndexed(properties) { _, prop ->
          val isSelected = selectedProperty == prop.name
          val count = (clip.transformKeyframes[prop.name] ?: emptyList()).size
          FilterChip(
            selected = isSelected,
            onClick = { selectedProperty = prop.name },
            label = {
              Text(
                text = if (count > 0) "${prop.name} (◆$count)" else prop.name,
                fontSize = 11.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
              )
            },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangePrimary,
              selectedLabelColor = Color.White
            ),
            modifier = Modifier.testTag("prop_chip_${prop.name.replace(" ", "_")}")
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Current Property Value & Diamond Action Button
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column {
              Text(
                text = "$selectedProperty at Playhead",
                fontSize = 12.sp,
                color = Color(0xFF64748B)
              )
              Text(
                text = String.format(Locale.US, "%.1f %s", currentValue, activePropDef.unit),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (isAtKf) OrangePrimary else Color(0xFF1E293B)
              )
            }

            // Big Diamond Add/Remove Button
            if (isAtKf) {
              Button(
                onClick = { onRemoveKeyframe(selectedProperty, currentPositionMs) },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                modifier = Modifier.testTag("btn_remove_keyframe")
              ) {
                Icon(Icons.Default.Diamond, contentDescription = null, modifier = Modifier.size(15.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("- Remove ◆", fontSize = 11.sp, fontWeight = FontWeight.Bold)
              }
            } else {
              Button(
                onClick = {
                  onSetKeyframe(selectedProperty, currentPositionMs, currentValue, selectedEasing)
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                modifier = Modifier.testTag("btn_add_keyframe")
              ) {
                Icon(Icons.Default.Diamond, contentDescription = null, modifier = Modifier.size(15.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("+ Add ◆", fontSize = 11.sp, fontWeight = FontWeight.Bold)
              }
            }
          }

          Spacer(modifier = Modifier.height(10.dp))

          // Slider to adjust value directly & auto-set keyframe
          Slider(
            value = currentValue.coerceIn(activePropDef.minVal, activePropDef.maxVal),
            onValueChange = { newVal ->
              onSetKeyframe(selectedProperty, currentPositionMs, newVal, selectedEasing)
            },
            valueRange = activePropDef.minVal..activePropDef.maxVal,
            colors = SliderDefaults.colors(
              thumbColor = OrangePrimary,
              activeTrackColor = OrangePrimary
            ),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("slider_keyframe_val")
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Easing Curves Selector
      Text(
        text = "Interpolation Curve",
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = Color(0xFF4B5563)
      )
      Spacer(modifier = Modifier.height(6.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        easings.forEach { easing ->
          val isSelected = selectedEasing == easing
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = if (isSelected) OrangeContainer else Color(0xFFF1F5F9),
            border = BorderStroke(1.dp, if (isSelected) OrangePrimary else Color.Transparent),
            modifier = Modifier
              .weight(1f)
              .clickable { selectedEasing = easing }
              .testTag("easing_$easing")
          ) {
            Text(
              text = easing,
              fontSize = 10.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
              color = if (isSelected) OrangePrimaryDark else Color(0xFF475569),
              textAlign = TextAlign.Center,
              modifier = Modifier.padding(vertical = 6.dp)
            )
          }
        }
      }

      // Existing Keyframe List for this Property
      if (currentKeyframes.isNotEmpty()) {
        Spacer(modifier = Modifier.height(16.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Active Keyframes (${currentKeyframes.size})",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1E293B)
          )
          TextButton(
            onClick = { onClearKeyframes(selectedProperty) },
            contentPadding = PaddingValues(0.dp)
          ) {
            Text("Clear $selectedProperty", fontSize = 11.sp, color = Color(0xFFEF4444))
          }
        }

        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
          currentKeyframes.forEach { kf ->
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFF8FAFC), RoundedCornerShape(6.dp))
                .padding(horizontal = 10.dp, vertical = 6.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Icon(
                  Icons.Default.Diamond,
                  contentDescription = null,
                  tint = OrangePrimary,
                  modifier = Modifier.size(13.dp)
                )
                Text(
                  text = formatTimecode(kf.timeMs),
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color(0xFF1E293B)
                )
                Text(
                  text = "${String.format(Locale.US, "%.1f", kf.value)} ${activePropDef.unit} (${kf.easing})",
                  fontSize = 11.sp,
                  color = Color(0xFF64748B)
                )
              }

              IconButton(
                onClick = { onRemoveKeyframe(selectedProperty, kf.timeMs) },
                modifier = Modifier.size(24.dp)
              ) {
                Icon(
                  Icons.Default.Delete,
                  contentDescription = "Delete",
                  tint = Color(0xFF94A3B8),
                  modifier = Modifier.size(14.dp)
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Bottom Clear All & Done buttons
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        OutlinedButton(
          onClick = {
            onClearKeyframes(null)
            onDismiss()
          },
          colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444)),
          border = BorderStroke(1.dp, Color(0xFFEF4444)),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1f)
            .height(44.dp)
        ) {
          Text("Clear All", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        }

        Button(
          onClick = onDismiss,
          colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1.5f)
            .height(44.dp)
            .testTag("btn_keyframe_done")
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Done", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }
    }
  }
}

private data class ChromaColorPreset(val name: String, val hex: Long, val color: Color)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickChromaKeySheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyChromaKey: (enabled: Boolean, color: Long, intensity: Float, shadow: Float, softness: Float) -> Unit
) {
  var isEnabled by remember { mutableStateOf(clip.chromaKeyEnabled) }
  var selectedColorHex by remember { mutableStateOf(clip.chromaKeyColor) }
  var intensity by remember { mutableFloatStateOf(clip.chromaIntensity) }
  var shadow by remember { mutableFloatStateOf(clip.chromaShadow) }
  var softness by remember { mutableFloatStateOf(clip.chromaSoftness) }

  val colorPresets = listOf(
    ChromaColorPreset("Green Screen", 0xFF00FF00, Color(0xFF00FF00)),
    ChromaColorPreset("Studio Green", 0xFF00E676, Color(0xFF00E676)),
    ChromaColorPreset("Deep Green", 0xFF007E33, Color(0xFF007E33)),
    ChromaColorPreset("Blue Screen", 0xFF0044FF, Color(0xFF0044FF)),
    ChromaColorPreset("Sky Cyan", 0xFF00BCD4, Color(0xFF00BCD4)),
    ChromaColorPreset("Magenta Key", 0xFFE91E63, Color(0xFFE91E63))
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    containerColor = Color.White,
    shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .padding(bottom = 24.dp)
    ) {
      // Header: Chroma Key (Green Screen) title & Enable Switch
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = Color(0xFFECFDF5),
            border = BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.5f)),
            modifier = Modifier.size(36.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.ColorLens,
                contentDescription = null,
                tint = Color(0xFF10B981),
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Chroma Key (Green Screen)",
              fontSize = 15.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF0F172A)
            )
            Text(
              text = "Remove green/blue screen for transparent overlay",
              fontSize = 11.sp,
              color = Color(0xFF64748B)
            )
          }
        }

        Switch(
          checked = isEnabled,
          onCheckedChange = { isEnabled = it },
          colors = SwitchDefaults.colors(
            checkedThumbColor = Color.White,
            checkedTrackColor = Color(0xFF10B981)
          ),
          modifier = Modifier.testTag("switch_chroma_key_enable")
        )
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Live Checkerboard Transparency Swatch Preview
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(14.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Column {
            Text(
              text = "KEY STATUS",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              letterSpacing = 1.sp,
              color = Color(0xFF94A3B8)
            )
            Text(
              text = if (isEnabled) "Active: #%06X".format(selectedColorHex and 0xFFFFFF) else "Disabled",
              fontSize = 13.sp,
              fontWeight = FontWeight.Bold,
              color = if (isEnabled) Color(0xFF34D399) else Color(0xFFEF4444)
            )
            Text(
              text = "Tolerance: ${intensity.toInt()}% • Shadow: ${shadow.toInt()}%",
              fontSize = 10.sp,
              color = Color(0xFF64748B)
            )
          }

          // Visual checkerboard preview swatch
          Box(
            modifier = Modifier
              .size(54.dp)
              .clip(RoundedCornerShape(8.dp))
              .border(1.5.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
          ) {
            androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
              val sq = 12.dp.toPx()
              for (r in 0..4) {
                for (c in 0..4) {
                  if ((r + c) % 2 == 0) {
                    drawRect(Color(0xFF334155), Offset(c * sq, r * sq), Size(sq, sq))
                  } else {
                    drawRect(Color(0xFF1E293B), Offset(c * sq, r * sq), Size(sq, sq))
                  }
                }
              }
            }

            Box(
              modifier = Modifier
                .align(Alignment.Center)
                .size(24.dp)
                .clip(CircleShape)
                .background(Color(selectedColorHex))
                .border(1.5.dp, Color.White, CircleShape)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Section: Color Picker Swatches
      Text(
        text = "SELECT KEY COLOR",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = Color(0xFF64748B)
      )

      Spacer(modifier = Modifier.height(8.dp))

      Row(
        modifier = Modifier
          .fillMaxWidth()
          .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        colorPresets.forEach { preset ->
          val isSelected = selectedColorHex == preset.hex
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = if (isSelected) Color(0xFFF1F5F9) else Color.White,
            border = BorderStroke(
              if (isSelected) 2.dp else 1.dp,
              if (isSelected) OrangePrimary else Color(0xFFE2E8F0)
            ),
            modifier = Modifier
              .clickable {
                selectedColorHex = preset.hex
                isEnabled = true
              }
              .testTag("color_preset_${preset.name.lowercase().replace(" ", "_")}")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                modifier = Modifier
                  .size(16.dp)
                  .clip(CircleShape)
                  .background(preset.color)
                  .border(1.dp, Color.Black.copy(alpha = 0.2f), CircleShape)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = preset.name,
                fontSize = 11.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color(0xFF0F172A) else Color(0xFF475569)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Slider 1: Intensity / Tolerance
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Color Intensity / Tolerance", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1E293B))
        Text("${intensity.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
      }
      Slider(
        value = intensity,
        onValueChange = { intensity = it },
        valueRange = 5f..100f,
        enabled = isEnabled,
        colors = SliderDefaults.colors(
          thumbColor = OrangePrimary,
          activeTrackColor = OrangePrimary
        ),
        modifier = Modifier.testTag("slider_chroma_intensity")
      )

      Spacer(modifier = Modifier.height(8.dp))

      // Slider 2: Spill / Shadow Suppression
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Spill & Shadow Suppression", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1E293B))
        Text("${shadow.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
      }
      Slider(
        value = shadow,
        onValueChange = { shadow = it },
        valueRange = 0f..100f,
        enabled = isEnabled,
        colors = SliderDefaults.colors(
          thumbColor = OrangePrimary,
          activeTrackColor = OrangePrimary
        ),
        modifier = Modifier.testTag("slider_chroma_shadow")
      )

      Spacer(modifier = Modifier.height(8.dp))

      // Slider 3: Edge Softness / Feather
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Edge Softness (Feather)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1E293B))
        Text("${softness.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
      }
      Slider(
        value = softness,
        onValueChange = { softness = it },
        valueRange = 0f..100f,
        enabled = isEnabled,
        colors = SliderDefaults.colors(
          thumbColor = OrangePrimary,
          activeTrackColor = OrangePrimary
        ),
        modifier = Modifier.testTag("slider_chroma_softness")
      )

      Spacer(modifier = Modifier.height(20.dp))

      // Bottom Action Buttons: Reset & Apply
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        OutlinedButton(
          onClick = {
            isEnabled = false
            intensity = 50f
            shadow = 30f
            softness = 20f
            selectedColorHex = 0xFF00FF00
            onApplyChromaKey(false, 0xFF00FF00, 50f, 30f, 20f)
          },
          border = BorderStroke(1.dp, Color(0xFFCBD5E1)),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1f)
            .height(44.dp)
            .testTag("btn_chroma_reset")
        ) {
          Text("Reset", fontSize = 13.sp, color = Color(0xFF64748B))
        }

        Button(
          onClick = {
            onApplyChromaKey(isEnabled, selectedColorHex, intensity, shadow, softness)
          },
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1.5f)
            .height(44.dp)
            .testTag("btn_chroma_apply")
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Apply Chroma Key", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }
    }
  }
}

private data class VoiceFilterItem(
  val id: String,
  val name: String,
  val desc: String,
  val defaultPitch: Float,
  val icon: ImageVector,
  val tag: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickVoiceEffectsSheet(
  clip: MediaClip,
  onDismiss: () -> Unit,
  onApplyVoiceEffect: (effect: String, pitch: Float, noiseReduction: Boolean) -> Unit,
  onApplyToAll: (effect: String, pitch: Float, noiseReduction: Boolean) -> Unit,
  onGenerateVoiceover: (text: String, voiceName: String, isSpeechToSong: Boolean, melodyStyle: String) -> Unit = { _, _, _, _ -> }
) {
  var selectedEffect by remember { mutableStateOf(clip.voiceEffect) }
  var pitch by remember { mutableFloatStateOf(clip.voicePitch) }
  var noiseReduction by remember { mutableStateOf(clip.noiseReductionEnabled) }

  val voiceFilters = listOf(
    VoiceFilterItem("None", "Original", "Original clean audio bypass", 1.0f, Icons.Default.Audiotrack, "Bypass"),
    VoiceFilterItem("Chipmunk", "Chipmunk", "Cartoon high squeak (+8 semi, 1.75x)", 1.75f, Icons.Default.AutoAwesome, "Viral"),
    VoiceFilterItem("Deep Male", "Deep Male", "Low resonant baritone (-6 semi, 0.65x)", 0.65f, Icons.Default.Mic, "Cinema"),
    VoiceFilterItem("Robot", "Robot", "Synthetic vocoder modulation", 0.9f, Icons.Default.SmartToy, "Sci-Fi"),
    VoiceFilterItem("Echo", "Echo", "Cavernous delay reverberation", 1.0f, Icons.Default.GraphicEq, "Spatial"),
    VoiceFilterItem("Noise Reduction", "Noise Clean", "AI Vocal isolation & hum gate", 1.0f, Icons.Default.Tune, "Pro AI")
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    containerColor = Color.White,
    shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 12.dp)
        .padding(bottom = 24.dp)
    ) {
      // Header: Voice Effects / Voice Changer
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = Color(0xFFF5F3FF),
            border = BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.5f)),
            modifier = Modifier.size(36.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.RecordVoiceOver,
                contentDescription = null,
                tint = Color(0xFF8B5CF6),
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Voice Effects & Changer",
              fontSize = 15.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF0F172A)
            )
            Text(
              text = "Chipmunk, Deep Male, Robot, Echo & Noise Clean",
              fontSize = 11.sp,
              color = Color(0xFF64748B)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // AI Voiceover (Text-to-Speech) & Speech-to-Song
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFFF8FAFC),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("section_ai_voiceover_tts")
      ) {
        var ttsInputText by remember { mutableStateOf("Welcome to this viral edit! Like and subscribe.") }
        var selectedTtsVoice by remember { mutableStateOf("Jessie (Viral Female)") }
        var isSpeechToSong by remember { mutableStateOf(false) }
        var songMelody by remember { mutableStateOf("Pop Anthem (120 BPM)") }
        var ttsGeneratedSuccess by remember { mutableStateOf(false) }

        val voiceOptions = listOf(
          "Jessie (Viral Female)",
          "Deep Storyteller (Male)",
          "Energetic Hype (Promo)",
          "Anime Kawaii (Cute)",
          "British Narrator",
          "ASMR Whispers"
        )
        val melodyOptions = listOf(
          "Pop Anthem (120 BPM)",
          "Lofi Chillhop (85 BPM)",
          "Trap Beat (140 BPM)",
          "Acoustic Folk (95 BPM)"
        )

        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF8B5CF6).copy(alpha = 0.15f),
                modifier = Modifier.size(30.dp)
              ) {
                Box(contentAlignment = Alignment.Center) {
                  Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color(0xFF8B5CF6),
                    modifier = Modifier.size(16.dp)
                  )
                }
              }
              Spacer(modifier = Modifier.width(8.dp))
              Column {
                Text(
                  text = "AI Voiceover / Text-to-Speech",
                  fontSize = 13.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color(0xFF0F172A)
                )
                Text(
                  text = "VFX Pro TTS & Speech-to-Song",
                  fontSize = 10.sp,
                  color = Color(0xFF64748B)
                )
              }
            }

            // Toggle Speech-to-Song mode
            Surface(
              shape = RoundedCornerShape(16.dp),
              color = if (isSpeechToSong) Color(0xFF8B5CF6) else Color(0xFFE2E8F0),
              modifier = Modifier.clickable { isSpeechToSong = !isSpeechToSong }
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  imageVector = Icons.Default.Audiotrack,
                  contentDescription = null,
                  tint = if (isSpeechToSong) Color.White else Color(0xFF64748B),
                  modifier = Modifier.size(12.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                  text = if (isSpeechToSong) "Song Mode ON" else "Voice Mode",
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Bold,
                  color = if (isSpeechToSong) Color.White else Color(0xFF64748B)
                )
              }
            }
          }

          Spacer(modifier = Modifier.height(10.dp))

          // Text Input Box
          androidx.compose.material3.OutlinedTextField(
            value = ttsInputText,
            onValueChange = { ttsInputText = it },
            label = { Text(if (isSpeechToSong) "Lyrics to sing" else "Text to speak", fontSize = 11.sp) },
            placeholder = { Text("Enter script for AI narrator...", fontSize = 11.sp) },
            maxLines = 3,
            modifier = Modifier
              .fillMaxWidth()
              .testTag("input_tts_text")
          )

          Spacer(modifier = Modifier.height(8.dp))

          // Voice / Melody selector
          Text(
            text = if (isSpeechToSong) "SELECT MELODY / HARMONY:" else "SELECT AI VOICE:",
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF64748B)
          )
          Spacer(modifier = Modifier.height(4.dp))

          LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            val list = if (isSpeechToSong) melodyOptions else voiceOptions
            items(list) { item ->
              val isSel = if (isSpeechToSong) songMelody == item else selectedTtsVoice == item
              Surface(
                shape = RoundedCornerShape(6.dp),
                color = if (isSel) Color(0xFF8B5CF6) else Color(0xFFEDE9FE),
                modifier = Modifier.clickable {
                  if (isSpeechToSong) songMelody = item else selectedTtsVoice = item
                }
              ) {
                Text(
                  text = item,
                  fontSize = 10.sp,
                  fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                  color = if (isSel) Color.White else Color(0xFF6D28D9),
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
                )
              }
            }
          }

          Spacer(modifier = Modifier.height(10.dp))

          // Generate Voiceover Button
          Button(
            onClick = {
              if (ttsInputText.isNotBlank()) {
                onGenerateVoiceover(
                  ttsInputText,
                  selectedTtsVoice,
                  isSpeechToSong,
                  songMelody
                )
                ttsGeneratedSuccess = true
              }
            },
            colors = ButtonDefaults.buttonColors(
              containerColor = if (ttsGeneratedSuccess) Color(0xFF10B981) else Color(0xFF8B5CF6)
            ),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("btn_generate_ai_voiceover")
          ) {
            Icon(
              imageVector = if (ttsGeneratedSuccess) Icons.Default.Check else Icons.Default.RecordVoiceOver,
              contentDescription = null,
              modifier = Modifier.size(16.dp),
              tint = Color.White
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = if (ttsGeneratedSuccess) {
                "Added to Audio & Subtitles Track!"
              } else if (isSpeechToSong) {
                "Generate Speech-to-Song ($songMelody)"
              } else {
                "Convert to AI Voice ($selectedTtsVoice)"
              },
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Section: Voice Presets Cards
      Text(
        text = "VOICE PRESETS",
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = Color(0xFF64748B)
      )

      Spacer(modifier = Modifier.height(10.dp))

      // 2 columns grid for the 6 voice filters
      voiceFilters.chunked(2).forEach { rowFilters ->
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          rowFilters.forEach { filter ->
            val isSelected = selectedEffect == filter.id
            Surface(
              shape = RoundedCornerShape(12.dp),
              color = if (isSelected) Color(0xFFF5F3FF) else Color(0xFFF8FAFC),
              border = BorderStroke(
                if (isSelected) 2.dp else 1.dp,
                if (isSelected) Color(0xFF8B5CF6) else Color(0xFFE2E8F0)
              ),
              modifier = Modifier
                .weight(1f)
                .clickable {
                  selectedEffect = filter.id
                  pitch = filter.defaultPitch
                  if (filter.id == "Noise Reduction") {
                    noiseReduction = true
                  }
                }
                .testTag("card_voice_${filter.id.lowercase().replace(" ", "_")}")
            ) {
              Column(modifier = Modifier.padding(12.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSelected) Color(0xFF8B5CF6) else Color(0xFFE2E8F0),
                    modifier = Modifier.size(28.dp)
                  ) {
                    Box(contentAlignment = Alignment.Center) {
                      Icon(
                        imageVector = filter.icon,
                        contentDescription = null,
                        tint = if (isSelected) Color.White else Color(0xFF64748B),
                        modifier = Modifier.size(16.dp)
                      )
                    }
                  }

                  Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = if (isSelected) Color(0xFF8B5CF6).copy(alpha = 0.15f) else Color(0xFFCBD5E1).copy(alpha = 0.3f)
                  ) {
                    Text(
                      text = filter.tag,
                      fontSize = 9.sp,
                      fontWeight = FontWeight.Bold,
                      color = if (isSelected) Color(0xFF8B5CF6) else Color(0xFF64748B),
                      modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                    )
                  }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                  text = filter.name,
                  fontSize = 13.sp,
                  fontWeight = FontWeight.Bold,
                  color = if (isSelected) Color(0xFF8B5CF6) else Color(0xFF1E293B)
                )

                Text(
                  text = filter.desc,
                  fontSize = 10.sp,
                  color = Color(0xFF64748B),
                  maxLines = 2,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }
          }
        }
        Spacer(modifier = Modifier.height(10.dp))
      }

      Spacer(modifier = Modifier.height(6.dp))

      // Fine-Tune Pitch Slider
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Fine-Tune Voice Pitch", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1E293B))
        val semiShift = ((kotlin.math.ln(pitch) / kotlin.math.ln(2.0)) * 12.0).toInt()
        val semiText = if (semiShift > 0) "+$semiShift semi" else if (semiShift < 0) "$semiShift semi" else "Natural"
        Text(
          text = "%.2fx ($semiText)".format(pitch),
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF8B5CF6)
        )
      }
      Slider(
        value = pitch,
        onValueChange = { pitch = it },
        valueRange = 0.5f..2.0f,
        colors = SliderDefaults.colors(
          thumbColor = Color(0xFF8B5CF6),
          activeTrackColor = Color(0xFF8B5CF6)
        ),
        modifier = Modifier.testTag("slider_voice_pitch")
      )

      Spacer(modifier = Modifier.height(10.dp))

      // Noise Reduction Toggle
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = Color(0xFFECFDF5),
              modifier = Modifier.size(32.dp)
            ) {
              Box(contentAlignment = Alignment.Center) {
                Icon(
                  imageVector = Icons.Default.Tune,
                  contentDescription = null,
                  tint = Color(0xFF10B981),
                  modifier = Modifier.size(18.dp)
                )
              }
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Text("AI Noise Reduction (-18dB)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
              Text("Suppress fan, hum, wind & room noise", fontSize = 10.sp, color = Color(0xFF64748B))
            }
          }

          Switch(
            checked = noiseReduction,
            onCheckedChange = { noiseReduction = it },
            colors = SwitchDefaults.colors(
              checkedThumbColor = Color.White,
              checkedTrackColor = Color(0xFF10B981)
            ),
            modifier = Modifier.testTag("switch_noise_reduction")
          )
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Bottom Action Buttons: Apply to Clip & Apply to All
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        OutlinedButton(
          onClick = {
            onApplyToAll(selectedEffect, pitch, noiseReduction)
          },
          border = BorderStroke(1.dp, Color(0xFF8B5CF6)),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1f)
            .height(44.dp)
            .testTag("btn_voice_apply_to_all")
        ) {
          Text("Apply to All", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF8B5CF6))
        }

        Button(
          onClick = {
            onApplyVoiceEffect(selectedEffect, pitch, noiseReduction)
          },
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF8B5CF6)),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .weight(1.3f)
            .height(44.dp)
            .testTag("btn_voice_apply_clip")
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Apply to Clip", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }
    }
  }
}

/**
 * Computes ColorFilter combining brightness, contrast, saturation, and filter presets
 */
private fun computeClipColorFilter(clip: MediaClip): ColorFilter? {
  val b = clip.brightness
  val c = clip.contrast
  val s = clip.saturation
  val filter = clip.filterEffect

  val hasAdjustments = b != 0f || c != 1f || s != 1f || (filter != "Normal" && filter.isNotEmpty())
  if (!hasAdjustments) return null

  // Start with saturation matrix
  val satMatrix = ColorMatrix().apply {
    setToSaturation(s.coerceIn(0f, 3f))
  }

  // Scale and offset for brightness and contrast
  val scale = c.coerceIn(0.1f, 3f)
  val offset = b * 2.55f // map -100..100 to approx -255..255

  val contrastBrightnessMatrix = ColorMatrix(
    floatArrayOf(
      scale, 0f,    0f,    0f, offset,
      0f,    scale, 0f,    0f, offset,
      0f,    0f,    scale, 0f, offset,
      0f,    0f,    0f,    1f, 0f
    )
  )

  val combinedMatrix = ColorMatrix().apply {
    set(contrastBrightnessMatrix)
    timesAssign(satMatrix)
  }

  if (filter == "B&W Retro") {
    val bwMatrix = ColorMatrix().apply { setToSaturation(0f) }
    combinedMatrix.timesAssign(bwMatrix)
  }

  return ColorFilter.colorMatrix(combinedMatrix)
}


