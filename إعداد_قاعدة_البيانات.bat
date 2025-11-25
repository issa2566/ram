@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║         🗄️ إعداد قاعدة البيانات PostgreSQL          ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.

echo    [1/3] التحقق من PostgreSQL...
cd /d "%~dp0backend"
if not exist "setup-database.js" (
    echo          ❌ خطأ: ملف إعداد قاعدة البيانات غير موجود!
    pause
    exit /b 1
)
echo          ✅ الملف موجود

echo.
echo    [2/3] تثبيت المكتبات...
call npm install >nul 2>&1
echo          ✅ تم

echo.
echo    [3/3] إعداد قاعدة البيانات...
node setup-database.js
echo.

if %ERRORLEVEL% EQU 0 (
    echo    ╔═══════════════════════════════════════════════════════╗
    echo    ║                                                       ║
    echo    ║              ✅ تم إعداد قاعدة البيانات!            ║
    echo    ║                                                       ║
    echo    ╚═══════════════════════════════════════════════════════╝
    echo.
    echo    📧 بيانات تسجيل الدخول:
    echo       • Email:    admin@example.com
    echo       • Password: admin123
    echo.
    echo    🚀 يمكنك الآن تشغيل المشروع!
    echo.
) else (
    echo    ❌ فشل في إعداد قاعدة البيانات!
    echo    تأكد من أن PostgreSQL يعمل وأن كلمة المرور صحيحة.
    echo.
)

pause

