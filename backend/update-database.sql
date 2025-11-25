-- تحديث جدول المستخدمين لإضافة حقول جديدة
-- قم بتشغيل هذا الملف إذا كان الجدول موجوداً بالفعل

-- حذف الجدول القديم (احذف هذا السطر إذا كنت لا تريد حذف البيانات القديمة)
DROP TABLE IF EXISTS users CASCADE;

-- إنشاء جدول المستخدمين الجديد
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إضافة بيانات تجريبية
-- ملاحظة: كلمات المرور غير مشفرة هنا للتجربة فقط
INSERT INTO users (name, email, password, is_admin) VALUES
  ('Admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', TRUE),
  ('أحمد محمد', 'ahmed@example.com', 'password123', FALSE),
  ('فاطمة علي', 'fatima@example.com', 'password123', FALSE),
  ('محمود حسن', 'mahmoud@example.com', 'password123', FALSE)
ON CONFLICT (email) DO NOTHING;

-- عرض جميع المستخدمين للتأكد
SELECT id, name, email, is_admin, created_at FROM users;

