package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.Audiotrack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Crop
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.EmojiEmotions
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PictureInPicture
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Title
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.ui.draw.alpha
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import com.example.ui.components.AiToolsBottomSheet
import com.example.ui.components.CanvasFormatBottomSheet
import com.example.ui.components.ClipFloatingContextMenu
import com.example.ui.components.ColorGradingBottomSheet
import com.example.ui.components.CreatorAssetsBottomSheet
import com.example.ui.components.ExportVideoBottomSheet
import com.example.ui.components.MediaPickerBottomSheet
import com.example.ui.components.MemeSfxBottomSheet
import com.example.ui.components.PipOverlaysBottomSheet
import com.example.ui.components.ProAudioMixerBottomSheet
import com.example.ui.components.ProjectsDashboard
import com.example.ui.components.PropertiesInspectorBottomSheet
import com.example.ui.components.QuickEditToolsBottomSheet
import com.example.ui.components.TemplatesBottomSheet
import com.example.ui.components.TextCaptionsBottomSheet
import com.example.ui.components.TransitionDropZoneSlot
import com.example.ui.components.ViralTemplate
import com.example.data.ProjectEntity
import com.example.ui.components.TransitionPickerBottomSheet
import com.example.ui.components.VfxEffectsBottomSheet
import com.example.ui.components.ProjectSettingsBottomSheet
import com.example.ui.components.QuickStudioWorkspace
import com.example.MediaImportItem
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.CreamBackground
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamSurface
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.WarmMuted
import com.example.ui.theme.WarmPeachAccent
import com.example.ui.theme.VfxAccentGreen
import com.example.ui.theme.VfxCyan
import com.example.ui.theme.VfxMagenta
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme(darkTheme = false) {
        VfxMainDashboard(initialEditorMode = EditorMode.QUICK)
      }
    }
  }
}

enum class EditorMode {
  QUICK, // VFX Pro Streamlined Studio mode
  PRO    // Advanced Studio Pro multi-track editor
}

enum class VfxNavTab(
  val label: String,
  val icon: ImageVector,
  val testTag: String
) {
  Home("Home", Icons.Default.Home, "tab_home"),
  Edit("Edit", Icons.Default.Edit, "tab_edit"),
  Export("Export", Icons.Default.FileUpload, "tab_export")
}

@Composable
fun VfxMainDashboard(
  playbackViewModel: PlaybackViewModel = viewModel(),
  initialEditorMode: EditorMode = EditorMode.QUICK,
  initialTab: VfxNavTab = VfxNavTab.Home
) {
  var selectedTab by remember { mutableStateOf(initialTab) }
  var editorMode by remember { mutableStateOf(initialEditorMode) }
  val snackbarHostState = remember { SnackbarHostState() }
  val scope = rememberCoroutineScope()
  var showMediaPickerSheet by remember { mutableStateOf(false) }
  var showExportBottomSheet by remember { mutableStateOf(false) }
  var showProjectSettingsSheet by remember { mutableStateOf(false) }

  Scaffold(
    modifier = Modifier
      .fillMaxSize()
      .testTag("main_scaffold"),
    topBar = {
      if (editorMode == EditorMode.PRO && selectedTab == VfxNavTab.Edit) {
        VfxTopBar(
          playbackViewModel = playbackViewModel,
          editorMode = editorMode,
          onToggleEditorMode = { editorMode = it },
          onExportClick = { showExportBottomSheet = true },
          onProjectSettingsClick = { showProjectSettingsSheet = true }
        )
      }
    },
    bottomBar = {
      if (editorMode == EditorMode.PRO && selectedTab == VfxNavTab.Edit) {
        VfxBottomBar(
          selectedTab = selectedTab,
          onTabSelect = { selectedTab = it }
        )
      }
    },
    floatingActionButton = {
      if (editorMode == EditorMode.PRO && selectedTab == VfxNavTab.Edit) {
        ExtendedFloatingActionButton(
          onClick = {
            showMediaPickerSheet = true
          },
          icon = {
            Icon(
              imageVector = Icons.Default.AddPhotoAlternate,
              contentDescription = "Import Media"
            )
          },
          text = {
            Text(
              text = "Import Media",
              fontWeight = FontWeight.Bold
            )
          },
          containerColor = MaterialTheme.colorScheme.primary,
          contentColor = MaterialTheme.colorScheme.onPrimary,
          modifier = Modifier.testTag("fab_import_media")
        )
      }
    },
    snackbarHost = {
      SnackbarHost(hostState = snackbarHostState)
    },
    containerColor = MaterialTheme.colorScheme.background
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(if ((editorMode == EditorMode.QUICK && selectedTab == VfxNavTab.Edit) || selectedTab == VfxNavTab.Home) PaddingValues(0.dp) else innerPadding)
    ) {
      AnimatedContent(
        targetState = selectedTab,
        transitionSpec = { fadeIn() togetherWith fadeOut() },
        label = "DashboardTabAnimation"
      ) { targetTab ->
        when (targetTab) {
          VfxNavTab.Edit -> {
            if (editorMode == EditorMode.QUICK) {
              val clips by playbackViewModel.clips.collectAsState()
              val tracks by playbackViewModel.tracks.collectAsState()
              val selectedClipId by playbackViewModel.selectedClipId.collectAsState()
              val isPlaying by playbackViewModel.isPlaying.collectAsState()
              val currentPositionMs by playbackViewModel.currentPositionMs.collectAsState()
              val totalDurationMs by playbackViewModel.totalDurationMs.collectAsState()
              val canUndo by playbackViewModel.canUndo.collectAsState()
              val canRedo by playbackViewModel.canRedo.collectAsState()

              QuickStudioWorkspace(
                viewModel = playbackViewModel,
                clips = clips,
                tracks = tracks,
                selectedClipId = selectedClipId,
                isPlaying = isPlaying,
                currentPositionMs = currentPositionMs,
                totalDurationMs = totalDurationMs,
                canUndo = canUndo,
                canRedo = canRedo,
                onOpenSettings = { showProjectSettingsSheet = true },
                onOpenMediaPicker = { showMediaPickerSheet = true },
                onSwitchToProMode = { editorMode = EditorMode.PRO },
                onExportProject = { showExportBottomSheet = true },
                onBackToHome = { selectedTab = VfxNavTab.Home }
              )
            } else {
              EditScreenContent(
                playbackViewModel = playbackViewModel,
                onImportMedia = {
                  showMediaPickerSheet = true
                }
              )
            }
          }
          VfxNavTab.Home -> {
            HomeScreenContent(
              onNavigateToEdit = {
                editorMode = EditorMode.QUICK
                selectedTab = VfxNavTab.Edit
              },
              onSelectProject = { project ->
                playbackViewModel.loadProject(project)
                editorMode = EditorMode.QUICK
                selectedTab = VfxNavTab.Edit
                scope.launch {
                  snackbarHostState.showSnackbar("Loaded project: ${project.name}")
                }
              },
              onOpenSettings = {
                showProjectSettingsSheet = true
              }
            )
          }
          VfxNavTab.Export -> {
            ExportScreenContent(
              onBackToEdit = { selectedTab = VfxNavTab.Edit },
              onOpenExportSheet = { showExportBottomSheet = true }
            )
          }
        }
      }
    }
  }

  // Media Library / Asset Picker Modal Bottom Sheet (Step 8)
  if (showMediaPickerSheet) {
    MediaPickerBottomSheet(
      onDismiss = { showMediaPickerSheet = false },
      onAddToTimeline = { selectedItems ->
        scope.launch {
          snackbarHostState.showSnackbar("Imported ${selectedItems.size} asset(s) to timeline")
        }
      },
      onAddRealClip = { uri, title, isVideo ->
        playbackViewModel.addRealClip(
          uri = uri,
          title = title,
          durationMs = if (isVideo) 6000L else 3500L,
          isVideo = isVideo
        )
        scope.launch {
          snackbarHostState.showSnackbar("Added '$title' to timeline!")
        }
      },
      onAddMultipleRealClips = { items ->
        playbackViewModel.addMultipleRealClips(items)
        scope.launch {
          snackbarHostState.showSnackbar("Imported ${items.size} media clips to timeline!")
        }
      },
      onAddAudioClip = { uri, title ->
        playbackViewModel.addRealAudioClip(uri, title)
        scope.launch {
          snackbarHostState.showSnackbar("Added audio: $title")
        }
      }
    )
  }

  // Real Project Settings Bottom Sheet
  if (showProjectSettingsSheet) {
    val projName by playbackViewModel.projectName.collectAsState()
    val projRes by playbackViewModel.projectResolution.collectAsState()
    val projFps by playbackViewModel.projectFps.collectAsState()
    val photoDur by playbackViewModel.defaultPhotoDurationSec.collectAsState()

    ProjectSettingsBottomSheet(
      initialProjectName = projName,
      initialResolution = projRes,
      initialFps = projFps,
      initialPhotoDurationSec = photoDur,
      onDismiss = { showProjectSettingsSheet = false },
      onSaveSettings = { name, res, fps, dur ->
        playbackViewModel.updateProjectSettings(name, res, fps, dur)
        scope.launch {
          snackbarHostState.showSnackbar("Project settings updated: $name ($res @ ${fps}fps)")
        }
      },
      onClearCache = {
        scope.launch {
          snackbarHostState.showSnackbar("Temporary render cache cleaned!")
        }
      },
      onResetProject = {
        playbackViewModel.resetProject()
        scope.launch {
          snackbarHostState.showSnackbar("Timeline reset to blank project")
        }
      }
    )
  }

  // Step 25: Export Video Bottom Sheet
  if (showExportBottomSheet) {
    val currentTracks by playbackViewModel.tracks.collectAsState()
    val wmOn by playbackViewModel.watermarkEnabled.collectAsState()
    val wmText by playbackViewModel.watermarkText.collectAsState()
    val wmPos by playbackViewModel.watermarkPosition.collectAsState()
    val wmOpacity by playbackViewModel.watermarkOpacity.collectAsState()
    val wmLogo by playbackViewModel.watermarkLogoUri.collectAsState()
    val canvasRatio by playbackViewModel.canvasRatio.collectAsState()
    ExportVideoBottomSheet(
      onDismiss = { showExportBottomSheet = false },
      tracks = currentTracks,
      watermarkEnabled = wmOn,
      watermarkText = wmText,
      watermarkPosition = wmPos,
      watermarkOpacity = wmOpacity,
      watermarkLogoUri = wmLogo,
      canvasRatio = canvasRatio,
      onExportToGallery = { res, fps, bitrate, estSize ->
        scope.launch {
          snackbarHostState.showSnackbar("Video exported & saved to Gallery! (Movies/VFXPro)")
        }
      }
    )
  }
}

