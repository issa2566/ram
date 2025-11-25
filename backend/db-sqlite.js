const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// مسار قاعدة البيانات
const dbPath = path.join(__dirname, 'database.sqlite');

// إنشاء اتصال قاعدة البيانات
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات SQLite:', err.message);
  } else {
    console.log('✅ تم الاتصال بقاعدة البيانات SQLite بنجاح');
    initDatabase();
  }
});

// تهيئة قاعدة البيانات
function initDatabase() {
  // إنشاء جدول المستخدمين
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ خطأ في إنشاء جدول users:', err.message);
    } else {
      console.log('✅ تم إنشاء/التحقق من جدول users');
      insertDefaultUsers();
    }
  });
}

// إدراج المستخدمين الافتراضيين
async function insertDefaultUsers() {
  const users = [
    { name: 'Admin', email: 'admin@example.com', password: 'admin123', is_admin: 1 },
    { name: 'أحمد محمد', email: 'ahmed@example.com', password: 'password123', is_admin: 0 },
    { name: 'فاطمة علي', email: 'fatima@example.com', password: 'password123', is_admin: 0 }
  ];

  for (const user of users) {
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    // إدراج المستخدم
    db.run(
      'INSERT OR IGNORE INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [user.name, user.email, hashedPassword, user.is_admin],
      function(err) {
        if (err) {
          console.error(`❌ خطأ في إدراج ${user.email}:`, err.message);
        } else {
          console.log(`✅ تم إدراج المستخدم: ${user.email}`);
        }
      }
    );
  }
}

// دالة للاستعلامات
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// دالة للاستعلامات التي تعدل البيانات
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

module.exports = { db, query, run };
