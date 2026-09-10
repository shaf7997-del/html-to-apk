# 🔧 ساخت مستقیم APK بدون Android Studio

## ❓ چرا در مرورگر نمی‌توان مستقیماً APK ساخت؟

APK یک فرمت باینری خاص است که شامل:
- فایل‌های DEX (کد کامپایل شده Java/Kotlin)
- منابع کامپایل شده (Binary XML)
- امضای دیجیتال (Signing)

تولید این فایل‌ها نیاز به **Android SDK** و **JDK** دارد که فقط روی سرور قابل اجرا هستند.

---

## ✅ راه‌حل: سرور بک‌اند ساده

با اضافه کردن یک سرور Node.js ساده، می‌توانید مستقیماً فایل APK واقعی تولید کنید.

### معماری سیستم:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   مرورگر کاربر   │ ──────► │  سرور Node.js    │ ──────► │  فایل APK   │
│  (Frontend)     │         │  (Backend API)   │         │  آماده دانلود│
└─────────────────┘         └──────────────────┘         └─────────────┘
                                    │
                              ┌─────┴─────┐
                              │ Android   │
                              │ SDK + JDK │
                              └───────────┘
```

---

## 🚀 روش ۱: استفاده از Cordova (پیشنهادی)

### پیش‌نیازهای سرور:
```bash
# نصب Node.js 18+
# نصب Java JDK 17
# نصب Android SDK (Command-line tools)
# نصب Gradle

# متغیرهای محیطی:
export ANDROID_HOME=/path/to/android-sdk
export JAVA_HOME=/path/to/java
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### نصب Cordova:
```bash
npm install -g cordova
```

---

## 🚀 روش ۲: استفاده از Capacitor (جدیدتر)

Capacitor جایگزین مدرن Cordova است و توسط تیم Ionic توسعه داده شده.

---

## 📦 نمونه کد سرور بک‌اند

فایل `server/index.js` را در پوشه پروژه بسازید (کد نمونه در ادامه).

---

## 🔌 API Endpoint

### درخواست:
```http
POST /api/build-apk
Content-Type: application/json

{
  "htmlCode": "<html>...</html>",
  "settings": {
    "appName": "My App",
    "packageName": "com.example.myapp",
    "versionName": "1.0.0",
    "versionCode": 1,
    "minSdk": 21,
    "targetSdk": 34,
    "orientation": "portrait",
    "fullscreen": false,
    "icon": "base64-encoded-icon"
  }
}
```

### پاسخ:
```http
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="my-app.apk"

[بایت‌های فایل APK]
```

---

## 🏗️ مراحل بیلد خودکار

سرور بک‌اند این مراحل را انجام می‌دهد:

1. ✅ دریافت کد HTML و تنظیمات از فرانت‌اند
2. ✅ بررسی امنیتی کد
3. ✅ ساخت پروژه Cordova/Capacitor
4. ✅ اضافه کردن پلاگین WebView
5. ✅ قرار دادن فایل HTML در assets
6. ✅ اضافه کردن آیکون
7. ✅ اجرای `cordova build android` یا `npx cap sync && npx cap build android`
8. ✅ امضای APK (با debug key یا release key)
9. ✅ ارسال فایل APK به کاربر

---

## 🔐 امضای APK

### Debug Signing (توسعه):
APK به صورت خودکار با کلید debug امضا می‌شود.

### Release Signing (انتشار):
برای انتشار در Google Play:
```bash
# ساخت keystore
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key

# استفاده در بیلد
./gradlew assembleRelease -PANDROID_KEYSTORE=release-key.jks
```

---

## ⚡ روش سریع: استفاده از Docker

یک Dockerfile برای سرور بک‌اند:

```dockerfile
FROM node:18

# نصب Java و Android SDK
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip

# دانلود Android SDK
ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
RUN unzip commandlinetools-linux-*.zip -d ${ANDROID_HOME}/cmdline-tools
RUN mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest

# پذیرش لایسنس‌ها
RUN yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --licenses

# نصب پکیج‌های Android
RUN ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0"

# متغیرهای محیطی
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

# نصب Cordova
RUN npm install -g cordova

# کپی پروژه
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["node", "server/index.js"]
```

