package com.example

import android.app.Application
import com.example.ads.ExportAdGate
import com.example.billing.ProAccess
import com.example.billing.ProBillingManager
import com.google.android.gms.ads.MobileAds

class VfxProApp : Application() {
  override fun onCreate() {
    super.onCreate()
    instance = this
    ProAccess.attach(this)
    ProBillingManager.start(this)
    MobileAds.initialize(this) {}
    ExportAdGate.preload(this)
  }

  companion object {
    lateinit var instance: VfxProApp
      private set
  }
}
