@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🚀 تشغيل خادم Backend لحل مشكلة تسجيل الدخول
echo ═══════════════════════════════════════════════════════════
echo.

REM التحقق من وجود Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js غير مثبت!
    echo 💡 قم بتثبيت Node.js من: https://nodejs.org/
    pause
    exit /b 1
)

REM التحقق من وجود node_modules
if not exist "node_modules\" (
    echo 📦 تثبيت المكتبات المطلوبة...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ فشل تثبيت المكتبات!
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت المكتبات بنجاح
    echo.
)

REM تثبيت bcrypt إذا لم يكن مثبتاً
echo 🔧 التحقق من مكتبة bcrypt...
call npm list bcrypt >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 تثبيت bcrypt...
    call npm install bcrypt
)

echo.
echo ═══════════════════════════════════════════════════════════
echo 🚀 تشغيل الخادم...
echo ═══════════════════════════════════════════════════════════
echo.
echo 📍 الخادم سيعمل على: http://localhost:3000
echo 🎯 Frontend يجب أن يعمل على: http://localhost:8080
echo 🛑 لإيقاف الخادم، اضغط: Ctrl+C
echo.

REM تشغيل الخادم
call npm start

echo.
echo ═══════════════════════════════════════════════════════════
echo ✅ تم إيقاف الخادم
echo ═══════════════════════════════════════════════════════════
pause
