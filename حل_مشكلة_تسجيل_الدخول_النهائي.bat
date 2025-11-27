@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🔧 حل مشكلة "المسار غير موجود" - الحل النهائي
echo ═══════════════════════════════════════════════════════════
echo.

echo 🛑 إيقاف جميع عمليات Node.js...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 📦 تثبيت المكتبات المطلوبة...
call npm install

echo.
echo 🔧 تثبيت bcrypt...
call npm install bcrypt

echo.
echo 🚀 تشغيل الخادم...
echo ═══════════════════════════════════════════════════════════
echo.

start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ انتظر 10 ثواني حتى يبدأ الخادم...
timeout /t 10 /nobreak > nul

echo.
echo 🧪 اختبار الخادم...
curl http://69.169.108.182:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ الخادم يعمل بنجاح!
    echo.
    echo 🎯 الآن يمكنك:
    echo    1. فتح المتصفح على: http://localhost:8080
    echo    2. الضغط على "Se connecter"
    echo    3. تسجيل الدخول بـ:
    echo       Email: admin@example.com
    echo       Mot de passe: admin123
    echo.
    echo ✅ المشكلة محلولة!
) else (
    echo ❌ الخادم لا يعمل، جاري المحاولة مرة أخرى...
    timeout /t 5 /nobreak > nul
    curl http://69.169.108.182:3000 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ الخادم يعمل الآن!
    ) else (
        echo ❌ لا يزال لا يعمل، تحقق من:
        echo    - تشغيل PostgreSQL
        echo    - تثبيت Node.js
        echo    - عدم استخدام المنفذ 3000
    )
)

echo.
echo ═══════════════════════════════════════════════════════════
pause
