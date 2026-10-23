@echo off
chcp 65001 >nul
title ساخت فایل نصب HTML to APK Builder
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║        ساخت فایل نصب HTML to APK Builder                ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo [1/4] بررسی Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ╔══════════════════════════════════════════════════════════╗
    echo ║  ❌ خطا: Node.js نصب نیست!                              ║
    echo ╠══════════════════════════════════════════════════════════╣
    echo ║                                                          ║
    echo ║  لطفاً Node.js را از سایت زیر دانلود و نصب کنید:        ║
    echo ║                                                          ║
    echo ║  https://nodejs.org/                                     ║
    echo ║                                                          ║
    echo ║  نسخه LTS را دانلود کنید و نصب کنید.                    ║
    echo ║  سپس دوباره این فایل را اجرا کنید.                      ║
    echo ║                                                          ║
    echo ╚══════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo     ✅ Node.js %NODE_VERSION% یافت شد
echo.

REM Install dependencies
echo [2/4] نصب وابستگی‌ها...
echo     این مرحله ۲-۵ دقیقه طول می‌کشد...
echo.
cd electron-app
call npm install --silent

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ خطا در نصب وابستگی‌ها!
    echo.
    echo راه‌حل:
    echo   1. اینترنت خود را بررسی کنید
    echo   2. آنتی‌ویروس را موقتاً غیرفعال کنید
    echo   3. دوباره تلاش کنید
    echo.
    pause
    exit /b 1
)

echo     ✅ وابستگی‌ها نصب شدند
echo.

REM Build installer
echo [3/4] ساخت فایل نصب...
echo     این مرحله ۵-۱۰ دقیقه طول می‌کشد...
echo.
call npm run dist:win --silent

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ خطا در ساخت فایل نصب!
    echo.
    pause
    exit /b 1
)

echo     ✅ فایل نصب ساخته شد
echo.

REM Open release folder
echo [4/4] باز کردن پوشه فایل نصب...
echo.
cd release

echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║  ✅ فایل نصب با موفقیت ساخته شد!                        ║
echo ║                                                          ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║                                                          ║
echo ║  فایل نصب:                                               ║
echo ║  HTML-to-APK-Builder-Setup-1.0.0.exe                    ║
echo ║                                                          ║
echo ║  برای نصب، روی فایل بالا دابل کلیک کنید.                ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

explorer .
pause