/**
 * Step 24: Enhanced VfxTopBar with Project Settings, Undo, Redo, and Export Quick Action.
 * - Undo: Curved Left Arrow, dynamically disabled (gray / alpha 0.35f) when canUndo is false.
 * - Redo: Curved Right Arrow, dynamically disabled (gray / alpha 0.35f) when canRedo is false.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VfxTopBar(
  playbackViewModel: PlaybackViewModel = viewModel(),
  editorMode: EditorMode = EditorMode.PRO,
  onToggleEditorMode: (EditorMode) -> Unit = {},
  onExportClick: () -> Unit = {},
  onProjectSettingsClick: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val canUndo by playbackViewModel.canUndo.collectAsState()
  val canRedo by playbackViewModel.canRedo.collectAsState()

  CenterAlignedTopAppBar(
    navigationIcon = {
      IconButton(
        onClick = onProjectSettingsClick,
        modifier = Modifier.testTag("btn_toolbar_project_settings")
      ) {
        Icon(
          imageVector = Icons.Default.Settings,
          contentDescription = "Project Settings",
          tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    },
    title = {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
      ) {
        Surface(
          shape = RoundedCornerShape(20.dp),
          color = MaterialTheme.colorScheme.surfaceVariant,
          border = BorderStroke(1.dp, CreamBorder)
        ) {
          Row(
            modifier = Modifier.padding(3.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              shape = RoundedCornerShape(16.dp),
              color = if (editorMode == EditorMode.QUICK) OrangePrimary else Color.Transparent,
              modifier = Modifier
                .clickable { onToggleEditorMode(EditorMode.QUICK) }
                .testTag("btn_topbar_quick_mode")
            ) {
              Text(
                text = "⚡ Quick",
                fontSize = 11.sp,
                fontWeight = if (editorMode == EditorMode.QUICK) FontWeight.Bold else FontWeight.Medium,
                color = if (editorMode == EditorMode.QUICK) Color.White else WarmEspresso,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }

            Surface(
              shape = RoundedCornerShape(16.dp),
              color = if (editorMode == EditorMode.PRO) OrangePrimary else Color.Transparent,
              modifier = Modifier
                .clickable { onToggleEditorMode(EditorMode.PRO) }
                .testTag("btn_topbar_pro_mode")
            ) {
              Text(
                text = "🎬 Studio Pro",
                fontSize = 11.sp,
                fontWeight = if (editorMode == EditorMode.PRO) FontWeight.Bold else FontWeight.Medium,
                color = if (editorMode == EditorMode.PRO) Color.White else WarmEspresso,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }
        }
      }
    },
    actions = {
      // Step 24: Undo (Curved Left Arrow)
      IconButton(
        onClick = { playbackViewModel.undo() },
        enabled = canUndo,
        modifier = Modifier
          .alpha(if (canUndo) 1.0f else 0.35f)
          .testTag("btn_toolbar_undo")
      ) {
        Icon(
          imageVector = Icons.AutoMirrored.Filled.Undo,
          contentDescription = "Undo Action",
          tint = if (canUndo) WarmEspresso else Color(0xFF9E948B)
        )
      }

      // Step 24: Redo (Curved Right Arrow)
      IconButton(
        onClick = { playbackViewModel.redo() },
        enabled = canRedo,
        modifier = Modifier
          .alpha(if (canRedo) 1.0f else 0.35f)
          .testTag("btn_toolbar_redo")
      ) {
        Icon(
          imageVector = Icons.AutoMirrored.Filled.Redo,
          contentDescription = "Redo Action",
          tint = if (canRedo) WarmEspresso else Color(0xFF9E948B)
        )
      }

      // Step 25: Prominent 'Export' button in the top right corner of the main app bar
      Button(
        onClick = onExportClick,
        colors = ButtonDefaults.buttonColors(
          containerColor = OrangePrimary,
          contentColor = Color.White
        ),
        shape = RoundedCornerShape(20.dp),
        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp),
        modifier = Modifier
          .padding(start = 4.dp, end = 8.dp)
          .testTag("btn_toolbar_export")
      ) {
        Icon(
          imageVector = Icons.Default.FileUpload,
          contentDescription = null,
          tint = Color.White,
          modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
          text = "Export",
          fontWeight = FontWeight.Black,
          fontSize = 13.sp,
          color = Color.White
        )
      }
    },
    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
      containerColor = MaterialTheme.colorScheme.surface
    ),
    modifier = modifier.testTag("top_bar")
  )
}

@Composable
fun EditScreenContent(
  playbackViewModel: PlaybackViewModel = viewModel(),
  onImportMedia: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val scrollState = rememberScrollState()

  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(horizontal = 14.dp, vertical = 10.dp)
      .verticalScroll(scrollState),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Top
  ) {
    // Large center area labeled 'Video Player / Timeline Preview'
    VideoPlayerTimelinePreviewArea(
      playbackViewModel = playbackViewModel,
      onImportMedia = onImportMedia
    )
    Spacer(modifier = Modifier.height(80.dp)) // Padding for FAB
  }
}

// Data model for Mock Video Clips in V1
data class MockVideoClip(
  val id: String,
  val title: String,
  val durationSec: Float,
  val widthDp: Int,
  val primaryColor: Color,
  val secondaryColor: Color,
  val cornerRadius: Int,
  val startTimeMs: Long = 0L,
  val durationMs: Long = (durationSec * 1000f).toLong(),
  val transformKeyframes: Map<String, List<Keyframe>> = emptyMap(),
  val speed: Float = 1.0f,
  val rotation: Float = 0f,
  val isFlippedHorizontal: Boolean = false,
  val isReversed: Boolean = false,
  val isFrozen: Boolean = false,
  val speedCurve: String = "Standard"
)

// Data model for Active Transition in Timeline Slots
data class ActiveTimelineTransition(
  val name: String,
  val durationSec: Float = 0.5f
)

@Composable
fun VideoPlayerTimelinePreviewArea(
  playbackViewModel: PlaybackViewModel = viewModel(),
  onImportMedia: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  // Step 18, 19 & 20: Playback State Engine & Multi-Track System ViewModel
  val isPlaying by playbackViewModel.isPlaying.collectAsState()
  val currentPositionMs by playbackViewModel.currentPositionMs.collectAsState()
  val totalDurationMs by playbackViewModel.totalDurationMs.collectAsState()
  val tracks by playbackViewModel.tracks.collectAsState()
  val mediaClips by playbackViewModel.clips.collectAsState()
  val timelineScale by playbackViewModel.timelineScale.collectAsState()

  // Proportional dynamic calculation of video clips scaled by timelineScale
  val videoClips = remember(tracks, mediaClips, totalDurationMs, timelineScale) {
    val mainVideoTrack = tracks.firstOrNull { it.type == TrackType.MAIN_VIDEO }
    val clips = mainVideoTrack?.clips ?: mediaClips.filter { it.type == ClipType.VIDEO || it.type == ClipType.IMAGE || it.type == ClipType.VFX }
    clips.mapIndexed { index, clip ->
      val proportionalWidth = (((clip.durationMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * 940f) * timelineScale).toInt().coerceAtLeast((80f * timelineScale).toInt())
      MockVideoClip(
        id = clip.id,
        title = clip.title.ifEmpty { "Clip_${index + 1}.mp4" },
        durationSec = clip.durationMs / 1000f,
        widthDp = proportionalWidth,
        primaryColor = clip.color,
        secondaryColor = clip.color.copy(alpha = 0.8f),
        cornerRadius = 10,
        startTimeMs = clip.startTimeMs,
        durationMs = clip.durationMs,
        transformKeyframes = clip.transformKeyframes,
        speed = clip.speed,
        rotation = clip.rotation,
        isFlippedHorizontal = clip.isFlippedHorizontal,
        isReversed = clip.isReversed,
        isFrozen = clip.isFrozen,
        speedCurve = clip.speedCurve
      )
    }
  }

  // Transitions between adjacent clips (Slot 0 is between Intro and AMV clips, initialized with Cross Dissolve)
  var timelineTransitions by remember {
    mutableStateOf(
      mapOf(
        0 to ActiveTimelineTransition(name = "Cross Dissolve", durationSec = 0.5f)
      )
    )
  }

  // Selected clip for Properties & Keyframe Inspector & Context Menu
  val vmSelectedClipId by playbackViewModel.selectedClipId.collectAsState()
  var selectedClipId by remember {
    mutableStateOf<String?>(null)
  }
  LaunchedEffect(vmSelectedClipId) {
    if (vmSelectedClipId != null) {
      selectedClipId = vmSelectedClipId
    }
  }
  val selectedClip = videoClips.firstOrNull { it.id == selectedClipId } ?: videoClips.firstOrNull()
  var showInspectorSheet by remember { mutableStateOf(false) }

  // Transition Picker Bottom Sheet state
  var selectedTransitionSlotIndex by remember { mutableStateOf<Int?>(null) }
  var showTransitionPickerSheet by remember { mutableStateOf(false) }

  // Color Grading Bottom Sheet state (Step 5)
  var showColorGradingSheet by remember { mutableStateOf(false) }

  // VFX & Effects Library Bottom Sheet state (Step 9)
  var showEffectsSheet by remember { mutableStateOf(false) }

  // AI Tools Bottom Sheet state (AI Magic Hub)
  var showAiToolsSheet by remember { mutableStateOf(false) }

  // Pro Audio Mixer Bottom Sheet state (Step 13)
  var showAudioMixerSheet by remember { mutableStateOf(false) }

  // Canvas & Format Bottom Sheet state (Step 14)
  var showCanvasFormatSheet by remember { mutableStateOf(false) }

  // Text & Captions Bottom Sheet state (Step 15)
  var showTextCaptionsSheet by remember { mutableStateOf(false) }

  // PIP & Overlays Bottom Sheet state (Step 16)
  var showPipSheet by remember { mutableStateOf(false) }

  // Creator Assets & Stickers Bottom Sheet state (Step 17)
  var showStickersSheet by remember { mutableStateOf(false) }

  // VFX Pro Studio features: Templates, Quick Toolbox, Meme SFX
  var showTemplatesSheet by remember { mutableStateOf(false) }
  var showQuickToolsSheet by remember { mutableStateOf(false) }
  var showMemeSfxSheet by remember { mutableStateOf(false) }

  // Playhead position in px within the timeline content
  var playheadPositionPx by remember { mutableFloatStateOf(160f) }

  // Handlers for Clip Actions: Split, Duplicate, Delete
  val handleSplitClip: (MockVideoClip) -> Unit = { clip ->
    playbackViewModel.splitClip(clip.id)
  }

  val handleDuplicateClip: (MockVideoClip) -> Unit = { clip ->
    playbackViewModel.duplicateClip(clip.id)
  }

  val handleDeleteClip: (MockVideoClip) -> Unit = { clip ->
    playbackViewModel.removeClip(clip.id)
  }

  // Step 21: Scaled total width of the scrollable timeline based on timelineScale
  val totalTimelineWidthDp = (1080f * timelineScale).dp

  val density = LocalDensity.current
  val totalWidthPx = with(density) { totalTimelineWidthDp.toPx() }
  val maxPlayheadPx = (totalWidthPx - 60f).coerceAtLeast(1f)

  // Step 21: Sync playhead position whenever currentPositionMs, totalDurationMs, or maxPlayheadPx changes
  LaunchedEffect(currentPositionMs, totalDurationMs, maxPlayheadPx) {
    if (totalDurationMs > 0L) {
      val ratio = (currentPositionMs.toFloat() / totalDurationMs.toFloat()).coerceIn(0f, 1f)
      playheadPositionPx = ratio * maxPlayheadPx
    }
  }

  // SMPTE formatted timecode derived directly from PlaybackViewModel state
  val formattedTime = PlaybackViewModel.formatTimecode(currentPositionMs)

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("video_player_timeline_preview_container"),
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface
    ),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(14.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // 1. VideoPreviewCanvas (Step 18: 16:9 black box simulating video player that listens to PlaybackViewModel)
      VideoPreviewCanvas(
        viewModel = playbackViewModel,
        modifier = Modifier.fillMaxWidth()
      )

      Spacer(modifier = Modifier.height(14.dp))

      // Header row for Timeline Controls
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.GraphicEq,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "MULTI-TRACK TIMELINE",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp,
            color = MaterialTheme.colorScheme.primary
          )

          Spacer(modifier = Modifier.width(10.dp))

          // Main Play/Pause Button on Timeline Toolbar
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = if (isPlaying) Color(0xFF0284C7).copy(alpha = 0.25f) else Color(0xFF1E293B),
            border = BorderStroke(1.dp, if (isPlaying) Color(0xFF38BDF8) else Color(0xFF334155)),
            onClick = { playbackViewModel.togglePlayPause() },
            modifier = Modifier.testTag("btn_timeline_play_pause")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                contentDescription = if (isPlaying) "Pause timeline" else "Play timeline",
                tint = if (isPlaying) Color(0xFF38BDF8) else Color.White,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = if (isPlaying) "PAUSE" else "PLAY",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (isPlaying) OrangePrimary else WarmEspresso
              )
            }
          }
        }

        // Quick Action Buttons: Inspector & Import Media
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          // Open Inspector Button
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = OrangeContainer,
            border = BorderStroke(1.dp, CreamBorder),
            onClick = {
              if (selectedClipId == null) {
                selectedClipId = videoClips.firstOrNull()?.id
              }
              showInspectorSheet = true
            },
            modifier = Modifier.testTag("btn_open_inspector_header")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Tune,
                contentDescription = "Open Clip Inspector",
                tint = OrangePrimaryDark,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Inspector",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = OrangePrimaryDark
              )
            }
          }

          // 1-Tap Viral Templates
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFFEF4444).copy(alpha = 0.15f),
            border = BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.45f)),
            onClick = { showTemplatesSheet = true },
            modifier = Modifier.testTag("btn_open_templates")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.ElectricBolt,
                contentDescription = "Viral Templates",
                tint = Color(0xFFEF4444),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Templates",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFEF4444)
              )
            }
          }

          // Quick Clip Toolbox
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = OrangeContainer,
            border = BorderStroke(1.dp, OrangePrimaryDark.copy(alpha = 0.4f)),
            onClick = {
              if (selectedClip == null && videoClips.isNotEmpty()) {
                selectedClipId = videoClips.first().id
              }
              showQuickToolsSheet = true
            },
            modifier = Modifier.testTag("btn_open_quick_toolbox")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Tune,
                contentDescription = "Quick Tools",
                tint = OrangePrimaryDark,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Quick Tools",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = OrangePrimaryDark
              )
            }
          }

          // Meme SFX Soundboard
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFFF59E0B).copy(alpha = 0.15f),
            border = BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f)),
            onClick = { showMemeSfxSheet = true },
            modifier = Modifier.testTag("btn_open_meme_sfx")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.VolumeUp,
                contentDescription = "Meme SFX",
                tint = Color(0xFFD97706),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Meme SFX",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFD97706)
              )
            }
          }

          // Color Grading Button (Step 5)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = OrangeContainer,
            border = BorderStroke(1.dp, CreamBorder),
            onClick = { showColorGradingSheet = true },
            modifier = Modifier.testTag("btn_open_color_grading")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.ColorLens,
                contentDescription = "Open Color Grading",
                tint = OrangePrimary,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Color",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = OrangePrimary
              )
            }
          }

          // VFX & Effects Library Button (Step 9)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFFA855F7).copy(alpha = 0.15f),
            border = BorderStroke(1.dp, Color(0xFFA855F7).copy(alpha = 0.4f)),
            onClick = { showEffectsSheet = true },
            modifier = Modifier.testTag("btn_open_vfx_effects")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "Open VFX Library",
                tint = Color(0xFFC084FC),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Effects",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFC084FC)
              )
            }
          }

          // AI Tools Button (AI Magic Hub)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF7C3AED).copy(alpha = 0.18f),
            border = BorderStroke(1.dp, Color(0xFFA855F7).copy(alpha = 0.5f)),
            onClick = { showAiToolsSheet = true },
            modifier = Modifier.testTag("btn_open_ai_tools")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "Open AI Tools",
                tint = Color(0xFFE879F9),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "AI Tools",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFE879F9)
              )
            }
          }

          // Pro Audio Mixer Button (Step 13)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF0F766E).copy(alpha = 0.20f),
            border = BorderStroke(1.dp, Color(0xFF14B8A6).copy(alpha = 0.5f)),
            onClick = { showAudioMixerSheet = true },
            modifier = Modifier.testTag("btn_open_audio_mixer")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.GraphicEq,
                contentDescription = "Open Pro Audio Mixer",
                tint = Color(0xFF2DD4BF),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Audio",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF2DD4BF)
              )
            }
          }

          // Canvas & Format Button (Step 14)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF1E3A8A).copy(alpha = 0.25f),
            border = BorderStroke(1.dp, Color(0xFF3B82F6).copy(alpha = 0.5f)),
            onClick = { showCanvasFormatSheet = true },
            modifier = Modifier.testTag("btn_open_canvas_format")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Crop,
                contentDescription = "Open Canvas Format",
                tint = Color(0xFF60A5FA),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Format",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF60A5FA)
              )
            }
          }

          // Text & Captions Button (Step 15)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF581C87).copy(alpha = 0.25f),
            border = BorderStroke(1.dp, Color(0xFFC084FC).copy(alpha = 0.5f)),
            onClick = { showTextCaptionsSheet = true },
            modifier = Modifier.testTag("btn_open_text_captions")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Title,
                contentDescription = "Open Text and Captions",
                tint = Color(0xFFE879F9),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Text",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFE879F9)
              )
            }
          }

          // PIP & Overlays Button (Step 16)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF0369A1).copy(alpha = 0.25f),
            border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.5f)),
            onClick = { showPipSheet = true },
            modifier = Modifier.testTag("btn_open_pip_sheet")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.PictureInPicture,
                contentDescription = "Open PIP and Overlays",
                tint = Color(0xFF38BDF8),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "PIP",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF38BDF8)
              )
            }
          }

          // Creator Assets & Stickers Button (Step 17)
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF78350F).copy(alpha = 0.25f),
            border = BorderStroke(1.dp, Color(0xFFFBBF24).copy(alpha = 0.5f)),
            onClick = { showStickersSheet = true },
            modifier = Modifier.testTag("btn_open_stickers_sheet")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.EmojiEmotions,
                contentDescription = "Open Creator Assets and Stickers",
                tint = Color(0xFFFBBF24),
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Stickers",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFFBBF24)
              )
            }
          }

          // Import Media Header Button
          Surface(
            shape = RoundedCornerShape(6.dp),
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)),
            onClick = onImportMedia,
            modifier = Modifier.testTag("btn_import_media_header")
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Import Media",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Import Media",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Step 21: Timeline Zoom Controls Toolbar ('Zoom In' and 'Zoom Out' buttons just above timeline tracks)
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 2.dp, vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.GraphicEq,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(15.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "TRACK LAYERS & PLAYHEAD",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp,
            color = MaterialTheme.colorScheme.primary
          )
        }

        // Timeline Zoom Controls
        Surface(
          shape = RoundedCornerShape(6.dp),
          color = Color(0xFF10141F),
          border = BorderStroke(1.dp, Color(0xFF1E2638)),
          modifier = Modifier.testTag("timeline_zoom_controls_container")
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            // Zoom Out Button
            IconButton(
              onClick = { playbackViewModel.zoomOut() },
              modifier = Modifier
                .size(28.dp)
                .testTag("btn_timeline_zoom_out"),
              enabled = timelineScale > 0.5f
            ) {
              Icon(
                imageVector = Icons.Default.ZoomOut,
                contentDescription = "Zoom Out Timeline",
                tint = if (timelineScale > 0.5f) Color.White else Color(0xFF64748B),
                modifier = Modifier.size(16.dp)
              )
            }

            // Zoom Scale Badge (Click to reset to 100%)
            Surface(
              shape = RoundedCornerShape(4.dp),
              color = Color(0xFF1E293B).copy(alpha = 0.7f),
              onClick = { playbackViewModel.resetTimelineScale() },
              modifier = Modifier.testTag("timeline_zoom_badge")
            ) {
              Text(
                text = "${(timelineScale * 100).toInt()}%",
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = OrangePrimary,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
              )
            }

            // Zoom In Button
            IconButton(
              onClick = { playbackViewModel.zoomIn() },
              modifier = Modifier
                .size(28.dp)
                .testTag("btn_timeline_zoom_in"),
              enabled = timelineScale < 3.0f
            ) {
              Icon(
                imageVector = Icons.Default.ZoomIn,
                contentDescription = "Zoom In Timeline",
                tint = if (timelineScale < 3.0f) Color.White else Color(0xFF64748B),
                modifier = Modifier.size(16.dp)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(6.dp))

      // 2. Horizontally Scrollable Multi-Track Timeline System
      DetailedMultiTrackTimeline(
        playheadPositionPx = playheadPositionPx,
        onPlayheadPositionChange = { newPos ->
          playheadPositionPx = newPos
          val ratio = (newPos / maxPlayheadPx).coerceIn(0f, 1f)
          playbackViewModel.seekTo((totalDurationMs * ratio).toLong())
        },
        totalTimelineWidthDp = totalTimelineWidthDp,
        formattedTime = formattedTime,
        timelineScale = timelineScale,
        onTimelineScaleChange = { newScale ->
          playbackViewModel.setTimelineScale(newScale)
        },
        tracks = tracks,
        mediaClips = mediaClips,
        videoClips = videoClips,
        selectedClip = selectedClip,
        transitions = timelineTransitions,
        onClipSelect = { clip ->
          selectedClipId = clip.id
          showInspectorSheet = true
        },
        onSplitClip = handleSplitClip,
        onQuickToolsClip = { clip ->
          selectedClipId = clip.id
          showQuickToolsSheet = true
        },
        onDuplicateClip = handleDuplicateClip,
        onDeleteClip = handleDeleteClip,
        onTransitionSlotClick = { slotIndex ->
          selectedTransitionSlotIndex = slotIndex
          showTransitionPickerSheet = true
        },
        onToggleTrackMuteHide = { trackId ->
          playbackViewModel.toggleTrackMuteHide(trackId)
        },
        onMoveClip = { clipId, newStartTimeMs ->
          playbackViewModel.moveClip(clipId, newStartTimeMs)
        },
        onTrimClip = { clipId, newStartTimeMs, newDurationMs ->
          playbackViewModel.trimClip(clipId, newStartTimeMs, newDurationMs)
        },
        onEditingFinished = {
          playbackViewModel.saveSnapshot("Move/Trim Clip")
        },
        totalDurationMs = totalDurationMs,
        currentPositionMs = currentPositionMs
      )
    }
  }

  // 3. Properties & Keyframe Inspector Modal Bottom Sheet
  if (showInspectorSheet && selectedClip != null) {
    PropertiesInspectorBottomSheet(
      clip = selectedClip!!,
      currentPositionMs = currentPositionMs,
      onToggleKeyframe = { property, timeMs, value ->
        val existing = selectedClip!!.transformKeyframes[property]?.find { kotlin.math.abs(it.timeMs - timeMs) <= 150L }
        if (existing != null) {
          playbackViewModel.removeKeyframe(selectedClip!!.id, property, existing.timeMs)
        } else {
          playbackViewModel.setKeyframe(selectedClip!!.id, property, timeMs, value)
        }
      },
      onDismiss = { showInspectorSheet = false }
    )
  }

  // 4. Add Transition Picker Modal Bottom Sheet
  if (showTransitionPickerSheet && selectedTransitionSlotIndex != null) {
    val slot = selectedTransitionSlotIndex!!
    val fromTitle = videoClips.getOrNull(slot)?.title ?: "Clip ${slot + 1}"
    val toTitle = videoClips.getOrNull(slot + 1)?.title ?: "Clip ${slot + 2}"
    val currentTrans = timelineTransitions[slot]

    TransitionPickerBottomSheet(
      slotIndex = slot,
      fromClipTitle = fromTitle,
      toClipTitle = toTitle,
      currentTransitionName = currentTrans?.name,
      onSelectTransition = { name, duration ->
        timelineTransitions = timelineTransitions + (slot to ActiveTimelineTransition(name, duration))
        showTransitionPickerSheet = false
        selectedTransitionSlotIndex = null
      },
      onRemoveTransition = {
        timelineTransitions = timelineTransitions - slot
        showTransitionPickerSheet = false
        selectedTransitionSlotIndex = null
      },
      onDismiss = {
        showTransitionPickerSheet = false
        selectedTransitionSlotIndex = null
      }
    )
  }

  // 5. Color Grading Modal Bottom Sheet (Step 5)
  if (showColorGradingSheet) {
    ColorGradingBottomSheet(
      onDismiss = { showColorGradingSheet = false }
    )
  }

  // 6. VFX & Effects Library Modal Bottom Sheet (Step 9)
  if (showEffectsSheet) {
    VfxEffectsBottomSheet(
      onDismiss = { showEffectsSheet = false },
      onApplyEffect = { effect ->
        // Applied effect UI state
      }
    )
  }

  // 7. AI Magic Hub / AI Tools Bottom Sheet
  if (showAiToolsSheet) {
    AiToolsBottomSheet(
      onDismiss = { showAiToolsSheet = false },
      onApplyTool = { tool ->
        // Selected AI Magic Tool applied to clip
      }
    )
  }

  // 8. Pro Audio Mixer Modal Bottom Sheet (Step 13)
  if (showAudioMixerSheet) {
    ProAudioMixerBottomSheet(
      onDismiss = { showAudioMixerSheet = false }
    )
  }

  // 9. Canvas & Format Modal Bottom Sheet (Step 14)
  if (showCanvasFormatSheet) {
    CanvasFormatBottomSheet(
      onDismiss = { showCanvasFormatSheet = false }
    )
  }

  // 10. Text & Captions Modal Bottom Sheet (Step 15)
  if (showTextCaptionsSheet) {
    TextCaptionsBottomSheet(
      onDismiss = { showTextCaptionsSheet = false },
      onGenerateCaptions = {
        playbackViewModel.generateAutoCaptions()
        showTextCaptionsSheet = false
      },
      onGenerateVoiceover = { text, voice, isSong, melody ->
        playbackViewModel.generateAiVoiceover(
          text = text,
          voiceName = voice,
          atTimeMs = currentPositionMs,
          isSpeechToSong = isSong,
          melodyStyle = melody
        )
        showTextCaptionsSheet = false
      }
    )
  }

  // 11. PIP & Overlays Modal Bottom Sheet (Step 16)
  if (showPipSheet) {
    PipOverlaysBottomSheet(
      onDismiss = { showPipSheet = false }
    )
  }

  // 12. Creator Assets & Stickers Modal Bottom Sheet (Step 17)
  if (showStickersSheet) {
    CreatorAssetsBottomSheet(
      onDismiss = { showStickersSheet = false }
    )
  }

  // 13. 1-Tap Viral Templates Hub
  if (showTemplatesSheet) {
    TemplatesBottomSheet(
      onDismiss = { showTemplatesSheet = false },
      onApplyTemplate = { template ->
        playbackViewModel.setCanvasRatio(template.aspect)
        playbackViewModel.setFilter(template.colorGradeName)
        playbackViewModel.insertMemeSfx(
          sfxTitle = "${template.name} (${template.musicStyle})",
          atTimeMs = 0L,
          durationMs = totalDurationMs.coerceAtLeast(15000L)
        )
      },
      onApplyTemplateWithPhotos = { template, photos ->
        playbackViewModel.applyPhotoTemplate(
          templateId = template.id,
          templateName = template.name,
          photos = photos,
          musicStyle = template.musicStyle,
          transitionType = template.transitionType,
          colorGrade = template.colorGradeName,
          bpm = template.bpm,
          aspect = template.aspect
        )
        showTemplatesSheet = false
      }
    )
  }

  // 14. Quick Clip Toolbox
  if (showQuickToolsSheet && selectedClip != null) {
    QuickEditToolsBottomSheet(
      clip = selectedClip!!,
      currentPositionMs = currentPositionMs,
      onSplitAtPlayhead = { clipId, playheadMs ->
        playbackViewModel.splitClipAtPlayhead(clipId, playheadMs)
      },
      onSetSpeed = { clipId, speed, curve ->
        playbackViewModel.setClipSpeed(clipId, speed, curve)
      },
      onReverse = { clipId ->
        playbackViewModel.reverseClip(clipId)
      },
      onFreeze = { clipId, playheadMs ->
        playbackViewModel.freezeFrame(clipId, playheadMs)
      },
      onRotate = { clipId ->
        playbackViewModel.rotateClip(clipId)
      },
      onFlipHorizontal = { clipId ->
        playbackViewModel.flipClipHorizontal(clipId)
      },
      onExtractAudio = { clipId ->
        playbackViewModel.extractAudioFromClip(clipId)
      },
      onSetVolume = { clipId, volume ->
        playbackViewModel.setClipVolume(clipId, volume)
      },
      onDuplicate = { clipId ->
        playbackViewModel.duplicateClip(clipId)
      },
      onDelete = { clipId ->
        playbackViewModel.removeClip(clipId)
        selectedClipId = videoClips.firstOrNull { it.id != clipId }?.id
      },
      onDismiss = { showQuickToolsSheet = false }
    )
  }

  // 15. Meme SFX Soundboard
  if (showMemeSfxSheet) {
    MemeSfxBottomSheet(
      currentPositionMs = currentPositionMs,
      onInsertSfx = { sfxTitle, atTimeMs, durationMs ->
        playbackViewModel.insertMemeSfx(sfxTitle, atTimeMs, durationMs)
      },
      onDismiss = { showMemeSfxSheet = false }
    )
  }
}

@Composable
fun DetailedMultiTrackTimeline(
  playheadPositionPx: Float,
  onPlayheadPositionChange: (Float) -> Unit,
  totalTimelineWidthDp: androidx.compose.ui.unit.Dp,
  formattedTime: String,
  timelineScale: Float = 1.0f,
  onTimelineScaleChange: (Float) -> Unit = {},
  tracks: List<MediaTrack> = emptyList(),
  mediaClips: List<MediaClip> = emptyList(),
  videoClips: List<MockVideoClip> = emptyList(),
  selectedClip: MockVideoClip? = null,
  transitions: Map<Int, ActiveTimelineTransition> = emptyMap(),
  onClipSelect: (MockVideoClip) -> Unit = {},
  onSplitClip: (MockVideoClip) -> Unit = {},
  onQuickToolsClip: (MockVideoClip) -> Unit = {},
  onDuplicateClip: (MockVideoClip) -> Unit = {},
  onDeleteClip: (MockVideoClip) -> Unit = {},
  onTransitionSlotClick: (Int) -> Unit = {},
  onToggleTrackMuteHide: (String) -> Unit = {},
  onMoveClip: (clipId: String, newStartTimeMs: Long) -> Unit = { _, _ -> },
  onTrimClip: (clipId: String, newStartTimeMs: Long, newDurationMs: Long) -> Unit = { _, _, _ -> },
  onEditingFinished: () -> Unit = {},
  totalDurationMs: Long = 30000L,
  currentPositionMs: Long = 0L,
  modifier: Modifier = Modifier
) {
  val horizontalScrollState = rememberScrollState()
  val density = LocalDensity.current
  val totalWidthPx = with(density) { totalTimelineWidthDp.toPx() }
  val usableWidthDp = totalTimelineWidthDp - 60.dp
  val maxPlayheadPx = (totalWidthPx - 60f).coerceAtLeast(1f)
  val pxPerMs = (with(density) { usableWidthDp.toPx() } / totalDurationMs.coerceAtLeast(1L).toFloat()).coerceAtLeast(0.0001f)

  val displayTracks = remember(tracks, mediaClips) {
    if (tracks.isNotEmpty()) {
      tracks
    } else {
      listOf(
        MediaTrack(
          id = "track_main_video",
          name = "Main Video",
          type = TrackType.MAIN_VIDEO,
          clips = mediaClips.filter { it.type == ClipType.VIDEO || it.type == ClipType.IMAGE || it.type == ClipType.VFX }
        ),
        MediaTrack(
          id = "track_text_overlay",
          name = "Text Overlay",
          type = TrackType.TEXT,
          clips = mediaClips.filter { it.type == ClipType.TEXT }
        ),
        MediaTrack(
          id = "track_audio",
          name = "Audio",
          type = TrackType.AUDIO,
          clips = mediaClips.filter { it.type == ClipType.AUDIO }
        )
      )
    }
  }

  Surface(
    shape = RoundedCornerShape(10.dp),
    color = Color(0xFF0A0D14),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
    modifier = modifier
      .fillMaxWidth()
      .testTag("timeline_scroll_container")
  ) {
    Row(modifier = Modifier.fillMaxWidth()) {
      // Left Fixed Track Headers (Track labels V1, T1, A1 with Mute/Hide toggle)
      Column(
        modifier = Modifier
          .width(74.dp)
          .background(Color(0xFF0E121B))
          .padding(top = 54.dp) // align with ruler height (28dp) + overview minimap (20dp) + spacing (6dp)
          .testTag("track_headers_column"),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        displayTracks.forEachIndexed { index, track ->
          val heightDp = when (track.type) {
            TrackType.MAIN_VIDEO -> 118.dp
            TrackType.TEXT -> 48.dp
            TrackType.AUDIO -> 56.dp
            TrackType.OVERLAY -> 48.dp
          }
          val accentColor = when (track.type) {
            TrackType.MAIN_VIDEO -> OrangePrimary
            TrackType.TEXT -> Color(0xFFEC4899)
            TrackType.AUDIO -> VfxAccentGreen
            TrackType.OVERLAY -> Color(0xFFA855F7)
          }

          TrackHeaderPanel(
            track = track,
            accentColor = accentColor,
            heightDp = heightDp,
            onToggleMuteHide = { onToggleTrackMuteHide(track.id) }
          )

          if (index < displayTracks.size - 1) {
            Spacer(modifier = Modifier.height(6.dp))
          }
        }
      }

      // Vertical Divider
      Box(
        modifier = Modifier
          .width(1.dp)
          .height(350.dp)
          .background(MaterialTheme.colorScheme.outline)
      )

      // Horizontally Scrollable Timeline Track Area with Draggable Playhead Overlay
      Box(
        modifier = Modifier
          .weight(1f)
          .horizontalScroll(horizontalScrollState)
          .pointerInput(timelineScale) {
            detectTransformGestures { _, _, zoom, _ ->
              if (zoom != 1f) {
                onTimelineScaleChange(timelineScale * zoom)
              }
            }
          }
          .testTag("timeline_tracks_scroll_viewport")
      ) {
        // Base Content Column (Ruler + Overview Minimap + Vertically Stacked Tracks)
        Column(
          modifier = Modifier
            .width(totalTimelineWidthDp)
            .padding(end = 60.dp) // allow dragging to end comfortably
        ) {
          // Time Ruler (00:00, 00:05, 00:10...) with instant tap/drag playhead scrubbing
          TimelineTimeRuler(
            totalWidthDp = totalTimelineWidthDp,
            timelineScale = timelineScale,
            onSeekToPx = { px ->
              onPlayheadPositionChange(px.coerceIn(0f, maxPlayheadPx))
            },
            modifier = Modifier
              .fillMaxWidth()
              .height(28.dp)
          )

          Spacer(modifier = Modifier.height(2.dp))

          // Canvas Multi-Track Overview Minimap
          CanvasTimelineOverview(
            mediaClips = mediaClips,
            currentPositionMs = currentPositionMs,
            totalDurationMs = totalDurationMs
          )

          Spacer(modifier = Modifier.height(4.dp))

          // Vertically Stacked Media Track Rows
          displayTracks.forEachIndexed { trackIndex, track ->
            val isMutedOrHidden = track.isMutedOrHidden
            when (track.type) {
              TrackType.MAIN_VIDEO -> {
                // 1. MAIN VIDEO TRACK ROW (118dp)
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(118.dp)
                    .alpha(if (isMutedOrHidden) 0.38f else 1.0f)
                    .background(Color(0xFF10141F))
                    .border(
                      BorderStroke(0.5.dp, if (isMutedOrHidden) Color(0xFF334155) else Color(0xFF1E2638)),
                      shape = RoundedCornerShape(4.dp)
                    )
                    .padding(vertical = 4.dp, horizontal = 6.dp)
                    .testTag("track_v1_row"),
                  contentAlignment = Alignment.BottomStart
                ) {
                  Row(
                    verticalAlignment = Alignment.Bottom,
                    modifier = Modifier
                      .fillMaxWidth()
                      .testTag("video_clips_lazy_row")
                  ) {
                    videoClips.forEachIndexed { index, clip ->
                      val isClipSelected = (selectedClip?.id == clip.id)

                      // Dynamic gap spacer based on clip startTimeMs
                      val prevEndMs = if (index == 0) 0L else (videoClips[index - 1].startTimeMs + videoClips[index - 1].durationMs)
                      val gapMs = (clip.startTimeMs - prevEndMs).coerceAtLeast(0L)
                      if (gapMs > 0L) {
                        val gapDp = ((gapMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * usableWidthDp.value).dp
                        Spacer(modifier = Modifier.width(gapDp))
                      }

                      Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Bottom
                      ) {
                        // Floating context menu appearing above the selected clip
                        if (isClipSelected && !isMutedOrHidden) {
                          ClipFloatingContextMenu(
                            visible = true,
                            onSplit = { onSplitClip(clip) },
                            onQuickTools = { onQuickToolsClip(clip) },
                            onDuplicate = { onDuplicateClip(clip) },
                            onDelete = { onDeleteClip(clip) },
                            modifier = Modifier.zIndex(15f)
                          )
                        } else {
                          Spacer(modifier = Modifier.height(28.dp))
                        }

                        VideoClipBlock(
                          clip = clip,
                          index = index,
                          isSelected = isClipSelected && !isMutedOrHidden,
                          onClick = { onClipSelect(clip) },
                          onMoveClip = onMoveClip,
                          onTrimClip = onTrimClip,
                          onEditingFinished = onEditingFinished,
                          totalDurationMs = totalDurationMs,
                          pxPerMs = pxPerMs
                        )
                      }

                      // Distinct drop-zone visual slot to accept transitions between adjacent clips
                      if (index < videoClips.size - 1) {
                        Column(
                          horizontalAlignment = Alignment.CenterHorizontally,
                          verticalArrangement = Arrangement.Bottom
                        ) {
                          Spacer(modifier = Modifier.height(28.dp))
                          val currentTrans = transitions[index]
                          TransitionDropZoneSlot(
                            slotIndex = index,
                            transitionName = currentTrans?.name,
                            transitionDurationSec = currentTrans?.durationSec ?: 0.5f,
                            onClick = { onTransitionSlotClick(index) }
                          )
                        }
                      }
                    }
                  }

                  if (isMutedOrHidden) {
                    Surface(
                      color = Color(0xFFEF4444).copy(alpha = 0.85f),
                      shape = RoundedCornerShape(4.dp),
                      modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                    ) {
                      Text(
                        text = "TRACK HIDDEN",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                      )
                    }
                  }
                }
              }

              TrackType.TEXT -> {
                // 2. TEXT OVERLAY TRACK ROW (48dp)
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .alpha(if (isMutedOrHidden) 0.38f else 1.0f)
                    .background(Color(0xFF140F1A))
                    .border(
                      BorderStroke(0.5.dp, if (isMutedOrHidden) Color(0xFF334155) else Color(0xFF331D38)),
                      shape = RoundedCornerShape(4.dp)
                    )
                    .padding(vertical = 3.dp, horizontal = 6.dp)
                    .testTag("track_t1_row"),
                  contentAlignment = Alignment.CenterStart
                ) {
                  LazyRow(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                      .fillMaxWidth()
                      .testTag("track_t1_lazy_row")
                  ) {
                    itemsIndexed(items = track.clips, key = { _, clip -> clip.id }) { index, clip ->
                      val prevEndMs = if (index == 0) 0L else (track.clips[index - 1].startTimeMs + track.clips[index - 1].durationMs)
                      val gapMs = (clip.startTimeMs - prevEndMs).coerceAtLeast(0L)
                      if (gapMs > 0L) {
                        val gapDp = ((gapMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * usableWidthDp.value).dp
                        Spacer(modifier = Modifier.width(gapDp))
                      }

                      val clipWidthDp = ((clip.durationMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * usableWidthDp.value).dp.coerceAtLeast((80.dp * timelineScale))
                      TextClipBlock(
                        clip = clip,
                        widthDp = clipWidthDp,
                        index = index,
                        onMoveClip = onMoveClip,
                        onTrimClip = onTrimClip,
                        onEditingFinished = onEditingFinished,
                        totalDurationMs = totalDurationMs,
                        pxPerMs = pxPerMs
                      )
                    }
                  }

                  if (isMutedOrHidden) {
                    Surface(
                      color = Color(0xFFEF4444).copy(alpha = 0.85f),
                      shape = RoundedCornerShape(4.dp),
                      modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                    ) {
                      Text(
                        text = "HIDDEN",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                      )
                    }
                  }
                }
              }

              TrackType.AUDIO -> {
                // 3. AUDIO TRACK ROW (56dp)
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .alpha(if (isMutedOrHidden) 0.38f else 1.0f)
                    .background(Color(0xFF0C101A))
                    .border(
                      BorderStroke(0.5.dp, if (isMutedOrHidden) Color(0xFF334155) else Color(0xFF1A2333)),
                      shape = RoundedCornerShape(4.dp)
                    )
                    .padding(vertical = 4.dp, horizontal = 6.dp)
                    .testTag("track_a1_row"),
                  contentAlignment = Alignment.CenterStart
                ) {
                  if (track.clips.isEmpty()) {
                    AudioWaveformBlock(
                      totalWidthDp = usableWidthDp,
                      modifier = Modifier
                        .fillMaxHeight()
                        .width(usableWidthDp)
                    )
                  } else {
                    LazyRow(
                      verticalAlignment = Alignment.CenterVertically,
                      modifier = Modifier
                        .fillMaxWidth()
                        .testTag("track_a1_lazy_row")
                    ) {
                      itemsIndexed(items = track.clips, key = { _, clip -> clip.id }) { index, clip ->
                        val prevEndMs = if (index == 0) 0L else (track.clips[index - 1].startTimeMs + track.clips[index - 1].durationMs)
                        val gapMs = (clip.startTimeMs - prevEndMs).coerceAtLeast(0L)
                        if (gapMs > 0L) {
                          val gapDp = ((gapMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * usableWidthDp.value).dp
                          Spacer(modifier = Modifier.width(gapDp))
                        }

                        val clipWidthDp = ((clip.durationMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * usableWidthDp.value).dp.coerceAtLeast((140.dp * timelineScale))
                        DynamicAudioClipBlock(
                          clip = clip,
                          widthDp = clipWidthDp,
                          index = index,
                          onMoveClip = onMoveClip,
                          onTrimClip = onTrimClip,
                          onEditingFinished = onEditingFinished,
                          totalDurationMs = totalDurationMs,
                          pxPerMs = pxPerMs
                        )
                      }
                    }
                  }

                  if (isMutedOrHidden) {
                    Surface(
                      color = Color(0xFFEF4444).copy(alpha = 0.85f),
                      shape = RoundedCornerShape(4.dp),
                      modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                    ) {
                      Text(
                        text = "MUTED",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                      )
                    }
                  }
                }
              }

              TrackType.OVERLAY -> {
                // 4. OVERLAY / VFX TRACK ROW (48dp)
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .alpha(if (isMutedOrHidden) 0.38f else 1.0f)
                    .background(Color(0xFF10121C))
                    .border(
                      BorderStroke(0.5.dp, if (isMutedOrHidden) Color(0xFF334155) else Color(0xFF281E38)),
                      shape = RoundedCornerShape(4.dp)
                    )
                    .padding(vertical = 3.dp, horizontal = 6.dp)
                    .testTag("track_fx1_row"),
                  contentAlignment = Alignment.CenterStart
                ) {
                  LazyRow(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                      .fillMaxWidth()
                      .testTag("track_fx1_lazy_row")
                  ) {
                    itemsIndexed(items = track.clips, key = { _, clip -> clip.id }) { index, clip ->
                      val prevEndMs = if (index == 0) 0L else (track.clips[index - 1].startTimeMs + track.clips[index - 1].durationMs)
                      val gapMs = (clip.startTimeMs - prevEndMs).coerceAtLeast(0L)
                      if (gapMs > 0L) {
                        val gapDp = ((gapMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * usableWidthDp.value).dp
                        Spacer(modifier = Modifier.width(gapDp))
                      }

                      val clipWidthDp = ((clip.durationMs.toFloat() / totalDurationMs.coerceAtLeast(1L).toFloat()) * usableWidthDp.value).dp.coerceAtLeast((90.dp * timelineScale))
                      VfxClipBlock(
                        clip = clip,
                        widthDp = clipWidthDp,
                        index = index,
                        onMoveClip = onMoveClip,
                        onTrimClip = onTrimClip,
                        onEditingFinished = onEditingFinished,
                        totalDurationMs = totalDurationMs,
                        pxPerMs = pxPerMs
                      )
                    }
                  }
                }
              }
            }

            if (trackIndex < displayTracks.size - 1) {
              Spacer(modifier = Modifier.height(6.dp))
            }
          }
        }

        // 5. DRAGGABLE PLAYHEAD OVERLAY (Vertical line with timestamp marker at top)
        DraggablePlayhead(
          positionPx = playheadPositionPx,
          maxPositionPx = maxPlayheadPx,
          formattedTime = formattedTime,
          onDragDelta = { delta ->
            val newPos = (playheadPositionPx + delta).coerceIn(0f, maxPlayheadPx)
            onPlayheadPositionChange(newPos)
          }
        )
      }
    }
  }
}

/**
 * Step 19: Canvas Multi-Track Overview Minimap
 * Renders all clips in dynamic Canvas proportionally mapped to total duration.
 */
