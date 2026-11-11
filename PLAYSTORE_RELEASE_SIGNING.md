# श्री शक्ति पंचांग (Shakti Panchang) - Play Store Production Signing & Release Guide

## 1. Keystore Details (की-स्टोर विवरण)

| विवरण | मान (Value) |
|---|---|
| **Keystore File** | `android/app/shakti-panchang-release.jks` |
| **Key Alias** | `shaktipanchang` |
| **Keystore Password** | `shaktipanchang123` |
| **Key Password** | `shaktipanchang123` |
| **Package Name / Application ID** | `com.shaktipanchang.app` |
| **SHA-256 Fingerprint** | `A1:4B:61:2A:77:CD:AA:DF:FE:72:A4:49:5C:47:AE:A0:4F:06:27:A6:28:39:CD:28:66:6D:B8:77:8F:2E:D8:1B` |
| **SHA-1 Fingerprint** | `86:80:CD:DF:22:C9:F4:D5:39:59:D5:BC:DD:0B:7A:FE:7D:8D:7C:62` |

---

## 2. Google Play Console Release Build Command (रिलीज़ बंडल तैयार करने का तरीका)

अपने सिस्टम पर Android Studio अथवा Terminal में निम्न आदेश चलाएँ:

```bash
# 1. वेब प्रोजेक्ट को कंपाइल व सिंक करें:
npm run build
npx cap sync android

# 2. साइन्ड प्रोडक्शन रिलीज़ AAB (Android App Bundle) बनाएँ:
cd android
./gradlew bundleRelease

# 3. अथवा सीधे साइन्ड APK तैयार करें:
./gradlew assembleRelease
```

### आउटपुट फ़ाइल स्थान:
- **Play Store AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Play Store APK:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 3. Play Store Play App Signing
`android/app/build.gradle` में `signingConfigs.release` पहले से जोड़ दिया गया है। जब आप `./gradlew bundleRelease` चलाएंगे, तो Google Play Store पर सीधे अपलोड करने योग्य हस्ताक्षरित (Signed) AAB तैयार होगा।
