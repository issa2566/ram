const { Pool } = require('pg');

// قائمة كلمات المرور الشائعة لـ PostgreSQL
const passwords = [
  'postgres',
  'admin', 
  'password',
  '123456',
  '', // فارغة
  'root',
  'user'
];

async function testConnection() {
  console.log('🔍 اختبار الاتصال بقاعدة البيانات PostgreSQL...\n');
  
  for (const password of passwords) {
    console.log(`🔄 جاري اختبار كلمة المرور: "${password || '(فارغة)'}"`);
    
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres', // الاتصال بقاعدة البيانات الرئيسية
      password: password,
      port: 5432,
    });
    
    try {
      await pool.query('SELECT 1');
      console.log(`✅ نجح الاتصال! كلمة المرور الصحيحة: "${password || '(فارغة)'}"`);
      
      // اختبار إنشاء قاعدة البيانات
      try {
        await pool.query('CREATE DATABASE testdb');
        console.log('✅ تم إنشاء قاعدة البيانات testdb');
      } catch (error) {
        if (error.code === '42P04') {
          console.log('ℹ️ قاعدة البيانات testdb موجودة بالفعل');
        } else {
          throw error;
        }
      }
      
      await pool.end();
      
      // إنشاء ملف إعداد جديد مع كلمة المرور الصحيحة
      const dbConfig = `const { Pool } = require('pg');

// إعدادات الاتصال بقاعدة البيانات PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: '${password}',
  port: 5432,
});

// اختبار الاتصال بقاعدة البيانات
pool.on('connect', () => {
  console.log('✅ تم الاتصال بقاعدة البيانات PostgreSQL بنجاح');
});

pool.on('error', (err) => {
  console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
  process.exit(-1);
});

module.exports = pool;
`;
      
      require('fs').writeFileSync('db-fixed.js', dbConfig);
      console.log('✅ تم إنشاء ملف db-fixed.js مع كلمة المرور الصحيحة');
      
      return password;
      
    } catch (error) {
      console.log(`❌ فشل الاتصال: ${error.message}`);
      await pool.end();
    }
  }
  
  console.log('\n❌ لم يتم العثور على كلمة مرور صحيحة!');
  console.log('📋 تأكد من:');
  console.log('   1. تشغيل PostgreSQL');
  console.log('   2. صحة إعدادات الاتصال');
  console.log('   3. كلمة المرور الصحيحة');
  
  return null;
}

// تشغيل الاختبار
testConnection()
  .then((password) => {
    if (password) {
      console.log(`\n🎉 تم العثور على كلمة المرور الصحيحة: "${password || '(فارغة)'}"`);
      console.log('📝 استبدل محتوى ملف db.js بمحتوى ملف db-fixed.js');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 خطأ في الاختبار:', error);
    process.exit(1);
  });