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

export async function buildApkProject(
  htmlCode: string,
  settings: AppSettings
): Promise<void> {
  const zip = new JSZip();

  const manifest = generateManifest(settings);
  const mainActivity = generateMainActivity(settings);
  const buildGradle = generateBuildGradle(settings);
  const settingsGradle = generateSettingsGradle(settings);
  const stringsXml = generateStringsXml(settings);
  const stylesXml = generateStylesXml(settings);
  const colorsXml = generateColorsXml(settings);

  zip.file('AndroidManifest.xml', manifest);
  zip.file('app/src/main/java/' + settings.packageName.replace(/\./g, '/') + '/MainActivity.java', mainActivity);
  zip.file('app/src/main/assets/index.html', htmlCode);
  zip.file('app/build.gradle', buildGradle);
  zip.file('settings.gradle', settingsGradle);
  zip.file('app/src/main/res/values/strings.xml', stringsXml);
  zip.file('app/src/main/res/values/styles.xml', stylesXml);
  zip.file('app/src/main/res/values/colors.xml', colorsXml);

  if (settings.iconDataUrl) {
    const iconBlob = dataURLtoBlob(settings.iconDataUrl);
    zip.file('app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-xxhdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-xhdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-hdpi/ic_launcher.png', iconBlob);
    zip.file('app/src/main/res/mipmap-mdpi/ic_launcher.png', iconBlob);
  }

  if (settings.splashDataUrl) {
    const splashBlob = dataURLtoBlob(settings.splashDataUrl);
    zip.file('app/src/main/res/drawable/splash_screen.png', splashBlob);
  }

  const webViewClient = generateWebViewClient(settings);
  zip.file('app/src/main/java/' + settings.packageName.replace(/\./g, '/') + '/AppWebViewClient.java', webViewClient);

  // Build scripts
  zip.file('build.bat', generateBuildBat());
  zip.file('build.sh', generateBuildSh());

  // Gradle wrapper
  zip.file('gradlew', generateGradlew());
  zip.file('gradlew.bat', generateGradlewBat());
  zip.file('gradle/wrapper/gradle-wrapper.properties', generateGradleWrapperProps());

  // Root build.gradle
  zip.file('build.gradle', generateRootBuildGradle());

  // README
  zip.file('README.md', generateReadme(settings));

  // Java setup helper
  zip.file('setup-java.bat', generateJavaSetupBat());

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${settings.appName.replace(/\s+/g, '_')}_project.zip`);
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
        android:usesCleartextTraffic="true">
        
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
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );` : `
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.setStatusBarColor(Color.parseColor("${settings.statusBarColor}"));
        }`}

        webView = new WebView(this);
        setContentView(webView);

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

        webView.setWebViewClient(new AppWebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

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

function generateBuildBat(): string {
  return `@echo off
chcp 65001 >nul
echo ============================================
echo   HTML to APK Builder - Build APK
echo ============================================
echo.

REM Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java JDK not found!
    echo.
    echo Please run setup-java.bat first
    echo or install Java JDK 17 from: https://adoptium.net/
    echo.
    pause
    exit /b 1
)

echo [OK] Java found
echo.

REM Check Android SDK
if not defined ANDROID_HOME (
    if exist "%USERPROFILE%\\android-sdk" (
        set "ANDROID_HOME=%USERPROFILE%\\android-sdk"
    ) else (
        echo [INFO] Downloading Android SDK...
        echo This may take a few minutes.
        echo.
        
        if not exist "%USERPROFILE%\\android-sdk" mkdir "%USERPROFILE%\\android-sdk"
        
        echo Downloading Command Line Tools...
        powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' -OutFile '%USERPROFILE%\\android-sdk\\cmdline-tools.zip' }"
        
        echo Extracting...
        powershell -Command "& { Expand-Archive -Path '%USERPROFILE%\\android-sdk\\cmdline-tools.zip' -DestinationPath '%USERPROFILE%\\android-sdk\\cmdline-tools-temp' -Force }"
        
        if not exist "%USERPROFILE%\\android-sdk\\cmdline-tools\\latest" mkdir "%USERPROFILE%\\android-sdk\\cmdline-tools\\latest"
        xcopy "%USERPROFILE%\\android-sdk\\cmdline-tools-temp\\cmdline-tools\\*" "%USERPROFILE%\\android-sdk\\cmdline-tools\\latest\\" /E /Y /Q >nul
        
        rmdir /S /Q "%USERPROFILE%\\android-sdk\\cmdline-tools-temp" 2>nul
        del "%USERPROFILE%\\android-sdk\\cmdline-tools.zip" 2>nul
        
        set "ANDROID_HOME=%USERPROFILE%\\android-sdk"
        
        echo Accepting licenses...
        echo y | "%ANDROID_HOME%\\cmdline-tools\\latest\\bin\\sdkmanager.bat" --licenses >nul 2>&1
        
        echo Installing Android platform...
        "%ANDROID_HOME%\\cmdline-tools\\latest\\bin\\sdkmanager.bat" "platforms;android-34" "build-tools;34.0.0" "platform-tools"
        
        echo.
        echo [OK] Android SDK installed
        echo.
    )
)

echo [OK] Android SDK found
echo.

set "PATH=%ANDROID_HOME%\\platform-tools;%ANDROID_HOME%\\cmdline-tools\\latest\\bin;%PATH%"

echo [INFO] Building APK...
echo.

call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   APK built successfully!
echo ============================================
echo.
echo APK location:
echo   app\\build\\outputs\\apk\\debug\\app-debug.apk
echo.
echo Install on device:
echo   adb install app\\build\\outputs\\apk\\debug\\app-debug.apk
echo.
pause
`;
}

function generateBuildSh(): string {
  return `#!/bin/bash
echo "============================================"
echo "  HTML to APK Builder - Build APK"
echo "============================================"
echo ""

if ! command -v java &> /dev/null; then
    echo "[ERROR] Java JDK not found!"
    echo "Install Java JDK 17: sudo apt install openjdk-17-jdk"
    exit 1
fi

echo "[OK] Java found"

if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/android-sdk" ]; then
        export ANDROID_HOME="$HOME/android-sdk"
    else
        echo "[INFO] Downloading Android SDK..."
        mkdir -p "$HOME/android-sdk/cmdline-tools"
        
        wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip
        unzip -q /tmp/cmdline-tools.zip -d "$HOME/android-sdk/cmdline-tools"
        mv "$HOME/android-sdk/cmdline-tools/cmdline-tools" "$HOME/android-sdk/cmdline-tools/latest"
        rm /tmp/cmdline-tools.zip
        
        yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null 2>&1
        "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-34" "build-tools;34.0.0" "platform-tools"
        
        echo "[OK] Android SDK installed"
    fi
fi

export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "[INFO] Building APK..."
chmod +x gradlew
./gradlew assembleDebug

echo ""
echo "============================================"
echo "  APK built successfully!"
echo "============================================"
echo "Location: app/build/outputs/apk/debug/app-debug.apk"
`;
}

function generateGradlew(): string {
  return `#!/bin/sh
GRADLE_VERSION="8.4"
GRADLE_DIR="$HOME/.gradle/wrapper/dists/gradle-\${GRADLE_VERSION}"

if [ ! -d "$GRADLE_DIR" ]; then
    echo "Downloading Gradle \${GRADLE_VERSION}..."
    mkdir -p "$GRADLE_DIR"
    curl -sL "https://services.gradle.org/distributions/gradle-\${GRADLE_VERSION}-bin.zip" -o "/tmp/gradle.zip"
    unzip -q "/tmp/gradle.zip" -d "$GRADLE_DIR"
    rm "/tmp/gradle.zip"
fi

exec "$GRADLE_DIR/gradle-\${GRADLE_VERSION}/bin/gradle" "$@"
`;
}

function generateGradlewBat(): string {
  return `@echo off
setlocal

set GRADLE_VERSION=8.4
set GRADLE_DIR=%USERPROFILE%\\.gradle\\wrapper\\dists\\gradle-%GRADLE_VERSION%

if not exist "%GRADLE_DIR%" (
    echo Downloading Gradle %GRADLE_VERSION%...
    mkdir "%GRADLE_DIR%" 2>nul
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://services.gradle.org/distributions/gradle-%GRADLE_VERSION%-bin.zip' -OutFile '%TEMP%\\gradle.zip' }"
    powershell -Command "& { Expand-Archive -Path '%TEMP%\\gradle.zip' -DestinationPath '%GRADLE_DIR%' -Force }"
    del "%TEMP%\\gradle.zip" 2>nul
)

"%GRADLE_DIR%\\gradle-%GRADLE_VERSION%\\bin\\gradle.bat" %*
`;
}

function generateGradleWrapperProps(): string {
  return `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
}

function generateRootBuildGradle(): string {
  return `// Top-level build file
plugins {
    id 'com.android.application' version '8.2.0' apply false
}
`;
}

function generateReadme(settings: AppSettings): string {
  return `# ${settings.appName}

## اطلاعات پروژه
- **نام:** ${settings.appName}
- **پکیج:** ${settings.packageName}
- **نسخه:** ${settings.versionName} (${settings.versionCode})
- **Min SDK:** ${settings.minSdk}
- **Target SDK:** ${settings.targetSdk}

## ساخت APK

### پیش‌نیاز: Java JDK 17
اگر Java نصب نیست، \`setup-java.bat\` را اجرا کنید.

### ساخت خودکار:
\`\`\`
build.bat
\`\`\`

APK در: \`app/build/outputs/apk/debug/app-debug.apk\`

### نصب:
\`\`\`
adb install app/build/outputs/apk/debug/app-debug.apk
\`\`\`
`;
}

function generateJavaSetupBat(): string {
  return `@echo off
chcp 65001 >nul
echo ============================================
echo   Install Java JDK 17
echo ============================================
echo.

set JAVA_DIR=%USERPROFILE%\\.java-jdk17

if exist "%JAVA_DIR%\\bin\\java.exe" (
    echo Java already installed at: %JAVA_DIR%
    echo.
    echo Set environment variable:
    echo   setx JAVA_HOME "%JAVA_DIR%"
    echo.
    pause
    exit /b 0
)

echo Downloading Java JDK 17 (Adoptium)...
echo.

mkdir "%JAVA_DIR%" 2>nul

powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse' -OutFile '%TEMP%\\jdk17.zip' }"

echo Extracting...
powershell -Command "& { Expand-Archive -Path '%TEMP%\\jdk17.zip' -DestinationPath '%TEMP%\\jdk17-temp' -Force }"

for /d %%i in ("%TEMP%\\jdk17-temp\\*") do (
    xcopy "%%i\\*" "%JAVA_DIR%\\" /E /Y /Q >nul
)

rmdir /S /Q "%TEMP%\\jdk17-temp" 2>nul
del "%TEMP%\\jdk17.zip" 2>nul

echo.
echo ============================================
echo   Java JDK 17 installed!
echo ============================================
echo.
echo Location: %JAVA_DIR%
echo.
echo Set environment variables:
echo   setx JAVA_HOME "%JAVA_DIR%"
echo   setx PATH "%%JAVA_HOME%%\\bin;%%PATH%%"
echo.

set "JAVA_HOME=%JAVA_DIR%"
set "PATH=%JAVA_DIR%\\bin;%PATH%"

echo Checking installation...
java -version
echo.
echo Now run build.bat to build APK.
echo.
pause
`;
}
