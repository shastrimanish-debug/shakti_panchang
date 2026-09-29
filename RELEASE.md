# Shakti Panchang - Release & APK/AAB Build Guide

## Why GitHub Actions didn't build an APK automatically:
The GitHub repository contains the React PWA web application and backend server (`src`, `server.ts`, `vite.config.ts`). Android APK/AAB compilation requires the native Android project wrapper (`android/` folder) and Android SDK / Gradle.

## How to Build Release APK / App Bundle (AAB) Locally for Google Play Store:

1. **Build the Web Assets**:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor (Android)**:
   ```bash
   npx cap sync android
   ```

3. **Open Android Studio or Build via Terminal**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

4. **Locate your Play Store App Bundle (AAB)**:
   Your signed/release App Bundle will be generated at:
   `android/app/build/outputs/bundle/release/app-release.aab`

5. **Upload to Google Play Console**:
   Upload `app-release.aab` to the Google Play Console production track. Because Play App Signing is enabled, Google Play will automatically re-sign it with Google's release key.
