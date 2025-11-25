@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🔧 الحل النهائي لمشكلة "فشل في تسجيل الدخول"
echo ═══════════════════════════════════════════════════════════
echo.

echo 🛑 إيقاف جميع عمليات Node.js...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 📁 الانتقال لمجلد Backend...
cd /d "C:\Users\PC\Desktop\newprej\backend"

echo.
echo 🔧 تحديث كلمة مرور PostgreSQL...
echo.

echo 📝 كلمات المرور الشائعة:
echo    - postgres (الأكثر شيوعاً)
echo    - admin
echo    - password
echo    - (فارغة)
echo.

echo 🧪 اختبار الاتصال بقاعدة البيانات...
echo جاري تجربة كلمة مرور "postgres"...
psql -U postgres -c "SELECT version();" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ نجح الاتصال مع كلمة مرور "postgres"!
) else (
    echo ❌ فشل مع "postgres"، جاري تجربة "admin"...
    echo.
    echo 💡 إذا فشل، جرب يدوياً:
    echo    psql -U postgres
    echo    ثم أدخل كلمة المرور الصحيحة
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
    echo.
    echo 🔧 الحل اليدوي:
    echo    1. افتح psql: psql -U postgres
    echo    2. أدخل كلمة المرور الصحيحة
    echo    3. أنشئ قاعدة البيانات: CREATE DATABASE testdb;
    echo    4. اخرج: \q
    echo    5. شغل: psql -U postgres -d testdb -f database.sql
)

echo.
echo ═══════════════════════════════════════════════════════════
pause
