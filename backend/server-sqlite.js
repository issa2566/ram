const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { query, run } = require('./db-sqlite');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route الرئيسي
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend Server يعمل بنجاح!',
    status: 'success',
    database: 'SQLite',
    port: PORT,
    endpoints: {
      login: 'POST /auth/login',
      register: 'POST /auth/register',
      users: 'GET /users'
    }
  });
});

// تسجيل الدخول
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    // البحث عن المستخدم
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    const user = users[0];

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // إرجاع بيانات المستخدم (بدون كلمة المرور)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم'
    });
  }
});

// تسجيل مستخدم جديد
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'
      });
    }

    // التحقق من وجود المستخدم
    const existingUsers = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إدراج المستخدم الجديد
    const result = await run(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || '', address || '']
    );

    res.json({
      success: true,
      message: 'تم تسجيل المستخدم بنجاح',
      userId: result.id
    });

  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم'
    });
  }
});

// الحصول على جميع المستخدمين
app.get('/users', async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, phone, address, is_admin, created_at FROM users');
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم'
    });
  }
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
  console.log('🔑 حسابات تجريبية:');
  console.log('   admin@example.com / admin123');
  console.log('   ahmed@example.com / password123');
  console.log('   fatima@example.com / password123');
  console.log('');
  console.log('⚠️  لا تغلق هذه النافذة!');
});
