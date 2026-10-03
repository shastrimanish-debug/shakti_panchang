package com.example.billing

import android.app.Activity
import android.app.Application
import android.content.Context
import android.content.ContextWrapper
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Google Play Billing for a single non-consumable lifetime product.
 * Buying once on a Google account unlocks ad-free + watermark-free on every
 * device signed into that account (Restore purchases).
 */
object ProBillingManager {
  private var billingClient: BillingClient? = null
  private var productDetails: ProductDetails? = null
  private var app: Application? = null

  private val _priceLabel = MutableStateFlow(LifetimePricing.fallbackLabel())
  val priceLabel: StateFlow<String> = _priceLabel.asStateFlow()

  private val _status = MutableStateFlow("Play price loads when the product is live.")
  val status: StateFlow<String> = _status.asStateFlow()

  fun start(application: Application) {
    if (billingClient != null) return
    app = application
    val client = BillingClient.newBuilder(application)
      .setListener { result, purchases ->
        if (result.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
          handlePurchases(purchases)
        } else if (result.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
          _status.value = "Purchase cancelled."
        }
      }
      .enablePendingPurchases(
        PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
      )
      .build()
    billingClient = client
    client.startConnection(object : BillingClientStateListener {
      override fun onBillingSetupFinished(result: BillingResult) {
        if (result.responseCode == BillingClient.BillingResponseCode.OK) {
          queryProduct()
          restore()
        } else {
          _status.value = "Billing unavailable on this device."
        }
      }

      override fun onBillingServiceDisconnected() {
        _status.value = "Billing disconnected. Tap restore to retry."
      }
    })
  }

  fun restore() {
    val client = billingClient ?: return
    if (!client.isReady) return
    val params = QueryPurchasesParams.newBuilder()
      .setProductType(BillingClient.ProductType.INAPP)
      .build()
    client.queryPurchasesAsync(params) { result, purchases ->
      if (result.responseCode != BillingClient.BillingResponseCode.OK) return@queryPurchasesAsync
      val owned = purchases.any { isLifetime(it) && it.purchaseState == Purchase.PurchaseState.PURCHASED }
      ProAccess.setFromPlay(owned)
      purchases.filter { isLifetime(it) && it.purchaseState == Purchase.PurchaseState.PURCHASED && !it.isAcknowledged }
        .forEach { acknowledge(it) }
      _status.value = if (owned) "Lifetime unlock restored." else "No lifetime purchase on this Google account."
    }
  }

  fun launch(activity: Activity) {
    val client = billingClient
    val details = productDetails
    if (client == null || !client.isReady || details == null) {
      _status.value = "Create in-app product ${LifetimePricing.PRODUCT_ID} in Play Console (one-time, India ₹99)."
      return
    }
    val flow = BillingFlowParams.newBuilder()
      .setProductDetailsParamsList(
        listOf(
          BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(details)
            .build()
        )
      )
      .build()
    val result = client.launchBillingFlow(activity, flow)
    if (result.responseCode != BillingClient.BillingResponseCode.OK) {
      _status.value = "Could not open Play purchase (${result.debugMessage})."
    }
  }

  private fun queryProduct() {
    val client = billingClient ?: return
    val params = QueryProductDetailsParams.newBuilder()
      .setProductList(
        listOf(
          QueryProductDetailsParams.Product.newBuilder()
            .setProductId(LifetimePricing.PRODUCT_ID)
            .setProductType(BillingClient.ProductType.INAPP)
            .build()
        )
      )
      .build()
    client.queryProductDetailsAsync(params) { result, list ->
      if (result.responseCode != BillingClient.BillingResponseCode.OK) return@queryProductDetailsAsync
      val details = list.firstOrNull() ?: return@queryProductDetailsAsync
      productDetails = details
      details.oneTimePurchaseOfferDetails?.formattedPrice?.let { _priceLabel.value = it }
      _status.value = "One-time purchase. No renewal."
    }
  }

  private fun handlePurchases(purchases: List<Purchase>) {
    var owned = ProAccess.isPro.value
    for (purchase in purchases) {
      if (!isLifetime(purchase)) continue
      if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
        owned = true
        if (!purchase.isAcknowledged) acknowledge(purchase)
      }
    }
    if (owned) {
      ProAccess.setFromPlay(true)
      _status.value = "Unlocked. Ads and the VFX Pro watermark are off."
    }
  }

  private fun acknowledge(purchase: Purchase) {
    val client = billingClient ?: return
    val params = AcknowledgePurchaseParams.newBuilder()
      .setPurchaseToken(purchase.purchaseToken)
      .build()
    client.acknowledgePurchase(params) { }
  }

  private fun isLifetime(purchase: Purchase): Boolean {
    return purchase.products.contains(LifetimePricing.PRODUCT_ID)
  }
}

fun Context.findActivity(): Activity? {
  var current: Context = this
  while (current is ContextWrapper) {
    if (current is Activity) return current
    current = current.baseContext
  }
  return null
}
