const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// إعدادات الاتصال بقاعدة البيانات PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // الاتصال بقاعدة البيانات الرئيسية أولاً
  password: 'postgres',
  port: 5432,
});

async function setupDatabase() {
  try {
    console.log('🔄 بدء إعداد قاعدة البيانات...');
    
    // إنشاء قاعدة البيانات إذا لم تكن موجودة
    await pool.query('CREATE DATABASE testdb');
    console.log('✅ تم إنشاء قاعدة البيانات testdb');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️ قاعدة البيانات testdb موجودة بالفعل');
    } else {
      console.error('❌ خطأ في إنشاء قاعدة البيانات:', error.message);
      throw error;
    }
  }
  
  // إغلاق الاتصال الحالي
  await pool.end();
  
  // الاتصال بقاعدة البيانات الجديدة
  const newPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: 'postgres',
    port: 5432,
  });
  
  try {
    // قراءة ملف SQL وتنفيذه
    const sqlFile = path.join(__dirname, 'database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // تقسيم المحتوى إلى استعلامات منفصلة
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          await newPool.query(query);
          console.log('✅ تم تنفيذ الاستعلام بنجاح');
        } catch (error) {
          if (error.code !== '23505') { // تجاهل خطأ التكرار
            console.error('❌ خطأ في تنفيذ الاستعلام:', error.message);
          }
        }
      }
    }
    
    console.log('✅ تم إعداد قاعدة البيانات بنجاح!');
    console.log('📧 بيانات تسجيل الدخول:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error.message);
    throw error;
  } finally {
    await newPool.end();
  }
}

// تشغيل الإعداد
setupDatabase()
  .then(() => {
    console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 فشل في إعداد قاعدة البيانات:', error);
    process.exit(1);
  });

