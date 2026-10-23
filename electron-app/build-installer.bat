@echo off
chcp 65001 >nul
echo ============================================
echo   ساخت فایل نصب HTML to APK Builder
echo ============================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js نصب نیست!
    echo.
    echo لطفاً Node.js را از سایت زیر دانلود کنید:
    echo https://nodejs.org/
    echo.
    echo نسخه LTS را دانلود و نصب کنید، سپس دوباره این فایل را اجرا کنید.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js یافت شد
echo.

REM Check if in electron-app directory
if not exist "package.json" (
    echo [ERROR] فایل package.json یافت نشد!
    echo.
    echo لطفاً این فایل را در پوشه electron-app اجرا کنید.
    echo.
    pause
    exit /b 1
)

echo [INFO] نصب وابستگی‌ها...
echo این مرحله ممکن است ۲-۵ دقیقه طول بکشد...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] نصب وابستگی‌ها با خطا مواجه شد!
    pause
    exit /b 1
)

echo.
echo [INFO] ساخت فایل نصب...
echo این مرحله ممکن است ۵-۱۰ دقیقه طول بکشد...
echo.
call npm run dist:win

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] ساخت فایل نصب با خطا مواجه شد!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   فایل نصب با موفقیت ساخته شد!
echo ============================================
echo.
echo مسیر فایل‌ها:
echo   release\HTML-to-APK-Builder-Setup-1.0.0.exe
echo.
echo برای نصب، روی فایل بالا کلیک کنید.
echo.
explorer release
pause
