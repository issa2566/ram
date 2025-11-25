const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// إعدادات الاتصال
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // الاتصال بقاعدة البيانات الرئيسية أولاً
  password: '', // كلمة مرور فارغة
  port: 5432,
});

async function createFreshDatabase() {
  try {
    console.log('🔧 إنشاء قاعدة بيانات جديدة...\n');

    // إنشاء قاعدة البيانات
    await pool.query('DROP DATABASE IF EXISTS testdb');
    await pool.query('CREATE DATABASE testdb');
    console.log('✅ تم إنشاء قاعدة البيانات testdb');

    // الاتصال بقاعدة البيانات الجديدة
    await pool.end();
    
    const newPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'testdb',
      password: '',
      port: 5432,
    });

    // إنشاء جدول المستخدمين
    await newPool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ تم إنشاء جدول users');

    // تشفير كلمات المرور وإدراجها
    const users = [
      { name: 'Admin', email: 'admin@example.com', password: 'admin123', is_admin: true },
      { name: 'أحمد محمد', email: 'ahmed@example.com', password: 'password123', is_admin: false },
      { name: 'فاطمة علي', email: 'fatima@example.com', password: 'password123', is_admin: false }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await newPool.query(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
        [user.name, user.email, hashedPassword, user.is_admin]
      );
      
      console.log(`✅ تم إضافة المستخدم: ${user.email}`);
    }

    // التحقق من البيانات
    const result = await newPool.query('SELECT email, name, is_admin FROM users');
    console.log('\n📋 المستخدمون في قاعدة البيانات:');
    result.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - ${user.is_admin ? 'Admin' : 'User'}`);
    });

    await newPool.end();
    
    console.log('\n🎉 تم إنشاء قاعدة البيانات بنجاح!');
    console.log('\n🔑 كلمات المرور:');
    console.log('   admin@example.com / admin123');
    console.log('   ahmed@example.com / password123');
    console.log('   fatima@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.log('\n💡 جرب كلمات مرور أخرى:');
    console.log('   1. افتح backend/db.js');
    console.log('   2. غيّر السطر 8 إلى: password: "postgres"');
    console.log('   3. أو: password: "admin"');
    console.log('   4. أو: password: "password"');
    process.exit(1);
  }
}

createFreshDatabase();