@Composable
fun CanvasTimelineOverview(
  mediaClips: List<MediaClip>,
  currentPositionMs: Long,
  totalDurationMs: Long,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .fillMaxWidth()
      .height(20.dp)
      .clip(RoundedCornerShape(4.dp))
      .background(Color(0xFF0B0F17))
      .border(0.5.dp, Color(0xFF1E293B), RoundedCornerShape(4.dp))
      .testTag("canvas_timeline_overview")
  ) {
    Canvas(modifier = Modifier.fillMaxSize()) {
      val canvasW = size.width
      val canvasH = size.height
      val dur = if (totalDurationMs > 0L) totalDurationMs.toFloat() else 30000f

      // Track separator lines
      drawLine(
        color = Color(0xFF1E293B),
        start = androidx.compose.ui.geometry.Offset(0f, canvasH * 0.5f),
        end = androidx.compose.ui.geometry.Offset(canvasW, canvasH * 0.5f),
        strokeWidth = 0.5.dp.toPx()
      )

      // Media clips drawn with proportional widths
      mediaClips.forEach { clip ->
        val startX = (clip.startTimeMs.toFloat() / dur) * canvasW
        val clipW = ((clip.durationMs.toFloat() / dur) * canvasW).coerceAtLeast(4f)
        val trackY = when (clip.type) {
          ClipType.VIDEO, ClipType.IMAGE -> 1.5f
          ClipType.VFX -> canvasH * 0.28f
          ClipType.TEXT -> canvasH * 0.52f
          ClipType.AUDIO -> canvasH * 0.76f
        }
        val trackH = canvasH * 0.20f

        drawRoundRect(
          color = clip.color,
          topLeft = androidx.compose.ui.geometry.Offset(startX, trackY),
          size = androidx.compose.ui.geometry.Size(clipW, trackH),
          cornerRadius = androidx.compose.ui.geometry.CornerRadius(2.dp.toPx(), 2.dp.toPx())
        )
      }

      // Live playhead needle
      val playheadX = ((currentPositionMs.toFloat() / dur) * canvasW).coerceIn(0f, canvasW)
      drawLine(
        color = OrangePrimary,
        start = androidx.compose.ui.geometry.Offset(playheadX, 0f),
        end = androidx.compose.ui.geometry.Offset(playheadX, canvasH),
        strokeWidth = 2.dp.toPx()
      )
      drawCircle(
        color = OrangePrimary,
        radius = 3.dp.toPx(),
        center = androidx.compose.ui.geometry.Offset(playheadX, 2.dp.toPx())
      )
    }
  }
}

