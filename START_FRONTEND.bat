@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🎨 تشغيل Frontend (واجهة المستخدم)
echo ═══════════════════════════════════════════════════════════
echo.

echo 📁 الانتقال لمجلد Frontend...
cd /d "%~dp0\auto-display-replicator-main"

echo.
echo 📦 التحقق من المكتبات...
if not exist "node_modules" (
    echo 📥 تثبيت المكتبات...
    call npm install
) else (
    echo ✅ المكتبات موجودة
)

echo.
echo 🚀 تشغيل Frontend...
echo ═══════════════════════════════════════════════════════════
echo.
echo 📍 رابط التطبيق: http://localhost:8080
echo.
echo ⚠️  لا تغلق هذه النافذة!
echo.
echo ═══════════════════════════════════════════════════════════
echo.

call npm run dev

pause
