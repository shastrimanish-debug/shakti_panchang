package com.shaktipanchang.app;

import android.Manifest;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        boolean wipeWebCache = clearStaleWebCacheOnce();
        registerPlugin(UmaVoicePlugin.class);
        registerPlugin(UmaDevicePlugin.class);
        registerPlugin(PlayLicensePlugin.class);
        super.onCreate(savedInstanceState);
        if (wipeWebCache) {
            try {
                WebView webView = getBridge().getWebView();
                if (webView != null) webView.clearCache(true);
            } catch (Throwable ignored) {
                // Cache clearing must not stop the first screen.
            }
        }

        boolean isDebuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        if (!isDebuggable) {
            WebView.setWebContentsDebuggingEnabled(false);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ArrayList<String> needed = new ArrayList<>();
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.ACCESS_FINE_LOCATION);
                needed.add(Manifest.permission.ACCESS_COARSE_LOCATION);
            }
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.RECORD_AUDIO);
            }
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.POST_NOTIFICATIONS);
            }
            if (!needed.isEmpty()) {
                requestPermissions(needed.toArray(new String[0]), 4101);
            }
        }
    }

    /** Drops only the web cache and service worker. Saved kundali stays. */
    private boolean clearStaleWebCacheOnce() {
        android.content.SharedPreferences prefs = getSharedPreferences("shakti_boot", MODE_PRIVATE);
        if (prefs.getInt("web_cache_gen", 0) >= 12) return false;
        File data = new File(getApplicationInfo().dataDir);
        deleteDir(new File(data, "app_webview/Service Worker"));
        deleteDir(new File(data, "app_webview/Cache"));
        deleteDir(new File(data, "app_webview/Code Cache"));
        deleteDir(new File(data, "app_webview/GPUCache"));
        deleteDir(new File(getCacheDir(), "WebView"));
        prefs.edit().putInt("web_cache_gen", 12).apply();
        return true;
    }

    private void deleteDir(File dir) {
        if (dir == null || !dir.exists()) return;
        File[] children = dir.listFiles();
        if (children != null) {
            for (File child : children) deleteDir(child);
        }
        dir.delete();
    }
}
