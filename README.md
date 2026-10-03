# VFX Pro - Next-Gen Android Video & VFX Editor

**VFX Pro** is a modern, high-performance mobile video editor and visual effects studio built natively with **Kotlin**, **Jetpack Compose**, and **Material Design 3**.

---

## Features

- **Multi-Track Timeline Editor**:
  - Interactive multi-track timeline preview with responsive scrubbing and smooth playhead tracking.
  - Granular zoom controls (`50%` to `200%`) with dynamic timecode ticks (`00:00:00`).
  - Track management: Video 1, Video 2 (Overlay), and Audio master tracks with mute and solo toggles.
- **Clip Context Actions & Transitions**:
  - Direct clip selection with floating context menu: **Split**, **Duplicate**, and **Delete**.
  - Interactive **Transition Drop Zones** between adjacent clips.
  - **Transition Picker Sheet**: Selection for Cross Dissolve, Dip to Black, Glitch Flash, Zoom Blur, and Wipe Right.
- **Properties Inspector & Keyframing**:
  - Transform sliders: **Scale** (0.5x - 3.0x), **Rotation** (-180° to +180°), **Opacity** (0% - 100%), and **Position X/Y**.
  - **Keyframing Engine**: Add, remove, and interpolate keyframes at the active playhead with visual keyframe indicators.
- **Color Grading**:
  - Professional color correction sheet featuring **Brightness**, **Contrast**, **Saturation**, and dynamic **Temperature** (cool/warm balance).
  - One-tap **Reset All** controls.
- **VFX & Visual Effects Library**:
  - Realtime GPU shader & filter browser with live category filtering (**Trending**, **Glitch**, **Blur**, **Stylized**, **Light Leaks**).
  - Mock effects including *RGB Split*, *Motion Blur*, *Film Grain*, *Prism Flare*, *Neon Glow*, and *VHS Glitch*.
  - Searchable effects catalog.
- **Asset / Media Picker**:
  - Multi-category asset picker for **Videos**, **Photos**, and **Audio**.
  - High-contrast duration overlays and resolution tags with multi-selection import.
- **Projects Dashboard (Home Tab)**:
  - Project management interface with a prominent **"Create New Project"** action card.
  - Recent project browser with aspect-ratio thumbnails and last-edited timestamps.

---

## Play Store: free with ads, lifetime unlock

The app stays free. Ads (home banner + an ad before export) and a burned-in **VFX Pro** watermark stay on until a **one-time** purchase. This is not a subscription.

1. Play Console → Monetize → Products → **In-app products** → Create.
2. Product ID: `lifetime_no_ads_no_watermark`
3. US price: **$0.99** (the $1 tier; use $1.00 if a custom price is available).
4. Override **India to ₹99**. Do not leave auto-convert (~₹95 at the 3 Oct 2026 rate of 1 USD = ₹96.13).
5. Other countries: apply Play’s local prices from the US tier (about $1).
6. Replace the test AdMob app id in `strings.xml` (`admob_app_id`) and the unit ids in `AdUnits` before release.

The purchase is tied to the Google account. **Restore purchase** brings it back on a new phone. Lifetime owners get no ads, can turn the watermark off, set their own channel name, or place a logo image. Export uses the chosen size, including 4K and 9:16 or 1:1 canvas, and the chosen frame rate, including 60fps. Filters, reverse, freeze-frame, crossfade, dip-to-black, stickers, and text are burned into the file. Video audio and music are mixed with volume and a short fade. Auto captions listen to the clip with an on-device Hindi, English, or Spanish speech model (downloaded once).

---

## Tech Stack & Architecture

- **Language**: [Kotlin 2.0+](https://kotlinlang.org/)
- **UI Framework**: [Jetpack Compose](https://developer.android.com/jetpack/compose) (Material 3)
- **Architecture**: Modern Android Architecture with Component Separation
- **Build System**: Gradle (Kotlin DSL - `build.gradle.kts`) with Version Catalog (`gradle/libs.versions.toml`)
- **Testing**: Robolectric & JUnit local JVM test suite

---

## Getting Started

### Prerequisites

- **Android Studio Ladybug | 2024.2.1** or newer
- **JDK 17** or **JDK 21**
- **Android SDK**: `compileSdk 35`, `minSdk 24`

### Clone & Build

```bash
# Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <repository-directory>

# Build Debug APK
gradle assembleDebug

# Run Unit Tests
gradle :app:testDebugUnitTest
```

---

## Pushing to GitHub & Automated Releases

### 1. Initial Push:
```bash
git init
git add .
git commit -m "feat: InShot/CapCut multi-track layers, VFX shaders & automated release"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### 2. Automated APK Release on GitHub:
Whenever you push to `main` or create a version tag:
```bash
# To create an official versioned release:
git tag v1.0.0
git push origin v1.0.0
```
- GitHub Actions will automatically run the CI/CD pipeline, build `VFXPro-v1.0-debug.apk`, and attach it directly under your GitHub repository's **Releases** tab (`https://github.com/<user>/<repo>/releases`).
- You can also go to **Actions** -> **Android CI/CD & GitHub Release** -> **Run workflow** anytime to generate a release APK manually on demand!

---

## License

This project is open source and available under the [Apache 2.0 License](LICENSE).
