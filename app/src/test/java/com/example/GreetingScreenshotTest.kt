package com.example

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.assertIsDisplayed
import com.example.ui.theme.MyApplicationTheme
import com.github.takahirom.roborazzi.RobolectricDeviceQualifiers
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = RobolectricDeviceQualifiers.Pixel8, sdk = [36])
class GreetingScreenshotTest {

  @get:Rule val composeTestRule = createComposeRule()

  @Test
  fun greeting_screenshot() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        VfxMainDashboard(initialEditorMode = EditorMode.PRO, initialTab = VfxNavTab.Edit)
      }
    }

    composeTestRule.onNodeWithTag("video_player_timeline_preview_container").assertIsDisplayed()
    composeTestRule.onNodeWithTag("timeline_scroll_container").assertIsDisplayed()
    composeTestRule.onNodeWithTag("draggable_playhead").assertIsDisplayed()
    composeTestRule.onNodeWithTag("fab_import_media").assertIsDisplayed()
  }
}
