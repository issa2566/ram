const { Pool } = require('pg');

// إعدادات الاتصال بقاعدة البيانات PostgreSQL
// جرب كلمات مرور مختلفة
const configs = [
  {
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: 'postgres',
    port: 5432,
  },
  {
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: 'admin',
    port: 5432,
  },
  {
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: 'password',
    port: 5432,
  },
  {
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: 'mypassword',
    port: 5432,
  },
  {
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: '',
    port: 5432,
  }
];

let pool = null;

// جرب الاتصال مع كلمات مرور مختلفة
async function createConnection() {
  for (let i = 0; i < configs.length; i++) {
    try {
      console.log(`🔍 جاري تجربة كلمة المرور ${i + 1}/${configs.length}...`);
      const testPool = new Pool(configs[i]);
      
      // اختبار الاتصال
      const client = await testPool.connect();
      await client.query('SELECT 1');
      client.release();
      
      console.log(`✅ نجح الاتصال مع كلمة المرور ${i + 1}!`);
      pool = testPool;
      break;
    } catch (error) {
      console.log(`❌ فشل مع كلمة المرور ${i + 1}: ${error.message}`);
      if (i < configs.length - 1) {
        continue;
      } else {
        console.error('❌ فشل في الاتصال مع جميع كلمات المرور');
        throw new Error('لا يمكن الاتصال بقاعدة البيانات');
      }
    }
  }
  
  return pool;
}

// إنشاء الاتصال
createConnection().catch(console.error);

// معالجات الأحداث
if (pool) {
  pool.on('connect', () => {
    console.log('✅ تم الاتصال بقاعدة البيانات PostgreSQL بنجاح');
  });

  pool.on('error', (err) => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
  });
}

module.exports = pool;
