# 🚀 HTML to APK/AAB Converter - رای استودیو

> تبدیل کد HTML به اپلیکیشن اندروید با بررسی امنیتی خودکار

---

## 📁 ساختار پروژه

```
project/
├── src/                          # کد فرانت‌اند (React)
│   ├── App.tsx                   # کامپوننت اصلی
│   ├── main.tsx                  # نقطه ورود
│   ├── index.css                 # استایل‌ها
│   └── utils/
│       ├── securityCheck.ts      # بررسی امنیتی کد
│       └── buildApk.ts           # تولید پروژه Android
│
├── server/                       # سرور بک‌اند (تولید مستقیم APK)
│   ├── build-server.js           # سرور Express
│   ├── setup.js                  # بررسی پیش‌نیازها
│   ├── package.json              # وابستگی‌های سرور
│   ├── Dockerfile                # ایمیج Docker
│   ├── docker-compose.yml        # اجرای آسان با Docker
│   ├── nginx.conf                # تنظیمات Nginx
│   └── .env.example              # متغیرهای محیطی
│
├── dist/                         # خروجی بیلد فرانت‌اند
├── index.html                    # HTML اصلی
├── package.json                  # وابستگی‌های فرانت‌اند
├── README.md                     # این فایل
├── README-DEPLOY.md              # راهنمای استقرار روی وردپرس
└── README-DIRECT-APK.md          # راهنمای تولید مستقیم APK
```

---

## 🎯 دو روش استفاده

### روش ۱: فرانت‌اند فقط (بدون سرور)
- کاربر کد HTML را وارد می‌کند
- پروژه Android Studio تولید و دانلود می‌شود
- کاربر باید Android Studio داشته باشد تا APK نهایی بسازد

### روش ۲: فرانت‌اند + سرور بک‌اند (تولید مستقیم APK) ⭐
- کاربر کد HTML را وارد می‌کند
- سرور بک‌اند مستقیماً فایل APK/AAB واقعی تولید می‌کند
- **نیازی به Android Studio نیست!**

---

## 🛠️ نصب و راه‌اندازی

### فرانت‌اند

```bash
# نصب وابستگی‌ها
npm install

# اجرای سرور توسعه
npm run dev

# بیلد برای تولید
npm run build
```

### سرور بک‌اند (برای تولید مستقیم APK)

```bash
cd server/

# بررسی پیش‌نیازها
node setup.js

# نصب وابستگی‌ها
npm install

# اجرای سرور
npm start
```

### سرور بک‌اند با Docker (ساده‌ترین روش)

```bash
cd server/

# ساخت و اجرای ایمیج
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f
```

---

## 📡 API سرور بک‌اند

### بررسی امنیت
```bash
curl -X POST http://localhost:3001/api/security-check \
  -H "Content-Type: application/json" \
  -d '{"htmlCode": "<html>...</html>"}'
```

### ساخت مستقیم APK
```bash
curl -X POST http://localhost:3001/api/build-apk \
  -H "Content-Type: application/json" \
  -d '{
    "htmlCode": "<html>...</html>",
    "settings": {
      "appName": "My App",
      "packageName": "com.example.myapp",
      "versionName": "1.0.0",
      "versionCode": 1,
      "minSdk": 21,
      "targetSdk": 34
    }
  }' \
  --output app.apk
```

### ساخت مستقیم AAB
```bash
curl -X POST http://localhost:3001/api/build-aab \
  -H "Content-Type: application/json" \
  -d '{
    "htmlCode": "<html>...</html>",
    "settings": {
      "appName": "My App",
      "packageName": "com.example.myapp"
    }
  }' \
  --output app.aab
```

---

## 🔐 امنیت

### بررسی خودکار کد
برنامه به صورت خودکار کد HTML را بررسی می‌کند و موارد زیر را شناسایی می‌کند:

- ❌ `eval()` و `Function()` constructor
- ⚠️ `document.write()` و `innerHTML`
- ⚠️ `iframe` و دسترسی به دوربین/GPS
- ⚠️ اسکریپت‌های خارجی مشکوک

### پاکسازی خودکار
کدهای مخرب به صورت خودکار حذف می‌شوند و نسخه امن تولید می‌شود.

---

## 📱 ویژگی‌ها

- ✅ ویرایشگر کد HTML با syntax highlighting
- ✅ پیش‌نمایش زنده
- ✅ بررسی امنیتی خودکار
- ✅ تنظیمات کامل اپلیکیشن
- ✅ آپلود آیکون سفارشی
- ✅ تولید پروژه Android Studio
- ✅ تولید مستقیم APK/AAB (با سرور بک‌اند)
- ✅ رابط کاربری فارسی و رسپانسیو
- ✅ پشتیبانی از Docker

---

## 🌐 استقرار روی سایت وردپرس

برای قرار دادن این ابزار روی سایت وردپرسی «رای استودیو»، فایل `README-DEPLOY.md` را مطالعه کنید.

### روش‌های موجود:
1. آپلود مستقیم فایل‌ها به هاست
2. استفاده از iframe در صفحه وردپرس ⭐ (پیشنهادی)
3. ساخت قالب سفارشی وردپرس
4. استفاده از افزونه Insert HTML Snippet

---

## 🚀 تولید مستقیم APK بدون Android Studio

برای راه‌اندازی سرور بک‌اند و تولید مستقیم فایل APK/AAB، فایل `README-DIRECT-APK.md` را مطالعه کنید.

### پیش‌نیازهای سرور:
- Node.js 18+
- Java JDK 17+
- Android SDK
- Cordova CLI

### سریع‌ترین روش (Docker):
```bash
cd server/
docker-compose up -d
```

---

## 📊 مقایسه روش‌ها

| ویژگی | فرانت‌اند فقط | با سرور بک‌اند |
|--------|:------------:|:--------------:|
| نیاز به Android Studio | ✅ بله | ❌ خیر |
| سرعت تولید | فوری | ۲-۵ دقیقه |
| نیاز به سرور | ❌ خیر | ✅ بله |
| فایل APK واقعی | ❌ خیر | ✅ بله |
| مناسب برای | توسعه‌دهندگان | کاربران نهایی |

---

## 🛠️ تکنولوژی‌ها

### فرانت‌اند
- React 18
- TypeScript
- Tailwind CSS v4
- Vite
- JSZip
- Lucide React

### سرور بک‌اند
- Node.js 18+
- Express
- Cordova
- Android SDK
- Docker

---

## 📝 مجوز

این پروژه برای استفاده در سایت «رای استودیو | RAY STUDIO» توسعه داده شده است.

---

## 📞 پشتیبانی

برای سوالات و پشتیبانی با تیم فنی رای استودیو تماس بگیرید.

---

**نسخه:** 1.0.0  
**آخرین بروزرسانی:** 2026  
**توسعه‌دهنده:** تیم فنی رای استودیو
