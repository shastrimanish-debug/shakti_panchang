package com.example

import com.example.billing.LifetimePricing
import org.junit.Assert.*
import org.junit.Test

class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun lifetimePrice_isOneTimeAboutOneDollar() {
    assertEquals("lifetime_no_ads_no_watermark", LifetimePricing.PRODUCT_ID)
    assertEquals(99, LifetimePricing.INDIA_PRICE_INR)
    assertEquals(true, LifetimePricing.indiaVersusOneDollar() in 0.9..1.2)
    assertEquals("₹99", LifetimePricing.indiaLabel())
  }
}
