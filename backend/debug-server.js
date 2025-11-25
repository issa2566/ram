const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إنشاء قاعدة البيانات
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// إنشاء جدول المستخدمين
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // إدراج مستخدم تجريبي
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(
    'INSERT OR IGNORE INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
    ['Admin', 'admin@example.com', hashedPassword, 1]
  );
});

// Route الرئيسي
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend Server يعمل بنجاح!',
    status: 'success',
    database: 'SQLite',
    port: PORT,
    time: new Date().toLocaleString()
  });
});

// تسجيل الدخول
app.post('/auth/login', (req, res) => {
  console.log('🔐 طلب تسجيل دخول:', req.body);
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'البريد الإلكتروني وكلمة المرور مطلوبان'
    });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('❌ خطأ في قاعدة البيانات:', err);
      return res.status(500).json({
        success: false,
        error: 'خطأ في الخادم'
      });
    }

    if (!user) {
      console.log('❌ مستخدم غير موجود:', email);
      return res.status(401).json({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ كلمة مرور خاطئة للمستخدم:', email);
      return res.status(401).json({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    console.log('✅ تسجيل دخول ناجح:', email);
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword
    });
  });
});

// تسجيل مستخدم جديد
app.post('/auth/register', (req, res) => {
  console.log('📝 طلب تسجيل جديد:', req.body);
  
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, phone || '', address || ''],
    function(err) {
      if (err) {
        console.error('❌ خطأ في التسجيل:', err);
        return res.status(400).json({
          success: false,
          error: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }

      console.log('✅ تسجيل جديد ناجح:', email);
      
      res.json({
        success: true,
        message: 'تم تسجيل المستخدم بنجاح',
        userId: this.lastID
      });
    }
  );
});

// بدء الخادم
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║        🚀 Backend Server يعمل بنجاح!                ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('🗄️  قاعدة البيانات: SQLite');
  console.log('');
  console.log('🔑 حساب تجريبي:');
  console.log('   admin@example.com / admin123');
  console.log('');
  console.log('⚠️  لا تغلق هذه النافذة!');
  console.log('');
  console.log('📊 جاهز لاستقبال الطلبات...');
});