/**
 * Step 22: Interactive Drag and Trim Wrapper for Timeline Media Clips
 * - Body is horizontally draggable via detectDragGestures to update startTimeMs in PlaybackEngine
 * - Left edge has a visual Drag Handle that trims startTimeMs and durationMs
 * - Right edge has a visual Drag Handle that trims durationMs
 */
@Composable
fun MediaClipInteractiveWrapper(
  clipId: String,
  startTimeMs: Long,
  durationMs: Long,
  totalDurationMs: Long,
  pxPerMs: Float,
  isSelected: Boolean = false,
  accentColor: Color = OrangePrimary,
  onMoveClip: ((clipId: String, newStartTimeMs: Long) -> Unit)? = null,
  onTrimClip: ((clipId: String, newStartTimeMs: Long, newDurationMs: Long) -> Unit)? = null,
  onEditingFinished: (() -> Unit)? = null,
  onClick: () -> Unit = {},
  modifier: Modifier = Modifier,
  content: @Composable () -> Unit
) {
  var moveDragAccumulatorPx by remember { mutableFloatStateOf(0f) }
  var leftTrimAccumulatorPx by remember { mutableFloatStateOf(0f) }
  var rightTrimAccumulatorPx by remember { mutableFloatStateOf(0f) }

  val effectivePxPerMs = pxPerMs.coerceAtLeast(0.0001f)

  Box(
    modifier = modifier
      .pointerInput(clipId, isSelected) {
        detectTapGestures(
          onTap = { onClick() }
        )
      }
      .pointerInput(clipId, startTimeMs, durationMs, effectivePxPerMs, totalDurationMs) {
        detectDragGestures(
          onDragStart = {
            moveDragAccumulatorPx = 0f
          },
          onDragEnd = {
            onEditingFinished?.invoke()
          },
          onDragCancel = {
            onEditingFinished?.invoke()
          },
          onDrag = { change, dragAmount ->
            change.consume()
            moveDragAccumulatorPx += dragAmount.x
            val deltaMs = (moveDragAccumulatorPx / effectivePxPerMs).toLong()
            if (deltaMs != 0L) {
              moveDragAccumulatorPx -= (deltaMs * effectivePxPerMs)
              val maxStart = (totalDurationMs - durationMs).coerceAtLeast(0L)
              val newStart = (startTimeMs + deltaMs).coerceIn(0L, maxStart)
              if (newStart != startTimeMs) {
                onMoveClip?.invoke(clipId, newStart)
              }
            }
          }
        )
      }
  ) {
    // Clip Body Content
    content()

    // Left Visual Drag / Trim Handle (thick border pill + grip cue)
    Box(
      modifier = Modifier
        .align(Alignment.CenterStart)
        .width(20.dp)
        .fillMaxHeight()
        .pointerInput(clipId, startTimeMs, durationMs, effectivePxPerMs) {
          detectDragGestures(
            onDragStart = {
              leftTrimAccumulatorPx = 0f
            },
            onDragEnd = {
              onEditingFinished?.invoke()
            },
            onDragCancel = {
              onEditingFinished?.invoke()
            },
            onDrag = { change, dragAmount ->
              change.consume()
              leftTrimAccumulatorPx += dragAmount.x
              val deltaMs = (leftTrimAccumulatorPx / effectivePxPerMs).toLong()
              if (deltaMs != 0L) {
                leftTrimAccumulatorPx -= (deltaMs * effectivePxPerMs)
                val proposedStart = (startTimeMs + deltaMs).coerceAtLeast(0L)
                val proposedDuration = durationMs - deltaMs
                if (proposedDuration >= 300L && proposedStart >= 0L) {
                  onTrimClip?.invoke(clipId, proposedStart, proposedDuration)
                }
              }
            }
          )
        }
        .testTag("left_trim_handle_$clipId"),
      contentAlignment = Alignment.CenterStart
    ) {
      Box(
        modifier = Modifier
          .padding(start = 2.dp)
          .width(5.dp)
          .fillMaxHeight(0.72f)
          .clip(RoundedCornerShape(topStart = 3.dp, bottomStart = 3.dp, topEnd = 1.dp, bottomEnd = 1.dp))
          .background(if (isSelected) OrangePrimary else Color.White.copy(alpha = 0.85f))
          .border(0.5.dp, Color.Black.copy(alpha = 0.35f), RoundedCornerShape(2.dp))
          .testTag("left_trim_handle"),
        contentAlignment = Alignment.Center
      ) {
        Column(
          modifier = Modifier.fillMaxHeight(),
          verticalArrangement = Arrangement.SpaceEvenly,
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Box(modifier = Modifier.size(2.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.7f)))
          Box(modifier = Modifier.size(2.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.7f)))
        }
      }
    }

    // Right Visual Drag / Trim Handle (thick border pill + grip cue)
    Box(
      modifier = Modifier
        .align(Alignment.CenterEnd)
        .width(20.dp)
        .fillMaxHeight()
        .pointerInput(clipId, startTimeMs, durationMs, effectivePxPerMs, totalDurationMs) {
          detectDragGestures(
            onDragStart = {
              rightTrimAccumulatorPx = 0f
            },
            onDragEnd = {
              onEditingFinished?.invoke()
            },
            onDragCancel = {
              onEditingFinished?.invoke()
            },
            onDrag = { change, dragAmount ->
              change.consume()
              rightTrimAccumulatorPx += dragAmount.x
              val deltaMs = (rightTrimAccumulatorPx / effectivePxPerMs).toLong()
              if (deltaMs != 0L) {
                rightTrimAccumulatorPx -= (deltaMs * effectivePxPerMs)
                val proposedDuration = (durationMs + deltaMs).coerceAtLeast(300L)
                val maxDuration = (totalDurationMs - startTimeMs).coerceAtLeast(300L)
                val clampedDuration = proposedDuration.coerceAtMost(maxDuration)
                if (clampedDuration != durationMs) {
                  onTrimClip?.invoke(clipId, startTimeMs, clampedDuration)
                }
              }
            }
          )
        }
        .testTag("right_trim_handle_$clipId"),
      contentAlignment = Alignment.CenterEnd
    ) {
      Box(
        modifier = Modifier
          .padding(end = 2.dp)
          .width(5.dp)
          .fillMaxHeight(0.72f)
          .clip(RoundedCornerShape(topEnd = 3.dp, bottomEnd = 3.dp, topStart = 1.dp, bottomStart = 1.dp))
          .background(if (isSelected) OrangePrimary else Color.White.copy(alpha = 0.85f))
          .border(0.5.dp, Color.Black.copy(alpha = 0.35f), RoundedCornerShape(2.dp))
          .testTag("right_trim_handle"),
        contentAlignment = Alignment.Center
      ) {
        Column(
          modifier = Modifier.fillMaxHeight(),
          verticalArrangement = Arrangement.SpaceEvenly,
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Box(modifier = Modifier.size(2.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.7f)))
          Box(modifier = Modifier.size(2.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.7f)))
        }
      }
    }
  }
}

