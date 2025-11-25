// ملف تشخيص مشكلة تسجيل الدخول
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// اختبار الاتصال بالخادم
function testServerConnection() {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000', (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// اختبار تسجيل الدخول
function testLogin() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.write(data);
    req.end();
  });
}

async function debugLogin() {
  console.log('🔍 تشخيص مشكلة تسجيل الدخول...\n');
  
  try {
    // 1. اختبار الاتصال بالخادم
    console.log('1️⃣ اختبار الاتصال بالخادم...');
    const serverTest = await testServerConnection();
    console.log(`✅ الخادم يعمل - Status: ${serverTest.status}`);
    console.log(`📄 Response: ${serverTest.body.substring(0, 100)}...\n`);
    
    // 2. اختبار تسجيل الدخول
    console.log('2️⃣ اختبار تسجيل الدخول...');
    const loginTest = await testLogin();
    console.log(`📊 Status: ${loginTest.status}`);
    console.log(`📄 Response:`, loginTest.data);
    
    if (loginTest.data.success) {
      console.log('✅ تسجيل الدخول نجح!');
    } else {
      console.log('❌ فشل تسجيل الدخول:', loginTest.data.error);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    if (error.message === 'Timeout') {
      console.log('💡 الحل: الخادم لا يستجيب - تأكد من تشغيله');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 الحل: الخادم غير مشغّل - شغّل: npm start');
    } else {
      console.log('💡 خطأ غير معروف:', error);
    }
  }
}

debugLogin();
