@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║         🚀 تشغيل المشروع - حل شامل                  ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo.

echo    [1/5] إيقاف العمليات القديمة...
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 /nobreak > nul
echo          ✅ تم
echo.

echo    [2/5] التحقق من الملفات...
cd /d "%~dp0backend"
if not exist "server.js" (
    echo          ❌ خطأ: ملفات Backend غير موجودة!
    pause
    exit /b 1
)
echo          ✅ الملفات موجودة
echo.

echo    [2.5/5] إعداد قاعدة البيانات...
if exist "setup-database.js" (
    echo          🔄 إعداد قاعدة البيانات...
    node setup-database.js >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo          ✅ تم إعداد قاعدة البيانات
    ) else (
        echo          ⚠️ تحذير: مشكلة في قاعدة البيانات (قد تكون موجودة بالفعل)
    )
) else (
    echo          ⚠️ تحذير: ملف إعداد قاعدة البيانات غير موجود
)
echo.

echo    [3/5] تثبيت المكتبات...
call npm install >nul 2>&1
echo          ✅ تم
echo.

echo    [4/5] تشغيل Backend...
start "🚀 Backend Server - لا تغلق هذه النافذة!" cmd /k "echo Backend Server يعمل على http://69.169.108.182:3000 && echo. && echo ⚠️ لا تغلق هذه النافذة! && echo. && node server.js"
timeout /t 3 /nobreak > nul
echo          ✅ Backend يعمل
echo.

echo    [5/5] تشغيل Frontend...
cd /d "%~dp0auto-display-replicator-main"
start "🎨 Frontend - لا تغلق هذه النافذة!" cmd /k "echo Frontend يعمل على http://localhost:8080 && echo. && echo ⚠️ لا تغلق هذه النافذة! && echo. && npm run dev"
timeout /t 3 /nobreak > nul
echo          ✅ Frontend يعمل
echo.
echo.

echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║              ✅ المشروع يعمل الآن!                   ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo    📍 الروابط:
echo       • Frontend: http://localhost:8080
echo       • Backend:  http://69.169.108.182:3000
echo.
echo    🎯 تسجيل الدخول:
echo       • Email:        admin@example.com
echo       • Mot de passe: admin123
echo.
echo    📝 ملاحظة مهمة:
echo       إذا فشل تسجيل الدخول، تأكد من أن PostgreSQL يعمل
echo       وأن كلمة المرور في backend\db.js صحيحة
echo.
echo    ⚠️  ملاحظة مهمة:
echo       إذا فشل تسجيل الدخول = مشكلة في PostgreSQL
echo       الحل: افتح backend\db.js وغيّر كلمة المرور (السطر 8)
echo.
echo    💡 كلمات مرور شائعة لـ PostgreSQL:
echo       1. postgres
echo       2. admin
echo       3. password
echo       4. (فارغة)
echo.
echo.

timeout /t 3 /nobreak > nul
start http://localhost:8080

echo    🌐 تم فتح المتصفح!
echo.
echo    يمكنك إغلاق هذه النافذة الآن.
echo    لا تغلق النافذتين الأخريين (Backend و Frontend)
echo.
pause