/**
 * Step 19: VFX Clip Block on the FX1 track
 */
@Composable
fun VfxClipBlock(
  clip: MediaClip,
  widthDp: androidx.compose.ui.unit.Dp,
  index: Int,
  isSelected: Boolean = false,
  onClick: () -> Unit = {},
  onMoveClip: ((clipId: String, newStartTimeMs: Long) -> Unit)? = null,
  onTrimClip: ((clipId: String, newStartTimeMs: Long, newDurationMs: Long) -> Unit)? = null,
  onEditingFinished: (() -> Unit)? = null,
  totalDurationMs: Long = 30000L,
  pxPerMs: Float = 1.0f,
  modifier: Modifier = Modifier
) {
  MediaClipInteractiveWrapper(
    clipId = clip.id,
    startTimeMs = clip.startTimeMs,
    durationMs = clip.durationMs,
    totalDurationMs = totalDurationMs,
    pxPerMs = pxPerMs,
    isSelected = isSelected,
    accentColor = clip.color,
    onMoveClip = onMoveClip,
    onTrimClip = onTrimClip,
    onEditingFinished = onEditingFinished,
    onClick = onClick,
    modifier = modifier
      .width(widthDp)
      .fillMaxHeight()
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .clip(RoundedCornerShape(6.dp))
        .background(
          androidx.compose.ui.graphics.Brush.horizontalGradient(
            colors = listOf(
              clip.color.copy(alpha = 0.45f),
              clip.color.copy(alpha = 0.75f)
            )
          )
        )
        .border(1.dp, clip.color.copy(alpha = 0.9f), RoundedCornerShape(6.dp))
        .padding(horizontal = 14.dp, vertical = 2.dp)
        .testTag("vfx_clip_${index + 1}")
    ) {
      Canvas(modifier = Modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height
        val sparkles = (w / 40.dp.toPx()).toInt().coerceIn(2, 8)
        for (i in 1..sparkles) {
          val x = (w / (sparkles + 1)) * i
          val y = if (i % 2 == 0) h * 0.3f else h * 0.7f
          drawCircle(
            color = Color.White.copy(alpha = 0.8f),
            radius = 1.5.dp.toPx(),
            center = androidx.compose.ui.geometry.Offset(x, y)
          )
        }
      }

      Row(
        modifier = Modifier.fillMaxSize(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Start
      ) {
        Icon(
          imageVector = Icons.Default.AutoAwesome,
          contentDescription = null,
          tint = Color.White,
          modifier = Modifier.size(12.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = clip.title.ifEmpty { "VFX ${index + 1}" },
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = "${clip.durationSec}s",
          fontSize = 9.sp,
          fontFamily = FontFamily.Monospace,
          color = Color.White.copy(alpha = 0.75f)
        )
      }
    }
  }
}

/**
 * Step 19: Text Clip Block on the T1 track
 */
@Composable
fun TextClipBlock(
  clip: MediaClip,
  widthDp: androidx.compose.ui.unit.Dp,
  index: Int,
  isSelected: Boolean = false,
  onClick: () -> Unit = {},
  onMoveClip: ((clipId: String, newStartTimeMs: Long) -> Unit)? = null,
  onTrimClip: ((clipId: String, newStartTimeMs: Long, newDurationMs: Long) -> Unit)? = null,
  onEditingFinished: (() -> Unit)? = null,
  totalDurationMs: Long = 30000L,
  pxPerMs: Float = 1.0f,
  modifier: Modifier = Modifier
) {
  MediaClipInteractiveWrapper(
    clipId = clip.id,
    startTimeMs = clip.startTimeMs,
    durationMs = clip.durationMs,
    totalDurationMs = totalDurationMs,
    pxPerMs = pxPerMs,
    isSelected = isSelected,
    accentColor = clip.color,
    onMoveClip = onMoveClip,
    onTrimClip = onTrimClip,
    onEditingFinished = onEditingFinished,
    onClick = onClick,
    modifier = modifier
      .width(widthDp)
      .fillMaxHeight()
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .clip(RoundedCornerShape(6.dp))
        .background(
          androidx.compose.ui.graphics.Brush.horizontalGradient(
            colors = listOf(
              clip.color.copy(alpha = 0.4f),
              clip.color.copy(alpha = 0.7f)
            )
          )
        )
        .border(1.dp, clip.color.copy(alpha = 0.85f), RoundedCornerShape(6.dp))
        .padding(horizontal = 14.dp, vertical = 2.dp)
        .testTag("text_clip_${index + 1}")
    ) {
      Row(
        modifier = Modifier.fillMaxSize(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Start
      ) {
        Icon(
          imageVector = Icons.Default.Title,
          contentDescription = null,
          tint = Color.White,
          modifier = Modifier.size(12.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = clip.title.ifEmpty { "Text ${index + 1}" },
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = "${clip.durationSec}s",
          fontSize = 9.sp,
          fontFamily = FontFamily.Monospace,
          color = Color.White.copy(alpha = 0.75f)
        )
      }
    }
  }
}

/**
 * Step 19: Dynamic Audio Clip Block on the A1 track with live Waveform Canvas
 */
@Composable
fun DynamicAudioClipBlock(
  clip: MediaClip,
  widthDp: androidx.compose.ui.unit.Dp,
  index: Int,
  isSelected: Boolean = false,
  onClick: () -> Unit = {},
  onMoveClip: ((clipId: String, newStartTimeMs: Long) -> Unit)? = null,
  onTrimClip: ((clipId: String, newStartTimeMs: Long, newDurationMs: Long) -> Unit)? = null,
  onEditingFinished: (() -> Unit)? = null,
  totalDurationMs: Long = 30000L,
  pxPerMs: Float = 1.0f,
  modifier: Modifier = Modifier
) {
  MediaClipInteractiveWrapper(
    clipId = clip.id,
    startTimeMs = clip.startTimeMs,
    durationMs = clip.durationMs,
    totalDurationMs = totalDurationMs,
    pxPerMs = pxPerMs,
    isSelected = isSelected,
    accentColor = VfxAccentGreen,
    onMoveClip = onMoveClip,
    onTrimClip = onTrimClip,
    onEditingFinished = onEditingFinished,
    onClick = onClick,
    modifier = modifier
      .width(widthDp)
      .fillMaxHeight()
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .clip(RoundedCornerShape(8.dp))
        .background(
          androidx.compose.ui.graphics.Brush.horizontalGradient(
            colors = listOf(
              Color(0xFF064E3B),
              Color(0xFF047857),
              Color(0xFF059669)
            )
          )
        )
        .border(1.dp, VfxAccentGreen.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
        .padding(horizontal = 14.dp, vertical = 4.dp)
        .testTag(if (index == 0) "audio_waveform_block" else "audio_clip_${index + 1}")
    ) {
      Canvas(
        modifier = Modifier
          .fillMaxSize()
          .testTag(if (index == 0) "canvas_audio_waveform" else "canvas_audio_waveform_$index")
      ) {
        val canvasWidth = size.width
        val canvasHeight = size.height
        val midY = canvasHeight / 2f

        val barWidth = 3.dp.toPx()
        val barSpacing = 2.dp.toPx()
        val totalBarPitch = barWidth + barSpacing
        val numBars = (canvasWidth / totalBarPitch).toInt().coerceAtLeast(1)

        for (i in 0 until numBars) {
          val x = i * totalBarPitch
          val waveFactor = kotlin.math.sin(i * 0.22 + index * 1.5) * 0.4 +
            kotlin.math.sin(i * 0.45) * 0.35 +
            kotlin.math.cos(i * 0.08) * 0.25
          val normalizedAmplitude = (kotlin.math.abs(waveFactor).toFloat()).coerceIn(0.18f, 0.95f)
          val barHeight = canvasHeight * normalizedAmplitude * 0.75f

          drawRoundRect(
            color = if (i % 8 == 0) Color(0xFF6EE7B7) else Color(0xFF10B981),
            topLeft = androidx.compose.ui.geometry.Offset(x, midY - barHeight / 2f),
            size = androidx.compose.ui.geometry.Size(barWidth, barHeight),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(2.dp.toPx(), 2.dp.toPx())
          )
        }
      }

      // Audio Label Overlay
      Row(
        modifier = Modifier
          .align(Alignment.TopStart)
          .padding(2.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(
          imageVector = Icons.Default.VolumeUp,
          contentDescription = null,
          tint = Color(0xFFA7F3D0),
          modifier = Modifier.size(11.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = "${clip.title.ifEmpty { "Audio_${index + 1}" }} • ${clip.durationSec}s",
          fontSize = 9.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFFA7F3D0),
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
      }
    }
  }
}

/**
 * Step 20: Fixed Track Header Panel on the left side of each track row
 * Contains:
 * - An icon representing the track type (Film for Main Video, Text for Text, Waveform for Audio)
 * - Track name & short label (V1, T1, A1)
 * - 'Mute/Hide' toggle button (eye or speaker icon)
 */
@Composable
fun TrackHeaderPanel(
  track: MediaTrack,
  accentColor: Color,
  heightDp: androidx.compose.ui.unit.Dp,
  onToggleMuteHide: () -> Unit,
  modifier: Modifier = Modifier
) {
  val isAudio = track.type == TrackType.AUDIO
  val isMuted = track.isMutedOrHidden

  val typeIcon = when (track.type) {
    TrackType.MAIN_VIDEO -> Icons.Default.Movie
    TrackType.TEXT -> Icons.Default.Title
    TrackType.AUDIO -> Icons.Default.GraphicEq
    TrackType.OVERLAY -> Icons.Default.Layers
  }
  val shortLabel = when (track.type) {
    TrackType.MAIN_VIDEO -> "V1"
    TrackType.TEXT -> "T1"
    TrackType.AUDIO -> "A1"
    TrackType.OVERLAY -> "OV1"
  }
  val headerTestTag = when (track.type) {
    TrackType.MAIN_VIDEO -> "track_header_v1"
    TrackType.TEXT -> "track_header_t1"
    TrackType.AUDIO -> "track_header_a1"
    TrackType.OVERLAY -> "track_header_ov1"
  }

  Box(
    modifier = modifier
      .fillMaxWidth()
      .height(heightDp)
      .padding(horizontal = 3.dp)
      .clip(RoundedCornerShape(6.dp))
      .background(if (isMuted) Color(0xFF10131B) else Color(0xFF131824))
      .border(
        1.dp,
        if (isMuted) Color(0xFF334155).copy(alpha = 0.4f) else accentColor.copy(alpha = 0.45f),
        RoundedCornerShape(6.dp)
      )
      .testTag(headerTestTag),
    contentAlignment = Alignment.Center
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 3.dp, vertical = 4.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.SpaceBetween
    ) {
      // Top row: Type Icon & Track Label
      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
      ) {
        Icon(
          imageVector = typeIcon,
          contentDescription = "${track.name} Icon",
          tint = if (isMuted) Color.Gray else accentColor,
          modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(3.dp))
        Text(
          text = shortLabel,
          fontSize = 11.sp,
          fontWeight = FontWeight.Black,
          color = if (isMuted) Color.Gray else Color.White
        )
      }

      // Track Name caption
      Text(
        text = track.name,
        fontSize = 8.5.sp,
        fontWeight = FontWeight.Medium,
        color = if (isMuted) Color.Gray.copy(alpha = 0.6f) else MaterialTheme.colorScheme.onSurfaceVariant,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )

      // Mute / Hide Toggle Button (Eye or Speaker icon)
      Surface(
        shape = RoundedCornerShape(4.dp),
        color = if (isMuted) Color(0xFFEF4444).copy(alpha = 0.22f) else Color.White.copy(alpha = 0.08f),
        border = BorderStroke(
          0.5.dp,
          if (isMuted) Color(0xFFEF4444).copy(alpha = 0.7f) else Color.White.copy(alpha = 0.2f)
        ),
        onClick = onToggleMuteHide,
        modifier = Modifier
          .size(24.dp)
          .testTag("btn_toggle_mute_${track.id}")
      ) {
        Box(contentAlignment = Alignment.Center) {
          Icon(
            imageVector = if (isAudio) {
              if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp
            } else {
              if (isMuted) Icons.Default.VisibilityOff else Icons.Default.Visibility
            },
            contentDescription = if (isAudio) {
              if (isMuted) "Unmute ${track.name}" else "Mute ${track.name}"
            } else {
              if (isMuted) "Show ${track.name}" else "Hide ${track.name}"
            },
            tint = if (isMuted) Color(0xFFF87171) else Color.White,
            modifier = Modifier.size(13.dp)
          )
        }
      }
    }
  }
}

@Composable
fun TrackHeaderBadge(
  label: String,
  subLabel: String,
  icon: ImageVector,
  accentColor: Color,
  heightDp: androidx.compose.ui.unit.Dp,
  testTag: String,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .fillMaxWidth()
      .height(heightDp)
      .padding(horizontal = 4.dp)
      .clip(RoundedCornerShape(6.dp))
      .background(Color(0xFF131824))
      .border(1.dp, accentColor.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
      .testTag(testTag),
    contentAlignment = Alignment.Center
  ) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        tint = accentColor,
        modifier = Modifier.size(16.dp)
      )
      Spacer(modifier = Modifier.height(2.dp))
      Text(
        text = label,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        color = accentColor
      )
      Text(
        text = subLabel,
        fontSize = 9.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant
      )
    }
  }
}

