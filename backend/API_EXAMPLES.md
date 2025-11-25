# 📡 أمثلة عملية لاستخدام الـ API

## 🔗 رابط الـ API الأساسي
```
http://localhost:3000
```

---

## 1️⃣ عرض جميع المستخدمين

### باستخدام المتصفح:
```
http://localhost:3000/users
```

### باستخدام cURL:
```bash
curl http://localhost:3000/users
```

### باستخدام JavaScript (Fetch):
```javascript
fetch('http://localhost:3000/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### النتيجة المتوقعة:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

## 2️⃣ عرض مستخدم واحد (حسب ID)

### باستخدام المتصفح:
```
http://localhost:3000/users/1
```

### باستخدام cURL:
```bash
curl http://localhost:3000/users/1
```

### باستخدام JavaScript (Fetch):
```javascript
fetch('http://localhost:3000/users/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### النتيجة المتوقعة:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

## 3️⃣ إضافة مستخدم جديد

### باستخدام cURL:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"محمد علي","email":"mohamed@example.com"}'
```

### باستخدام JavaScript (Fetch):
```javascript
fetch('http://localhost:3000/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'محمد علي',
    email: 'mohamed@example.com'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### باستخدام PowerShell:
```powershell
$body = @{
    name = "محمد علي"
    email = "mohamed@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/users" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### النتيجة المتوقعة:
```json
{
  "success": true,
  "message": "تم إضافة المستخدم بنجاح",
  "data": {
    "id": 5,
    "name": "محمد علي",
    "email": "mohamed@example.com",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## 4️⃣ تعديل مستخدم

### باستخدام cURL:
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"أحمد محمد المحدث","email":"ahmed.updated@example.com"}'
```

### باستخدام JavaScript (Fetch):
```javascript
fetch('http://localhost:3000/users/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'أحمد محمد المحدث',
    email: 'ahmed.updated@example.com'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### باستخدام PowerShell:
```powershell
$body = @{
    name = "أحمد محمد المحدث"
    email = "ahmed.updated@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/users/1" `
  -Method PUT `
  -Body $body `
  -ContentType "application/json"
```

### النتيجة المتوقعة:
```json
{
  "success": true,
  "message": "تم تعديل المستخدم بنجاح",
  "data": {
    "id": 1,
    "name": "أحمد محمد المحدث",
    "email": "ahmed.updated@example.com",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T13:00:00.000Z"
  }
}
```

---

## 5️⃣ حذف مستخدم

### باستخدام cURL:
```bash
curl -X DELETE http://localhost:3000/users/1
```

### باستخدام JavaScript (Fetch):
```javascript
fetch('http://localhost:3000/users/1', {
  method: 'DELETE'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### باستخدام PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/users/1" -Method DELETE
```

### النتيجة المتوقعة:
```json
{
  "success": true,
  "message": "تم حذف المستخدم بنجاح",
  "data": {
    "id": 1,
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

## 🧪 استخدام Postman

### خطوات الاستخدام:

1. **افتح Postman**

2. **لعرض المستخدمين:**
   - Method: `GET`
   - URL: `http://localhost:3000/users`
   - اضغط `Send`

3. **لإضافة مستخدم:**
   - Method: `POST`
   - URL: `http://localhost:3000/users`
   - اذهب إلى تبويب `Body`
   - اختر `raw` و `JSON`
   - أدخل:
   ```json
   {
     "name": "اسم المستخدم",
     "email": "email@example.com"
   }
   ```
   - اضغط `Send`

4. **لتعديل مستخدم:**
   - Method: `PUT`
   - URL: `http://localhost:3000/users/1`
   - اذهب إلى تبويب `Body`
   - اختر `raw` و `JSON`
   - أدخل البيانات الجديدة
   - اضغط `Send`

5. **لحذف مستخدم:**
   - Method: `DELETE`
   - URL: `http://localhost:3000/users/1`
   - اضغط `Send`

---

## ❌ أمثلة على الأخطاء

### 1. مستخدم غير موجود:
```json
{
  "success": false,
  "error": "المستخدم غير موجود"
}
```

### 2. بيانات ناقصة:
```json
{
  "success": false,
  "error": "الرجاء إدخال الاسم والبريد الإلكتروني"
}
```

### 3. بريد إلكتروني مكرر:
```json
{
  "success": false,
  "error": "البريد الإلكتروني مستخدم بالفعل"
}
```

### 4. خطأ في الخادم:
```json
{
  "success": false,
  "error": "فشل في جلب المستخدمين",
  "message": "connection refused"
}
```

---

## 🔧 اختبار سريع

استخدم سكريبتات الاختبار المرفقة:

### اختبار الاتصال بقاعدة البيانات:
```bash
npm run test:db
```

### اختبار جميع عمليات الـ API:
```bash
npm run test:api
```

---

## 📝 ملاحظات

1. تأكد من تشغيل الخادم قبل اختبار الـ API
2. جميع الطلبات تستخدم `Content-Type: application/json`
3. الاستجابات دائماً بصيغة JSON
4. الأخطاء تُرجع مع رموز HTTP المناسبة (404, 409, 500, إلخ)

---

**🎯 الآن أنت جاهز لاستخدام الـ API!**

