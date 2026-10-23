/**
 * سرور بک‌اند برای تولید مستقیم APK
 * 
 * پیش‌نیازها:
 * - Node.js 18+
 * - Java JDK 17+
 * - Android SDK
 * - Cordova CLI
 * 
 * نصب:
 *   npm install express cors multer uuid archiver
 * 
 * اجرا:
 *   node server/build-server.js
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Temp directory
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ============================================
// بررسی امنیتی کد
// ============================================
function analyzeSecurity(htmlCode) {
  const dangerousPatterns = [
    { pattern: /eval\s*\(/gi, type: 'danger', title: 'eval()' },
    { pattern: /Function\s*\(/gi, type: 'danger', title: 'Function constructor' },
    { pattern: /document\.write\s*\(/gi, type: 'warning', title: 'document.write()' },
    { pattern: /innerHTML\s*=/gi, type: 'warning', title: 'innerHTML assignment' },
    { pattern: /<iframe[^>]*>/gi, type: 'warning', title: 'iframe detected' },
    { pattern: /navigator\.geolocation/gi, type: 'warning', title: 'Geolocation access' },
    { pattern: /getUserMedia/gi, type: 'warning', title: 'Camera/Mic access' },
  ];

  const issues = [];
  for (const { pattern, type, title } of dangerousPatterns) {
    if (pattern.test(htmlCode)) {
      issues.push({ type, title });
    }
  }

  // Sanitize
  let sanitized = htmlCode;
  sanitized = sanitized.replace(/eval\s*\(([^)]*)\)/g, '/* [EVAL REMOVED] */ void(0)');
  sanitized = sanitized.replace(/new\s+Function\s*\(([^)]*)\)/g, '/* [FUNCTION REMOVED] */ void(0)');
  sanitized = sanitized.replace(/document\.write\s*\([^)]*\)/g, '/* [document.write REMOVED] */ void(0)');

  return {
    isSafe: !issues.some(i => i.type === 'danger'),
    issues,
    sanitizedCode: sanitized
  };
}

// ============================================
// ساخت پروژه Cordova
// ============================================
function createCordovaProject(projectDir, settings, htmlCode) {
  const appId = settings.packageName || 'com.example.myapp';
  const appName = settings.appName || 'My App';

  // ساخت پروژه Cordova
  execSync(`cordova create "${projectDir}" ${appId} "${appName}"`, {
    cwd: TEMP_DIR,
    env: { ...process.env, ANDROID_HOME: process.env.ANDROID_HOME }
  });

  // اضافه کردن پلتفرم اندروید
  execSync('cordova platform add android', { cwd: projectDir });

  // جایگزینی index.html
  const wwwDir = path.join(projectDir, 'www');
  fs.writeFileSync(path.join(wwwDir, 'index.html'), htmlCode);

  // اضافه کردن آیکون (اگر وجود دارد)
  if (settings.icon) {
    const iconBuffer = Buffer.from(settings.icon, 'base64');
    const resDir = path.join(projectDir, 'res', 'icon', 'android');
    if (!fs.existsSync(resDir)) {
      fs.mkdirSync(resDir, { recursive: true });
    }
    fs.writeFileSync(path.join(resDir, 'icon.png'), iconBuffer);
  }

  // تنظیم config.xml
  const configPath = path.join(projectDir, 'config.xml');
  let configXml = fs.readFileSync(configPath, 'utf-8');

  // اضافه کردن تنظیمات
  const orientation = settings.orientation || 'default';
  const fullscreen = settings.fullscreen || false;

  configXml = configXml.replace(
    '</widget>',
    `
    <preference name="Orientation" value="${orientation}" />
    <preference name="Fullscreen" value="${fullscreen}" />
    <preference name="StatusBarBackgroundColor" value="${settings.statusBarColor || '#1a1a2e'}" />
    <preference name="StatusBarStyle" value="lightcontent" />
    <preference name="BackgroundColor" value="${settings.themeColor || '#6366f1'}" />
    <preference name="android-minSdkVersion" value="${settings.minSdk || 21}" />
    <preference name="android-targetSdkVersion" value="${settings.targetSdk || 34}" />
    <preference name="AllowInlineMediaPlayback" value="true" />
    <preference name="MediaPlaybackRequiresUserAction" value="false" />
    
    <access origin="*" />
    <allow-navigation href="*" />
    
    <platform name="android">
        <preference name="AndroidWindowSoftInputMode" value="adjustResize" />
    </platform>
</widget>`
  );

  fs.writeFileSync(configPath, configXml);

  return projectDir;
}

