const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const archiver = require('archiver');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'HTML to APK Builder',
    autoHideMenuBar: true,
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load built files
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============================================
// IPC Handlers
// ============================================

// Select output directory
ipcMain.handle('select-output-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Output Directory',
  });
  return result.canceled ? null : result.filePaths[0];
});

// Check if Java is installed
ipcMain.handle('check-java', async () => {
  return new Promise((resolve) => {
    exec('java -version', (error, stdout, stderr) => {
      if (error) {
        resolve({ installed: false, version: null });
      } else {
        const version = stderr.split('\n')[0] || stdout.split('\n')[0];
        resolve({ installed: true, version });
      }
    });
  });
});

// Check if Android SDK is installed
ipcMain.handle('check-android-sdk', async () => {
  const androidHome = process.env.ANDROID_HOME || 
    path.join(require('os').homedir(), 'android-sdk');
  
  const exists = fs.existsSync(androidHome);
  return { installed: exists, path: androidHome };
});

// Build APK
ipcMain.handle('build-apk', async (event, { htmlCode, settings, outputDir }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const projectDir = path.join(outputDir, settings.appName.replace(/\s+/g, '_'));
      
      // Create project structure
      await createProjectStructure(projectDir, htmlCode, settings);
      
      // Build APK
      const buildCommand = process.platform === 'win32' 
        ? 'gradlew.bat assembleDebug'
        : './gradlew assembleDebug';
      
      exec(buildCommand, { 
        cwd: projectDir,
        env: { ...process.env },
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Build failed: ${stderr || error.message}`));
          return;
        }
        
        const apkPath = path.join(
          projectDir, 
          'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'
        );
        
        resolve({
          success: true,
          apkPath,
          projectDir,
          message: 'APK built successfully!'
        });
      });
    } catch (error) {
      reject(error);
    }
  });
});

// Create project ZIP
ipcMain.handle('create-project-zip', async (event, { htmlCode, settings, outputDir }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tempDir = path.join(outputDir, `${settings.appName.replace(/\s+/g, '_')}_temp`);
      const zipPath = path.join(outputDir, `${settings.appName.replace(/\s+/g, '_')}_project.zip`);
      
      // Create project structure
      await createProjectStructure(tempDir, htmlCode, settings);
      
      // Create ZIP
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        // Cleanup temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        resolve({
          success: true,
          zipPath,
          size: archive.pointer(),
          message: 'Project ZIP created successfully!'
        });
      });
      
      archive.on('error', (err) => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        reject(err);
      });
      
      archive.pipe(output);
      archive.directory(tempDir, false);
      await archive.finalize();
      
    } catch (error) {
      reject(error);
    }
  });
});

// Open folder in explorer
ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath);
});

// Install Java
ipcMain.handle('install-java', async () => {
  const javaSetupScript = `
@echo off
echo Downloading Java JDK 17...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse' -OutFile '%TEMP%\\jdk17.zip' }"
echo Extracting...
powershell -Command "& { Expand-Archive -Path '%TEMP%\\jdk17.zip' -DestinationPath '%USERPROFILE%\\.java-jdk17' -Force }"
echo Setting environment variables...
setx JAVA_HOME "%USERPROFILE%\\.java-jdk17"
setx PATH "%USERPROFILE%\\.java-jdk17\\bin;%PATH%"
echo Java JDK 17 installed successfully!
pause
`;
  
  const scriptPath = path.join(app.getPath('temp'), 'install-java.bat');
  fs.writeFileSync(scriptPath, javaSetupScript);
  
  exec(`start cmd /k "${scriptPath}"`);
  
  return { success: true, message: 'Java installation started' };
});

// ============================================
// Project Structure Creation
// ============================================

async function createProjectStructure(projectDir, htmlCode, settings) {
  // Create directories
  const dirs = [
    projectDir,
    path.join(projectDir, 'app', 'src', 'main', 'java', ...settings.packageName.split('.')),
    path.join(projectDir, 'app', 'src', 'main', 'assets'),
    path.join(projectDir, 'app', 'src', 'main', 'res', 'values'),
    path.join(projectDir, 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi'),
    path.join(projectDir, 'app', 'src', 'main', 'res', 'mipmap-xxhdpi'),
    path.join(projectDir, 'app', 'src', 'main', 'res', 'mipmap-xhdpi'),
    path.join(projectDir, 'app', 'src', 'main', 'res', 'mipmap-hdpi'),
    path.join(projectDir, 'app', 'src', 'main', 'res', 'mipmap-mdpi'),
    path.join(projectDir, 'gradle', 'wrapper'),
  ];
  
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write files
  fs.writeFileSync(path.join(projectDir, 'app', 'src', 'main', 'assets', 'index.html'), htmlCode);
  fs.writeFileSync(path.join(projectDir, 'AndroidManifest.xml'), generateManifest(settings));
  fs.writeFileSync(
    path.join(projectDir, 'app', 'src', 'main', 'java', ...settings.packageName.split('.'), 'MainActivity.java'),
    generateMainActivity(settings)
  );
  fs.writeFileSync(
    path.join(projectDir, 'app', 'src', 'main', 'java', ...settings.packageName.split('.'), 'AppWebViewClient.java'),
    generateWebViewClient(settings)
  );
  fs.writeFileSync(path.join(projectDir, 'app', 'build.gradle'), generateBuildGradle(settings));
  fs.writeFileSync(path.join(projectDir, 'settings.gradle'), generateSettingsGradle(settings));
  fs.writeFileSync(path.join(projectDir, 'build.gradle'), generateRootBuildGradle());
  fs.writeFileSync(path.join(projectDir, 'app', 'src', 'main', 'res', 'values', 'strings.xml'), generateStringsXml(settings));
  fs.writeFileSync(path.join(projectDir, 'app', 'src', 'main', 'res', 'values', 'styles.xml'), generateStylesXml(settings));
  fs.writeFileSync(path.join(projectDir, 'app', 'src', 'main', 'res', 'values', 'colors.xml'), generateColorsXml(settings));
  fs.writeFileSync(path.join(projectDir, 'gradle', 'wrapper', 'gradle-wrapper.properties'), generateGradleWrapperProps());
  fs.writeFileSync(path.join(projectDir, 'gradlew'), generateGradlew(), { mode: 0o755 });
  fs.writeFileSync(path.join(projectDir, 'gradlew.bat'), generateGradlewBat());
  fs.writeFileSync(path.join(projectDir, 'build.bat'), generateBuildBat());
  fs.writeFileSync(path.join(projectDir, 'build.sh'), generateBuildSh(), { mode: 0o755 });
  fs.writeFileSync(path.join(projectDir, 'setup-java.bat'), generateJavaSetupBat());
  fs.writeFileSync(path.join(projectDir, 'README.md'), generateReadme(settings));
  
  // Copy icon if provided
  if (settings.iconDataUrl) {
    const iconBuffer = Buffer.from(settings.iconDataUrl.split(',')[1], 'base64');
    const mipmapDirs = ['mipmap-xxxhdpi', 'mipmap-xxhdpi', 'mipmap-xhdpi', 'mipmap-hdpi', 'mipmap-mdpi'];
    for (const dir of mipmapDirs) {
      fs.writeFileSync(path.join(projectDir, 'app', 'src', 'main', 'res', dir, 'ic_launcher.png'), iconBuffer);
    }
  }
}

// ============================================
// Generator Functions (same as web version)
// ============================================

function generateManifest(settings) {
  const orientation = settings.orientation === 'portrait'
    ? 'android:screenOrientation="portrait"'
    : settings.orientation === 'landscape'
      ? 'android:screenOrientation="landscape"'
      : '';

  const theme = settings.fullscreen ? '@style/AppTheme.Fullscreen' : '@style/AppTheme';

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

function generateMainActivity(settings) {
  return `package ${settings.packageName};

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
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
            getWindow().setStatusBarColor(Color.parseColor("${settings.statusBarColor}"));
        }`}

        webView = new WebView(this);
        setContentView(webView);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);

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

function generateWebViewClient(settings) {
  return `package ${settings.packageName};

import android.graphics.Bitmap;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class AppWebViewClient extends WebViewClient {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        view.loadUrl(request.getUrl().toString());
        return true;
    }
}`;
}

function generateBuildGradle(settings) {
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

function generateSettingsGradle(settings) {
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

function generateRootBuildGradle() {
  return `plugins {
    id 'com.android.application' version '8.2.0' apply false
}`;
}

function generateStringsXml(settings) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${settings.appName}</string>
</resources>`;
}

function generateStylesXml(settings) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:colorPrimary">${settings.themeColor}</item>
        <item name="android:statusBarColor">${settings.statusBarColor}</item>
    </style>
    <style name="AppTheme.Fullscreen" parent="AppTheme">
        <item name="android:windowFullscreen">true</item>
    </style>
</resources>`;
}

function generateColorsXml(settings) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${settings.themeColor}</color>
    <color name="colorPrimaryDark">${settings.statusBarColor}</color>
</resources>`;
}

