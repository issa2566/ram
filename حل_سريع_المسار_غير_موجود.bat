@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🔧 حل مشكلة "المسار غير موجود" - تشغيل سريع
echo ═══════════════════════════════════════════════════════════
echo.

echo 🚀 تشغيل Backend...
cd /d "C:\Users\PC\Desktop\newprej\backend"
start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ انتظر 5 ثواني حتى يبدأ الخادم...
timeout /t 5 /nobreak > nul

echo.
echo 🧪 اختبار الخادم...
curl http://localhost:3000 > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ الخادم يعمل بنجاح!
) else (
    echo ❌ الخادم لا يعمل، جاري المحاولة مرة أخرى...
    timeout /t 3 /nobreak > nul
)

echo.
echo 🎯 الآن يمكنك:
echo    1. فتح المتصفح على: http://localhost:8080
echo    2. الضغط على "Se connecter"
echo    3. تسجيل الدخول بـ:
echo       Email: admin@example.com
echo       Mot de passe: admin123
echo.

echo ═══════════════════════════════════════════════════════════
echo ✅ تم تشغيل Backend! الآن جرب تسجيل الدخول
echo ═══════════════════════════════════════════════════════════
echo.

pause
