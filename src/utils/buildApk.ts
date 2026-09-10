import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface AppSettings {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  orientation: 'portrait' | 'landscape' | 'unspecified';
  fullscreen: boolean;
  statusBarColor: string;
  themeColor: string;
  iconDataUrl: string | null;
  splashDataUrl: string | null;
}

export async function buildApk(
  htmlCode: string,
  settings: AppSettings,
  format: 'apk' | 'aab'
): Promise<void> {
  const zip = new JSZip();

  // Create Android project structure
  const manifest = generateManifest(settings);
  const mainActivity = generateMainActivity(settings);
  const buildGradle = generateBuildGradle(settings);
  const settingsGradle = generateSettingsGradle(settings);
  const stringsXml = generateStringsXml(settings);
  const stylesXml = generateStylesXml(settings);
  const colorsXml = generateColorsXml(settings);

  // Add files to zip
  zip.file('AndroidManifest.xml', manifest);
  zip.file('app/src/main/java/' + settings.packageName.replace(/\./g, '/') + '/MainActivity.java', mainActivity);
  zip.file('app/src/main/assets/index.html', htmlCode);
  zip.file('app/build.gradle', buildGradle);
  zip.file('settings.gradle', settingsGradle);
  zip.file('app/src/main/res/values/strings.xml', stringsXml);
  zip.file('app/src/main/res/values/styles.xml', stylesXml);
  zip.file('app/src/main/res/values/colors.xml', colorsXml);

  // Add icon if provided
  if (settings.iconDataUrl) {
    const iconBlob = dataURLtoBlob(settings.iconDataUrl);
    zip.file('app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-xxhdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-xhdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-hdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-mdpi/ic_launcher.png', iconBlob);
  }

  // Add splash screen if provided
  if (settings.splashDataUrl) {
    const splashBlob = dataURLtoBlob(settings.splashDataUrl);
    zip.file('app/src/main/res/drawable/splash_screen.png', splashBlob);
  }

  // Add WebView client
  const webViewClient = generateWebViewClient(settings);
  zip.file('app/src/main/java/' + settings.packageName.replace(/\./g, '/') + '/AppWebViewClient.java', webViewClient);

  // Add build script
  const buildScript = generateBuildScript(format);
  zip.file('build_' + format + '.sh', buildScript);

  // Add README
  const readme = generateReadme(settings, format);
  zip.file('README.md', readme);

  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  const extension = format === 'apk' ? 'apk' : 'aab';
  saveAs(content, `${settings.appName.replace(/\s+/g, '_')}_project.${extension}.zip`);
}

function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

function generateManifest(settings: AppSettings): string {
  const orientation = settings.orientation === 'portrait'
    ? 'android:screenOrientation="portrait"'
    : settings.orientation === 'landscape'
      ? 'android:screenOrientation="landscape"'
      : '';

  const theme = settings.fullscreen
    ? '@style/AppTheme.Fullscreen'
    : '@style/AppTheme';

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${settings.packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="${theme}"
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            ${orientation}>
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
}

function generateMainActivity(settings: AppSettings): string {
  return `package ${settings.packageName};

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.graphics.Color;

public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        ${settings.fullscreen ? `
        // Fullscreen mode
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );` : `
        // Set status bar color
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.setStatusBarColor(Color.parseColor("${settings.statusBarColor}"));
        }`}

        webView = new WebView(this);
        setContentView(webView);

        // Configure WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setDatabaseEnabled(true);
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);

        // Set WebView client
        webView.setWebViewClient(new AppWebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        // Load HTML from assets
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;
}

function generateWebViewClient(settings: AppSettings): string {
  return `package ${settings.packageName};

import android.graphics.Bitmap;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class AppWebViewClient extends WebViewClient {

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        // Load all URLs within the WebView
        view.loadUrl(url);
        return true;
    }
}`;
}

function generateBuildGradle(settings: AppSettings): string {
  return `plugins {
    id 'com.android.application'
}