@Composable
fun VideoClipBlock(
  clip: MockVideoClip,
  index: Int,
  isSelected: Boolean = false,
  onClick: () -> Unit = {},
  onMoveClip: ((clipId: String, newStartTimeMs: Long) -> Unit)? = null,
  onTrimClip: ((clipId: String, newStartTimeMs: Long, newDurationMs: Long) -> Unit)? = null,
  onEditingFinished: (() -> Unit)? = null,
  totalDurationMs: Long = 30000L,
  pxPerMs: Float = 1.0f,
  modifier: Modifier = Modifier
) {
  MediaClipInteractiveWrapper(
    clipId = clip.id,
    startTimeMs = clip.startTimeMs,
    durationMs = clip.durationMs,
    totalDurationMs = totalDurationMs,
    pxPerMs = pxPerMs,
    isSelected = isSelected,
    accentColor = OrangePrimary,
    onMoveClip = onMoveClip,
    onTrimClip = onTrimClip,
    onEditingFinished = onEditingFinished,
    onClick = onClick,
    modifier = modifier
      .width(clip.widthDp.dp)
      .height(58.dp)
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .clip(RoundedCornerShape(clip.cornerRadius.dp))
        .background(
          Brush.horizontalGradient(
            colors = listOf(
              clip.primaryColor,
              clip.secondaryColor
            )
          )
        )
        .border(
          width = if (isSelected) 2.5.dp else 1.5.dp,
          color = if (isSelected) OrangePrimary else Color.White.copy(alpha = 0.25f),
          shape = RoundedCornerShape(clip.cornerRadius.dp)
        )
        .padding(horizontal = 14.dp, vertical = 6.dp)
        .testTag("video_clip_${index + 1}")
    ) {
      // Filmstrip perforation dots at top
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(bottom = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        repeat(6) {
          Box(
            modifier = Modifier
              .size(3.dp)
              .clip(CircleShape)
              .background(Color.White.copy(alpha = 0.5f))
          )
        }
      }

      // Clip details
      Column(
        modifier = Modifier
          .align(Alignment.CenterStart)
          .padding(top = 4.dp)
      ) {
        Text(
          text = clip.title,
          color = Color.White,
          fontWeight = FontWeight.Bold,
          fontSize = 11.sp,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
        Text(
          text = "${clip.durationSec}s • 4K UHD",
          color = Color.White.copy(alpha = 0.85f),
          fontSize = 9.sp,
          fontFamily = FontFamily.Monospace
        )
      }

      // Selected indicator badge
      if (isSelected) {
        Surface(
          shape = RoundedCornerShape(3.dp),
          color = VfxCyan,
          modifier = Modifier
            .align(Alignment.BottomEnd)
            .padding(bottom = 2.dp, end = 8.dp)
        ) {
          Text(
            text = "SELECTED",
            fontSize = 8.sp,
            fontWeight = FontWeight.Black,
            color = Color.Black,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
          )
        }
      }
    }
  }
}

