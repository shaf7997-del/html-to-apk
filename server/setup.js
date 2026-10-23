/**
 * اسکریپت نصب و راه‌اندازی سرور
 * بررسی و نصب پیش‌نیازها
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 بررسی پیش‌نیازهای سرور HTML to APK Builder...\n');

const checks = [];

// 1. بررسی Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  const major = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (major >= 18) {
    checks.push({ name: 'Node.js', status: '✅', version: nodeVersion });
  } else {
    checks.push({ name: 'Node.js', status: '❌', version: `${nodeVersion} (نیاز به 18+)` });
  }
} catch {
  checks.push({ name: 'Node.js', status: '❌', version: 'نصب نشده' });
}

// 2. بررسی Java
try {
  const javaVersion = execSync('java -version 2>&1', { encoding: 'utf-8' }).split('\n')[0];
  checks.push({ name: 'Java JDK', status: '✅', version: javaVersion });
} catch {
  checks.push({ name: 'Java JDK', status: '❌', version: 'نصب نشده' });
}

// 3. بررسی Android SDK
const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (androidHome && fs.existsSync(androidHome)) {
  checks.push({ name: 'Android SDK', status: '✅', version: androidHome });
} else {
  checks.push({ name: 'Android SDK', status: '❌', version: 'ANDROID_HOME تنظیم نشده' });
}

// 4. بررسی Cordova
try {
  const cordovaVersion = execSync('cordova --version', { encoding: 'utf-8' }).trim();
  checks.push({ name: 'Cordova', status: '✅', version: cordovaVersion });
} catch {
  checks.push({ name: 'Cordova', status: '❌', version: 'نصب نشده' });
}

// 5. بررسی Gradle
try {
  const gradleVersion = execSync('gradle --version 2>&1', { encoding: 'utf-8' })
    .match(/Gradle (\d+\.\d+)/)?.[0] || 'installed';
  checks.push({ name: 'Gradle', status: '✅', version: gradleVersion });
} catch {
  checks.push({ name: 'Gradle', status: '⚠️', version: 'نصب نشده (معمولاً توسط Cordova مدیریت می‌شود)' });
}

// نمایش نتایج
console.log('┌─────────────────────────────────────────────────────┐');
console.log('│           وضعیت پیش‌نیازها                          │');
console.log('├─────────────────────────────────────────────────────┤');
checks.forEach(check => {
  const padding = ' '.repeat(Math.max(0, 45 - check.name.length - check.version.length));
  console.log(`│ ${check.status} ${check.name}${padding}${check.version} │`);
});
console.log('└─────────────────────────────────────────────────────┘\n');

// بررسی خطاها
const hasErrors = checks.some(c => c.status === '❌');

if (hasErrors) {
  console.log('❌ برخی پیش‌نیازها نصب نیستند!\n');
  console.log('📋 راهنمای نصب:\n');

  if (checks.find(c => c.name === 'Java JDK')?.status === '❌') {
    console.log('1️⃣  نصب Java JDK 17:');
    console.log('   • Ubuntu/Debian: sudo apt install openjdk-17-jdk');
    console.log('   • macOS: brew install openjdk@17');
    console.log('   • Windows: https://adoptium.net/\n');
  }

  if (checks.find(c => c.name === 'Android SDK')?.status === '❌') {
    console.log('2️⃣  نصب Android SDK:');
    console.log('   • دانلود از: https://developer.android.com/studio#command-tools');
    console.log('   • تنظیم ANDROID_HOME:');
    console.log('     export ANDROID_HOME=$HOME/android-sdk');
    console.log('     export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin\n');
  }

  if (checks.find(c => c.name === 'Cordova')?.status === '❌') {
    console.log('3️⃣  نصب Cordova:');
    console.log('   npm install -g cordova\n');
  }

  console.log('بعد از نصب، دوباره این اسکریپت را اجرا کنید.');
  process.exit(1);
} else {
  console.log('✅ همه پیش‌نیازها آماده هستند!\n');

  // ساخت پوشه temp
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log('🚀 سرور آماده اجراست!');
  console.log('   npm start\n');
  console.log('📡 API Endpoints:');
  console.log('   POST http://localhost:3001/api/build-apk');
  console.log('   POST http://localhost:3001/api/build-aab');
  console.log('   POST http://localhost:3001/api/security-check');
  console.log('   GET  http://localhost:3001/api/health\n');
}
