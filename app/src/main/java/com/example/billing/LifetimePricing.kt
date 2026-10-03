package com.example.billing

/**
 * One-time lifetime unlock. This is NOT a subscription.
 *
 * Play Console product id must be exactly [PRODUCT_ID], type In-app product.
 * Set the US price to $0.99 (Play's $1 tier; use $1.00 if a custom price exists).
 * Override India to ₹99 — do not leave Google's auto-convert (~₹95 at the
 * 3 Oct 2026 rate of 1 USD = 96.13 INR). Other countries follow the $1 template.
 *
 * The sheet shows ProductDetails.formattedPrice from Play when the product is live.
 * [fallbackLabel] is only used before billing returns a price.
 */
object LifetimePricing {
  const val PRODUCT_ID = "lifetime_no_ads_no_watermark"
  const val INDIA_PRICE_INR = 99
  const val USD_ANCHOR = "0.99"
  const val FX_DATE = "2026-10-03"
  const val USD_PER_INR = 96.13

  fun indiaLabel(): String = "₹$INDIA_PRICE_INR"

  fun fallbackLabel(): String = "${indiaLabel()} · about $$USD_ANCHOR worldwide"

  /** ₹99 is slightly above $1 at the FX date above (~$1.03). */
  fun indiaVersusOneDollar(): Double = INDIA_PRICE_INR / USD_PER_INR
}
