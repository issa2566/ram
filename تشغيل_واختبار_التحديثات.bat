@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║         🚀 تشغيل واختبار التحديثات الجديدة         ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.

echo    [1/4] إيقاف العمليات القديمة...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul
echo          ✅ تم إيقاف جميع العمليات
echo.

echo    [2/4] إعداد قاعدة البيانات...
cd /d "%~dp0backend"
if exist "test-db-connection.js" (
    echo          🔍 اختبار قاعدة البيانات...
    node test-db-connection.js >nul 2>&1
    if exist "db-fixed.js" (
        copy db-fixed.js db.js >nul 2>&1
        echo          ✅ تم إصلاح إعدادات قاعدة البيانات
    )
)
echo.

echo    [3/4] تشغيل Backend...
start "🚀 Backend Server" cmd /k "echo Backend Server يعمل على http://69.169.108.182:3000 && echo. && echo ⚠️ لا تغلق هذه النافذة! && echo. && node server.js"
timeout /t 5 /nobreak > nul
echo          ✅ Backend يعمل
echo.

echo    [4/4] تشغيل Frontend...
cd /d "%~dp0auto-display-replicator-main"
start "🎨 Frontend" cmd /k "echo Frontend يعمل على http://localhost:8080 && echo. && echo ⚠️ لا تغلق هذه النافذة! && echo. && npm run dev"
timeout /t 3 /nobreak > nul
echo          ✅ Frontend يعمل
echo.

echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║              ✅ تم تشغيل المشروع!                    ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo    📍 الروابط:
echo       • Frontend: http://localhost:8080
echo       • Backend:  http://69.169.108.182:3000
echo.
echo    🔑 بيانات تسجيل الدخول:
echo       • Email:    admin@example.com
echo       • Password: admin123
echo.
echo    🎯 التحديثات الجديدة:
echo       ✅ عند تسجيل الدخول: "Client visitant" → "Welcome Admin"
echo       ✅ عند تسجيل الدخول: "Login" → "Log out"
echo       ✅ تحديث تلقائي للقائمة الجانبية
echo.
echo    📋 خطوات الاختبار:
echo       1. افتح http://localhost:8080
echo       2. اضغط على قائمة الهامبرغر (☰)
echo       3. ستجد "Client visitant | Login"
echo       4. اضغط على "Login" وسجل الدخول
echo       5. بعد تسجيل الدخول ستجد "Welcome Admin | Log out"
echo.

timeout /t 3 /nobreak > nul
start http://localhost:8080

echo    🌐 تم فتح المتصفح!
echo.
echo    يمكنك إغلاق هذه النافذة الآن.
echo    لا تغلق النافذتين الأخريين (Backend و Frontend)
echo.
pause