@Composable
fun AudioWaveformBlock(
  totalWidthDp: androidx.compose.ui.unit.Dp,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .clip(RoundedCornerShape(8.dp))
      .background(
        Brush.horizontalGradient(
          colors = listOf(
            Color(0xFF064E3B), // Deep Emerald
            Color(0xFF047857),
            Color(0xFF059669)
          )
        )
      )
      .border(1.dp, VfxAccentGreen.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
      .padding(horizontal = 10.dp, vertical = 4.dp)
      .testTag("audio_waveform_block")
  ) {
    // Waveform canvas graphic
    Canvas(
      modifier = Modifier
        .fillMaxSize()
        .testTag("canvas_audio_waveform")
    ) {
      val canvasWidth = size.width
      val canvasHeight = size.height
      val midY = canvasHeight / 2f

      val barWidth = 3.dp.toPx()
      val barSpacing = 2.dp.toPx()
      val totalBarPitch = barWidth + barSpacing
      val numBars = (canvasWidth / totalBarPitch).toInt()

      for (i in 0 until numBars) {
        val x = i * totalBarPitch
        // Generate pseudo-harmonic waveform bars for rich audio look
        val waveFactor = kotlin.math.sin(i * 0.18) * 0.4 +
          kotlin.math.sin(i * 0.45) * 0.35 +
          kotlin.math.cos(i * 0.08) * 0.25
        val normalizedAmplitude = (kotlin.math.abs(waveFactor).toFloat()).coerceIn(0.15f, 0.95f)
        val barHeight = canvasHeight * normalizedAmplitude * 0.75f

        drawRoundRect(
          color = if (i % 8 == 0) Color(0xFF6EE7B7) else Color(0xFF10B981),
          topLeft = Offset(x, midY - barHeight / 2f),
          size = Size(barWidth, barHeight),
          cornerRadius = CornerRadius(2.dp.toPx(), 2.dp.toPx())
        )
      }
    }

    // Audio Label Overlay
    Row(
      modifier = Modifier
        .align(Alignment.TopStart)
        .padding(2.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(
        imageVector = Icons.Default.VolumeUp,
        contentDescription = null,
        tint = Color(0xFFA7F3D0),
        modifier = Modifier.size(12.dp)
      )
      Spacer(modifier = Modifier.width(4.dp))
      Text(
        text = "Master_Audio_Track_Stereo.wav (48kHz 24-bit)",
        fontSize = 9.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFFA7F3D0)
      )
    }
  }
}

