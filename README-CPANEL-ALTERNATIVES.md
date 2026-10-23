# ❌ چرا هاست cPanel معمولی مناسب نیست؟
# ✅ راه‌حل‌های جایگزین عملی

---

## 🔴 چرا cPanel Shared Hosting کار نمی‌کند؟

### محدودیت‌های هاست اشتراکی cPanel:

| محدودیت | توضیح | وضعیت |
|----------|--------|:------:|
| ❌ عدم دسترسی به Node.js | اکثر هاست‌های cPanel فقط PHP پشتیبانی می‌کنند | غیرممکن |
| ❌ عدم دسترسی root | نمی‌توانید نرم‌افزار سیستمی نصب کنید | غیرممکن |
| ❌ فضای محدود | Android SDK حدود ۳ گیگابایت نیاز دارد | ناکافی |
| ❌ RAM محدود | بیلد APK حداقل ۲-۴ گیگابایت RAM نیاز دارد | ناکافی |
| ❌ عدم نصب Java JDK | نیاز به دسترسی root دارد | غیرممکن |
| ❌ عدم نصب Android SDK | نیاز به دسترسی سیستمی دارد | غیرممکن |
| ❌ محدودیت زمانی | بیلد APK ۲-۵ دقیقه طول می‌کشد (Timeout می‌خورد) | غیرممکن |
| ❌ عدم اجرای دستورات سیستمی | exec() و child_process مسدود هستند | غیرممکن |

### خلاصه:
> هاست cPanel فقط برای **سایت‌های استاتیک و PHP** مناسب است.
> تولید APK نیاز به **سرور اختصاصی (VPS)** دارد.

---

## ✅ اما نگران نباشید! راه‌حل‌های جایگزین وجود دارد:

---

## 🥇 راه‌حل ۱: VPS ارزان (پیشنهادی)

### سرویس‌های پیشنهادی:

| سرویس | قیمت ماهانه | RAM | مناسب برای |
|--------|:----------:|:---:|:----------:|
| **Hetzner** (آلمان) | €4.5 | 2GB | ✅ عالی |
| **DigitalOcean** | $6 | 1GB | ✅ خوب |
| **Vultr** | $6 | 1GB | ✅ خوب |
| **Parspack** (ایران) | ۱۵۰,۰۰۰ تومان | 2GB | ✅ عالی |
| **لیارا** (ایران) | ۲۰۰,۰۰۰ تومان | 1GB | ✅ خوب |
| **Afranet** (ایران) | ۱۰۰,۰۰۰ تومان | 1GB | ⚠️ حداقل |

### مراحل راه‌اندازی روی VPS:

```bash
# ۱. اتصال به سرور
ssh root@your-server-ip

# ۲. نصب Docker
curl -fsSL https://get.docker.com | sh

# ۳. کلون کردن پروژه
git clone your-repo-url
cd project/server

# ۴. اجرای سرور با Docker
docker-compose up -d

# ۵. تنظیم Nginx (reverse proxy)
# فایل nginx.conf را در /etc/nginx/sites-available/ کپی کنید

# ۶. فعال‌سازی SSL با Let's Encrypt
certbot --nginx -d api.ray-studio.com
```

### نتیجه:
```
فرانت‌اند: https://ray-studio.com/tools/html-to-apk/  (روی cPanel)
بک‌اند:    https://api.ray-studio.com                  (روی VPS)
```

---

## 🥈 راه‌حل ۲: استفاده از سرویس‌های رایگان

### الف) Render.com (رایگان)
```bash
# ۱. کد را روی GitHub پوش کنید
# ۲. به render.com بروید
# ۳. New Web Service → Connect to GitHub
# ۴. تنظیمات:
#    - Build Command: cd server && npm install
#    - Start Command: node build-server.js
#    - Environment: Docker
# ۵. Deploy!
```

**مزایا:** رایگان، SSL خودکار، CDN جهانی  
**معایب:** بعد از ۱۵ دقیقه غیرفعال می‌شود (cold start)

### ب) Railway.app (رایگان - $5 اعتبار ماهانه)
```bash
# ۱. نصب Railway CLI
npm install -g @railway/cli

# ۲. ورود
railway login

# ۳. ایجاد پروژه
railway init

# ۴. دیپلوی
cd server
railway up
```

### ج) Fly.io (رایگان - ۳ ماشین مجازی)
```bash
# ۱. نصب Fly CLI
curl -L https://fly.io/install.sh | sh

# ۲. ورود
fly auth login

# ۳. دیپلوی
cd server
fly launch
fly deploy
```

---

## 🥉 راه‌حل ۳: استفاده از API‌های آماده (بدون سرور!)

اگر نمی‌خواهید سرور راه‌اندازی کنید، از این سرویس‌ها استفاده کنید:

### ۱. PWABuilder (مایکروسافت) - رایگان ⭐
```javascript
// فرانت‌اند شما:
async function buildWithPWABuilder(htmlCode, settings) {
  // ۱. ساخت manifest
  const manifest = {
    name: settings.appName,
    short_name: settings.appName,
    start_url: '/',
    display: 'standalone',
    background_color: settings.themeColor,
    theme_color: settings.statusBarColor,
    icons: [{
      src: settings.iconDataUrl,
      sizes: '512x512',
      type: 'image/png'
    }]
  };

  // ۲. ارسال به PWABuilder API
  const response = await fetch('https://pwabuilder-cloudapk.azurewebsites.net/generateApk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      manifestUrl: 'https://your-site.com/manifest.json',
      manifest,
      startUrl: '/',
      iconUrl: settings.iconDataUrl,
      name: settings.appName,
      packageId: settings.packageName,
      appVersion: settings.versionName,
      backgroundColor: settings.themeColor,
      themeColor: settings.statusBarColor,
      signing: {
        file: null,
        alias: 'my-key-alias',
        fullName: 'Ray Studio',
        organization: 'Ray Studio',
        organizationalUnit: 'Development',
        countryCode: 'IR',
        keyPassword: '',
        storePassword: 'ray-studio-123'
      }
    })
  });

  // ۳. دانلود APK
  const blob = await response.blob();
  saveAs(blob, `${settings.appName}.apk`);
}
```

