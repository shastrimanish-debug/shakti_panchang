package com.example.ads

import android.app.Activity
import android.content.Context
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.billing.ProAccess
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

/**
 * Test AdMob ids. Replace with the real app id (manifest) and these unit ids
 * before publishing. Lifetime owners never load or see ads.
 */
object AdUnits {
  const val BANNER = "ca-app-pub-3940256099942544/6300978111"
  const val INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712"
}

object ExportAdGate {
  private var interstitial: InterstitialAd? = null
  private var loading = false

  fun preload(context: Context) {
    if (ProAccess.isPro.value || interstitial != null || loading) return
    loading = true
    InterstitialAd.load(
      context.applicationContext,
      AdUnits.INTERSTITIAL,
      AdRequest.Builder().build(),
      object : InterstitialAdLoadCallback() {
        override fun onAdLoaded(ad: InterstitialAd) {
          interstitial = ad
          loading = false
        }

        override fun onAdFailedToLoad(error: LoadAdError) {
          interstitial = null
          loading = false
        }
      }
    )
  }

  fun showThen(activity: Activity, onContinue: () -> Unit) {
    if (ProAccess.isPro.value) {
      onContinue()
      return
    }
    val ad = interstitial
    if (ad == null) {
      preload(activity)
      onContinue()
      return
    }
    ad.fullScreenContentCallback = object : FullScreenContentCallback() {
      override fun onAdDismissedFullScreenContent() {
        interstitial = null
        preload(activity)
        onContinue()
      }

      override fun onAdFailedToShowFullScreenContent(error: com.google.android.gms.ads.AdError) {
        interstitial = null
        preload(activity)
        onContinue()
      }
    }
    ad.show(activity)
  }
}

@Composable
fun StudioBannerAd(modifier: Modifier = Modifier) {
  val isPro by ProAccess.isPro.collectAsState()
  if (isPro) return
  AndroidView(
    modifier = modifier.fillMaxWidth().height(56.dp),
    factory = { ctx ->
      AdView(ctx).apply {
        setAdSize(AdSize.BANNER)
        adUnitId = AdUnits.BANNER
        loadAd(AdRequest.Builder().build())
      }
    }
  )
}
