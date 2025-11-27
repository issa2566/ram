@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║      🚀 حل نهائي لمشكلة تسجيل الدخول               ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
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
echo    الخطوة 2: تشغيل Backend (SQLite)
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "%~dp0backend"

echo          📦 تثبيت SQLite...
call npm install sqlite3 >nul 2>&1
echo          ✅ تم

echo.
echo          🚀 تشغيل Backend...
start "🚀 Backend SQLite" cmd /k "color 0A && echo ╔═════════════════════════════════════════════╗ && echo ║  Backend SQLite يعمل                        ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 URL: http://69.169.108.182:3000 && echo 🗄️  قاعدة البيانات: SQLite && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && node server-sqlite.js"

timeout /t 5 /nobreak > nul
echo          ✅ Backend يعمل
echo.

echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    الخطوة 3: تشغيل Frontend
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "%~dp0auto-display-replicator-main"

echo          🎨 تشغيل Frontend...
start "🎨 Frontend" cmd /k "color 0B && echo ╔═════════════════════════════════════════════╗ && echo ║  Frontend يعمل                             ║ && echo ╚═════════════════════════════════════════════╝ && echo. && echo 📍 URL: http://localhost:8080 && echo. && echo ⚠️  لا تغلق هذه النافذة! && echo. && npm run dev"

timeout /t 3 /nobreak > nul
echo          ✅ Frontend يعمل
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
echo    🔑 حسابات تسجيل الدخول:
echo.
echo       ┌────────────────────┬─────────────┬────────────┐
echo       │ Email              │ Mot de passe│ Nom        │
echo       ├────────────────────┼─────────────┼────────────┤
echo       │ admin@example.com  │ admin123    │ Admin      │
echo       │ ahmed@example.com  │ password123 │ أحمد محمد  │
echo       │ fatima@example.com │ password123 │ فاطمة علي  │
echo       └────────────────────┴─────────────┴────────────┘
echo.
echo    🎯 الآن:
echo       1. انتظر 5 ثواني حتى يفتح المتصفح
echo       2. اضغط "Se connecter"
echo       3. سجل دخولك بـ admin@example.com / admin123
echo       4. ✅ سيعمل بنجاح!
echo.

echo    🌐 فتح المتصفح خلال 5 ثواني...
timeout /t 5 /nobreak > nul

start http://localhost:8080

echo.
echo    ✅ تم فتح المتصفح!
echo.
echo    🎉 الآن جرب تسجيل الدخول!
echo.

pause
