// ملف اختبار بسيط للـ API
// للتشغيل: node test-api.js

const http = require('http');

const BASE_URL = 'http://69.169.108.182:3000';

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
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
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
async function runTests() {
  console.log('🧪 بدء اختبار الـ API...\n');

  try {
    // 1. اختبار الصفحة الرئيسية
    console.log('1️⃣ اختبار الصفحة الرئيسية (GET /)');
    const home = await makeRequest('GET', '/');
    console.log('✅ النتيجة:', home.message);
    console.log('');

    // 2. اختبار جلب جميع المستخدمين
    console.log('2️⃣ اختبار جلب جميع المستخدمين (GET /users)');
    const users = await makeRequest('GET', '/users');
    console.log(`✅ تم جلب ${users.count} مستخدم`);
    console.log('المستخدمون:', users.data);
    console.log('');

    // 3. اختبار إضافة مستخدم جديد
    console.log('3️⃣ اختبار إضافة مستخدم جديد (POST /users)');
    const newUser = await makeRequest('POST', '/users', {
      name: 'مستخدم تجريبي',
      email: `test${Date.now()}@example.com`
    });
    console.log('✅ تم إضافة المستخدم:', newUser.data);
    const userId = newUser.data.id;
    console.log('');

    // 4. اختبار جلب مستخدم واحد
    console.log(`4️⃣ اختبار جلب مستخدم واحد (GET /users/${userId})`);
    const singleUser = await makeRequest('GET', `/users/${userId}`);
    console.log('✅ بيانات المستخدم:', singleUser.data);
    console.log('');

    // 5. اختبار تعديل المستخدم
    console.log(`5️⃣ اختبار تعديل المستخدم (PUT /users/${userId})`);
    const updatedUser = await makeRequest('PUT', `/users/${userId}`, {
      name: 'مستخدم محدث',
      email: `updated${Date.now()}@example.com`
    });
    console.log('✅ تم تحديث المستخدم:', updatedUser.data);
    console.log('');

    // 6. اختبار حذف المستخدم
    console.log(`6️⃣ اختبار حذف المستخدم (DELETE /users/${userId})`);
    const deletedUser = await makeRequest('DELETE', `/users/${userId}`);
    console.log('✅ تم حذف المستخدم:', deletedUser.message);
    console.log('');

    console.log('🎉 جميع الاختبارات نجحت!');
    
  } catch (error) {
    console.error('❌ فشل الاختبار:', error.message);
    console.error('تأكد من أن الخادم يعمل على المنفذ 3000');
    console.error('شغل الخادم بالأمر: npm start');
  }
}

// تشغيل الاختبارات
runTests();

