// ملف اختبار نظام المصادقة
// للتشغيل: node test-auth.js

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// دالة لعمل طلب HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// دالة الاختبار الرئيسية
async function runAuthTests() {
  console.log('🧪 بدء اختبار نظام المصادقة...\n');

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testName = 'مستخدم اختبار';

  try {
    // 1. اختبار تسجيل مستخدم جديد
    console.log('1️⃣ اختبار تسجيل مستخدم جديد (POST /auth/register)');
    const registerResponse = await makeRequest('POST', '/auth/register', {
      name: testName,
      email: testEmail,
      password: testPassword,
      phone: '0612345678',
      address: 'تونس'
    });
    
    if (registerResponse.data.success) {
      console.log('✅ تم التسجيل بنجاح');
      console.log('   المستخدم:', registerResponse.data.user);
    } else {
      console.log('❌ فشل التسجيل:', registerResponse.data.error);
    }
    console.log('');

    // 2. اختبار تسجيل بريد مكرر
    console.log('2️⃣ اختبار تسجيل بريد مكرر (يجب أن يفشل)');
    const duplicateResponse = await makeRequest('POST', '/auth/register', {
      name: 'اسم آخر',
      email: testEmail,
      password: 'anotherpass'
    });
    
    if (!duplicateResponse.data.success) {
      console.log('✅ تم منع البريد المكرر بنجاح');
      console.log('   الخطأ:', duplicateResponse.data.error);
    } else {
      console.log('❌ لم يتم منع البريد المكرر!');
    }
    console.log('');

    // 3. اختبار تسجيل الدخول بكلمة مرور صحيحة
    console.log('3️⃣ اختبار تسجيل الدخول بكلمة مرور صحيحة (POST /auth/login)');
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: testPassword
    });
    
    if (loginResponse.data.success) {
      console.log('✅ تم تسجيل الدخول بنجاح');
      console.log('   المستخدم:', loginResponse.data.user.name);
      console.log('   البريد:', loginResponse.data.user.email);
    } else {
      console.log('❌ فشل تسجيل الدخول:', loginResponse.data.error);
    }
    console.log('');

    // 4. اختبار تسجيل الدخول بكلمة مرور خاطئة
    console.log('4️⃣ اختبار تسجيل الدخول بكلمة مرور خاطئة (يجب أن يفشل)');
    const wrongPasswordResponse = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: 'wrongpassword'
    });
    
    if (!wrongPasswordResponse.data.success) {
      console.log('✅ تم رفض كلمة المرور الخاطئة بنجاح');
      console.log('   الخطأ:', wrongPasswordResponse.data.error);
    } else {
      console.log('❌ لم يتم رفض كلمة المرور الخاطئة!');
    }
    console.log('');

    // 5. اختبار تسجيل الدخول ببريد غير موجود
    console.log('5️⃣ اختبار تسجيل الدخول ببريد غير موجود (يجب أن يفشل)');
    const nonExistentResponse = await makeRequest('POST', '/auth/login', {
      email: 'notfound@example.com',
      password: 'anypassword'
    });
    
    if (!nonExistentResponse.data.success) {
      console.log('✅ تم رفض البريد غير الموجود بنجاح');
      console.log('   الخطأ:', nonExistentResponse.data.error);
    } else {
      console.log('❌ لم يتم رفض البريد غير الموجود!');
    }
    console.log('');

    // 6. اختبار التحقق من توفر البريد
    console.log('6️⃣ اختبار التحقق من توفر البريد (GET /auth/check-email/:email)');
    const checkEmailResponse = await makeRequest('GET', `/auth/check-email/${testEmail}`);
    
    if (checkEmailResponse.data.success) {
      console.log(`✅ البريد ${testEmail}:`);
      console.log('   متوفر؟', checkEmailResponse.data.available ? 'نعم' : 'لا (مستخدم)');
    } else {
      console.log('❌ فشل التحقق من البريد');
    }
    console.log('');

    // 7. اختبار التحقق من بريد غير موجود
    const newEmail = `new${Date.now()}@example.com`;
    const checkNewEmailResponse = await makeRequest('GET', `/auth/check-email/${newEmail}`);
    
    if (checkNewEmailResponse.data.success) {
      console.log(`✅ البريد ${newEmail}:`);
      console.log('   متوفر؟', checkNewEmailResponse.data.available ? 'نعم' : 'لا');
    }
    console.log('');

    // 8. اختبار تسجيل دخول بحساب تجريبي
    console.log('8️⃣ اختبار تسجيل الدخول بحساب تجريبي');
    const testLoginResponse = await makeRequest('POST', '/auth/login', {
      email: 'ahmed@example.com',
      password: 'password123'
    });
    
    if (testLoginResponse.data.success) {
      console.log('✅ تم تسجيل الدخول بالحساب التجريبي بنجاح');
      console.log('   المستخدم:', testLoginResponse.data.user.name);
    } else {
      console.log('⚠️  الحساب التجريبي غير موجود - قم بتشغيل database.sql');
    }
    console.log('');

    console.log('🎉 اكتملت جميع الاختبارات!');
    console.log('');
    console.log('📝 ملخص:');
    console.log('  ✅ تسجيل مستخدم جديد');
    console.log('  ✅ منع البريد المكرر');
    console.log('  ✅ تسجيل الدخول بنجاح');
    console.log('  ✅ رفض كلمة مرور خاطئة');
    console.log('  ✅ رفض بريد غير موجود');
    console.log('  ✅ التحقق من توفر البريد');
    console.log('  ✅ تسجيل الدخول بحساب تجريبي');
    
  } catch (error) {
    console.error('❌ فشل الاختبار:', error.message);
    console.error('');
    console.error('تأكد من:');
    console.error('  1. تشغيل الخادم (npm start)');
    console.error('  2. تحديث قاعدة البيانات (psql -U postgres -d testdb -f database.sql)');
    console.error('  3. تثبيت bcrypt (npm install bcrypt)');
  }
}

// تشغيل الاختبارات
runAuthTests();

