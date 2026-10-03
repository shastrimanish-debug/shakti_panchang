package com.example.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FontDownload
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.VideoLibrary
import com.example.ui.theme.AppThemeManager
import com.example.ui.theme.StudioThemePickerSheet
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ads.StudioBannerAd
import com.example.billing.ProAccess
import com.example.billing.ProBillingManager
import com.example.data.AppDatabase
import com.example.data.ProjectEntity
import com.example.data.ProjectRepository
import kotlinx.coroutines.launch

/**
 * Project Data Model for Projects Dashboard
 */
data class MockProject(
  val id: String,
  val name: String,
  val lastEdited: String,
  val duration: String,
  val resolution: String,
  val trackCount: Int,
  val entityId: Long = 0L
)

/**
 * Projects Dashboard UI for VFX Pro Studio Home screen:
 * 1. Warm apricot / peach to coral cinema gradient background.
 * 2. VFX PRO Studio brand logo with VIP Pro & settings gear header.
 * 3. White card with 3 circular hero buttons: Video (pink), Photo (coral), Collage (orange).
 * 4. VFX Pro Drafts / New dialog with "NEW +" bright emerald button and draft items.
 * 5. "WHAT'S NEW" section showcasing 3D Shaders, AI Cutout, and Cinema 3D LUTs.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectsDashboard(
  onNavigateToEdit: () -> Unit,
  onOpenSettings: () -> Unit = {},
  onSelectProject: ((ProjectEntity) -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val scope = rememberCoroutineScope()
  val repository = remember { ProjectRepository(AppDatabase.getDatabase(context).projectDao()) }
  val dbProjects by repository.allProjects.collectAsState(initial = emptyList())
  val currentTheme by AppThemeManager.currentTheme.collectAsState()
  val isLifetime by ProAccess.isPro.collectAsState()
  val lifetimePrice by ProBillingManager.priceLabel.collectAsState()
  var showLifetimeSheet by remember { mutableStateOf(false) }

  var showDraftsSheet by remember { mutableStateOf(false) }
  var showThemePickerSheet by remember { mutableStateOf(false) }

  val timeFormat = remember { java.text.SimpleDateFormat("yyyy-MM-dd\nHH:mm", java.util.Locale.getDefault()) }
  val fullTimeFormat = remember { java.text.SimpleDateFormat("MMM dd, yyyy • hh:mm a", java.util.Locale.getDefault()) }

  // Real Photo Picker launcher for the 'Video' hero button
  val pickVideoLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    if (uri != null) {
      scope.launch {
        val fileName = try {
          context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex >= 0) cursor.getString(nameIndex) else null
          }
        } catch (_: Exception) { null } ?: "Video_${System.currentTimeMillis() % 1000}.mp4"

        val newProject = ProjectEntity(
          name = fileName.substringBeforeLast("."),
          videoUri = uri.toString(),
          durationMs = 15000L,
          resolution = "1080p 60fps",
          clipCount = 1
        )
        val insertedId = repository.insertProject(newProject)
        onSelectProject?.invoke(newProject.copy(id = insertedId))
        onNavigateToEdit()
      }
    }
  }

  // Real Photo Picker launcher for the 'Photo' hero button
  val pickPhotoLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    if (uri != null) {
      scope.launch {
        val newProject = ProjectEntity(
          name = "Photo_${System.currentTimeMillis() % 1000}",
          thumbnailUri = uri.toString(),
          durationMs = 5000L,
          resolution = "4K Canvas",
          clipCount = 1
        )
        val insertedId = repository.insertProject(newProject)
        onSelectProject?.invoke(newProject.copy(id = insertedId))
        onNavigateToEdit()
      }
    }
  }

  // Real Multiple Picker launcher for 'Collage'
  val pickMultipleLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 10)
  ) { uris: List<Uri> ->
    if (uris.isNotEmpty()) {
      scope.launch {
        val newProject = ProjectEntity(
          name = "Collage_${System.currentTimeMillis() % 1000}",
          thumbnailUri = uris.firstOrNull()?.toString(),
          durationMs = (uris.size * 3000L),
          resolution = "1080p 60fps",
          clipCount = uris.size
        )
        val insertedId = repository.insertProject(newProject)
        onSelectProject?.invoke(newProject.copy(id = insertedId))
        onNavigateToEdit()
      }
    }
  }

  val projectsList = dbProjects.map {
    val durationSec = (it.durationMs / 1000).toInt()
    MockProject(
      id = it.id.toString(),
      name = it.name,
      lastEdited = fullTimeFormat.format(java.util.Date(it.lastEdited)),
      duration = String.format(java.util.Locale.US, "%02d:%02d", durationSec / 60, durationSec % 60),
      resolution = it.resolution,
      trackCount = it.clipCount.coerceAtLeast(1),
      entityId = it.id
    )
  }

  // Dynamic Cinema Pro Studio Theme Gradient
  val vfxStudioBackground = Brush.verticalGradient(
    colors = listOf(
      currentTheme.backgroundColor,
      currentTheme.surfaceColor,
      currentTheme.surfaceRaised
    )
  )

  Box(
    modifier = modifier
      .fillMaxSize()
      .background(vfxStudioBackground)
      .testTag("vfx_home_root")
  ) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("projects_dashboard"),
      contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp, bottom = if (isLifetime) 16.dp else 84.dp),
      verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
      // 1. VFX Pro Studio Header: Stylized Brand Logo + Theme Picker + Settings
      item {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(top = 12.dp, bottom = 12.dp)
            .testTag("vfx_top_header"),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Left: "VFX PRO" Studio Brand Logo
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = "VFX",
              fontSize = 32.sp,
              fontWeight = FontWeight.Black,
              letterSpacing = (-0.5).sp,
              color = Color.White
            )
            Text(
              text = "PRO",
              fontSize = 32.sp,
              fontWeight = FontWeight.Black,
              letterSpacing = (-0.5).sp,
              color = currentTheme.primaryColor
            )
            Spacer(modifier = Modifier.width(6.dp))
            Surface(
              color = currentTheme.primaryColor,
              shape = RoundedCornerShape(6.dp)
            ) {
              Text(
                text = "STUDIO",
                fontSize = 10.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.Black,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
          }

          // Right Icons: lifetime price, theme, settings
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            if (!isLifetime) {
              Surface(
                color = currentTheme.primaryColor,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                  .clickable { showLifetimeSheet = true }
                  .testTag("btn_home_lifetime")
              ) {
                Text(
                  text = lifetimePrice.substringBefore("·").trim(),
                  fontSize = 12.sp,
                  fontWeight = FontWeight.Black,
                  color = Color.Black,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                )
              }
            }
            // Theme Switcher button (10+ custom themes)
            IconButton(
              onClick = { showThemePickerSheet = true },
              modifier = Modifier
                .size(40.dp)
                .testTag("btn_top_theme_picker")
            ) {
              Icon(
                imageVector = Icons.Default.Palette,
                contentDescription = "Change Theme",
                tint = currentTheme.primaryColor,
                modifier = Modifier.size(24.dp)
              )
            }

            // Profile / VIP badge
            IconButton(
              onClick = { /* VIP Pro */ },
              modifier = Modifier.size(40.dp)
            ) {
              Box(contentAlignment = Alignment.TopEnd) {
                Icon(
                  imageVector = Icons.Default.Person,
                  contentDescription = "Account",
                  tint = currentTheme.textColor.copy(alpha = 0.85f),
                  modifier = Modifier.size(24.dp)
                )
                Icon(
                  imageVector = Icons.Default.Stars,
                  contentDescription = null,
                  tint = currentTheme.primaryColor,
                  modifier = Modifier
                    .size(10.dp)
                    .offset(x = 2.dp, y = (-2).dp)
                )
              }
            }

            // Settings gear
            IconButton(
              onClick = onOpenSettings,
              modifier = Modifier
                .size(40.dp)
                .testTag("btn_settings")
            ) {
              Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = "Settings",
                tint = currentTheme.textColor.copy(alpha = 0.85f),
                modifier = Modifier.size(24.dp)
              )
            }
          }
        }
      }

      // 1.5 Quick Theme Switcher Row (10+ Themes preview directly on Dashboard)
      item {
        Column(modifier = Modifier.fillMaxWidth()) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(start = 4.dp, bottom = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "STUDIO THEMES (10+)",
              fontSize = 12.sp,
              fontWeight = FontWeight.ExtraBold,
              letterSpacing = 1.2.sp,
              color = currentTheme.textColor.copy(alpha = 0.85f)
            )
            Text(
              text = currentTheme.displayName,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = currentTheme.primaryColor
            )
          }

          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            com.example.ui.theme.AppStudioTheme.entries.forEach { theme ->
              val isSelected = theme == currentTheme
              Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (isSelected) theme.surfaceRaised else theme.surfaceColor,
                border = BorderStroke(
                  width = if (isSelected) 2.dp else 1.dp,
                  color = if (isSelected) theme.primaryColor else currentTheme.surfaceRaised
                ),
                modifier = Modifier
                  .clickable {
                    com.example.ui.theme.AppThemeManager.setTheme(theme)
                  }
                  .testTag("theme_chip_${theme.id}")
              ) {
                Row(
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Box(
                    modifier = Modifier
                      .size(12.dp)
                      .clip(CircleShape)
                      .background(theme.primaryColor)
                  )
                  Spacer(modifier = Modifier.width(6.dp))
                  Text(
                    text = theme.displayName.substringBefore(" ("),
                    fontSize = 11.sp,
                    fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium,
                    color = if (isSelected) theme.primaryColor else currentTheme.textColor.copy(alpha = 0.8f)
                  )
                }
              }
            }
          }
        }
      }

      // 2. CapCut & InShot Style Massive "New Project" Hero Banner Card + Quick Actions
      item {
        Column(modifier = Modifier.fillMaxWidth()) {
          Card(
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent),
            modifier = Modifier
              .fillMaxWidth()
              .shadow(12.dp, RoundedCornerShape(28.dp))
              .clickable {
                pickVideoLauncher.launch(
                  PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                )
              }
              .testTag("hero_new_project_card")
          ) {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .background(
                  Brush.linearGradient(
                    colors = listOf(
                      Color(0xFF2563EB), // Vibrant Blue
                      Color(0xFF7C3AED), // Violet
                      Color(0xFFEC4899)  // Pink
                    )
                  )
                )
                .padding(26.dp)
            ) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Column(modifier = Modifier.weight(1f)) {
                  Surface(
                    color = Color.White.copy(alpha = 0.25f),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text(
                      text = "🎬 PRO VIDEO EDITOR",
                      fontSize = 10.sp,
                      fontWeight = FontWeight.ExtraBold,
                      color = Color.White,
                      modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                  }
                  Spacer(modifier = Modifier.height(10.dp))
                  Text(
                    text = "New Project",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                  )
                  Spacer(modifier = Modifier.height(4.dp))
                  Text(
                    text = "Select clips & start editing instantly",
                    fontSize = 13.sp,
                    color = Color.White.copy(alpha = 0.85f)
                  )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Surface(
                  shape = CircleShape,
                  color = Color.White,
                  modifier = Modifier.size(60.dp)
                ) {
                  Box(contentAlignment = Alignment.Center) {
                    Icon(
                      imageVector = Icons.Default.Add,
                      contentDescription = "New Project",
                      tint = Color(0xFF2563EB),
                      modifier = Modifier.size(36.dp)
                    )
                  }
                }
              }
            }
          }

          Spacer(modifier = Modifier.height(14.dp))

          // Quick Action Row: Video, Photo, Collage
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            // Video Drafts
            Surface(
              shape = RoundedCornerShape(18.dp),
              color = currentTheme.surfaceColor,
              border = BorderStroke(1.dp, currentTheme.surfaceRaised),
              modifier = Modifier
                .weight(1f)
                .clickable { showDraftsSheet = true }
                .testTag("btn_quick_video")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
              ) {
                Icon(Icons.Default.Movie, contentDescription = null, tint = currentTheme.primaryColor, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Drafts", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = currentTheme.textColor)
              }
            }

            // Photo Editor
            Surface(
              shape = RoundedCornerShape(18.dp),
              color = currentTheme.surfaceColor,
              border = BorderStroke(1.dp, currentTheme.surfaceRaised),
              modifier = Modifier
                .weight(1f)
                .clickable {
                  pickPhotoLauncher.launch(
                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                  )
                }
                .testTag("btn_quick_photo")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
              ) {
                Icon(Icons.Default.Image, contentDescription = null, tint = currentTheme.accentColor, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Photo", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = currentTheme.textColor)
              }
            }

            // Collage Maker
            Surface(
              shape = RoundedCornerShape(18.dp),
              color = currentTheme.surfaceColor,
              border = BorderStroke(1.dp, currentTheme.surfaceRaised),
              modifier = Modifier
                .weight(1f)
                .clickable {
                  pickMultipleLauncher.launch(
                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)
                  )
                }
                .testTag("btn_quick_collage")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
              ) {
                Icon(Icons.Default.GridView, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Collage", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = currentTheme.textColor)
              }
            }
          }
        }
      }

      // 3. "WHAT'S NEW" Section with "ALL >"
      item {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(top = 8.dp)
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 4.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "WHAT'S NEW",
              fontSize = 13.sp,
              fontWeight = FontWeight.ExtraBold,
              letterSpacing = 1.2.sp,
              color = currentTheme.textColor.copy(alpha = 0.85f)
            )

            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.clickable { /* View All */ }
            ) {
              Text(
                text = "ALL",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = currentTheme.primaryColor
              )
              Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = currentTheme.primaryColor,
                modifier = Modifier.size(16.dp)
              )
            }
          }

          // Horizontal scroll row with the 3 colorful feature cards
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState())
              .padding(top = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            // Card 1: 3D SHADERS & PARTICLES (Cyber Cyan)
            VfxWhatsNewCard(
              title = "3D SHADERS\n& PARTICLES",
              backgroundColor = Color(0xFF0284C7),
              badgeIcon = Icons.Default.AutoAwesome,
              badgeText = "✨ ⚡",
              onClick = {
                scope.launch {
                  val sampleProject = ProjectEntity(
                    name = "VFX_Cinema_${System.currentTimeMillis() % 1000}",
                    durationMs = 12000L,
                    resolution = "4K 60fps",
                    clipCount = 2
                  )
                  val insertedId = repository.insertProject(sampleProject)
                  onSelectProject?.invoke(sampleProject.copy(id = insertedId))
                  onNavigateToEdit()
                }
              }
            )

            // Card 2: AI SMART CUTOUT (Emerald)
            VfxWhatsNewCard(
              title = "AI SMART\nCUTOUT",
              backgroundColor = Color(0xFF059669),
              badgeIcon = Icons.Default.LocalFireDepartment,
              badgeText = "🤖 ✂️",
              onClick = {
                scope.launch {
                  val sampleProject = ProjectEntity(
                    name = "AI_Cutout_${System.currentTimeMillis() % 1000}",
                    durationMs = 15000L,
                    resolution = "4K 60fps",
                    clipCount = 3
                  )
                  val insertedId = repository.insertProject(sampleProject)
                  onSelectProject?.invoke(sampleProject.copy(id = insertedId))
                  onNavigateToEdit()
                }
              }
            )

            // Card 3: CINEMA 3D LUTS & SCOPES (Amber/Gold)
            VfxWhatsNewCard(
              title = "CINEMA 3D LUTS\n& SCOPES",
              backgroundColor = Color(0xFFD97706),
              badgeIcon = Icons.Default.FontDownload,
              badgeText = "🎨 📽️",
              onClick = {
                scope.launch {
                  val sampleProject = ProjectEntity(
                    name = "Cinema_Grading_${System.currentTimeMillis() % 1000}",
                    durationMs = 10000L,
                    resolution = "4K 60fps",
                    clipCount = 2
                  )
                  val insertedId = repository.insertProject(sampleProject)
                  onSelectProject?.invoke(sampleProject.copy(id = insertedId))
                  onNavigateToEdit()
                }
              }
            )
          }
        }
      }

      // 4. Recent Drafts list if any
      if (projectsList.isNotEmpty()) {
        item {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(top = 10.dp, start = 4.dp, end = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "RECENT DRAFTS",
              fontSize = 12.sp,
              fontWeight = FontWeight.ExtraBold,
              letterSpacing = 1.2.sp,
              color = currentTheme.textColor.copy(alpha = 0.85f)
            )

            Text(
              text = "${projectsList.size} Drafts",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = currentTheme.primaryColor
            )
          }
        }

        items(projectsList.take(6), key = { it.id }) { project ->
          VfxDraftListItem(
            project = project,
            onClick = {
              val entity = dbProjects.find { it.id == project.entityId }
              if (entity != null) {
                onSelectProject?.invoke(entity)
              }
              onNavigateToEdit()
            },
            onDelete = {
              scope.launch {
                val entity = dbProjects.find { it.id == project.entityId }
                if (entity != null) {
                  repository.deleteProject(entity)
                }
              }
            }
          )
        }
      }

      // Bottom breathing space
      item {
        Spacer(modifier = Modifier.height(30.dp))
      }
    }

    // VFX Pro Drafts / New Bottom Sheet
    if (showDraftsSheet) {
      VfxDraftsSheet(
        projects = dbProjects,
        onDismiss = { showDraftsSheet = false },
        onNewProjectClick = {
          showDraftsSheet = false
          pickVideoLauncher.launch(
            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
          )
        },
        onSelectProject = { entity ->
          showDraftsSheet = false
          onSelectProject?.invoke(entity)
          onNavigateToEdit()
        },
        onDeleteProject = { entity ->
          scope.launch {
            repository.deleteProject(entity)
          }
        }
      )
    }
    // 1-Tap Studio Theme Picker Sheet (10+ Themes)
    if (showThemePickerSheet) {
      StudioThemePickerSheet(
        onDismiss = { showThemePickerSheet = false }
      )
    }
    if (showLifetimeSheet) {
      LifetimeUnlockSheet(onDismiss = { showLifetimeSheet = false })
    }
    if (!isLifetime) {
      StudioBannerAd(
        modifier = Modifier
          .align(Alignment.BottomCenter)
          .testTag("home_banner_ad")
      )
    }
  }
}

