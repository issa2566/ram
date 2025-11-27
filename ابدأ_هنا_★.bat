@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║      🚀 حل مشكلة تسجيل الدخول - نهائي               ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo 🛑 إيقاف العمليات القديمة...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul
echo ✅ تم

echo.
echo 🚀 تشغيل Backend...
cd /d "%~dp0backend"
start "Backend" cmd /k "echo ╔═════════════════════════════════════════════╗ && echo ║  Backend يعمل                               ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 http://69.169.108.182:3000 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && npm install sqlite3 && node server-sqlite.js"

echo ⏳ انتظار 8 ثواني...
timeout /t 8 /nobreak > nul

echo.
echo 🎨 تشغيل Frontend...
cd /d "%~dp0auto-display-replicator-main"
start "Frontend" cmd /k "echo ╔═════════════════════════════════════════════╗ && echo ║  Frontend يعمل                             ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 http://localhost:8080 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && npm run dev"

echo ⏳ انتظار 5 ثواني...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 فتح المتصفح...
start http://localhost:8080

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
echo 🎯 الآن:
echo    1. اضغط "Se connecter"
echo    2. أدخل البيانات أعلاه
echo    3. اضغط "SE CONNECTER"
echo    4. ✅ سيعمل!
echo.

pause
