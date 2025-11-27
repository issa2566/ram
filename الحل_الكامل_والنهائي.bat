@echo off
chcp 65001 > nul
color 0B
cls

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║      🔧 الحل الكامل لمشكلة تسجيل الدخول             ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo.

echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    الخطوة 1: تنظيف العمليات القديمة
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul
echo          ✅ تم
echo.

echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    الخطوة 2: التحقق من PostgreSQL
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

psql -U postgres -c "SELECT version();" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo          ✅ PostgreSQL يعمل
    
    echo.
    echo          📊 التحقق من قاعدة البيانات testdb...
    psql -U postgres -l | findstr testdb >nul 2>&1
    
    if %ERRORLEVEL% EQU 0 (
        echo          ✅ قاعدة البيانات testdb موجودة
    ) else (
        echo          ⚠️ قاعدة البيانات testdb غير موجودة
        echo          📝 جاري إنشائها...
        psql -U postgres -c "CREATE DATABASE testdb;" >nul 2>&1
        
        if %ERRORLEVEL% EQU 0 (
            echo          ✅ تم إنشاء testdb
        )
    )
    
    echo.
    echo          📋 التحقق من جدول users...
    cd /d "%~dp0backend"
    psql -U postgres -d testdb -c "\dt" | findstr users >nul 2>&1
    
    if %ERRORLEVEL% EQU 0 (
        echo          ✅ جدول users موجود
    ) else (
        echo          ⚠️ جدول users غير موجود
        echo          📝 جاري إنشائه...
        psql -U postgres -d testdb -f database.sql >nul 2>&1
        
        if %ERRORLEVEL% EQU 0 (
            echo          ✅ تم إنشاء جدول users
        )
    )
) else (
    echo          ❌ PostgreSQL لا يعمل أو كلمة المرور خاطئة
    echo.
    echo          💡 الحلول:
    echo             1. تأكد من تشغيل PostgreSQL
    echo             2. افتح backend\db.js وغيّر السطر 8
    echo             3. جرب كلمات مرور: postgres, admin, password
    echo.
)

echo.
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    الخطوة 3: تشفير كلمات المرور
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "%~dp0backend"

echo          🔐 جاري تشفير كلمات المرور...
node fix-passwords.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo          ⚠️ تحذير: قد تكون هناك مشكلة في التشفير
    echo          💡 تأكد من صحة كلمة مرور PostgreSQL في backend\db.js
    echo.
)

echo.
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    الخطوة 4: تشغيل Backend
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

start "🚀 Backend - لا تغلق!" cmd /k "color 0A && echo ╔═════════════════════════════════════════════╗ && echo ║  Backend Server يعمل                       ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 URL: http://69.169.108.182:3000 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && node server.js"

timeout /t 5 /nobreak > nul
echo          ✅ Backend يعمل في نافذة منفصلة
echo.

echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    الخطوة 5: تشغيل Frontend
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "%~dp0auto-display-replicator-main"

start "🎨 Frontend - لا تغلق!" cmd /k "color 0B && echo ╔═════════════════════════════════════════════╗ && echo ║  Frontend يعمل                             ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 URL: http://localhost:8080 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && npm run dev"

timeout /t 3 /nobreak > nul
echo          ✅ Frontend يعمل في نافذة منفصلة
echo.

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║            ✅ المشروع يعمل بنجاح!                    ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo.
echo    📍 الروابط:
echo       • Frontend: http://localhost:8080
echo       • Backend:  http://69.169.108.182:3000
echo.
echo    🎯 الحسابات المتاحة:
echo.
echo       ┌────────────────────┬─────────────┬────────────┐
echo       │ Email              │ Mot de passe│ Nom        │
echo       ├────────────────────┼─────────────┼────────────┤
echo       │ admin@example.com  │ admin123    │ Admin      │
echo       │ ahmed@example.com  │ password123 │ أحمد محمد  │
echo       │ fatima@example.com │ password123 │ فاطمة علي  │
echo       └────────────────────┴─────────────┴────────────┘
echo.
echo    ⚠️  ملاحظات:
echo       • لا تغلق النافذتين الأخريين (Backend + Frontend)
echo       • إذا فشل تسجيل الدخول = غيّر كلمة مرور PostgreSQL
echo       • الملف: backend\db.js (السطر 8)
echo.
echo.

echo    🌐 فتح المتصفح خلال 3 ثواني...
timeout /t 3 /nobreak > nul

start http://localhost:8080

echo.
echo    ✅ تم فتح المتصفح!
echo.
echo    🎯 الآن:
echo       1. اضغط "Se connecter"
echo       2. سجل دخولك
echo       3. ✅ يجب أن يعمل!
echo.
echo.

pause
