# 🚀 دليل البدء السريع

## خطوات التشغيل السريعة

### 1️⃣ تثبيت الحزم
```bash
npm install
```

### 2️⃣ إعداد PostgreSQL
```bash
# افتح PostgreSQL
psql -U postgres

# أنشئ قاعدة البيانات
CREATE DATABASE testdb;

# اخرج
\q

# قم بتنفيذ ملف SQL
psql -U postgres -d testdb -f database.sql
```

### 3️⃣ تشغيل الخادم
```bash
npm start
```

### 4️⃣ اختبار API
افتح المتصفح على: **http://localhost:3000**

## 🧪 اختبار سريع

### عرض جميع المستخدمين:
```bash
curl http://localhost:3000/users
```

### إضافة مستخدم جديد:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"محمد علي","email":"mohamed@example.com"}'
```

---

✅ **تم! الخادم يعمل الآن على المنفذ 3000**

للمزيد من التفاصيل، راجع ملف [README.md](README.md)

