package com.shaktipanchang.app;

import android.content.pm.ApplicationInfo;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean isDebuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;

        // Disable WebView remote debugging in production release builds
        if (!isDebuggable) {
            WebView.setWebContentsDebuggingEnabled(false);
        }
        
        // Security checks aur popup yahan se hata diye gaye hain! 😎
    }
}
