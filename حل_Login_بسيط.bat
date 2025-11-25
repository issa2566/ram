@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║      🔧 حل مشكلة Login - بسيط وسريع                 ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo 🛑 إيقاف العمليات القديمة...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo.
echo 📁 الانتقال لمجلد Backend...
cd /d "%~dp0backend"

echo.
echo 📦 تثبيت المكتبات...
call npm install sqlite3 bcrypt express body-parser cors >nul 2>&1
echo ✅ تم

echo.
echo 🚀 تشغيل Backend...
start "Backend" cmd /k "echo ╔═════════════════════════════════════════════╗ && echo ║  Backend يعمل                               ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 http://localhost:3000 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && node debug-server.js"

echo ⏳ انتظار 10 ثواني...
timeout /t 10 /nobreak > nul

echo.
echo 🎨 تشغيل Frontend...
cd /d "%~dp0auto-display-replicator-main"
start "Frontend" cmd /k "echo ╔═════════════════════════════════════════════╗ && echo ║  Frontend يعمل                             ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 http://localhost:8080 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && npm run dev"

echo ⏳ انتظار 5 ثواني...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 فتح المتصفح...
start http://localhost:8080/login

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║            ✅ المشروع يعمل بنجاح!                    ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo 🔑 تسجيل الدخول:
echo    Email: admin@example.com
echo    Mot de passe: admin123
echo.
echo 🎯 الآن جرب تسجيل الدخول!
echo.

pause