function generateGradleWrapperProps() {
  return `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`;
}

function generateGradlew() {
  return `#!/bin/sh
GRADLE_VERSION="8.4"
GRADLE_DIR="$HOME/.gradle/wrapper/dists/gradle-\${GRADLE_VERSION}"
if [ ! -d "$GRADLE_DIR" ]; then
    mkdir -p "$GRADLE_DIR"
    curl -sL "https://services.gradle.org/distributions/gradle-\${GRADLE_VERSION}-bin.zip" -o "/tmp/gradle.zip"
    unzip -q "/tmp/gradle.zip" -d "$GRADLE_DIR"
    rm "/tmp/gradle.zip"
fi
exec "$GRADLE_DIR/gradle-\${GRADLE_VERSION}/bin/gradle" "$@"`;
}

function generateGradlewBat() {
  return `@echo off
set GRADLE_VERSION=8.4
set GRADLE_DIR=%USERPROFILE%\\.gradle\\wrapper\\dists\\gradle-%GRADLE_VERSION%
if not exist "%GRADLE_DIR%" (
    mkdir "%GRADLE_DIR%" 2>nul
    powershell -Command "Invoke-WebRequest -Uri 'https://services.gradle.org/distributions/gradle-%GRADLE_VERSION%-bin.zip' -OutFile '%TEMP%\\gradle.zip'"
    powershell -Command "Expand-Archive -Path '%TEMP%\\gradle.zip' -DestinationPath '%GRADLE_DIR%' -Force"
    del "%TEMP%\\gradle.zip" 2>nul
)
"%GRADLE_DIR%\\gradle-%GRADLE_VERSION%\\bin\\gradle.bat" %*`;
}

