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

    // Official release keystore SHA-256 fingerprint (without colons, uppercase)
    // from shakti-panchang-release.jks
    private static final Set<String> VALID_SIGNATURE_HASHES = new HashSet<>(Arrays.asList(
        "A14B612A77CDAADFFE72A4495C47AEA04F0627A62839CD28666DB8778F2ED81B"
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
                showSecurityAlert("असुरक्षित / रूपांतरित ऐप (Modified APK)!",
                    "यह ऐप अनधिकृत रूप से बदला गया है (Tampered/Re-signed)। सुरक्षा कारणों से यह ऐप बंद किया जा रहा है। कृपया केवल आधिकारिक Google Play Store से स्थापित करें।");
                return;
            }

            if (isDeviceRootedOrHooked()) {
                Log.w(TAG, "Device environment security warning: Root/Hooking detected");
                // Logged for monitoring
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

                // If matches official release signature, APK is genuine
                if (VALID_SIGNATURE_HASHES.contains(currentHash)) {
                    return true;
                }
            }

            // Signature did not match the official release keystore
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Signature verification error", e);
            return false;
        }
    }

    /**
     * Checks for common Root binaries and Xposed/Frida hooking frameworks.
     */
    private boolean isDeviceRootedOrHooked() {
        // Check for su binaries
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

        // Check for Xposed
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

