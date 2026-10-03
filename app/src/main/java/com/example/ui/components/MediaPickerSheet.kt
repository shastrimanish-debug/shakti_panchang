package com.example.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import com.example.MediaImportItem
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.Audiotrack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.SecondaryTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CreamBackground
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamSurface
import com.example.ui.theme.CreamSurfaceVariant
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangeOnContainer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.OrangePrimaryDark
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.WarmMuted

/**
 * Category tabs for media selection.
 */
enum class MediaCategory(val label: String, val icon: ImageVector, val testTag: String) {
  All("All", Icons.Default.PhotoLibrary, "tab_all"),
  Videos("Videos", Icons.Default.Videocam, "tab_videos"),
  Photos("Photos", Icons.Default.Image, "tab_photos"),
  Audio("Audio", Icons.Default.Audiotrack, "tab_audio")
}

/**
 * Mock media item data representation.
 */
data class MockMediaItem(
  val id: String,
  val title: String,
  val duration: String,
  val resolution: String,
  val placeholderTint: Color,
  val category: MediaCategory
)

/**
 * Step 8: Media Library / Asset Picker UI
 * Modal Bottom Sheet containing:
 * 1. Top Bar with title 'Select Media' and 'Close' icon button.
 * 2. Category Tab row below header ('Videos', 'Photos', 'Audio').
 * 3. Real Phone Storage / Gallery Import Button.
 * 4. Grid layout showing media thumbnails.
 * 5. Prominent 'Add to Timeline' action button at the bottom.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MediaPickerBottomSheet(
  onDismiss: () -> Unit,
  onAddToTimeline: (selectedItems: List<MockMediaItem>) -> Unit,
  onAddRealClip: ((uri: String, title: String, isVideo: Boolean) -> Unit)? = null,
  onAddMultipleRealClips: ((List<MediaImportItem>) -> Unit)? = null,
  onAddAudioClip: ((uri: String, title: String) -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = CreamSurface,
    contentColor = WarmEspresso,
    dragHandle = {
      Box(
        modifier = Modifier
          .padding(top = 10.dp, bottom = 4.dp)
          .size(width = 38.dp, height = 4.dp)
          .clip(CircleShape)
          .background(WarmMuted.copy(alpha = 0.4f))
      )
    },
    modifier = modifier.testTag("media_picker_sheet")
  ) {
    MediaPickerContent(
      onDismiss = onDismiss,
      onAddToTimeline = { items ->
        onAddToTimeline(items)
        onDismiss()
      },
      onAddRealClip = onAddRealClip,
      onAddMultipleRealClips = onAddMultipleRealClips,
      onAddAudioClip = onAddAudioClip
    )
  }
}

@Composable
fun MediaPickerContent(
  onDismiss: () -> Unit,
  onAddToTimeline: (selectedItems: List<MockMediaItem>) -> Unit,
  onAddRealClip: ((uri: String, title: String, isVideo: Boolean) -> Unit)? = null,
  onAddMultipleRealClips: ((List<MediaImportItem>) -> Unit)? = null,
  onAddAudioClip: ((uri: String, title: String) -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var selectedCategoryIndex by remember { mutableIntStateOf(0) }
  val selectedCategories = MediaCategory.entries

  // Multiple Visual Media Picker (Select 1 to 50 videos and photos)
  val multiPhotoPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 50)
  ) { uris: List<Uri> ->
    if (uris.isNotEmpty()) {
      val items = uris.map { uri ->
        val isVideo = uri.toString().contains("video", ignoreCase = true) ||
          (context.contentResolver.getType(uri)?.startsWith("video") == true)
        val fileName = try {
          context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex >= 0) cursor.getString(nameIndex) else null
          }
        } catch (_: Exception) { null } ?: if (isVideo) "Gallery_Video.mp4" else "Gallery_Photo.jpg"
        MediaImportItem(
          uri = uri.toString(),
          title = fileName,
          isVideo = isVideo,
          durationMs = if (isVideo) 6000L else 3500L
        )
      }
      if (onAddMultipleRealClips != null) {
        onAddMultipleRealClips(items)
      } else {
        items.forEach { onAddRealClip?.invoke(it.uri, it.title, it.isVideo) }
      }
      onDismiss()
    }
  }

  // Dedicated Audio Picker (Opens Device Audio / Music storage, NOT photo gallery)
  val audioPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent()
  ) { uri: Uri? ->
    if (uri != null) {
      val fileName = try {
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
          val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
          if (cursor.moveToFirst() && nameIndex >= 0) cursor.getString(nameIndex) else null
        }
      } catch (_: Exception) { null } ?: "Audio_Track.mp3"
      onAddAudioClip?.invoke(uri.toString(), fileName)
      onDismiss()
    }
  }

  // 8 Mock media items (Videos)
  val mockVideos = remember {
    listOf(
      MockMediaItem("v1", "Neon_Cyberpunk_Drone.mp4", "00:15", "4K 60fps", Color(0xFF2E2218), MediaCategory.Videos),
      MockMediaItem("v2", "Tokyo_Night_Walk.mp4", "01:24", "4K 30fps", Color(0xFF332819), MediaCategory.Videos),
      MockMediaItem("v3", "Action_Glitch_Transition.mp4", "00:08", "4K 60fps", Color(0xFF28201A), MediaCategory.Videos),
      MockMediaItem("v4", "Cinematic_Sunset_Timelapse.mp4", "00:45", "4K 60fps", Color(0xFF2E2218), MediaCategory.Videos),
      MockMediaItem("v5", "Anime_AMV_VFX_Intro.mp4", "00:32", "1080p 60fps", Color(0xFF25211D), MediaCategory.Videos),
      MockMediaItem("v6", "SlowMo_Water_Splash.mp4", "02:10", "4K 120fps", Color(0xFF2E251E), MediaCategory.Videos),
      MockMediaItem("v7", "Hyperlapse_Highway.mp4", "01:05", "4K 60fps", Color(0xFF30241A), MediaCategory.Videos),
      MockMediaItem("v8", "Studio_Portrait_B_Roll.mp4", "00:50", "4K 30fps", Color(0xFF26201B), MediaCategory.Videos)
    )
  }

  // Mock items for Photos
  val mockPhotos = remember {
    listOf(
      MockMediaItem("p1", "Landscape_Mountains.raw", "HDR", "24MP", Color(0xFF2E2218), MediaCategory.Photos),
      MockMediaItem("p2", "Cyberpunk_Poster_Art.png", "PNG", "4K", Color(0xFF332819), MediaCategory.Photos),
      MockMediaItem("p3", "Vlog_Thumbnail_Frame.jpg", "JPEG", "1080p", Color(0xFF28201A), MediaCategory.Photos),
      MockMediaItem("p4", "Light_Leak_Overlay.png", "PNG", "4K", Color(0xFF332819), MediaCategory.Photos),
      MockMediaItem("p5", "Neon_Typography.png", "PNG", "4K", Color(0xFF25211D), MediaCategory.Photos),
      MockMediaItem("p6", "Texture_Film_Grain.png", "PNG", "4K", Color(0xFF2B2B2B), MediaCategory.Photos)
    )
  }

  // Mock items for Audio
  val mockAudio = remember {
    listOf(
      MockMediaItem("a1", "Synthwave_Retro_Drive.wav", "03:12", "Lossless 48kHz", Color(0xFF2E2218), MediaCategory.Audio),
      MockMediaItem("a2", "Cinematic_Deep_Impact_Sfx.wav", "00:05", "SFX 96kHz", Color(0xFF332819), MediaCategory.Audio),
      MockMediaItem("a3", "LoFi_Chill_Beats.mp3", "02:45", "320kbps", Color(0xFF28201A), MediaCategory.Audio),
      MockMediaItem("a4", "Cyberpunk_Bass_Drop.wav", "00:12", "SFX 96kHz", Color(0xFF2E2218), MediaCategory.Audio),
      MockMediaItem("a5", "Glitch_Woosh_Transition.wav", "00:03", "SFX 96kHz", Color(0xFF25211D), MediaCategory.Audio),
      MockMediaItem("a6", "Ambient_Drone_Atmosphere.mp3", "04:20", "320kbps", Color(0xFF26201B), MediaCategory.Audio)
    )
  }

  // Track selection (defaulting with first video item selected)
  val selectedItemIds = remember { mutableStateListOf("v1") }

  val currentItems = when (selectedCategories[selectedCategoryIndex]) {
    MediaCategory.All -> mockVideos + mockPhotos
    MediaCategory.Videos -> mockVideos
    MediaCategory.Photos -> mockPhotos
    MediaCategory.Audio -> mockAudio
  }

  Column(
    modifier = modifier
      .fillMaxWidth()
      .height(560.dp)
      .padding(bottom = 16.dp)
      .testTag("media_picker_content")
  ) {
    // 1. Top Bar: Title 'Select Media' and 'Close' icon button
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp, vertical = 6.dp)
        .testTag("media_picker_header"),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = OrangeContainer,
          border = BorderStroke(1.dp, OrangePrimary.copy(alpha = 0.4f)),
          modifier = Modifier.size(36.dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.PhotoLibrary,
              contentDescription = null,
              tint = OrangePrimary,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column {
          Text(
            text = "Select Media",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = WarmEspresso,
            modifier = Modifier.testTag("media_picker_title")
          )
          Text(
            text = "Choose clips, images, or audio for timeline",
            style = MaterialTheme.typography.bodySmall,
            color = WarmMuted
          )
        }
      }

      IconButton(
        onClick = onDismiss,
        modifier = Modifier.testTag("btn_close_media_picker")
      ) {
        Icon(
          imageVector = Icons.Default.Close,
          contentDescription = "Close",
          tint = WarmEspresso
        )
      }
    }

    Spacer(modifier = Modifier.height(6.dp))

    // 2. Tab Row just below the header ('Videos', 'Photos', 'Audio')
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp)
        .testTag("media_picker_tab_row"),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      selectedCategories.forEachIndexed { index, category ->
        val isSelected = selectedCategoryIndex == index
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = if (isSelected) OrangeContainer else CreamSurfaceVariant,
          border = BorderStroke(
            1.dp,
            if (isSelected) OrangePrimary else CreamBorder
          ),
          onClick = { selectedCategoryIndex = index },
          modifier = Modifier
            .weight(1f)
            .testTag(category.testTag)
        ) {
          Row(
            modifier = Modifier.padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = category.icon,
              contentDescription = null,
              tint = if (isSelected) OrangePrimary else WarmMuted,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = category.label,
              fontSize = 12.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
              color = if (isSelected) OrangeOnContainer else WarmMuted
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Prominent Real Storage / Gallery Picker Action
    val currentCat = selectedCategories[selectedCategoryIndex]
    val isAudioCategory = currentCat == MediaCategory.Audio
    Surface(
      shape = RoundedCornerShape(12.dp),
      color = OrangeContainer,
      border = BorderStroke(1.5.dp, OrangePrimary),
      onClick = {
        if (isAudioCategory) {
          audioPickerLauncher.launch("audio/*")
        } else {
          val mediaType = when (currentCat) {
            MediaCategory.Videos -> ActivityResultContracts.PickVisualMedia.VideoOnly
            MediaCategory.Photos -> ActivityResultContracts.PickVisualMedia.ImageOnly
            else -> ActivityResultContracts.PickVisualMedia.ImageAndVideo
          }
          multiPhotoPickerLauncher.launch(
            PickVisualMediaRequest(mediaType)
          )
        }
      },
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp)
        .testTag("btn_pick_device_gallery")
    ) {
      Row(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
      ) {
        Icon(
          imageVector = if (isAudioCategory) Icons.Default.Audiotrack else Icons.Default.AddPhotoAlternate,
          contentDescription = null,
          tint = OrangePrimary,
          modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.width(10.dp))
        Column {
          Text(
            text = when (currentCat) {
              MediaCategory.Audio -> "Choose Audio / Music from Device"
              MediaCategory.Videos -> "Select Multiple Videos from Gallery"
              MediaCategory.Photos -> "Select Multiple Photos from Gallery"
              MediaCategory.All -> "Select Multiple Videos & Photos (1-50)"
            },
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = OrangeOnContainer
          )
          Text(
            text = when (currentCat) {
              MediaCategory.Audio -> "Import MP3, WAV or AAC from internal storage"
              MediaCategory.Videos -> "Pick 1 to 50 videos together from gallery"
              MediaCategory.Photos -> "Pick 1 to 50 photos together from gallery"
              MediaCategory.All -> "Pick 1 to 50 videos & photos together in one go"
            },
            fontSize = 10.sp,
            color = WarmMuted
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // 3. Grid layout showing media thumbnails
    Box(
      modifier = Modifier
        .weight(1f)
        .padding(horizontal = 18.dp)
    ) {
      LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(bottom = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier
          .fillMaxSize()
          .testTag("media_grid")
      ) {
        itemsIndexed(currentItems, key = { _, item -> item.id }) { index, item ->
          val isSelected = selectedItemIds.contains(item.id)

          MockMediaThumbnailCard(
            item = item,
            isSelected = isSelected,
            onClick = {
              if (selectedItemIds.contains(item.id)) {
                selectedItemIds.remove(item.id)
              } else {
                selectedItemIds.add(item.id)
              }
            },
            index = index,
            modifier = Modifier.testTag("media_thumbnail_$index")
          )
        }
      }
    }

    // 4. Prominent 'Add to Timeline' action button at the bottom
    Surface(
      color = CreamSurface,
      border = BorderStroke(1.dp, CreamBorder),
      modifier = Modifier.fillMaxWidth()
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 18.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = if (selectedItemIds.isEmpty()) "No media selected" else "${selectedItemIds.size} selected",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (selectedItemIds.isEmpty()) WarmMuted else OrangePrimaryDark
          )
          Text(
            text = "Ready to insert at playhead",
            fontSize = 10.sp,
            color = WarmMuted
          )
        }

        Button(
          onClick = {
            val itemsToAdd = (mockVideos + mockPhotos + mockAudio).filter { selectedItemIds.contains(it.id) }
            onAddToTimeline(itemsToAdd)
            itemsToAdd.forEach { item ->
              if (item.category == MediaCategory.Audio) {
                onAddAudioClip?.invoke("content://vfxpro/audio/${item.id}", item.title)
              }
            }
          },
          enabled = selectedItemIds.isNotEmpty(),
          colors = ButtonDefaults.buttonColors(
            containerColor = OrangePrimary,
            contentColor = Color.White,
            disabledContainerColor = CreamSurfaceVariant,
            disabledContentColor = WarmMuted
          ),
          shape = RoundedCornerShape(10.dp),
          contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp),
          modifier = Modifier.testTag("btn_add_to_timeline")
        ) {
          Icon(
            imageVector = Icons.Default.Add,
            contentDescription = null,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Add to Timeline",
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp
          )
        }
      }
    }
  }
}

/**
 * Individual Mock Media Thumbnail with dark placeholder and duration overlay.
 */
