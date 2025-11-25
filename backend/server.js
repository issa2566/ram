const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // السماح بالطلبات من مصادر مختلفة
app.use(bodyParser.json()); // معالجة البيانات بصيغة JSON
app.use(bodyParser.urlencoded({ extended: true })); // معالجة البيانات من النماذج

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.json({
    message: 'مرحباً بك في API خادم Node.js مع PostgreSQL',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        checkEmail: 'GET /auth/check-email/:email'
      },
      users: {
        getAll: 'GET /users',
        getById: 'GET /users/:id',
        create: 'POST /users',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id'
      }
    }
  });
});

// استخدام مسارات المصادقة والمستخدمين
app.use('/auth', authRouter);
app.use('/users', usersRouter);

// مسارات البحث
app.get('/searchOptions', (req, res) => {
  const { field } = req.query;
  
  // بيانات وهمية للبحث
  const searchData = {
    marque: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Chevrolet'],
    modele: ['Camry', 'Civic', 'X3', 'C-Class', 'A4', 'Altima', 'Elantra', 'Sportage', 'Focus', 'Cruze'],
    annee: ['2020', '2021', '2022', '2023', '2024', '2019', '2018', '2017', '2016', '2015']
  };
  
  if (field && searchData[field]) {
    const options = searchData[field].map((value, index) => ({
      id: `${field}_${index + 1}`,
      field: field,
      value: value
    }));
    res.json(options);
  } else {
    // إرجاع جميع الخيارات
    const allOptions = [];
    Object.keys(searchData).forEach(fieldKey => {
      searchData[fieldKey].forEach((value, index) => {
        allOptions.push({
          id: `${fieldKey}_${index + 1}`,
          field: fieldKey,
          value: value
        });
      });
    });
    res.json(allOptions);
  }
});

// إضافة خيار بحث جديد
app.post('/searchOptions', (req, res) => {
  const { field, value } = req.body;
  
  if (!field || !value) {
    return res.status(400).json({
      success: false,
      error: 'الرجاء إدخال الحقل والقيمة'
    });
  }
  
  // في التطبيق الحقيقي، سيتم حفظ البيانات في قاعدة البيانات
  res.status(201).json({
    success: true,
    message: 'تم إضافة خيار البحث بنجاح',
    data: {
      id: `${field}_${Date.now()}`,
      field: field,
      value: value
    }
  });
});

// حذف خيار البحث
app.delete('/searchOptions/:id', (req, res) => {
  const { id } = req.params;
  
  // في التطبيق الحقيقي، سيتم حذف البيانات من قاعدة البيانات
  res.json({
    success: true,
    message: 'تم حذف خيار البحث بنجاح',
    id: id
  });
});

// معالجة المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({
    error: 'المسار غير موجود',
    path: req.path
  });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('❌ خطأ في الخادم:', err.stack);
  res.status(500).json({
    error: 'حدث خطأ في الخادم',
    message: err.message
  });
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`📍 الرابط: http://localhost:${PORT}`);
});