// ============================================
// بیلد APK
// ============================================
function buildApk(projectDir, isRelease = false) {
  const buildType = isRelease ? 'release' : 'debug';
  
  try {
    execSync(`cordova build android --${buildType}`, {
      cwd: projectDir,
      env: {
        ...process.env,
        ANDROID_HOME: process.env.ANDROID_HOME,
        JAVA_HOME: process.env.JAVA_HOME
      },
      timeout: 300000 // 5 دقیقه
    });

    // پیدا کردن فایل APK
    const apkDir = path.join(projectDir, 'platforms', 'android', 'app', 'build', 'outputs', 'apk', buildType);
    const apkFiles = fs.readdirSync(apkDir).filter(f => f.endsWith('.apk'));

    if (apkFiles.length === 0) {
      throw new Error('APK file not found after build');
    }

    return path.join(apkDir, apkFiles[0]);
  } catch (error) {
    console.error('Build error:', error.message);
    throw error;
  }
}

// ============================================
// بیلد AAB
// ============================================
function buildAab(projectDir) {
  try {
    execSync('cordova build android --release -- --packageType=bundle', {
      cwd: projectDir,
      env: {
        ...process.env,
        ANDROID_HOME: process.env.ANDROID_HOME,
        JAVA_HOME: process.env.JAVA_HOME
      },
      timeout: 300000
    });

    const aabDir = path.join(projectDir, 'platforms', 'android', 'app', 'build', 'outputs', 'bundle', 'release');
    const aabFiles = fs.readdirSync(aabDir).filter(f => f.endsWith('.aab'));

    if (aabFiles.length === 0) {
      throw new Error('AAB file not found after build');
    }

    return path.join(aabDir, aabFiles[0]);
  } catch (error) {
    console.error('Build AAB error:', error.message);
    throw error;
  }
}

// ============================================
// پاکسازی
// ============================================
function cleanup(projectDir) {
  try {
    fs.rmSync(projectDir, { recursive: true, force: true });
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
}

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HTML to APK Builder',
    version: '1.0.0',
    features: {
      cordova: true,
      securityCheck: true,
      directApk: true,
      directAab: true
    }
  });
});

