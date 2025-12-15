# Backend Refactoring - Complete Guide

## 🎯 Overview

The backend has been completely refactored to use PostgreSQL with a clean architecture pattern.

---

## 📁 New Folder Structure

```
backend/
├── config/
│   ├── database.js      # Database connection & utilities
│   └── app.js           # App configuration
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   ├── searchOptionController.js
│   ├── carBrandController.js
│   └── uploadController.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── SearchOption.js
│   └── CarBrand.js
├── middlewares/
│   ├── errorHandler.js
│   ├── asyncHandler.js
│   └── responseFormatter.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   ├── searchOptions.js
│   ├── carBrands.js
│   └── upload.js
├── migrations/
│   └── add-search-options-and-car-brands.sql
├── uploads/             # Image storage
├── server.js            # Main server file
└── db.js                # Legacy (still works, but use config/database.js)
```

---

## 🔄 Migration Steps

### 1. Database Setup
```bash
# Run main schema
psql -U postgres -d your_database -f database.sql

# Run additional tables
psql -U postgres -d your_database -f migrations/add-search-options-and-car-brands.sql
```

### 2. Environment Variables
Create `.env` file:
```env
DB_USER=postgres
DB_NAME=testdb
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000
```

### 3. Start Server
```bash
npm install
node server.js
```

---

## 📡 API Endpoints

All endpoints return:
```json
{
  "success": true/false,
  "data": {...},
  "error": null or message
}
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check-email/:email` - Check email availability

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products (supports ?category=, ?brand=, ?search=)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Search Options
- `GET /api/searchOptions` - Get all (supports ?field=)
- `GET /api/searchOptions/:id` - Get by ID
- `POST /api/searchOptions` - Create
- `DELETE /api/searchOptions/:id` - Delete
- `DELETE /api/searchOptions/field-value` - Delete by field and value

### Car Brands
- `GET /api/carBrands` - Get all
- `GET /api/carBrands/:id` - Get by ID
- `POST /api/carBrands` - Create
- `PUT /api/carBrands/:id` - Update
- `DELETE /api/carBrands/:id` - Delete

### Upload
- `POST /api/upload/image` - Upload image (multipart/form-data)
- `DELETE /api/upload/image` - Delete image

---

## 🏗️ Architecture

### Flow:
1. **Request** → Route
2. **Route** → Controller (via asyncHandler)
3. **Controller** → Model
4. **Model** → Database (pool.query)
5. **Response** → Standardized format

### Error Handling:
- All routes wrapped with asyncHandler
- Errors caught by errorHandler middleware
- Standardized error responses

---

## ✅ What Changed

### Before:
- Mock data in server.js
- In-memory arrays
- localStorage fallbacks
- Mixed concerns (routes + logic + DB)

### After:
- PostgreSQL for all data
- Clean architecture (routes → controllers → models)
- Standardized responses
- Proper error handling
- No mock data

---

**Status**: ✅ Production Ready

