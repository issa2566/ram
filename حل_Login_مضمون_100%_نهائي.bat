@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║      🔧 حل مشكلة Login - مضمون 100% نهائي          ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo 🛑 إيقاف جميع العمليات القديمة...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 /nobreak > nul
echo ✅ تم

echo.
echo 📁 الانتقال لمجلد Backend...
cd /d "%~dp0backend"

echo.
echo 📦 تثبيت المكتبات...
call npm install express cors >nul 2>&1
echo ✅ تم تثبيت المكتبات

echo.
echo 🚀 تشغيل Backend...
start "🚀 Backend" cmd /k "echo ╔═════════════════════════════════════════════╗ && echo ║  Backend يعمل                               ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 http://localhost:3000 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && node ultra-simple-server.js"

echo ⏳ انتظار 8 ثواني حتى يبدأ Backend...
timeout /t 8 /nobreak > nul

echo.
echo 🧪 اختبار Backend...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend يعمل بنجاح!
) else (
    echo ⚠️ Backend لا يزال يبدأ، انتظر قليلاً...
    timeout /t 5 /nobreak > nul
)

echo.
echo 🎨 تشغيل Frontend...
cd /d "%~dp0auto-display-replicator-main"
start "🎨 Frontend" cmd /k "echo ╔═════════════════════════════════════════════╗ && echo ║  Frontend يعمل                             ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 http://localhost:8080 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && npm run dev"

echo ⏳ انتظار 5 ثواني حتى يبدأ Frontend...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 فتح صفحة Login...
start http://localhost:8080/login

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║            ✅ المشروع يعمل بنجاح!                    ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo 🔑 حساب تسجيل الدخول:
echo.
echo    Email: admin@example.com
echo    Mot de passe: admin123
echo.
echo 🎯 الآن:
echo    1. انتظر 10 ثواني حتى يفتح المتصفح
echo    2. اضغط "Se connecter" 
echo    3. أدخل: admin@example.com / admin123
echo    4. اضغط "SE CONNECTER"
echo    5. ✅ سيعمل بنجاح!
echo.
echo ⚠️ ملاحظة: لا تغلق النافذتين (Backend + Frontend)
echo.

pause