---

## 🌐 سرویس‌های آماده (بدون نیاز به سرور شخصی)

اگر نمی‌خواهید سرور راه‌اندازی کنید، از این سرویس‌ها استفاده کنید:

### 1. PWABuilder (مایکروسافت) - رایگان
- سایت: https://www.pwabuilder.com
- API: https://docs.pwabuilder.com
- تبدیل PWA به APK

### 2. GoNative.io
- سایت: https://gonative.io
- تبدیل HTML به APK/AAB
- پولی ولی ساده

### 3. WebIntoApp
- سایت: https://www.webintoapp.com
- تبدیل آنلاین HTML به APK
- رایگان با محدودیت

### 4. AppsGeyser
- سایت: https://appsgeyser.com
- ساخت اپ از HTML
- رایگان

---

## 📊 مقایسه روش‌ها

| روش | نیاز به سرور | سرعت | هزینه | کنترل |
|------|:-----------:|:-----:|:-----:|:-----:|
| Android Studio | ❌ | کند | رایگان | کامل |
| سرور Cordova | ✅ | متوسط | سرور | کامل |
| PWABuilder | ❌ | سریع | رایگان | محدود |
| GoNative.io | ❌ | سریع | پولی | متوسط |
| Docker + Cordova | ✅ | سریع | سرور | کامل |

---

## ❌ آیا با هاست cPanel می‌شود؟

**خیر، متأسفانه با هاست cPanel معمولی (Shared Hosting) نمی‌شود این کار را انجام داد.**

### دلایل:
- ❌ cPanel فقط PHP و فایل‌های استاتیک پشتیبانی می‌کند
- ❌ Node.js روی shared hosting اجرا نمی‌شود
- ❌ نصب Java JDK و Android SDK نیاز به دسترسی root دارد
- ❌ بیلد APK حداقل ۲-۴ گیگابایت RAM نیاز دارد
- ❌ Android SDK حدود ۳ گیگابایت فضا نیاز دارد

### ✅ راه‌حل‌های جایگزین:

#### ۱. PWABuilder API (رایگان - بدون سرور!)
```javascript
// استفاده مستقیم از API مایکروسافت
const response = await fetch('https://pwabuilder-cloudapk.azurewebsites.net/generateApk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    manifest: { name: 'My App', ... },
    startUrl: '/',
    iconUrl: 'https://...',
    packageId: 'com.example.myapp'
  })
});
const apk = await response.blob();
```
**مزایا:** رایگان، بدون سرور، توسط مایکروسافت  
**معایب:** فقط PWA تبدیل می‌کند

#### ۲. VPS ارزان (۱۰۰-۲۰۰ هزار تومان/ماه)
- **Parspack** یا **لیارا** (ایران)
- **Hetzner** (آلمان - €4.5/ماه)
- **DigitalOcean** ($6/ماه)

#### ۳. ترکیب cPanel + VPS (بهترین روش)
```
فرانت‌اند: cPanel (موجود) → ray-studio.com
بک‌اند: VPS (جدید) → api.ray-studio.com
```

📖 **جزئیات کامل:** فایل `README-CPANEL-ALTERNATIVES.md` را مطالعه کنید.

---

## 💡 پیشنهاد نهایی برای رای استودیو

### برای استفاده شخصی/توسعه:
→ **Android Studio** (رایگان، کنترل کامل)

### برای ارائه سرویس به کاربران سایت:
→ **سرور Cordova + Docker** روی VPS

### برای شروع سریع و رایگان:
→ **PWABuilder API** (رایگان، بدون سرور) ⭐

### اگر فقط cPanel دارید:
→ **PWABuilder API** (تنها گزینه رایگان بدون نیاز به سرور)

---

## 🔗 لینک‌های مفید

- [Cordova Documentation](https://cordova.apache.org/docs/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PWABuilder](https://www.pwabuilder.com)
- [Android SDK Download](https://developer.android.com/studio#command-tools)
- [Docker Hub - Android SDK](https://hub.docker.com/r/thyrlian/android-sdk)

---

**نسخه:** 1.0.0  
**آخرین بروزرسانی:** 2026