// بررسی امنیت
app.post('/api/security-check', (req, res) => {
  try {
    const { htmlCode } = req.body;
    if (!htmlCode) {
      return res.status(400).json({ error: 'HTML code is required' });
    }

    const report = analyzeSecurity(htmlCode);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ساخت مستقیم APK
app.post('/api/build-apk', upload.single('icon'), async (req, res) => {
  let projectDir = null;

  try {
    const { htmlCode, settings, release = false } = req.body;

    if (!htmlCode) {
      return res.status(400).json({ error: 'HTML code is required' });
    }

    // بررسی امنیت
    const securityReport = analyzeSecurity(htmlCode);
    const safeCode = securityReport.sanitizedCode;

    // پردازش آیکون
    let iconBase64 = null;
    if (req.file) {
      iconBase64 = req.file.buffer.toString('base64');
    } else if (settings?.icon) {
      // آیکون به صورت base64 در body
      const iconData = settings.icon.replace(/^data:image\/\w+;base64,/, '');
      iconBase64 = iconData;
    }

    // ساخت پروژه
    const projectId = uuidv4();
    projectDir = path.join(TEMP_DIR, projectId);

    const finalSettings = {
      ...settings,
      icon: iconBase64
    };

    createCordovaProject(projectDir, finalSettings, safeCode);

    // بیلد APK
    const apkPath = buildApk(projectDir, release);

    // ارسال فایل
    res.download(apkPath, `${settings?.appName || 'app'}.apk`, async (err) => {
      // پاکسازی بعد از ارسال
      setTimeout(() => cleanup(projectDir), 5000);
      if (err) {
        console.error('Download error:', err);
      }
    });

  } catch (error) {
    if (projectDir) cleanup(projectDir);
    console.error('Build APK error:', error);
    res.status(500).json({
      error: 'Build failed',
      message: error.message,
      hint: 'Make sure Android SDK and Java are properly installed'
    });
  }
});

// ساخت مستقیم AAB
app.post('/api/build-aab', upload.single('icon'), async (req, res) => {
  let projectDir = null;

  try {
    const { htmlCode, settings } = req.body;

    if (!htmlCode) {
      return res.status(400).json({ error: 'HTML code is required' });
    }

    const securityReport = analyzeSecurity(htmlCode);
    const safeCode = securityReport.sanitizedCode;

    let iconBase64 = null;
    if (req.file) {
      iconBase64 = req.file.buffer.toString('base64');
    } else if (settings?.icon) {
      const iconData = settings.icon.replace(/^data:image\/\w+;base64,/, '');
      iconBase64 = iconData;
    }

    const projectId = uuidv4();
    projectDir = path.join(TEMP_DIR, projectId);

    const finalSettings = { ...settings, icon: iconBase64 };
    createCordovaProject(projectDir, finalSettings, safeCode);

    const aabPath = buildAab(projectDir);

    res.download(aabPath, `${settings?.appName || 'app'}.aab`, async (err) => {
      setTimeout(() => cleanup(projectDir), 5000);
      if (err) {
        console.error('Download error:', err);
      }
    });

  } catch (error) {
    if (projectDir) cleanup(projectDir);
    console.error('Build AAB error:', error);
    res.status(500).json({
      error: 'Build failed',
      message: error.message
    });
  }
});

// وضعیت بیلد (برای بیلدهای طولانی)
const buildJobs = new Map();

app.post('/api/build-apk-async', upload.single('icon'), async (req, res) => {
  const jobId = uuidv4();
  buildJobs.set(jobId, { status: 'queued', progress: 0 });

  const { htmlCode, settings } = req.body;

  // شروع بیلد در پس‌زمینه
  setImmediate(async () => {
    let projectDir = null;
    try {
      buildJobs.set(jobId, { status: 'building', progress: 10 });

      const securityReport = analyzeSecurity(htmlCode);
      buildJobs.set(jobId, { status: 'building', progress: 20 });

      const projectId = uuidv4();
      projectDir = path.join(TEMP_DIR, projectId);

      let iconBase64 = null;
      if (req.file) {
        iconBase64 = req.file.buffer.toString('base64');
      }

      const finalSettings = { ...settings, icon: iconBase64 };
      createCordovaProject(projectDir, finalSettings, securityReport.sanitizedCode);
      buildJobs.set(jobId, { status: 'building', progress: 40 });

      const apkPath = buildApk(projectDir, false);
      buildJobs.set(jobId, { status: 'complete', progress: 100, apkPath });

      setTimeout(() => cleanup(projectDir), 60000);
    } catch (error) {
      if (projectDir) cleanup(projectDir);
      buildJobs.set(jobId, { status: 'error', progress: 0, error: error.message });
    }
  });

  res.json({ jobId, status: 'queued' });
});

// بررسی وضعیت بیلد
app.get('/api/build-status/:jobId', (req, res) => {
  const job = buildJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status === 'complete' && job.apkPath) {
    return res.json({ ...job, downloadUrl: `/api/download/${req.params.jobId}` });
  }

  res.json(job);
});

// دانلود نتیجه بیلد
app.get('/api/download/:jobId', (req, res) => {
  const job = buildJobs.get(req.params.jobId);
  if (!job || job.status !== 'complete') {
    return res.status(404).json({ error: 'Build not ready' });
  }

  res.download(job.apkPath, 'app.apk', () => {
    setTimeout(() => {
      buildJobs.delete(req.params.jobId);
    }, 5000);
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   HTML to APK Builder Server               ║
║   Running on http://localhost:${PORT}          ║
║                                              ║
║   Endpoints:                                 ║
║   POST /api/build-apk    - Build APK         ║
║   POST /api/build-aab    - Build AAB         ║
║   POST /api/security-check - Security Scan   ║
║   GET  /api/health       - Health Check      ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
