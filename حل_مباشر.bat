@echo off
chcp 65001 > nul
cls

echo 🚀 تشغيل المشروع...

REM تنظيف العمليات القديمة
taskkill /f /im node.exe >nul 2>&1

REM تشغيل Backend
cd /d "%~dp0backend"
start "Backend" cmd /k "npm install sqlite3 && node server-sqlite.js"

REM انتظار 5 ثواني
timeout /t 5 /nobreak > nul

REM تشغيل Frontend
cd /d "%~dp0auto-display-replicator-main"
start "Frontend" cmd /k "npm run dev"

REM انتظار 3 ثواني
timeout /t 3 /nobreak > nul

REM فتح المتصفح
start http://localhost:8080

echo ✅ تم تشغيل المشروع!
echo.
echo 🔑 تسجيل الدخول:
echo    Email: admin@example.com
echo    Mot de passe: admin123
echo.
pause