/**
 * VFX Pro Signature Hero Button: Big Colorful Circle with optional Clock Badge.
 */
@Composable
private fun VfxSignatureHeroButton(
  icon: androidx.compose.ui.graphics.vector.ImageVector,
  label: String,
  circleColor: Color,
  textColor: Color = Color.White,
  hasRecentsBadge: Boolean,
  testTag: String,
  onClick: () -> Unit
) {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .clickable(onClick = onClick)
      .testTag(testTag)
  ) {
    Box(contentAlignment = Alignment.TopEnd) {
      Surface(
        shape = CircleShape,
        color = circleColor,
        shadowElevation = 5.dp,
        modifier = Modifier.size(76.dp)
      ) {
        Box(contentAlignment = Alignment.Center) {
          Icon(
            imageVector = icon,
            contentDescription = label,
            tint = Color.Black,
            modifier = Modifier.size(36.dp)
          )
        }
      }

      // Small clock badge indicating recents/drafts
      if (hasRecentsBadge) {
        Surface(
          shape = CircleShape,
          color = Color.Black.copy(alpha = 0.8f),
          border = BorderStroke(1.dp, circleColor),
          shadowElevation = 2.dp,
          modifier = Modifier
            .size(24.dp)
            .offset(x = 4.dp, y = (-2).dp)
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.Schedule,
              contentDescription = "Drafts",
              tint = circleColor,
              modifier = Modifier.size(15.dp)
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(10.dp))
    Text(
      text = label,
      fontSize = 14.sp,
      fontWeight = FontWeight.Bold,
      color = textColor
    )
  }
}

/**
 * VFX Pro What's New Feature Card.
 */
@Composable
private fun VfxWhatsNewCard(
  title: String,
  backgroundColor: Color,
  badgeIcon: androidx.compose.ui.graphics.vector.ImageVector,
  badgeText: String,
  onClick: () -> Unit
) {
  Surface(
    shape = RoundedCornerShape(16.dp),
    color = backgroundColor,
    shadowElevation = 4.dp,
    modifier = Modifier
      .width(116.dp)
      .height(116.dp)
      .clickable(onClick = onClick)
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(8.dp)
    ) {
      // Decorative center content
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(bottom = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {
        Text(
          text = badgeText,
          fontSize = 24.sp
        )
      }

      // Bottom label
      Text(
        text = title,
        fontSize = 11.sp,
        fontWeight = FontWeight.Black,
        color = Color.White,
        textAlign = TextAlign.Center,
        modifier = Modifier
          .align(Alignment.BottomCenter)
          .fillMaxWidth()
      )
    }
  }
}

/**
 * VFX Pro Drafts / New Bottom Sheet.
 * Displays the bright green "NEW +" pill button and recent drafts list.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VfxDraftsSheet(
  projects: List<ProjectEntity>,
  onDismiss: () -> Unit,
  onNewProjectClick: () -> Unit,
  onSelectProject: (ProjectEntity) -> Unit,
  onDeleteProject: (ProjectEntity) -> Unit
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  val dateFormat = remember { java.text.SimpleDateFormat("yyyy-MM-dd\nHH:mm", java.util.Locale.getDefault()) }

  val currentTheme by AppThemeManager.currentTheme.collectAsState()

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = currentTheme.surfaceColor,
    shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp, vertical = 12.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // 1. Prominent Theme Primary "NEW +" Pill Button
      Surface(
        shape = RoundedCornerShape(18.dp),
        color = currentTheme.primaryColor,
        shadowElevation = 4.dp,
        modifier = Modifier
          .fillMaxWidth()
          .height(64.dp)
          .clip(RoundedCornerShape(18.dp))
          .clickable(onClick = onNewProjectClick)
          .testTag("btn_vfx_new_project")
      ) {
        Row(
          modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "NEW",
            fontSize = 20.sp,
            fontWeight = FontWeight.Black,
            color = Color.Black,
            letterSpacing = 1.sp
          )

          Surface(
            shape = RoundedCornerShape(12.dp),
            color = Color.Black.copy(alpha = 0.15f),
            border = BorderStroke(1.5.dp, Color.Black),
            modifier = Modifier.size(36.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "New",
                tint = Color.Black,
                modifier = Modifier.size(24.dp)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 2. Drafts List (Screenshot 2)
      if (projects.isEmpty()) {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .height(120.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "Tap NEW + to import your first video!",
            fontSize = 14.sp,
            color = currentTheme.textColor.copy(alpha = 0.7f),
            fontWeight = FontWeight.Medium
          )
        }
      } else {
        Column(
          modifier = Modifier.fillMaxWidth(),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          projects.take(6).forEach { project ->
            Surface(
              shape = RoundedCornerShape(14.dp),
              color = currentTheme.surfaceRaised,
              border = BorderStroke(1.dp, currentTheme.primaryColor.copy(alpha = 0.3f)),
              shadowElevation = 1.dp,
              modifier = Modifier
                .fillMaxWidth()
                .clickable { onSelectProject(project) }
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                // Left: Date & Time in 2 lines
                Column {
                  val dateText = try {
                    dateFormat.format(java.util.Date(project.lastEdited))
                  } catch (_: Exception) {
                    "2026-09-26\n13:30"
                  }
                  Text(
                    text = dateText,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = currentTheme.textColor,
                    lineHeight = 18.sp
                  )
                  Text(
                    text = project.name,
                    fontSize = 11.sp,
                    color = currentTheme.textColor.copy(alpha = 0.6f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                  )
                }

                // Right: Checkerboard / Video Thumbnail Placeholder + Options Menu
                Row(verticalAlignment = Alignment.CenterVertically) {
                  // Thumbnail box (Screenshot 2 checkerboard style)
                  Box(
                    modifier = Modifier
                      .size(54.dp)
                      .clip(RoundedCornerShape(8.dp))
                      .background(Color(0xFF262626)),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.Movie,
                      contentDescription = null,
                      tint = Color.White.copy(alpha = 0.6f),
                      modifier = Modifier.size(24.dp)
                    )
                  }

                  Spacer(modifier = Modifier.width(6.dp))

                  var menuOpen by remember { mutableStateOf(false) }
                  Box {
                    IconButton(
                      onClick = { menuOpen = true },
                      modifier = Modifier.size(32.dp)
                    ) {
                      Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Options",
                        tint = Color(0xFF9CA3AF),
                        modifier = Modifier.size(18.dp)
                      )
                    }

                    DropdownMenu(
                      expanded = menuOpen,
                      onDismissRequest = { menuOpen = false }
                    ) {
                      DropdownMenuItem(
                        text = { Text("Open") },
                        leadingIcon = { Icon(Icons.Default.PlayArrow, null) },
                        onClick = {
                          menuOpen = false
                          onSelectProject(project)
                        }
                      )
                      DropdownMenuItem(
                        text = { Text("Delete", color = Color(0xFFEF4444)) },
                        leadingIcon = { Icon(Icons.Default.Delete, null, tint = Color(0xFFEF4444)) },
                        onClick = {
                          menuOpen = false
                          onDeleteProject(project)
                        }
                      )
                    }
                  }
                }
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // 3. Footer: "X DRAFTS >" (Screenshot 2)
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .clickable { /* View all drafts */ }
          .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "${projects.size} DRAFTS",
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF6B7280)
        )
        Icon(
          imageVector = Icons.Default.ChevronRight,
          contentDescription = null,
          tint = Color(0xFF6B7280),
          modifier = Modifier.size(16.dp)
        )
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

