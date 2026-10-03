package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.util.AppSecurityIntegrityGuard
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Anti-Modding & App Integrity Security Dashboard Sheet
 * Provides real-time visibility into all 7 anti-modding / anti-tamper shields.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppSecurityDashboardSheet(
  onDismiss: () -> Unit
) {
  val context = LocalContext.current
  val scope = rememberCoroutineScope()
  var isScanning by remember { mutableStateOf(false) }
  var scanResult by remember { mutableStateOf<AppSecurityIntegrityGuard.SecurityScanResult?>(null) }

  // Initial scan on launch
  LaunchedEffect(Unit) {
    isScanning = true
    delay(400) // Brief animation
    scanResult = AppSecurityIntegrityGuard.performFullSecurityAudit(context)
    isScanning = false
  }

  val infiniteTransition = rememberInfiniteTransition(label = "pulse")
  val pulseScale by infiniteTransition.animateFloat(
    initialValue = 0.95f,
    targetValue = 1.05f,
    animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse),
    label = "pulseScale"
  )

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color.White,
    contentColor = Color(0xFF0F172A)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 8.dp)
        .navigationBarsPadding()
    ) {
      // Header
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
                imageVector = Icons.Default.Shield,
                contentDescription = null,
                tint = Color(0xFF10B981),
                modifier = Modifier.size(20.dp)
              )
            }
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Anti-Modding Security Guard",
              fontSize = 17.sp,
              fontWeight = FontWeight.Bold,
              color = Color(0xFF0F172A)
            )
            Text(
              text = "Tamper, Hook, Frida & Mod Protection",
              fontSize = 11.sp,
              color = Color(0xFF64748B)
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF64748B))
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Status Banner Card
      val isAllSafe = scanResult?.isSecure ?: true
      val bannerGradient = if (isAllSafe) {
        Brush.linearGradient(listOf(Color(0xFF065F46), Color(0xFF047857)))
      } else {
        Brush.linearGradient(listOf(Color(0xFF991B1B), Color(0xFFB91C1C)))
      }

      Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        modifier = Modifier
          .fillMaxWidth()
          .background(bannerGradient, RoundedCornerShape(16.dp))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Box(
            modifier = Modifier
              .size(54.dp)
              .scale(if (isScanning) pulseScale else 1f)
              .background(Color.White.copy(alpha = 0.2f), CircleShape)
              .border(2.dp, Color.White.copy(alpha = 0.6f), CircleShape),
            contentAlignment = Alignment.Center
          ) {
            if (isScanning) {
              CircularProgressIndicator(
                modifier = Modifier.size(28.dp),
                color = Color.White,
                strokeWidth = 3.dp
              )
            } else {
              Icon(
                imageVector = if (isAllSafe) Icons.Default.Lock else Icons.Default.Warning,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(30.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(10.dp))

          Text(
            text = if (isScanning) "Auditing Integrity Shields..." else if (isAllSafe) "App Is 100% Protected Against Modding" else "Tamper Warning: Modification Detected",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )

          Text(
            text = if (isAllSafe) "All 7 Anti-Tamper & Anti-MOD layers active and verified" else "One or more security checks flagged anomalous environment",
            fontSize = 11.sp,
            color = Color.White.copy(alpha = 0.85f)
          )

          Spacer(modifier = Modifier.height(12.dp))

          // Security Score Progress
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("Integrity Score", fontSize = 11.sp, color = Color.White.copy(alpha = 0.9f))
            Text(
              "${scanResult?.securityScore ?: 100}% Secure",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          }
          Spacer(modifier = Modifier.height(4.dp))
          LinearProgressIndicator(
            progress = { ((scanResult?.securityScore ?: 100) / 100f) },
            modifier = Modifier
              .fillMaxWidth()
              .height(6.dp),
            color = if (isAllSafe) Color(0xFF34D399) else Color(0xFFF87171),
            trackColor = Color.White.copy(alpha = 0.25f)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Section Title: 7-Layer Defense
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Active Protection Shields (7 Layers)",
          fontSize = 13.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1E293B)
        )
        OutlinedButton(
          onClick = {
            scope.launch {
              isScanning = true
              delay(500)
              scanResult = AppSecurityIntegrityGuard.performFullSecurityAudit(context)
              isScanning = false
            }
          },
          border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
          shape = RoundedCornerShape(8.dp),
          contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 8.dp, vertical = 2.dp),
          modifier = Modifier.height(28.dp).testTag("btn_rescan_security")
        ) {
          Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color(0xFF64748B))
          Spacer(modifier = Modifier.width(4.dp))
          Text("Scan Now", fontSize = 10.sp, color = Color(0xFF475569))
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // List of 7 Security Checks
      scanResult?.scanDetails?.forEach { check ->
        Card(
          shape = RoundedCornerShape(10.dp),
          colors = CardDefaults.cardColors(
            containerColor = if (check.status) Color(0xFFF8FAFC) else Color(0xFFFEF2F2)
          ),
          border = BorderStroke(
            1.dp,
            if (check.status) Color(0xFFE2E8F0) else Color(0xFFFECACA)
          ),
          modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = if (check.status) Icons.Default.CheckCircle else Icons.Default.Warning,
              contentDescription = null,
              tint = if (check.status) Color(0xFF10B981) else Color(0xFFEF4444),
              modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = check.title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = if (check.status) Color(0xFF0F172A) else Color(0xFF991B1B)
              )
              Text(
                text = check.description,
                fontSize = 10.sp,
                color = if (check.status) Color(0xFF64748B) else Color(0xFFB91C1C)
              )
            }
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = if (check.status) Color(0xFFECFDF5) else Color(0xFFFEE2E2),
              modifier = Modifier.padding(start = 6.dp)
            ) {
              Text(
                text = if (check.status) "ACTIVE" else "ALERT",
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = if (check.status) Color(0xFF059669) else Color(0xFFDC2626),
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Anti-Modding Guarantees Info Box
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFFF0FDF4),
        border = BorderStroke(1.dp, Color(0xFF86EFAC)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Security, contentDescription = null, tint = Color(0xFF15803D), modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Anti-MOD Hardening Highlights", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF166534))
          }
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            text = "• Modders cannot re-sign with Lucky Patcher or MT Manager due to SHA-256 cert hash enforcement.\n" +
              "• Dynamic hooking via Frida or Xposed is blocked by /proc/self/maps scanning & port locks.\n" +
              "• Running inside Parallel Space / Dual Apps virtual spaces is quarantined.\n" +
              "• Pro & VFX feature keys are cryptographically signed with HMAC-SHA256 tokens that cannot be bypassed via smali bytecode edits.",
            fontSize = 10.sp,
            color = Color(0xFF15803D),
            lineHeight = 15.sp
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      Button(
        onClick = onDismiss,
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F172A)),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier
          .fillMaxWidth()
          .height(44.dp)
          .testTag("btn_close_security_sheet")
      ) {
        Text("Done & Keep Protected", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
      }

      Spacer(modifier = Modifier.height(12.dp))
    }
  }
}
