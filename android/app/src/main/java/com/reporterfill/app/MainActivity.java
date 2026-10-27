package com.reporterfill.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.OutputStream;
import java.util.ArrayList;

// Opens Ethiopian Reporter Jobs and adds a ReporterFill button to its pages.
// The applicant logs in and taps Save themselves; the app never stores passwords.
public class MainActivity extends Activity {
    static final String HOME = "https://www.ethiopianreporterjobs.com/user-dashboard/";
    static final String RFILL = "https://cdn.jsdelivr.net/gh/yezihalemGitH/jobcodes@9e35889395/rfill.js";
    static final String BUTTON = "(function(){if(document.getElementById('rfbtn')||!document.body)return;"
        + "var b=document.createElement('button');b.id='rfbtn';b.textContent='ReporterFill';"
        + "b.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483645;padding:12px 16px;border:0;border-radius:24px;background:#1a7f37;color:#fff;font:bold 15px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.3)';"
        + "b.onclick=function(){var s=document.createElement('script');s.src='" + RFILL + "';document.body.appendChild(s)};"
        + "document.body.appendChild(b)})()";
    static final int PICK = 1;
    WebView web;
    ValueCallback<Uri[]> pending;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        CookieManager.getInstance().setAcceptCookie(true);
        // login and robot checks on the site use cookies from other domains
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        // lets ReporterFill save files into Download/Job Documents on the phone
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public String save(String b64, String name, String mime) {
                if (Build.VERSION.SDK_INT < 29) return "This phone's Android is too old to save from the app. Use Chrome instead.";
                try {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                    v.put(MediaStore.MediaColumns.MIME_TYPE, mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
                    v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Job Documents");
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    OutputStream o = getContentResolver().openOutputStream(u);
                    o.write(Base64.decode(b64, Base64.DEFAULT));
                    o.close();
                    return "ok";
                } catch (Exception e) {
                    return "Could not save: " + e.getMessage();
                }
            }
        }, "RFApp");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                // frames inside the page (robot checks, login widgets) load normally
                if (!r.isForMainFrame()) return false;
                Uri u = r.getUrl();
                String h = u.getHost() == null ? "" : u.getHost();
                if (h.endsWith("ethiopianreporterjobs.com")) return false;
                // Google and LinkedIn refuse to sign in inside apps, and a login made in Chrome
                // stays in Chrome, so explain instead of leaving the app
                if (h.endsWith("accounts.google.com") || h.endsWith("linkedin.com")) {
                    new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Use email and password here")
                        .setMessage("Google and LinkedIn login only work in Chrome, not inside apps.\n\n"
                            + "In this app, log in with your email and password.\n\n"
                            + "If you always used Google and have no password: on the login page tap "
                            + "\"Forgot password\", enter your Gmail address, and set a password from the email you get. "
                            + "Then log in here with it.\n\n"
                            + "Or use Chrome with the rfill bookmark, where Google login works.")
                        .setPositiveButton("OK", null)
                        .show();
                    if (v.canGoBack() && r.isRedirect()) v.goBack();
                    return true;
                }
                // ChatGPT, Gemini and other sites open in the phone's own browser
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException e) { }
                return true;
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                CookieManager.getInstance().flush();
                v.evaluateJavascript(BUTTON, null);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (pending != null) pending.onReceiveValue(null);
                pending = cb;
                ArrayList<String> types = new ArrayList<>();
                for (String a : p.getAcceptTypes()) {
                    for (String t : a.split(",")) {
                        t = t.trim().toLowerCase();
                        if (t.equals(".pdf")) t = "application/pdf";
                        else if (t.equals(".doc")) t = "application/msword";
                        else if (t.equals(".docx")) t = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        if (t.contains("/") && !types.contains(t)) types.add(t);
                    }
                }
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                if (!types.isEmpty()) i.putExtra(Intent.EXTRA_MIME_TYPES, types.toArray(new String[0]));
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try {
                    startActivityForResult(Intent.createChooser(i, "Pick a file"), PICK);
                } catch (ActivityNotFoundException e) {
                    pending = null;
                    return false;
                }
                return true;
            }
        });
        if (saved != null) web.restoreState(saved);
        else web.loadUrl(HOME);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req != PICK || pending == null) { super.onActivityResult(req, res, data); return; }
        Uri[] out = null;
        if (res == RESULT_OK && data != null) {
            ClipData c = data.getClipData();
            if (c != null) {
                out = new Uri[c.getItemCount()];
                for (int k = 0; k < out.length; k++) out[k] = c.getItemAt(k).getUri();
            } else if (data.getData() != null) {
                out = new Uri[] { data.getData() };
            }
        }
        pending.onReceiveValue(out);
        pending = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
