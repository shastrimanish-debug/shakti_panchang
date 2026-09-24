# ProGuard and R8 rules for Shakti Panchang

# Preserve JavaScript Interface for Capacitor WebView Bridge
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve Capacitor Core and Plugins
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Preserve Application package classes & BridgeActivity
-keep class com.shaktipanchang.app.** { *; }
-keepclassmembers class com.shaktipanchang.app.** { *; }

# Preserve annotations and enums
-keepattributes *Annotation*
-keepclassmembers enum * { *; }

# Prevent obfuscation of native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Preserve View constructors for XML inflation
-keepclassmembers class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Hide line numbers and source file names to prevent reverse engineering
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable

