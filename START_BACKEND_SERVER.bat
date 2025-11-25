@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🚀 تشغيل خادم Backend - حل نهائي
echo ═══════════════════════════════════════════════════════════
echo.

echo 🛑 الخطوة 1: إيقاف جميع عمليات Node.js السابقة...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo ✅ تم إيقاف جميع العمليات
echo.

echo 📁 الخطوة 2: الانتقال لمجلد Backend...
cd /d "%~dp0backend"
if not exist "server.js" (
    echo ❌ لم يتم العثور على ملف server.js
    echo المجلد الحالي: %CD%
    echo.
    echo 💡 تأكد من وجود مجلد backend في:
    echo    C:\Users\PC\Desktop\newprej\backend
    pause
    exit /b 1
)

echo ✅ تم العثور على server.js
echo 📍 المجلد: %CD%
echo.

echo 📦 الخطوة 3: التحقق من المكتبات...
if not exist "node_modules" (
    echo 📥 تثبيت المكتبات...
    call npm install
    echo ✅ تم تثبيت المكتبات
) else (
    echo ✅ المكتبات موجودة
)
echo.

echo 🔧 الخطوة 4: التحقق من bcrypt...
call npm install bcrypt >nul 2>&1
echo ✅ تم التحقق من bcrypt
echo.

echo 🚀 الخطوة 5: تشغيل الخادم...
echo ═══════════════════════════════════════════════════════════
echo.
echo 📍 رابط الخادم: http://localhost:3000
echo.
echo ⚠️  لا تغلق هذه النافذة!
echo.
echo ═══════════════════════════════════════════════════════════
echo.

call npm start

echo.
echo ❌ الخادم توقف!
pause
