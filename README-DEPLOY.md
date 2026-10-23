# 🚀 راهنمای استقرار HTML to APK/AAB Converter
## سایت: رای استودیو | RAY STUDIO

---

## 📋 فهرست مطالب
1. [روش‌های قرار دادن در سایت وردپرسی](#روشهای-قرار-دادن-در-سایت-وردپرسی)
2. [روش اول: آپلود مستقیم فایل‌ها](#روش-اول-آپلود-مستقیم-فایلهاب-پوشه-های-هاست)
3. [روش دوم: استفاده از iframe در صفحه وردپرس](#روش-دوم-استفاده-از-iframe-در-صفحه-وردپرس)
4. [روش سوم: ساخت قالب سفارشی وردپرس](#روش-سوم-ساخت-قالب-سفارشی-وردپرس)
5. [روش چهارم: استفاده از افزونه Insert HTML](#روش-چهارم-استفاده-از-افزونه-insert-html-snippet)
6. [تنظیمات ضروری](#تنظیمات-ضروری)
7. [رفع مشکلات رایج](#رفع-مشکلات-رایج)

---

## 🎯 روش‌های قرار دادن در سایت وردپرسی

### ⚡ سریع‌ترین روش (پیشنهادی)
> **روش دوم (iframe)** ساده‌ترین و امن‌ترین راه برای سایت وردپرسی شماست.

---

## روش اول: آپلود مستقیم فایل‌ها به پوشه‌های هاست

### مرحله ۱: بیلد گرفتن از پروژه
```bash
# در ترمینال، داخل پوشه پروژه:
npm run build
```

### مرحله ۲: ساخت پوشه در هاست
در File Manager هاست خود (cPanel یا DirectAdmin):
```
public_html/
└── tools/
    └── html-to-apk/
        ├── index.html
        └── assets/
            ├── index-xxxxx.js
            └── index-xxxxx.css
```

### مرحله ۳: آپلود فایل‌ها
1. وارد cPanel شوید
2. File Manager → public_html
3. پوشه `tools/html-to-apk/` بسازید
4. تمام محتویات پوشه `dist/` را آپلود کنید

### مرحله ۴: دسترسی
سایت شما در آدرس زیر قابل دسترسی خواهد بود:
```
https://ray-studio.com/tools/html-to-apk/
```

### مرحله ۵: اضافه کردن لینک در منوی وردپرس
از پیشخوان وردپرس:
1. **نمایش → فهرست‌ها**
2. یک لینک سفارشی اضافه کنید:
   - URL: `https://ray-studio.com/tools/html-to-apk/`
   - متن: «تبدیل HTML به APK»

---

## روش دوم: استفاده از iframe در صفحه وردپرس ⭐ (پیشنهادی)

### مرحله ۱: آپلود فایل‌ها
طبق روش اول، فایل‌ها را در هاست آپلود کنید.

### مرحله ۲: ساخت صفحه در وردپرس
1. وارد پیشخوان وردپرس شوید
2. **برگه‌ها → افزودن جدید**
3. عنوان: «تبدیل HTML به اپلیکیشن اندروید»
4. به ویرایشگر بلوکی بروید
5. بلوک **«HTML سفارشی»** (Custom HTML) اضافه کنید
6. کد زیر را قرار دهید:

```html
<div style="width: 100%; min-height: 800px; position: relative;">
  <iframe 
    src="https://ray-studio.com/tools/html-to-apk/" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);"
    allow="clipboard-write; clipboard-read"
    loading="lazy"
    title="تبدیل HTML به APK - رای استودیو"
  ></iframe>
</div>
```

### مرحله ۳: تنظیمات صفحه
- **قالب صفحه:** قالب پیش‌فرض
- **دیدگاه‌ها:** غیرفعال (اختیاری)
- **اسلاگ:** `html-to-apk-converter`

### مرحله ۴: سئو (با Yoast یا RankMath)
- عنوان سئو: «تبدیل HTML به APK و AAB | ابزار رایگان - رای استودیو»
- توضیحات متا: «ابزار آنلاین تبدیل کد HTML به اپلیکیشن اندروید. با بررسی امنیتی خودکار، فایل APK و AAB بسازید.»

---

## روش سوم: ساخت قالب سفارشی وردپرس

### مرحله ۱: ساخت فایل قالب
فایل `page-html-to-apk.php` را در پوشه قالب خود بسازید:

```php
<?php
/**
 * Template Name: HTML to APK Converter
 * Description: قالب تبدیل HTML به APK - رای استودیو
 */

get_header();
?>

<div class="html-to-apk-wrapper" style="width: 100%; min-height: 100vh;">
  <iframe 
    src="<?php echo get_site_url(); ?>/tools/html-to-apk/" 
    width="100%" 
    height="900" 
    frameborder="0"
    style="border: none; display: block;"
    allow="clipboard-write; clipboard-read"
    loading="lazy"
    title="تبدیل HTML به APK - رای استودیو"
  ></iframe>
</div>

<style>
  .html-to-apk-wrapper {
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    padding: 0;
    margin: 0;
  }
  .html-to-apk-wrapper iframe {
    width: 100%;
    min-height: calc(100vh - 200px);
  }
  /* مخفی کردن هدر و فوتر وردپرس برای این صفحه */
  .html-to-apk-wrapper ~ footer,
  .html-to-apk-wrapper ~ header {
    display: none;
  }
</style>

<?php get_footer(); ?>
```

### مرحله ۲: ساخت برگه
1. **برگه‌ها → افزودن جدید**
2. عنوان: «تبدیل HTML به APK»
3. از ستون سمت راست، **قالب صفحه** را روی «HTML to APK Converter» بگذارید
4. انتشار دهید

---

## روش چهارم: استفاده از افزونه Insert HTML Snippet

### مرحله ۱: نصب افزونه
1. **افزونه‌ها → افزودن جدید**
2. جستجو: «Insert HTML Snippet» یا «WPCode»
3. نصب و فعال‌سازی

### مرحله ۲: ایجاد اسنیپت
1. به تنظیمات افزونه بروید
2. یک اسنیپت جدید بسازید
3. کد iframe را قرار دهید:

```html
<div class="ray-studio-converter">
  <iframe 
    src="/tools/html-to-apk/" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);"
    allow="clipboard-write"
    loading="lazy"
  ></iframe>
</div>
```

### مرحله ۳: استفاده
- شورت‌کد: `[html_to_apk_converter]`
- یا در هر پست/برگه‌ای که خواستید قرار دهید

---

## 🔧 تنظیمات ضروری

### فایل .htaccess (در صورت نیاز)
اگر فایل‌ها مستقیماً آپلود شده‌اند، این فایل را در پوشه `tools/html-to-apk/` بسازید:

```apache
# .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /tools/html-to-apk/
    
    # SPA routing
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /tools/html-to-apk/index.html [L]
</IfModule>

# فشرده‌سازی
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# کش مرورگر
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>

# هدرهای امنیتی
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### تنظیمات CSP در وردپرس
اگر از افزونه امنیتی استفاده می‌کنید، مطمئن شوید iframe مجاز است. در functions.php قالب:

```php
// اضافه کردن هدر CSP برای اجازه iframe
add_action('send_headers', function() {
    if (is_page('html-to-apk-converter')) {
        header("Content-Security-Policy: frame-ancestors 'self' https://ray-studio.com");
    }
});
```

---

## 🐛 رفع مشکلات رایج

### مشکل: iframe نمایش داده نمی‌شود
**علت:** محدودیت X-Frame-Options  
**راه‌حل:** در فایل `.htaccess` یا `functions.php` هدر `X-Frame-Options` را بررسی کنید

### مشکل: فایل‌ها 404 می‌دهند
**علت:** مسیر اشتباه  
**راه‌حل:** 
- بررسی کنید فایل‌ها در مسیر صحیح آپلود شده‌اند
- URL را مستقیماً در مرورگر تست کنید: `https://ray-studio.com/tools/html-to-apk/`

### مشکل: استایل‌ها لود نمی‌شوند
**علت:** مسیر نسبی اشتباه  
**راه‌حل:**
- مطمئن شوید پوشه `assets/` کنار `index.html` است
- Base URL را در index.html تنظیم کنید:
```html
<base href="/tools/html-to-apk/">
```

### مشکل: دانلود فایل کار نمی‌کند
**علت:** محدودیت CORS یا CSP  
**راه‌حل:**
```apache
# در .htaccess
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
```

### مشکل: صفحه سفید نمایش داده می‌شود
**علت:** خطای JavaScript  
**راه‌حل:**
- Console مرورگر را بررسی کنید (F12)
- مطمئن شوید فایل‌های JS به درستی لود شده‌اند

---

## 📝 ساختار نهایی پیشنهادی برای سایت رای استودیو

```
public_html/
├── (فایل‌های وردپرس)
├── wp-content/
├── tools/
│   └── html-to-apk/
│       ├── index.html
│       ├── assets/
│       │   ├── index-xxxxx.js
│       │   └── index-xxxxx.css
│       └── .htaccess
└── .htaccess
```

### لینک‌های پیشنهادی برای منوی سایت:
- صفحه اصلی ابزار: `https://ray-studio.com/tools/html-to-apk/`
- صفحه توضیحات (وردپرس): `https://ray-studio.com/html-to-apk-converter/`

---

## 🎨 سفارشی‌سازی ظاهری iframe

برای هماهنگی iframe با قالب سایت رای استودیو:

```css
/* در Custom CSS وردپرس اضافه کنید */
.ray-studio-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.ray-studio-converter iframe {
  border-radius: 16px;
  width: 100%;
  min-height: 800px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ریسپانسیو */
@media (max-width: 768px) {
  .ray-studio-converter {
    padding: 10px;
    border-radius: 12px;
  }
  .ray-studio-converter iframe {
    min-height: 700px;
    border-radius: 12px;
  }
}
```

---

## 📊 بهینه‌سازی عملکرد

### فعال‌سازی CDN (اختیاری)
اگر از Cloudflare استفاده می‌کنید:
1. Rule بسازید برای `/tools/html-to-apk/*`
2. Cache Level: Cache Everything
3. Edge Cache TTL: 1 month

### فشرده‌سازی Brotli (به جای Gzip)
```apache
<IfModule mod_brotli.c>
    AddOutputFilterByType BROTLI text/html text/css application/javascript
</IfModule>
```

---

## 🔐 نکات امنیتی

1. ✅ برنامه کاملاً سمت کلاینت اجرا می‌شود - اطلاعات به سرور ارسال نمی‌شود
2. ✅ از HTTPS استفاده کنید (الزامی برای clipboard API)
3. ✅ CSP هدرها را تنظیم کنید
4. ✅ فایل‌ها را در پوشه‌ای خارج از wp-content قرار دهید
5. ✅ دسترسی نوشتن به پوشه ابزار را محدود کنید:
```bash
chmod 755 /tools/html-to-apk/
chmod 644 /tools/html-to-apk/*
```

---

## 📞 پشتیبانی

برای سوالات مربوط به استقرار در سایت رای استودیو، با تیم فنی تماس بگیرید.

---

**نسخه:** 1.0.0  
**آخرین بروزرسانی:** 2026  
**سازگار با:** WordPress 6.x، PHP 8.x
