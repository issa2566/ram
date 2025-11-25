@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🔧 حل مشكلة "فشل في تسجيل الدخول"
echo ═══════════════════════════════════════════════════════════
echo.

echo 🛑 إيقاف جميع عمليات Node.js...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 📁 الانتقال لمجلد Backend...
cd /d "C:\Users\PC\Desktop\newprej\backend"

echo.
echo 🔧 تشخيص مشكلة قاعدة البيانات...
echo.

echo 📋 كلمات المرور الشائعة لـ PostgreSQL:
echo    - postgres
echo    - admin
echo    - password
echo    - (فارغة)
echo.

echo 🧪 اختبار الاتصال بقاعدة البيانات...
psql -U postgres -c "SELECT version();" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL يعمل!
) else (
    echo ❌ مشكلة في PostgreSQL
    echo.
    echo 💡 الحلول:
    echo    1. تأكد من تشغيل PostgreSQL
    echo    2. جرب كلمة مرور مختلفة
    echo    3. أعد تعيين كلمة مرور PostgreSQL
)

echo.
echo 📦 تثبيت المكتبات...
call npm install

echo.
echo 🔧 تثبيت bcrypt...
call npm install bcrypt

echo.
echo 🚀 تشغيل الخادم...
echo ═══════════════════════════════════════════════════════════
echo.

start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ انتظر 10 ثواني حتى يبدأ الخادم...
timeout /t 10 /nobreak > nul

echo.
echo 🧪 اختبار الخادم...
curl http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ الخادم يعمل بنجاح!
    echo.
    echo 🎯 الآن يمكنك:
    echo    1. فتح المتصفح على: http://localhost:8080
    echo    2. الضغط على "Se connecter"
    echo    3. تسجيل الدخول بـ:
    echo       Email: admin@example.com
    echo       Mot de passe: admin123
    echo.
    echo ✅ المشكلة محلولة!
) else (
    echo ❌ الخادم لا يعمل
    echo.
    echo 💡 تحقق من:
    echo    - تشغيل PostgreSQL
    echo    - كلمة مرور PostgreSQL صحيحة
    echo    - قاعدة البيانات testdb موجودة
)

echo.
echo ═══════════════════════════════════════════════════════════
pause
