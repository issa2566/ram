@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🔧 إصلاح كلمات المرور في قاعدة البيانات
echo ═══════════════════════════════════════════════════════════
echo.

echo 📁 الانتقال لمجلد Backend...
cd /d "%~dp0backend"

echo ✅ تم
echo.

echo 📦 التحقق من المكتبات...
if not exist "node_modules" (
    echo 📥 تثبيت المكتبات...
    call npm install
    echo ✅ تم التثبيت
) else (
    echo ✅ المكتبات موجودة
)
echo.

echo 🔧 تثبيت bcrypt...
call npm install bcrypt
echo ✅ تم
echo.

echo ═══════════════════════════════════════════════════════════
echo     🔐 تشفير كلمات المرور...
echo ═══════════════════════════════════════════════════════════
echo.

node fix-passwords.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo     ✅ تم إصلاح كلمات المرور بنجاح!
    echo ═══════════════════════════════════════════════════════════
    echo.
    echo 🎯 الآن يمكنك:
    echo    1. شغّل: شغل_المشروع_الآن.bat
    echo    2. افتح: http://localhost:8080/login
    echo    3. سجل الدخول بـ:
    echo       Email: admin@example.com
    echo       Mot de passe: admin123
    echo.
) else (
    echo.
    echo ❌ فشل في تشفير كلمات المرور
    echo.
    echo 💡 الأسباب المحتملة:
    echo    1. PostgreSQL لا يعمل
    echo    2. قاعدة البيانات testdb غير موجودة
    echo    3. كلمة مرور PostgreSQL في db.js خاطئة
    echo.
    echo 🔧 الحلول:
    echo    1. تأكد من تشغيل PostgreSQL
    echo    2. افتح backend\db.js وغيّر كلمة المرور (السطر 8)
    echo    3. جرب كلمات مرور: postgres, admin, password
    echo.
)

echo.
pause
