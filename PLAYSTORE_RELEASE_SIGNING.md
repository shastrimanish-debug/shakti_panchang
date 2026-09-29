# Google Play Store Signing & Anti-Tamper (MOD Prevention) Guide

## Why did the "Modified APK" (Tampered/Re-signed) error occur on Google Play Store?
When you upload an App Bundle (.aab) to Google Play Console, Google Play uses **Play App Signing**. 
1. You sign your app with your local upload keystore (`shakti-panchang-release.jks`).
2. Google Play strips your upload signature and re-signs the APK with **Google's official Play App Signing certificate** before distributing it to users.
3. If your code or native Android `MainActivity.java` checks the APK signature hash against your local upload keystore hash, **it will mismatch** because Google Play's signing certificate is different! This caused legitimate users downloading from the Play Store to see the "Modified APK" security block error.

## The Fix
1. **Play App Signing Compatibility**: The security guard (`src/utils/securityGuard.ts`) has been updated to support Google Play App Signing and official store installations without false-positive blocks.
2. **Native Android MainActivity / Security Guard**: If you implemented signature verification in your native Android wrapper (`MainActivity.java`), make sure to allow packages signed by Google Play (`com.android.vending` installer) or verify against Google Play's signing public key instead of the upload keystore.
3. **GitHub Sync**: All updates are synchronized with the GitHub repository (`shastrimanish-debug/shakti_panchang`).
