package com.example.ui.components

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.billing.LifetimePricing
import com.example.billing.ProAccess
import com.example.billing.ProBillingManager
import com.example.billing.findActivity

/**
 * One payment, forever, on this Google account. Not a subscription.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LifetimeUnlockSheet(onDismiss: () -> Unit) {
  val context = LocalContext.current
  val price by ProBillingManager.priceLabel.collectAsState()
  val status by ProBillingManager.status.collectAsState()
  val isPro by ProAccess.isPro.collectAsState()

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF141416),
    contentColor = Color(0xFFF4EFE8)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 22.dp, vertical = 8.dp)
        .navigationBarsPadding()
        .testTag("sheet_lifetime_unlock")
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.WorkspacePremium, contentDescription = null, tint = Color(0xFFFF4D6D))
          Spacer(modifier = Modifier.width(8.dp))
          Text("Lifetime unlock", fontSize = 20.sp, fontWeight = FontWeight.Black)
        }
        IconButton(onClick = onDismiss) {
          Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFFA39E96))
        }
      }
      Text(
        text = "Pay once. No monthly plan. Same Google account stays unlocked on every phone.",
        fontSize = 13.sp,
        color = Color(0xFFA39E96)
      )
      Spacer(modifier = Modifier.height(16.dp))
      BenefitRow("Watermark off on preview and exported video")
      BenefitRow("Banner and export ads removed")
      BenefitRow("Optional: your own channel name as a brand mark")
      Spacer(modifier = Modifier.height(16.dp))
      Surface(
        color = Color(0xFF1C1C21),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Text("ONE TIME", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFF4D6D))
          Text(price, fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.White)
          Text(
            text = "India is set to ${LifetimePricing.indiaLabel()}. Other countries use the local price of about US $${LifetimePricing.USD_ANCHOR}.",
            fontSize = 12.sp,
            color = Color(0xFFA39E96)
          )
        }
      }
      Spacer(modifier = Modifier.height(10.dp))
      Text(status, fontSize = 12.sp, color = Color(0xFFA39E96))
      Spacer(modifier = Modifier.height(14.dp))
      if (isPro) {
        Button(
          onClick = onDismiss,
          modifier = Modifier.fillMaxWidth().height(50.dp),
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF4D6D), contentColor = Color(0xFF14080C))
        ) {
          Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text("You're unlocked", fontWeight = FontWeight.Bold)
        }
      } else {
        Button(
          onClick = {
            val activity = context.findActivity()
            if (activity != null) ProBillingManager.launch(activity)
          },
          modifier = Modifier.fillMaxWidth().height(50.dp).testTag("btn_buy_lifetime"),
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF4D6D), contentColor = Color(0xFF14080C))
        ) {
          Text("Unlock forever", fontWeight = FontWeight.Black)
        }
        TextButton(
          onClick = { ProBillingManager.restore() },
          modifier = Modifier.fillMaxWidth().testTag("btn_restore_lifetime")
        ) {
          Text("Restore purchase", color = Color(0xFFF4EFE8))
        }
      }
      Spacer(modifier = Modifier.height(8.dp))
    }
  }
}

@Composable
private fun BenefitRow(label: String) {
  Row(
    modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFFFF4D6D), modifier = Modifier.size(16.dp))
    Spacer(modifier = Modifier.width(10.dp))
    Text(label, fontSize = 14.sp, color = Color(0xFFF4EFE8))
  }
}
