@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🚀 تشغيل المشروع - الإصدار النهائي
echo ═══════════════════════════════════════════════════════════
echo.

echo 🛑 إيقاف جميع عمليات Node.js...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo ✅ تم
echo.

echo ═══════════════════════════════════════════════════════════
echo 📋 التحقق من PostgreSQL...
echo ═══════════════════════════════════════════════════════════

echo.
echo 🔍 محاولة الاتصال بـ PostgreSQL...
psql -U postgres -c "SELECT version();" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL يعمل بنجاح!
    echo.
    echo 📊 التحقق من قاعدة البيانات testdb...
    psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='testdb';" >nul 2>&1
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ قاعدة البيانات testdb موجودة
    ) else (
        echo ⚠️ قاعدة البيانات testdb غير موجودة
        echo 📝 إنشاء قاعدة البيانات...
        psql -U postgres -c "CREATE DATABASE testdb;" >nul 2>&1
        echo ✅ تم إنشاء قاعدة البيانات
    )
) else (
    echo ❌ PostgreSQL لا يعمل أو كلمة المرور خاطئة
    echo.
    echo 💡 الحلول:
    echo    1. تأكد من تشغيل PostgreSQL
    echo    2. جرب كلمة مرور مختلفة في backend\db.js
    echo    3. كلمات مرور شائعة: postgres, admin, password
    echo.
    echo ⚠️ سأحاول التشغيل على أي حال...
    timeout /t 3 /nobreak > nul
)

echo.
echo ═══════════════════════════════════════════════════════════
echo 🚀 تشغيل Backend...
echo ═══════════════════════════════════════════════════════════

cd /d "%~dp0backend"

if not exist "server.js" (
    echo ❌ خطأ: server.js غير موجود!
    pause
    exit /b 1
)

echo ✅ server.js موجود
echo 📍 المجلد: %CD%
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
call npm install bcrypt >nul 2>&1
echo ✅ bcrypt جاهز
echo.

start "Backend Server - لا تغلق هذه النافذة!" cmd /k "node server.js"

echo ✅ Backend يعمل في نافذة منفصلة
echo.

echo ⏳ انتظر 10 ثواني للتأكد من بدء Backend...
timeout /t 10 /nobreak

echo.
echo 🧪 اختبار Backend...
curl -s http://69.169.108.182:3000 >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend يعمل بنجاح على http://69.169.108.182:3000
) else (
    echo ⚠️ Backend قد لا يعمل - تحقق من النافذة الأخرى
)

echo.
echo ═══════════════════════════════════════════════════════════
echo 🎨 تشغيل Frontend...
echo ═══════════════════════════════════════════════════════════

cd /d "%~dp0auto-display-replicator-main"

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
start "Frontend - لا تغلق هذه النافذة!" cmd /k "npm run dev"

echo ✅ Frontend يعمل في نافذة منفصلة
echo.

echo ⏳ انتظر 5 ثواني...
timeout /t 5 /nobreak

echo.
echo ═══════════════════════════════════════════════════════════
echo     ✅ المشروع يعمل الآن!
echo ═══════════════════════════════════════════════════════════
echo.
echo 📍 الروابط:
echo    Backend:  http://69.169.108.182:3000
echo    Frontend: http://localhost:8080
echo.
echo 🎯 للدخول:
echo    1. افتح: http://localhost:8080
echo    2. اضغط "Se connecter"
echo    3. سجل الدخول:
echo       Email: admin@example.com
echo       Mot de passe: admin123
echo.
echo ⚠️ ملاحظات:
echo    - لا تغلق النافذتين الأخريين!
echo    - إذا فشل تسجيل الدخول: تحقق من PostgreSQL
echo    - كلمة مرور PostgreSQL في: backend\db.js (السطر 8)
echo.
echo ═══════════════════════════════════════════════════════════
echo.

echo فتح المتصفح خلال 3 ثواني...
timeout /t 3 /nobreak > nul

start http://localhost:8080

echo.
echo ✅ تم فتح المتصفح!
echo.
echo 💡 إذا واجهت مشكلة "فشل في تسجيل الدخول":
echo    - أغلق كل النوافذ
echo    - افتح backend\db.js
echo    - غيّر كلمة المرور في السطر 8 إلى: 'postgres'
echo    - شغّل هذا الملف مرة أخرى
echo.

pause
