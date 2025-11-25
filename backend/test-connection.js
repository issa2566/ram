const { Pool } = require('pg');

// جرب كلمات مرور مختلفة
const passwords = ['postgres', 'admin', 'password', ''];

async function testConnection() {
  for (const password of passwords) {
    console.log(`\n🔍 جاري اختبار كلمة المرور: "${password}"`);
    
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'testdb',
      password: password,
      port: 5432,
    });

    try {
      const client = await pool.connect();
      console.log(`✅ نجح الاتصال بكلمة المرور: "${password}"`);
      
      // اختبار جدول users
      const result = await client.query('SELECT COUNT(*) FROM users');
      console.log(`📊 عدد المستخدمين في قاعدة البيانات: ${result.rows[0].count}`);
      
      // عرض المستخدمين
      const users = await client.query('SELECT email, name FROM users LIMIT 3');
      console.log('👥 المستخدمون:');
      users.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`);
      });
      
      client.release();
      await pool.end();
      
      console.log(`\n🎉 كلمة المرور الصحيحة هي: "${password}"`);
      console.log('💡 انسخ هذه الكلمة إلى backend/db.js');
      
      return password;
    } catch (error) {
      console.log(`❌ فشل مع كلمة المرور: "${password}"`);
      console.log(`   الخطأ: ${error.message}`);
      await pool.end();
    }
  }
  
  console.log('\n❌ لم تنجح أي كلمة مرور!');
  console.log('💡 تأكد من:');
  console.log('   1. PostgreSQL يعمل');
  console.log('   2. قاعدة البيانات testdb موجودة');
  console.log('   3. جدول users موجود');
  
  return null;
}

testConnection().then(workingPassword => {
  if (workingPassword) {
    console.log(`\n🔧 لتحديث db.js: استبدل السطر 8 بـ:`);
    console.log(`   password: '${workingPassword}',`);
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
});
