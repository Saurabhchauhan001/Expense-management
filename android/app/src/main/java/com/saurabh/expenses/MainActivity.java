package com.saurabh.expenses;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install Android 12+ Splash Screen
        SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);

        WebView webView = bridge.getWebView();

        // Enable JavaScript (important for Next.js apps)
        webView.getSettings().setJavaScriptEnabled(true);

        // Disable Zoom
        webView.getSettings().setBuiltInZoomControls(false);
        webView.getSettings().setSupportZoom(false);

        // Ensure navigation stays inside the WebView
        webView.setWebViewClient(new WebViewClient());

        // Load your deployed Next.js app
        webView.loadUrl("https://expense-management-xi.vercel.app/");
    }

    @Override
    public void onBackPressed() {
        WebView webView = bridge.getWebView();
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}