@Composable
fun MockMediaThumbnailCard(
  item: MockMediaItem,
  isSelected: Boolean,
  onClick: () -> Unit,
  index: Int,
  modifier: Modifier = Modifier
) {
  Card(
    onClick = onClick,
    shape = RoundedCornerShape(10.dp),
    colors = CardDefaults.cardColors(
      containerColor = item.placeholderTint
    ),
    border = BorderStroke(
      width = if (isSelected) 2.dp else 1.dp,
      color = if (isSelected) OrangePrimary else CreamBorder
    ),
    modifier = modifier
      .fillMaxWidth()
      .testTag("media_item_${item.id}")
  ) {
    Column {
      // 16:9 Dark thumbnail placeholder
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .aspectRatio(16f / 9f)
          .background(item.placeholderTint)
      ) {
        // Placeholder watermark icon
        Box(
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = when (item.category) {
              MediaCategory.Videos -> Icons.Default.Movie
              MediaCategory.Photos -> Icons.Default.Image
              MediaCategory.Audio -> Icons.Default.MusicNote
              MediaCategory.All -> Icons.Default.PhotoLibrary
            },
            contentDescription = null,
            tint = Color.White.copy(alpha = 0.25f),
            modifier = Modifier.size(28.dp)
          )
        }

        // Selection Checkmark Badge
        if (isSelected) {
          Surface(
            shape = CircleShape,
            color = OrangePrimary,
            modifier = Modifier
              .align(Alignment.TopEnd)
              .padding(6.dp)
              .size(20.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.Check,
                contentDescription = "Selected",
                tint = Color.White,
                modifier = Modifier.size(14.dp)
              )
            }
          }
        }

        // Duration overlay badge (e.g., '00:15')
        Surface(
          shape = RoundedCornerShape(4.dp),
          color = Color(0xCC000000),
          modifier = Modifier
            .align(Alignment.BottomEnd)
            .padding(6.dp)
        ) {
          Text(
            text = item.duration,
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
          )
        }

        // Resolution / Format tag in top-left
        Surface(
          shape = RoundedCornerShape(3.dp),
          color = Color(0x80000000),
          modifier = Modifier
            .align(Alignment.TopStart)
            .padding(6.dp)
        ) {
          Text(
            text = item.resolution,
            fontSize = 8.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
          )
        }
      }

      // Title caption below thumbnail
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .background(CreamSurfaceVariant)
          .padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = item.title,
          fontSize = 10.sp,
          fontWeight = FontWeight.Medium,
          color = WarmEspresso,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis,
          modifier = Modifier.weight(1f)
        )
      }
    }
  }
}
