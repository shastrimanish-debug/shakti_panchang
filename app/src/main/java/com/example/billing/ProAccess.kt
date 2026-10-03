package com.example.billing

import android.app.Application
import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Lifetime entitlement. Google Play is the source of truth once billing connects.
 * A local cache keeps the unlock working offline after a real purchase.
 */
object ProAccess {
  private const val PREFS = "vfx_pro_lifetime"
  private const val KEY_OWNED = "owned"

  private val _isPro = MutableStateFlow(false)
  val isPro: StateFlow<Boolean> = _isPro.asStateFlow()

  private var app: Application? = null

  fun attach(application: Application) {
    app = application
    _isPro.value = application.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .getBoolean(KEY_OWNED, false)
  }

  fun setFromPlay(owned: Boolean) {
    _isPro.value = owned
    app?.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      ?.edit()
      ?.putBoolean(KEY_OWNED, owned)
      ?.apply()
  }

  /** Unit tests only. Does not write the Play cache. */
  internal fun debugOverride(pro: Boolean) {
    _isPro.value = pro
  }
}
