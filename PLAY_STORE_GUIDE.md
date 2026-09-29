# Shakti Panchang & Vidvan Jyotish Uma - Google Play Store Publishing Guide

This guide provides complete instructions and configuration for packaging **Shakti Panchang & Vidvan Jyotish Uma** into an Android App Bundle (.aab) / APK for the **Google Play Store**.

---

### Method 1: Using Capacitor (Recommended for Native Android APK / Play Store)

Capacitor wraps your web app into a native Android container (`WebView`), giving you full access to native features, push notifications, and Play Store publishing.

#### Step 1: Initialize Capacitor in your local environment
Run the following commands in your local terminal after cloning your repository (`shastrimanish-debug/shakti_panchang`):

```bash
# 1. Install dependencies
npm install

# 2. Install Capacitor CLI and core packages
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Initialize Capacitor
npx cap init "Shakti Panchang" "com.shakti.panchang" --web-dir dist

# 4. Add Android platform
npx cap add android

# 5. Build the web app
npm run build

# 6. Copy web assets to Android project
npx cap copy android
```

#### Step 2: Open in Android Studio & Generate Signed APK / AAB
```bash
npx cap open android
```
Once Android Studio opens:
1. Go to **Build > Generate Signed Bundle / APK...**
2. Select **Android App Bundle (AAB)** (recommended by Google Play) or **APK**.
3. Create or select your **Key Store** (Keystore path, password, key alias, key password).
4. Select **release** build variant and click **Finish**.
5. Your signed `.aab` file will be generated in `android/app/release/app-release.aab`.
6. Upload this `.aab` file to the **Google Play Console**!

---

### Method 2: Trusted Web Activity (TWA) / Bubblewrap (PWA to Play Store)
Google also supports PWA apps directly via TWA. 
1. Install Bubblewrap CLI: `npm install -g @bubblewrap/cli`
2. Initialize manifest: `bubblewrap init --manifest=https://your-app-url/manifest.json`
3. Build the APK/AAB: `bubblewrap build`

---

### App Metadata for Play Store:
- **App Name**: Shakti Panchang & Vidvan Jyotish Uma
- **Package Name**: `com.shakti.panchang`
- **Short Description**: Vedic Panchang, Kundali, Horoscope, Muhurat & AI Astrologer Uma.
- **Full Description**: शक्ति पंचांग और उमा विद्वान ज्योतिष ऐप में आपका स्वागत है। यहाँ आपको दैनिक पंचांग, लग्न कुंडली, राशिफल, शुभ मुहूर्त, व्रत-त्योहार और AI ज्योतिषी उमा जी से ज्योतिषीय परामर्श की सुविधा मिलती है।
- **Category**: Lifestyle / Astrology / Books & Reference