android {
    namespace '${settings.packageName}'
    compileSdk ${settings.targetSdk}

    defaultConfig {
        applicationId "${settings.packageName}"
        minSdk ${settings.minSdk}
        targetSdk ${settings.targetSdk}
        versionCode ${settings.versionCode}
        versionName "${settings.versionName}"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            minifyEnabled false
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.webkit:webkit:1.8.0'
}`;
}

function generateSettingsGradle(settings: AppSettings): string {
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${settings.appName}"
include ':app'`;
}

function generateStringsXml(settings: AppSettings): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${settings.appName}</string>
</resources>`;
}

function generateStylesXml(settings: AppSettings): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:colorPrimary">${settings.themeColor}</item>
        <item name="android:colorPrimaryDark">${settings.statusBarColor}</item>
        <item name="android:colorAccent">${settings.themeColor}</item>
        <item name="android:statusBarColor">${settings.statusBarColor}</item>
    </style>

    <style name="AppTheme.Fullscreen" parent="AppTheme">
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>`;
}

function generateColorsXml(settings: AppSettings): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${settings.themeColor}</color>
    <color name="colorPrimaryDark">${settings.statusBarColor}</color>
    <color name="colorAccent">${settings.themeColor}</color>
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
</resources>`;
}

function generateBuildScript(format: 'apk' | 'aab'): string {
  if (format === 'apk') {
    return `#!/bin/bash
# Build APK Script
# Requirements: Android SDK, JDK 11+

echo "Building APK..."
./gradlew assembleRelease

echo ""
echo "APK built successfully!"
echo "Output: app/build/outputs/apk/release/app-release.apk"
echo ""
echo "To install on device:"
echo "  adb install app/build/outputs/apk/release/app-release.apk"
`;
  } else {
    return `#!/bin/bash
# Build AAB (Android App Bundle) Script
# Requirements: Android SDK, JDK 11+

echo "Building AAB..."
./gradlew bundleRelease

echo ""
echo "AAB built successfully!"
echo "Output: app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "Upload this file to Google Play Console."
`;
  }
}

function generateReadme(settings: AppSettings, format: 'apk' | 'aab'): string {
  return `# ${settings.appName}

## اطلاعات پروژه
- **نام برنامه:** ${settings.appName}
- **شناسه پکیج:** ${settings.packageName}
- **نسخه:** ${settings.versionName} (${settings.versionCode})
- **حداقل SDK:** ${settings.minSdk}
- **هدف SDK:** ${settings.targetSdk}

## نحوه بیلد

### پیش‌نیازها
1. نصب Android Studio
2. نصب JDK 11 یا بالاتر
3. تنظیم متغیر محیطی ANDROID_HOME

### مراحل بیلد

\`\`\`bash
# دادن مجوز اجرا به اسکریپت
chmod +x build_${format}.sh

# اجرای بیلد
./build_${format}.sh
\`\`\`

### یا با Gradle مستقیم

\`\`\`bash
# برای APK
./gradlew assembleRelease

# برای AAB
./gradlew bundleRelease
\`\`\`

## خروجی
${format === 'apk'
    ? '- فایل APK در مسیر: `app/build/outputs/apk/release/app-release.apk`'
    : '- فایل AAB در مسیر: `app/build/outputs/bundle/release/app-release.aab`'}

## نصب روی دستگاه
\`\`\`bash
adb install app/build/outputs/apk/release/app-release.apk
\`\`\`

## ویژگی‌ها
- WebView با پشتیبانی از JavaScript
- DOM Storage فعال
- پشتیبانی از کش
- Fullscreen ${settings.fullscreen ? 'فعال' : 'غیرفعال'}
- جهت صفحه: ${settings.orientation === 'portrait' ? 'عمودی' : settings.orientation === 'landscape' ? 'افقی' : 'آزاد'}
`;
}