@Composable
fun TimelineTimeRuler(
  totalWidthDp: androidx.compose.ui.unit.Dp,
  timelineScale: Float = 1.0f,
  onSeekToPx: ((Float) -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .background(Color(0xFF090C12))
      .then(
        if (onSeekToPx != null) {
          Modifier
            .pointerInput(timelineScale) {
              detectTapGestures { offset ->
                onSeekToPx(offset.x)
              }
            }
            .pointerInput(timelineScale) {
              detectDragGestures { change, _ ->
                change.consume()
                onSeekToPx(change.position.x)
              }
            }
        } else Modifier
      )
      .testTag("timeline_time_ruler")
  ) {
    Canvas(modifier = Modifier.fillMaxSize()) {
      val width = size.width
      val height = size.height

      // Draw ruler ticks every 40dp * timelineScale
      val stepPx = (40.dp * timelineScale).toPx().coerceAtLeast(8f)
      val numTicks = (width / stepPx).toInt()

      for (i in 0..numTicks) {
        val x = i * stepPx
        val isMajor = i % 2 == 0
        val tickHeight = if (isMajor) height * 0.6f else height * 0.3f

        drawLine(
          color = if (isMajor) Color(0xFF64748B) else Color(0xFF334155),
          start = Offset(x, height - tickHeight),
          end = Offset(x, height),
          strokeWidth = if (isMajor) 1.5f else 1f
        )
      }
    }

    // Ruler second timestamps spaced according to timelineScale
    val spacingDp = (64.dp * timelineScale).coerceAtLeast(36.dp)
    Row(
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 4.dp),
      horizontalArrangement = Arrangement.spacedBy(spacingDp),
      verticalAlignment = Alignment.Top
    ) {
      val numLabels = (25 * timelineScale).toInt().coerceIn(15, 60)
      repeat(numLabels) { index ->
        val seconds = index * 2
        Text(
          text = String.format(java.util.Locale.US, "00:%02d", seconds),
          fontSize = 9.sp,
          fontFamily = FontFamily.Monospace,
          color = Color(0xFF94A3B8)
        )
      }
    }
  }
}

@Composable
fun DraggablePlayhead(
  positionPx: Float,
  maxPositionPx: Float,
  formattedTime: String,
  onDragDelta: (Float) -> Unit,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .offset { IntOffset(x = positionPx.roundToInt(), y = 0) }
      .fillMaxHeight()
      .width(52.dp)
      .testTag("draggable_playhead")
  ) {
    // 1. Timestamp Marker Flag at the top (draggable scrubber handle)
    Surface(
      shape = RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp, bottomStart = 2.dp, bottomEnd = 2.dp),
      color = OrangePrimary,
      shadowElevation = 6.dp,
      modifier = Modifier
        .align(Alignment.TopCenter)
        .offset(x = 0.dp, y = 2.dp)
        .pointerInput(maxPositionPx) {
          detectDragGestures { change, dragAmount ->
            change.consume()
            onDragDelta(dragAmount.x)
          }
        }
        .testTag("playhead_timestamp_marker")
    ) {
      Row(
        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = formattedTime.takeLast(5), // e.g. 05:22
          fontSize = 9.sp,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Black,
          color = Color.White
        )
      }
    }

    // Playhead downward arrow pinhead
    Canvas(
      modifier = Modifier
        .align(Alignment.TopCenter)
        .offset(x = 0.dp, y = 20.dp)
        .size(10.dp, 6.dp)
    ) {
      val trianglePath = Path().apply {
        moveTo(0f, 0f)
        lineTo(size.width, 0f)
        lineTo(size.width / 2f, size.height)
        close()
      }
      drawPath(trianglePath, color = OrangePrimary)
    }

    // 2. Playhead Vertical Needle spanning across all tracks
    Box(
      modifier = Modifier
        .align(Alignment.TopCenter)
        .offset(x = 0.dp, y = 24.dp)
        .width(2.dp)
        .fillMaxHeight()
        .background(
          Brush.verticalGradient(
            listOf(
              OrangePrimary,
              OrangePrimary.copy(alpha = 0.8f),
              WarmPeachAccent
            )
          )
        )
        .testTag("playhead_vertical_line")
    )
  }
}

@Composable
fun HomeScreenContent(
  onNavigateToEdit: () -> Unit,
  onOpenSettings: () -> Unit = {},
  onSelectProject: (ProjectEntity) -> Unit = {},
  modifier: Modifier = Modifier
) {
  ProjectsDashboard(
    onNavigateToEdit = onNavigateToEdit,
    onOpenSettings = onOpenSettings,
    onSelectProject = onSelectProject,
    modifier = modifier
  )
}

@Composable
fun ExportScreenContent(
  onBackToEdit: () -> Unit,
  onOpenExportSheet: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(20.dp),
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("export_overview_card"),
      shape = RoundedCornerShape(16.dp),
      colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.surface
      ),
      border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Surface(
          shape = CircleShape,
          color = MaterialTheme.colorScheme.primaryContainer,
          modifier = Modifier.size(64.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.FileUpload,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(32.dp)
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
          text = "Export Settings",
          style = MaterialTheme.typography.titleLarge,
          fontWeight = FontWeight.Bold,
          color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
          text = "Hardware Accelerated 4K/1080p 60FPS Video Rendering",
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
          onClick = onOpenExportSheet,
          colors = ButtonDefaults.buttonColors(
            containerColor = OrangePrimary,
            contentColor = Color.White
          ),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("btn_open_export_sheet")
        ) {
          Icon(
            imageVector = Icons.Default.FileUpload,
            contentDescription = null,
            tint = Color(0xFF0A0E17),
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            "Configure & Export Video",
            fontWeight = FontWeight.Bold,
            color = Color(0xFF0A0E17)
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedButton(
          onClick = onBackToEdit,
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("btn_back_to_edit")
        ) {
          Icon(
            imageVector = Icons.Default.Edit,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text("Return to Edit Timeline", fontWeight = FontWeight.Bold)
        }
      }
    }
  }
}

@Composable
fun VfxBottomBar(
  selectedTab: VfxNavTab,
  onTabSelect: (VfxNavTab) -> Unit,
  modifier: Modifier = Modifier
) {
  NavigationBar(
    containerColor = MaterialTheme.colorScheme.surface,
    tonalElevation = 8.dp,
    modifier = modifier.testTag("bottom_nav_bar")
  ) {
    VfxNavTab.entries.forEach { tab ->
      val isSelected = selectedTab == tab
      NavigationBarItem(
        selected = isSelected,
        onClick = { onTabSelect(tab) },
        icon = {
          Icon(
            imageVector = tab.icon,
            contentDescription = tab.label
          )
        },
        label = {
          Text(
            text = tab.label,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
          )
        },
        colors = NavigationBarItemDefaults.colors(
          selectedIconColor = MaterialTheme.colorScheme.onPrimary,
          selectedTextColor = MaterialTheme.colorScheme.primary,
          indicatorColor = MaterialTheme.colorScheme.primary,
          unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
          unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
        ),
        modifier = Modifier.testTag(tab.testTag)
      )
    }
  }
}

// Backward-compatible Greeting for tests
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
  Text(text = "Hello $name!", modifier = modifier)
}

@Preview(showBackground = true)
@Composable
fun VfxDashboardPreview() {
  MyApplicationTheme(darkTheme = false) {
    VfxMainDashboard()
  }
}
