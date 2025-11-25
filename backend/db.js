const { Pool } = require('pg');

// إعدادات الاتصال بقاعدة البيانات PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: '123456',
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
