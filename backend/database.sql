-- إنشاء قاعدة البيانات (إذا لم تكن موجودة)
-- CREATE DATABASE testdb;

-- الاتصال بقاعدة البيانات
-- \c testdb;

-- إنشاء جدول المستخدمين
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
-- كلمة المرور للجميع: admin123
INSERT INTO users (name, email, password, is_admin) VALUES
  ('Admin', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
  ('أحمد محمد', 'ahmed@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE),
  ('فاطمة علي', 'fatima@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE),
  ('محمود حسن', 'mahmoud@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE)
ON CONFLICT (email) DO NOTHING;

-- عرض جميع المستخدمين للتأكد
SELECT * FROM users;

