const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// مستخدمين تجريبيين
const users = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123', // كلمة مرور غير مشفرة للبساطة
    is_admin: true
  },
  {
    id: 2,
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    password: 'password123',
    is_admin: false
  }
];

// Route الرئيسي
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend Server يعمل بنجاح!',
    status: 'success',
    port: PORT,
    time: new Date().toLocaleString()
  });
});

// تسجيل الدخول
app.post('/auth/login', (req, res) => {
  console.log('🔐 طلب تسجيل دخول:', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ مستخدم غير موجود:', email);
      return res.status(401).json({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    if (user.password !== password) {
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
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم'
    });
  }
});

// تسجيل مستخدم جديد
app.post('/auth/register', (req, res) => {
  console.log('📝 طلب تسجيل جديد:', req.body);
  
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'
      });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      phone: phone || '',
      address: address || '',
      is_admin: false
    };

    users.push(newUser);
    
    console.log('✅ تسجيل جديد ناجح:', email);
    
    res.json({
      success: true,
      message: 'تم تسجيل المستخدم بنجاح',
      userId: newUser.id
    });
  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error);
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
  console.log('');
  console.log('🔑 حسابات تجريبية:');
  console.log('   admin@example.com / admin123');
  console.log('   ahmed@example.com / password123');
  console.log('');
  console.log('⚠️  لا تغلق هذه النافذة!');
  console.log('');
  console.log('📊 جاهز لاستقبال الطلبات...');
});
