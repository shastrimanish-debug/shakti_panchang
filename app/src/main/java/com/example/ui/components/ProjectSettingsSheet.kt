package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.HighQuality
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.VideoSettings
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CreamBorder
import com.example.ui.theme.CreamSurface
import com.example.ui.theme.CreamSurfaceVariant
import com.example.ui.theme.OrangeContainer
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.WarmEspresso
import com.example.ui.theme.WarmMuted

/**
 * Functional Project Settings Bottom Sheet
 * Allows user to configure:
 * - Project Name
 * - Resolution (1080p, 4K, 720p)
 * - Frame Rate (60 FPS, 30 FPS, 24 FPS)
 * - Color Profile (Rec.709, DCI-P3, HDR)
 * - Default Photo Duration
 * - Cache Cleaning & Project Reset
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectSettingsBottomSheet(
  initialProjectName: String = "My VFX Pro Project",
  initialResolution: String = "1080p FHD",
  initialFps: Int = 60,
  initialPhotoDurationSec: Float = 3.0f,
  onDismiss: () -> Unit,
  onSaveSettings: (projectName: String, resolution: String, fps: Int, photoDurationSec: Float) -> Unit,
  onClearCache: () -> Unit,
  onResetProject: () -> Unit,
  modifier: Modifier = Modifier
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  var projectName by remember { mutableStateOf(initialProjectName) }
  var selectedResolution by remember { mutableStateOf(initialResolution) }
  var selectedFps by remember { mutableStateOf(initialFps) }
  var photoDurationSec by remember { mutableFloatStateOf(initialPhotoDurationSec) }
  var selectedColorSpace by remember { mutableStateOf("Rec. 709") }

  val resolutions = listOf("720p HD", "1080p FHD", "4K UHD")
  val fpsOptions = listOf(24, 30, 60)
  val colorSpaces = listOf("Rec. 709", "DCI-P3", "HDR10")

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = CreamSurface,
    contentColor = WarmEspresso,
    dragHandle = {
      Box(
        modifier = Modifier
          .padding(top = 10.dp, bottom = 4.dp)
          .size(width = 40.dp, height = 4.dp)
          .clip(CircleShape)
          .background(WarmMuted.copy(alpha = 0.4f))
      )
    },
    modifier = modifier.testTag("project_settings_sheet")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp)
        .padding(bottom = 28.dp)
        .verticalScroll(rememberScrollState())
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = OrangeContainer,
            modifier = Modifier.size(36.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = null,
                tint = OrangePrimary,
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Project Settings",
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              color = WarmEspresso
            )
            Text(
              text = "Render configuration & default preferences",
              fontSize = 12.sp,
              color = WarmMuted
            )
          }
        }
        IconButton(
          onClick = onDismiss,
          modifier = Modifier.testTag("btn_close_settings")
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = WarmEspresso
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Project Title Input
      Text(
        text = "Project Name",
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        color = WarmEspresso
      )
      Spacer(modifier = Modifier.height(6.dp))
      OutlinedTextField(
        value = projectName,
        onValueChange = { projectName = it },
        placeholder = { Text("Enter project title...") },
        singleLine = true,
        modifier = Modifier
          .fillMaxWidth()
          .testTag("input_project_name")
      )

      Spacer(modifier = Modifier.height(18.dp))

      // Resolution Picker
      Text(
        text = "Master Resolution",
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        color = WarmEspresso
      )
      Spacer(modifier = Modifier.height(6.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        resolutions.forEach { res ->
          FilterChip(
            selected = selectedResolution == res,
            onClick = { selectedResolution = res },
            label = { Text(res, fontSize = 12.sp) },
            leadingIcon = {
              Icon(
                imageVector = Icons.Default.HighQuality,
                contentDescription = null,
                modifier = Modifier.size(16.dp)
              )
            },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangeContainer,
              selectedLabelColor = OrangePrimary,
              selectedLeadingIconColor = OrangePrimary
            ),
            modifier = Modifier.weight(1f)
          )
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Frame Rate (FPS)
      Text(
        text = "Timeline Frame Rate",
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        color = WarmEspresso
      )
      Spacer(modifier = Modifier.height(6.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        fpsOptions.forEach { fps ->
          FilterChip(
            selected = selectedFps == fps,
            onClick = { selectedFps = fps },
            label = {
              Text(
                when (fps) {
                  24 -> "24 FPS (Cinematic)"
                  30 -> "30 FPS (Standard)"
                  else -> "60 FPS (Smooth)"
                },
                fontSize = 11.sp
              )
            },
            leadingIcon = {
              Icon(
                imageVector = Icons.Default.Speed,
                contentDescription = null,
                modifier = Modifier.size(14.dp)
              )
            },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangeContainer,
              selectedLabelColor = OrangePrimary,
              selectedLeadingIconColor = OrangePrimary
            ),
            modifier = Modifier.weight(1f)
          )
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Color Profile
      Text(
        text = "Color Space Profile",
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        color = WarmEspresso
      )
      Spacer(modifier = Modifier.height(6.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        colorSpaces.forEach { cs ->
          FilterChip(
            selected = selectedColorSpace == cs,
            onClick = { selectedColorSpace = cs },
            label = { Text(cs, fontSize = 12.sp) },
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = OrangeContainer,
              selectedLabelColor = OrangePrimary
            ),
            modifier = Modifier.weight(1f)
          )
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Default Photo Duration Slider
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Default Photo Duration",
          fontSize = 13.sp,
          fontWeight = FontWeight.SemiBold,
          color = WarmEspresso
        )
        Text(
          text = "%.1fs".format(photoDurationSec),
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          color = OrangePrimary
        )
      }
      Slider(
        value = photoDurationSec,
        onValueChange = { photoDurationSec = it },
        valueRange = 1.0f..10.0f,
        steps = 17,
        modifier = Modifier
          .fillMaxWidth()
          .testTag("slider_photo_duration")
      )

      Spacer(modifier = Modifier.height(12.dp))
      HorizontalDivider(color = CreamBorder)
      Spacer(modifier = Modifier.height(16.dp))

      // Storage Maintenance
      Text(
        text = "Project & Cache Management",
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        color = WarmEspresso
      )
      Spacer(modifier = Modifier.height(10.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedButton(
          onClick = {
            onClearCache()
            onDismiss()
          },
          colors = ButtonDefaults.outlinedButtonColors(contentColor = WarmEspresso),
          border = BorderStroke(1.dp, CreamBorder),
          modifier = Modifier.weight(1f).testTag("btn_clear_cache")
        ) {
          Icon(Icons.Default.CleaningServices, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Clear Cache", fontSize = 12.sp)
        }

        OutlinedButton(
          onClick = {
            onResetProject()
            onDismiss()
          },
          colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFDC2626)),
          border = BorderStroke(1.dp, Color(0xFFFCA5A5)),
          modifier = Modifier.weight(1f).testTag("btn_reset_project")
        ) {
          Icon(Icons.Default.DeleteSweep, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("New Project", fontSize = 12.sp)
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Save Button
      Button(
        onClick = {
          onSaveSettings(projectName, selectedResolution, selectedFps, photoDurationSec)
          onDismiss()
        },
        colors = ButtonDefaults.buttonColors(
          containerColor = OrangePrimary,
          contentColor = Color.White
        ),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("btn_save_project_settings")
      ) {
        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "Apply Settings",
          fontWeight = FontWeight.Bold,
          fontSize = 15.sp
        )
      }
    }
  }
}
