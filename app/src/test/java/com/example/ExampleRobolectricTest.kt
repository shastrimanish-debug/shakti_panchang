package com.example

import android.content.Context
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.assertTextContains
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.printToLog
import androidx.compose.ui.test.performScrollTo
import androidx.test.core.app.ApplicationProvider
import com.example.billing.ProAccess
import com.example.ui.components.PlaybackControls
import com.example.ui.components.PropertiesInspectorContent
import com.example.ui.components.TimelineView
import com.example.ui.components.TransitionPickerContent
import com.example.ui.theme.MyApplicationTheme
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @get:Rule
  val composeTestRule = createComposeRule()

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("VFX Pro", appName)
  }

  @Test
  fun `properties inspector content displays transform sliders and keyframe controls`() {
    val mockClip = MockVideoClip(
      id = "test_clip_1",
      title = "Intro_Cinematic_4K.mp4",
      durationSec = 5.2f,
      widthDp = 280,
      primaryColor = Color(0xFF6366F1),
      secondaryColor = Color(0xFF4338CA),
      cornerRadius = 8
    )

    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        PropertiesInspectorContent(
          clip = mockClip,
          onClose = {}
        )
      }
    }

    // Verify Properties & Keyframe Inspector header and clip name
    composeTestRule.onNodeWithTag("inspector_header").assertExists()
    composeTestRule.onNodeWithTag("inspector_clip_name").assertExists()
    composeTestRule.onNodeWithTag("inspector_clip_name").assertTextContains("Intro_Cinematic_4K.mp4")

    // Verify basic transform sliders
    composeTestRule.onNodeWithTag("slider_scale").assertExists()
    composeTestRule.onNodeWithTag("slider_pos_x").assertExists()
    composeTestRule.onNodeWithTag("slider_pos_y").assertExists()
    composeTestRule.onNodeWithTag("slider_opacity").assertExists()

    // Verify diamond-shaped keyframe buttons
    composeTestRule.onNodeWithTag("keyframe_btn_scale").assertExists()
    composeTestRule.onNodeWithTag("keyframe_btn_pos_x").assertExists()
    composeTestRule.onNodeWithTag("keyframe_btn_pos_y").assertExists()
    composeTestRule.onNodeWithTag("keyframe_btn_opacity").assertExists()

    // Verify blend mode dropdown (showing 'Normal')
    composeTestRule.onNodeWithTag("blend_mode_dropdown").assertExists()
    composeTestRule.onNodeWithTag("blend_mode_dropdown").assertTextContains("Normal")
  }

  @Test
  fun `selected clip displays floating context menu with Split, Duplicate, and Delete`() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        VfxMainDashboard(initialEditorMode = EditorMode.PRO, initialTab = VfxNavTab.Edit)
      }
    }

    // Clip 1 is selected by default, verify floating context menu
    composeTestRule.onNodeWithTag("clip_floating_context_menu").assertExists()
    composeTestRule.onNodeWithTag("btn_clip_split").assertExists()
    composeTestRule.onNodeWithTag("btn_clip_duplicate").assertExists()
    composeTestRule.onNodeWithTag("btn_clip_delete").assertExists()
  }

  @Test
  fun `transition drop zone slot exists between adjacent clips`() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        VfxMainDashboard(initialEditorMode = EditorMode.PRO, initialTab = VfxNavTab.Edit)
      }
    }

    // Verify visual transition drop zone slot exists between Intro and AMV clips
    composeTestRule.onNodeWithTag("transition_slot_0").assertExists()
  }

  @Test
  fun `transition picker content displays options and handles selection`() {
    var selectedTransition: String? = null
    var selectedDurationSec: Float? = null

    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        TransitionPickerContent(
          slotIndex = 0,
          fromClipTitle = "Intro.mp4",
          toClipTitle = "AMV.mp4",
          currentTransitionName = null,
          onSelectTransition = { name, duration ->
            selectedTransition = name
            selectedDurationSec = duration
          },
          onRemoveTransition = {},
          onDismiss = {}
        )
      }
    }

    // Verify 'Add Transition' picker content is displayed
    composeTestRule.onNodeWithTag("transition_picker_content").assertExists()

    // Verify mock transitions: 'Cross Dissolve', 'Fade to Black', 'Directional Wipe'
    composeTestRule.onNodeWithTag("transition_item_cross_dissolve").assertExists()
    composeTestRule.onNodeWithTag("transition_item_fade_to_black").assertExists()
    composeTestRule.onNodeWithTag("transition_item_directional_wipe").assertExists()

    // Select 'Fade to Black' and apply
    composeTestRule.onNodeWithTag("transition_item_fade_to_black").performScrollTo().performClick()
    composeTestRule.onNodeWithTag("btn_apply_transition").performScrollTo().performClick()

    assertEquals("Fade to Black", selectedTransition)
    assertEquals(0.5f, selectedDurationSec ?: 0f, 0.01f)
  }

  @Test
  fun `splitting a clip adds split parts to timeline`() {
    val viewModel = PlaybackViewModel()
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        VideoPlayerTimelinePreviewArea(playbackViewModel = viewModel)
      }
    }

    // Tap Split on the active clip
    composeTestRule.onNodeWithTag("btn_clip_split").performClick()
    composeTestRule.waitForIdle()

    composeTestRule.onNodeWithTag("video_clip_4").assertExists()
  }

  @Test
  fun `smart cutout state updates on clip and applies to all clips`() {
    val viewModel = PlaybackViewModel()
    val testClipId = viewModel.tracks.value.first().clips.first().id

    // Enable cutout with Neon Cyan stroke and Cyber Grid bg
    viewModel.setClipCutout(
      clipId = testClipId,
      enabled = true,
      strokeEffect = "Neon Cyan",
      strokeWidth = 6f,
      inverted = false,
      bgReplacement = "Cyber Grid"
    )

    val updatedClip = viewModel.tracks.value.first().clips.first { it.id == testClipId }
    assertTrue(updatedClip.isCutoutEnabled)
    assertEquals("Neon Cyan", updatedClip.cutoutStrokeEffect)
    assertEquals(6f, updatedClip.cutoutStrokeWidth, 0.01f)
    assertEquals("Cyber Grid", updatedClip.cutoutBgReplacement)

    // Apply to all
    viewModel.applyCutoutToAll(
      enabled = true,
      strokeEffect = "White Sticker",
      strokeWidth = 8f,
      inverted = true,
      bgReplacement = "Dark Studio"
    )

    val allVisualClips = viewModel.tracks.value.flatMap { it.clips }.filter { it.type == ClipType.VIDEO || it.type == ClipType.IMAGE }
    assertTrue(allVisualClips.all { it.isCutoutEnabled })
    assertTrue(allVisualClips.all { it.cutoutStrokeEffect == "White Sticker" })
  }

  @Test
  fun `beat sync auto-detection, manual markers, and split clips`() {
    val viewModel = PlaybackViewModel()
    
    // Test auto detect
    viewModel.autoDetectBeats(sensitivity = 0.8f)
    assertTrue(viewModel.isBeatSyncEnabled.value)
    assertTrue(viewModel.beatMarkers.value.isNotEmpty())

    // Test set BPM
    viewModel.setBeatBpm(120)
    assertTrue(viewModel.beatMarkers.value.isNotEmpty())
    assertEquals(120, viewModel.beatBpm.value)

    // Test add and remove manual marker
    val markerCountBefore = viewModel.beatMarkers.value.size
    viewModel.seekTo(3333L)
    viewModel.addBeatMarkerAtCurrentPosition()
    assertTrue(viewModel.beatMarkers.value.contains(3333L))

    viewModel.removeBeatMarker(3333L)
    assertTrue(!viewModel.beatMarkers.value.contains(3333L))

    // Test split clips at beats
    val mainTrackClipsBefore = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.size
    viewModel.splitClipsAtBeats()
    val mainTrackClipsAfter = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.size
    assertTrue(mainTrackClipsAfter >= mainTrackClipsBefore)
  }

  @Test
  fun `safe zone guide toggle and platform selection`() {
    val viewModel = PlaybackViewModel()

    viewModel.setSafeZone("TikTok / Shorts", show = true)
    assertEquals("TikTok / Shorts", viewModel.safeZonePlatform.value)
    assertTrue(viewModel.showSafeZone.value)

    viewModel.toggleSafeZone()
    assertEquals(false, viewModel.showSafeZone.value)
  }

  @Test
  fun `watermark toggle, custom text, and branding config`() {
    val viewModel = PlaybackViewModel()

    ProAccess.debugOverride(false)
    viewModel.setWatermarkEnabled(true)
    viewModel.setWatermarkEnabled(false)
    assertEquals(true, viewModel.watermarkEnabled.value)

    ProAccess.debugOverride(true)
    viewModel.setWatermarkConfig(
      text = "@my_channel",
      position = "Top-Right",
      opacity = 0.9f
    )
    assertEquals("@my_channel", viewModel.watermarkText.value)
    assertEquals("Top-Right", viewModel.watermarkPosition.value)
    assertEquals(0.9f, viewModel.watermarkOpacity.value, 0.01f)

    viewModel.setWatermarkEnabled(false)
    assertEquals(false, viewModel.watermarkEnabled.value)

    viewModel.setWatermarkEnabled(true)
    assertEquals(true, viewModel.watermarkEnabled.value)
    ProAccess.debugOverride(false)
  }

  @Test
  fun `vfx pro ai body tracking effects, halo, wings, lightning and color customization`() {
    val viewModel = PlaybackViewModel()
    val clip = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.first()

    // Apply Glowing Halo with Gold color and 0.9 intensity
    viewModel.setClipBodyEffect(clip.id, "Glowing Halo", color = 0xFFFFD700, intensity = 0.9f)
    val updatedClip = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.first { it.id == clip.id }
    assertEquals("Glowing Halo", updatedClip.bodyEffect)
    assertEquals(0xFFFFD700, updatedClip.bodyEffectColor)
    assertEquals(0.9f, updatedClip.bodyEffectIntensity, 0.01f)

    // Apply Angel Wings
    viewModel.setClipBodyEffect(clip.id, "Angel Wings", color = 0xFF00E5FF, intensity = 0.8f)
    val wingsClip = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.first { it.id == clip.id }
    assertEquals("Angel Wings", wingsClip.bodyEffect)
    assertEquals(0xFF00E5FF, wingsClip.bodyEffectColor)

    // Apply Lightning Stroke
    viewModel.setClipBodyEffect(clip.id, "Lightning Stroke", color = 0xFF00E676, intensity = 0.95f)
    val lightningClip = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.first { it.id == clip.id }
    assertEquals("Lightning Stroke", lightningClip.bodyEffect)
  }

  @Test
  fun `vfx pro smooth slow-mo optical flow and directional motion blur`() {
    val viewModel = PlaybackViewModel()
    val clip = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.first()

    // Apply 0.5x speed with Optical Flow Smooth Slow-Mo
    viewModel.setClipSpeed(
      clipId = clip.id,
      newSpeed = 0.5f,
      speedCurve = "Bullet Time",
      smoothSlowMo = true,
      slowMoQuality = "Optical Flow"
    )
    val slowMoClip = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.first { it.id == clip.id }
    assertEquals(0.5f, slowMoClip.speed, 0.01f)
    assertEquals("Bullet Time", slowMoClip.speedCurve)
    assertTrue(slowMoClip.smoothSlowMoEnabled)
    assertEquals("Optical Flow", slowMoClip.smoothSlowMoQuality)

    // Enable Optical Flow Motion Blur with 180 shutter angle and 4 passes
    viewModel.setClipMotionBlur(
      clipId = clip.id,
      enabled = true,
      intensity = 75f,
      shutterAngle = 180,
      blendPasses = 4
    )
    val blurClip = viewModel.tracks.value.first { it.type == TrackType.MAIN_VIDEO }.clips.first { it.id == clip.id }
    assertTrue(blurClip.motionBlurEnabled)
    assertEquals(75f, blurClip.motionBlurIntensity, 0.01f)
    assertEquals(180, blurClip.motionBlurShutterAngle)
    assertEquals(4, blurClip.motionBlurBlendPasses)
  }

  @Test
  fun `playback controls renders all controls and interacts with play pause seek and volume`() {
    var playPauseClicked = false
    var seekForwardClicked = false
    var seekBackwardClicked = false
    var muteToggled = false
    var targetSeekMs = -1L
    var updatedVolume = -1f

    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        PlaybackControls(
          isPlaying = false,
          currentPositionMs = 5000L,
          totalDurationMs = 30000L,
          volume = 0.8f,
          isMuted = false,
          onPlayPause = { playPauseClicked = true },
          onSeekTo = { targetSeekMs = it },
          onSeekForward = { seekForwardClicked = true },
          onSeekBackward = { seekBackwardClicked = true },
          onVolumeChange = { updatedVolume = it },
          onToggleMute = { muteToggled = true }
        )
      }
    }

    // Verify container and primary buttons exist
    composeTestRule.onNodeWithTag("playback_controls_container").assertExists()
    composeTestRule.onNodeWithTag("playback_play_pause_button").assertExists()
    composeTestRule.onNodeWithTag("playback_seek_back_button").assertExists()
    composeTestRule.onNodeWithTag("playback_seek_forward_button").assertExists()
    composeTestRule.onNodeWithTag("playback_seek_slider").assertExists()
    composeTestRule.onNodeWithTag("playback_volume_button").assertExists()
    composeTestRule.onNodeWithTag("playback_volume_slider").assertExists()
    composeTestRule.onNodeWithTag("playback_volume_label").assertExists()
    composeTestRule.onNodeWithTag("playback_current_time").assertExists()
    composeTestRule.onNodeWithTag("playback_total_time").assertExists()
    composeTestRule.onNodeWithTag("playback_speed_button").assertExists()

    // Test Play/Pause click
    composeTestRule.onNodeWithTag("playback_play_pause_button").performClick()
    assertTrue(playPauseClicked)

    // Test Seek Backward click
    composeTestRule.onNodeWithTag("playback_seek_back_button").performClick()
    assertTrue(seekBackwardClicked)

    // Test Seek Forward click
    composeTestRule.onNodeWithTag("playback_seek_forward_button").performClick()
    assertTrue(seekForwardClicked)

    // Test Volume Mute toggle click
    composeTestRule.onNodeWithTag("playback_volume_button").performClick()
    assertTrue(muteToggled)
  }

  @Test
  fun `timeline view renders precision scrubber jog wheel and navigates frame-by-frame`() {
    var seekedMs = -1L
    var playPauseToggled = false

    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        TimelineView(
          currentPositionMs = 5000L,
          totalDurationMs = 30000L,
          isPlaying = false,
          fps = 30,
          onSeekTo = { seekedMs = it },
          onPlayPauseToggle = { playPauseToggled = true }
        )
      }
    }

    // Verify root, timecode, playhead, strip and jog wheel exist
    composeTestRule.onNodeWithTag("timeline_view_root").assertExists()
    composeTestRule.onNodeWithTag("text_timeline_timecode").assertExists()
    composeTestRule.onNodeWithTag("timeline_frame_strip").assertExists()
    composeTestRule.onNodeWithTag("timeline_playhead").assertExists()
    composeTestRule.onNodeWithTag("jog_wheel_scrubber").assertExists()
    composeTestRule.onNodeWithTag("btn_fps_selector").assertExists()

    // Test Play/Pause toggle
    composeTestRule.onNodeWithTag("btn_timeline_play_pause").performClick()
    assertTrue(playPauseToggled)

    // Test Step +1 Frame (at 30fps, 1000/30 = 33ms -> 5000 + 33 = 5033ms)
    composeTestRule.onNodeWithTag("btn_timeline_step_next").performClick()
    assertEquals(5033L, seekedMs)

    // Test Step -1 Frame
    composeTestRule.onNodeWithTag("btn_timeline_step_prev").performClick()
    assertEquals(4967L, seekedMs)

    // Test Step +10 Frames (+330ms -> 5330ms)
    composeTestRule.onNodeWithTag("btn_timeline_step_10_next").performClick()
    assertEquals(5330L, seekedMs)

    // Test Step -10 Frames (-330ms -> 4670ms)
    composeTestRule.onNodeWithTag("btn_timeline_step_10_prev").performClick()
    assertEquals(4670L, seekedMs)
  }
}


