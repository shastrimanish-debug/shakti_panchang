package com.shaktipanchang.app;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SecurityCheck";

    // Google Play App Signing Key SHA-256 fingerprint (without colons, uppercase)
    private static final Set<String> VALID_SIGNATURE_HASHES = new HashSet<>(Arrays.asList(
        "B8C08BA2EBBE1B3F7C6D2B8D6492C2370807AE421AD0BD3A45B6DCB70EDA437C"
    ));

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        boolean isDebuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;

        // 1. Disable WebView remote debugging in production release builds
        if (!isDebuggable) {
            WebView.setWebContentsDebuggingEnabled(false);
        }

        // 2. Perform Anti-Tamper & Security Verification
        if (!isDebuggable) {
            if (!verifyAppSignature()) {
                String detectedHash = getComputedSignatureHash();
                showSecurityAlert("असुरक्षित / रूपांतरित ऐप (Modified APK)!",
                    "Detected Hash: " + detectedHash + "\n\nकृपया केवल आधिकारिक Google Play Store से स्थापित करें।");
                return;
            }
            if (isDeviceRootedOrHooked()) {
                Log.w(TAG, "Device environment security warning: Root/Hooking detected");
            }
        }
    }

    /**
     * Verifies that the APK has NOT been modified and re-signed with a third-party key.
     */
    private boolean verifyAppSignature() {
        try {
            Context ctx = getApplicationContext();
            PackageManager pm = ctx.getPackageManager();
            String packageName = ctx.getPackageName();
            Signature[] signatures;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                PackageInfo packageInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES);
                SigningInfo signingInfo = packageInfo.signingInfo;
                if (signingInfo == null) return false;
                if (signingInfo.hasMultipleSigners()) {
                    signatures = signingInfo.getApkContentsSigners();
                } else {
                    signatures = signingInfo.getSigningCertificateHistory();
                }
            } else {
                @SuppressWarnings("deprecation")
                PackageInfo packageInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES);
                signatures = packageInfo.signatures;
            }

            if (signatures == null || signatures.length == 0) {
                return false;
            }

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            for (Signature sig : signatures) {
                byte[] digest = md.digest(sig.toByteArray());
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02X", b));
                }
                String currentHash = sb.toString().toUpperCase();

                // If matches official Google Play App Signing signature, APK is genuine
                if (VALID_SIGNATURE_HASHES.contains(currentHash)) {
                    return true;
                }
            }

            // Signature did not match the official Play Signing key
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Signature verification error", e);
            return false;
        }
    }

    /**
     * Retrieves the exact runtime computed signature hash for debugging mismatch.
     */
    private String getComputedSignatureHash() {
        try {
            Context ctx = getApplicationContext();
            PackageManager pm = ctx.getPackageManager();
            String packageName = ctx.getPackageName();
            Signature[] signatures;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                PackageInfo packageInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES);
                SigningInfo signingInfo = packageInfo.signingInfo;
                if (signingInfo == null) return "NO_SIGNING_INFO";
                if (signingInfo.hasMultipleSigners()) {
                    signatures = signingInfo.getApkContentsSigners();
                } else {
                    signatures = signingInfo.getSigningCertificateHistory();
                }
            } else {
                @SuppressWarnings("deprecation")
                PackageInfo packageInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES);
                signatures = packageInfo.signatures;
            }

            if (signatures == null || signatures.length == 0) {
                return "NO_SIGNATURES_FOUND";
            }

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            StringBuilder allHashes = new StringBuilder();
            for (Signature sig : signatures) {
                byte[] digest = md.digest(sig.toByteArray());
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02X", b));
                }
                if (allHashes.length() > 0) allHashes.append(", ");
                allHashes.append(sb.toString().toUpperCase());
            }
            return allHashes.toString();
        } catch (Exception e) {
            return "ERROR: " + e.getMessage();
        }
    }

    /**
     * Checks for common Root binaries and Xposed/Frida hooking frameworks.
     */
    private boolean isDeviceRootedOrHooked() {
        String[] suPaths = {
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/su/bin/su"
        };
        for (String path : suPaths) {
            if (new File(path).exists()) {
                return true;
            }
        }
        try {
            Class.forName("de.robv.android.xposed.XposedBridge");
            return true;
        } catch (ClassNotFoundException ignored) {}
        return false;
    }

    private void showSecurityAlert(String title, String message) {
        new AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setCancelable(false)
            .setPositiveButton("ठीक है (Exit)", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    finishAffinity();
                    System.exit(0);
                }
            })
            .show();
    }
}