/**
 * VFX Pro Draft List Item on Home Screen
 */
@Composable
private fun VfxDraftListItem(
  project: MockProject,
  onClick: () -> Unit,
  onDelete: () -> Unit
) {
  var showMenu by remember { mutableStateOf(false) }
  val currentTheme by com.example.ui.theme.AppThemeManager.currentTheme.collectAsState()

  Surface(
    shape = RoundedCornerShape(16.dp),
    color = currentTheme.surfaceRaised,
    border = BorderStroke(1.dp, currentTheme.primaryColor.copy(alpha = 0.25f)),
    shadowElevation = 2.dp,
    modifier = Modifier
      .fillMaxWidth()
      .clickable(onClick = onClick)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
        Box(
          modifier = Modifier
            .size(50.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF262626)),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = Icons.Default.Movie,
            contentDescription = null,
            tint = currentTheme.primaryColor,
            modifier = Modifier.size(22.dp)
          )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column {
          Text(
            text = project.name,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = currentTheme.textColor,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
          Spacer(modifier = Modifier.height(2.dp))
          Text(
            text = "${project.lastEdited} • ${project.duration}",
            fontSize = 11.sp,
            color = currentTheme.textColor.copy(alpha = 0.6f)
          )
        }
      }

      Box {
        IconButton(
          onClick = { showMenu = true },
          modifier = Modifier.size(32.dp)
        ) {
          Icon(
            imageVector = Icons.Default.MoreVert,
            contentDescription = "Options",
            tint = Color(0xFF9CA3AF),
            modifier = Modifier.size(18.dp)
          )
        }

        DropdownMenu(
          expanded = showMenu,
          onDismissRequest = { showMenu = false }
        ) {
          DropdownMenuItem(
            text = { Text("Open Project") },
            leadingIcon = { Icon(Icons.Default.PlayArrow, null) },
            onClick = {
              showMenu = false
              onClick()
            }
          )
          DropdownMenuItem(
            text = { Text("Delete", color = Color(0xFFEF4444)) },
            leadingIcon = { Icon(Icons.Default.Delete, null, tint = Color(0xFFEF4444)) },
            onClick = {
              showMenu = false
              onDelete()
            }
          )
        }
      }
    }
  }
}
