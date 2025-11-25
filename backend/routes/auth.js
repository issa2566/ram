const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// POST /auth/register - تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إدخال الاسم والبريد الإلكتروني وكلمة المرور'
      });
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني غير صحيح'
      });
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
    }
    
    // التحقق من عدم تكرار البريد الإلكتروني
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'البريد الإلكتروني مسجل بالفعل'
      });
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // إضافة المستخدم
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, address, created_at',
      [name, email, hashedPassword, phone || null, address || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في التسجيل',
      message: error.message
    });
  }
});

// POST /auth/login - تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور'
      });
    }
    
    // البحث عن المستخدم
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }
    
    const user = result.rows[0];
    
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
    
    console.log('🔍 بيانات المستخدم من قاعدة البيانات:', user);
    console.log('🔍 بيانات المستخدم المرسلة للعميل:', userWithoutPassword);
    console.log('🔍 is_admin:', user.is_admin);
    console.log('🔍 role:', user.role);
    
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في تسجيل الدخول',
      message: error.message
    });
  }
});

// GET /auth/check-email/:email - التحقق من توفر البريد الإلكتروني
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    res.status(200).json({
      success: true,
      available: result.rows.length === 0
    });
  } catch (error) {
    console.error('❌ خطأ في التحقق من البريد:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في التحقق من البريد الإلكتروني',
      message: error.message
    });
  }
});

module.exports = router;

