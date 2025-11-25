@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║         🔐 اختبار تسجيل الدخول فقط                  ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.

echo    [1/3] التحقق من Backend...
cd /d "%~dp0backend"
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo          ✅ Backend يعمل
) else (
    echo          ❌ Backend لا يعمل - شغله أولاً
    echo          💡 شغل: node server.js
    pause
    exit /b 1
)
echo.

echo    [2/3] اختبار قاعدة البيانات...
if exist "test-db-connection.js" (
    echo          🔍 اختبار الاتصال بقاعدة البيانات...
    node test-db-connection.js
    if exist "db-fixed.js" (
        copy db-fixed.js db.js >nul 2>&1
        echo          ✅ تم إصلاح إعدادات قاعدة البيانات
    )
) else (
    echo          ⚠️ ملف اختبار قاعدة البيانات غير موجود
)
echo.

echo    [3/3] اختبار تسجيل الدخول...
echo          🔐 جاري اختبار تسجيل الدخول...
node -e "const fetch = require('node-fetch'); fetch('http://localhost:3000/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: 'admin@example.com', password: 'admin123'})}).then(r => r.json()).then(data => {console.log('✅ نتيجة تسجيل الدخول:'); console.log(JSON.stringify(data, null, 2)); if(data.success) console.log('🎉 تسجيل الدخول نجح!'); else console.log('❌ تسجيل الدخول فشل:', data.error);}).catch(err => console.log('❌ خطأ في الاتصال:', err.message))"
echo.

echo    📋 النتائج:
echo       • إذا ظهر "🎉 تسجيل الدخول نجح!" = المشكلة محلولة
echo       • إذا ظهر "❌ تسجيل الدخول فشل" = مشكلة في قاعدة البيانات
echo       • إذا ظهر "❌ خطأ في الاتصال" = Backend لا يعمل
echo.

pause

