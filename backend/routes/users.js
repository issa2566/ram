const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /users - عرض جميع المستخدمين
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدمين:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب المستخدمين',
      message: error.message
    });
  }
});

// GET /users/:id - عرض مستخدم واحد حسب ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدم:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب المستخدم',
      message: error.message
    });
  }
});

// POST /users - إضافة مستخدم جديد
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إدخال الاسم والبريد الإلكتروني'
      });
    }
    
    // التحقق من عدم تكرار البريد الإلكتروني
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة المستخدم بنجاح',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ خطأ في إضافة المستخدم:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في إضافة المستخدم',
      message: error.message
    });
  }
});

// PUT /users/:id - تعديل مستخدم حسب ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إدخال البيانات المراد تعديلها'
      });
    }
    
    // التحقق من وجود المستخدم
    const checkUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    // التحقق من عدم تكرار البريد الإلكتروني إذا تم تعديله
    if (email) {
      const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (checkEmail.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }
    
    // تحديث البيانات
    const updateName = name || checkUser.rows[0].name;
    const updateEmail = email || checkUser.rows[0].email;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [updateName, updateEmail, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'تم تعديل المستخدم بنجاح',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ خطأ في تعديل المستخدم:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في تعديل المستخدم',
      message: error.message
    });
  }
});

// DELETE /users/:id - حذف مستخدم حسب ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // التحقق من وجود المستخدم
    const checkUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: 'تم حذف المستخدم بنجاح',
      data: checkUser.rows[0]
    });
  } catch (error) {
    console.error('❌ خطأ في حذف المستخدم:', error.message);
    res.status(500).json({
      success: false,
      error: 'فشل في حذف المستخدم',
      message: error.message
    });
  }
});

module.exports = router;

