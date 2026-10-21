package com.colourbasher.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.DisplayCutout;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;

/**
 * Colour Basher – full-screen host for the game in assets/index.html.
 * The game itself is HTML/CSS/JS; this activity adds immersive mode,
 * haptics, back-button handling and auto-pause when the app is backgrounded.
 */
public class MainActivity extends Activity {

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = w.getAttributes();
            lp.layoutInDisplayCutoutMode = Build.VERSION.SDK_INT >= 30
                    ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                    : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            w.setAttributes(lp);
        }

        // Root keeps the game clear of camera cut-outs.
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#140D3A"));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int l = 0, t = 0, r = 0, b = 0;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets c = insets.getInsets(WindowInsets.Type.displayCutout());
                l = c.left; t = c.top; r = c.right; b = c.bottom;
            } else if (Build.VERSION.SDK_INT >= 28) {
                DisplayCutout dc = insets.getDisplayCutout();
                if (dc != null) {
                    l = dc.getSafeInsetLeft(); t = dc.getSafeInsetTop();
                    r = dc.getSafeInsetRight(); b = dc.getSafeInsetBottom();
                }
            }
            v.setPadding(l, t, r, b);
            return insets;
        });

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#140D3A"));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setHapticFeedbackEnabled(false);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                 // records + settings (localStorage)
        s.setMediaPlaybackRequiresUserGesture(false); // sound effects
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);                           // keep layout stable with large system fonts
        s.setAllowFileAccess(false);                  // android_asset still loads

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true; // never navigate away from the game
            }
        });

        root.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        web.loadUrl("file:///android_asset/index.html");

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        hideSystemBars();
    }

    /** Back: pause the game / step back through screens; exit from the title screen. */
    private void handleBack() {
        web.evaluateJavascript("window.cbBack ? window.cbBack() : false", value -> {
            if (!"true".equals(value)) finish();
        });
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() { // Android 8 to 12
        handleBack();
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.systemBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onPause() {
        if (web != null) {
            web.evaluateJavascript("window.cbPause && window.cbPause()", null);
            web.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        hideSystemBars();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    /** Exposed to the game as window.AndroidBridge. */
    public class Bridge {
        @JavascriptInterface
        @SuppressWarnings("deprecation")
        public void vibrate(int ms) {
            try {
                Vibrator v;
                if (Build.VERSION.SDK_INT >= 31) {
                    VibratorManager vm = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                    v = vm != null ? vm.getDefaultVibrator() : null;
                } else {
                    v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                }
                if (v != null && v.hasVibrator()) {
                    v.vibrate(VibrationEffect.createOneShot(Math.max(1, Math.min(ms, 500)),
                            VibrationEffect.DEFAULT_AMPLITUDE));
                }
            } catch (Exception ignored) { }
        }
    }
}
