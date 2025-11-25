const pool = require('./db');
const bcrypt = require('bcrypt');

async function fixPasswords() {
  try {
    console.log('🔧 جاري تصحيح كلمات المرور...\n');

    // كلمات المرور التي نريد تشفيرها
    const users = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'ahmed@example.com', password: 'password123' },
      { email: 'fatima@example.com', password: 'password123' },
      { email: 'mahmoud@example.com', password: 'password123' }
    ];

    for (const user of users) {
      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // تحديث كلمة المرور في قاعدة البيانات
      await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, user.email]
      );
      
      console.log(`✅ تم تحديث كلمة المرور لـ: ${user.email}`);
    }

    console.log('\n✅ تم تشفير جميع كلمات المرور بنجاح!');
    console.log('\n📋 يمكنك الآن تسجيل الدخول بـ:');
    console.log('   Email: admin@example.com');
    console.log('   Mot de passe: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error('\n💡 تأكد من:');
    console.error('   1. PostgreSQL يعمل');
    console.error('   2. قاعدة البيانات testdb موجودة');
    console.error('   3. جدول users موجود');
    console.error('   4. كلمة المرور في db.js صحيحة');
    process.exit(1);
  }
}

fixPasswords();