function generateBuildBat() {
  return `@echo off
chcp 65001 >nul
echo Building APK...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found! Run setup-java.bat first.
    pause
    exit /b 1
)
call gradlew.bat assembleDebug
if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   APK built successfully!
    echo   Location: app\\build\\outputs\\apk\\debug\\app-debug.apk
    echo ============================================
) else (
    echo [ERROR] Build failed!
)
pause`;
}

function generateBuildSh() {
  return `#!/bin/bash
echo "Building APK..."
if ! command -v java &> /dev/null; then
    echo "[ERROR] Java not found!"
    exit 1
fi
chmod +x gradlew
./gradlew assembleDebug
echo ""
echo "============================================"
echo "  APK built: app/build/outputs/apk/debug/app-debug.apk"
echo "============================================"`;
}

function generateJavaSetupBat() {
  return `@echo off
chcp 65001 >nul
echo Installing Java JDK 17...
set JAVA_DIR=%USERPROFILE%\\.java-jdk17
if exist "%JAVA_DIR%\\bin\\java.exe" (
    echo Java already installed.
    setx JAVA_HOME "%JAVA_DIR%"
    pause
    exit /b 0
)
powershell -Command "Invoke-WebRequest -Uri 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse' -OutFile '%TEMP%\\jdk17.zip'"
powershell -Command "Expand-Archive -Path '%TEMP%\\jdk17.zip' -DestinationPath '%JAVA_DIR%' -Force"
setx JAVA_HOME "%JAVA_DIR%"
setx PATH "%JAVA_DIR%\\bin;%PATH%"
echo Java JDK 17 installed!
pause`;
}

function generateReadme(settings) {
  return `# ${settings.appName}

## Build APK
1. Run \`setup-java.bat\` (if Java not installed)
2. Run \`build.bat\`
3. APK will be in: \`app/build/outputs/apk/debug/app-debug.apk\`

## Install
\`\`\`
adb install app/build/outputs/apk/debug/app-debug.apk
\`\`\`
`;
}