**مزایا:**
- ✅ کاملاً رایگان
- ✅ بدون نیاز به سرور
- ✅ توسط مایکروسافت پشتیبانی می‌شود
- ✅ APK واقعی و امضا شده تولید می‌کند

**معایب:**
- ⚠️ فقط PWA تبدیل می‌کند (نه HTML ساده)
- ⚠️ محدودیت‌هایی در سفارشی‌سازی

### ۲. GoNative.io (پولی ولی ساده)
```javascript
// API call
const response = await fetch('https://gonative.io/api/build', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: settings.appName,
    url: 'https://your-site.com/app/',
    platform: 'android',
    bundleId: settings.packageName
  })
});
```

**قیمت:** از $19/ماه  
**مزایا:** بدون دردسر، APK حرفه‌ای

### ۳. WebIntoApp (رایگان با محدودیت)
```
سایت: https://www.webintoapp.com/api
روش: POST با HTML یا URL
خروجی: APK
محدودیت: واترمارک در نسخه رایگان
```

---

## 🏆 پیشنهاد نهایی برای رای استودیو

### سناریوی ۱: بودجه محدود (رایگان)
```
فرانت‌اند: cPanel (رایگان)
بک‌اند: PWABuilder API (رایگان)
نتیجه: ✅ APK واقعی بدون هزینه سرور
```

### سناریوی ۲: بودجه متوسط (۱۰۰-۲۰۰ هزار تومان/ماه)
```
فرانت‌اند: cPanel (موجود)
بک‌اند: VPS ایرانی (Parspack/Liyara)
نتیجه: ✅ کنترل کامل + سرعت بالا + بدون محدودیت
```

### سناریوی ۳: حرفه‌ای
```
فرانت‌اند: cPanel (موجود)
بک‌اند: Hetzner VPS (€4.5/ماه) + Docker
نتیجه: ✅ بهترین عملکرد + مقیاس‌پذیری + پایداری
```

---

## 🔗 ترکیب cPanel + VPS (بهترین روش)

```
┌─────────────────────────────────────────────────────┐
│                    رای استودیو                       │
├──────────────────────┬──────────────────────────────┤
│     cPanel (موجود)    │     VPS (جدید)               │
├──────────────────────┼──────────────────────────────┤
│                      │                               │
│  ray-studio.com      │  api.ray-studio.com          │
│  ├── وردپرس          │  ├── سرور APK Builder        │
│  ├── فرانت‌اند ابزار  │  ├── Docker + Cordova        │
│  └── فایل‌های استاتیک │  └── Android SDK             │
│                      │                               │
└──────────┬───────────┴──────────────┬───────────────┘
           │                          │
           │    ┌─────────────────┐   │
           └───►│  API Request    │◄──┘
                │  /api/build-apk │
                └─────────────────┘
```

### تنظیمات DNS:
```
ray-studio.com        →  IP هاست cPanel
api.ray-studio.com    →  IP سرور VPS
tools.ray-studio.com  →  IP هاست cPanel (اختیاری)
```

### کد فرانت‌اند برای اتصال به سرور:
```javascript
// در App.tsx - اضافه کردن قابلیت بیلد مستقیم
const API_URL = 'https://api.ray-studio.com';

async function buildDirectApk(htmlCode, settings) {
  const formData = new FormData();
  formData.append('htmlCode', htmlCode);
  formData.append('settings', JSON.stringify(settings));
  
  if (settings.iconDataUrl) {
    const iconBlob = await fetch(settings.iconDataUrl).then(r => r.blob());
    formData.append('icon', iconBlob, 'icon.png');
  }

  const response = await fetch(`${API_URL}/api/build-apk`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Build failed');
  
  const blob = await response.blob();
  saveAs(blob, `${settings.appName}.apk`);
}
```

---

## 💰 مقایسه هزینه‌ها

| روش | هزینه ماهانه | پیچیدگی | کنترل |
|------|:----------:|:-------:|:-----:|
| cPanel + PWABuilder | **رایگان** | آسان | محدود |
| cPanel + VPS ایرانی | **۱۰۰-۲۰۰ هزار تومان** | متوسط | کامل |
| cPanel + Hetzner | **~۲۵۰ هزار تومان** | متوسط | کامل |
| GoNative.io | **~۵۰۰ هزار تومان** | آسان | متوسط |
| cPanel + DigitalOcean | **~۳۵۰ هزار تومان** | متوسط | کامل |

---

## 🎯 نتیجه‌گیری

### ❌ cPanel به تنهایی:
> امکان‌پذیر نیست - نیاز به Node.js، Java، Android SDK دارد

### ✅ cPanel + PWABuilder API:
> **بهترین گزینه رایگان** - بدون نیاز به سرور اضافی

### ✅ cPanel + VPS:
> **بهترین گزینه حرفه‌ای** - کنترل کامل و بدون محدودیت

---

**پیشنهاد من برای رای استودیو:**
1. ابتدا با **PWABuilder API** شروع کنید (رایگان)
2. اگر کاربران زیاد شدند، به **VPS ایرانی** مهاجرت کنید
3. در نهایت اگر نیاز به مقیاس‌پذیری بود، **Hetzner** بهترین گزینه است
