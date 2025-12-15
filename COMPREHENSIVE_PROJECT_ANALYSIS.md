# 🔥 Project Summary

**Automotive Parts E-Commerce Platform** - A full-stack web application for selling automotive parts, filters, and oils. The system includes user authentication, product catalog, search functionality, admin dashboard, and shopping cart features.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + PostgreSQL
- **State Management**: React Context API + TanStack Query
- **UI Components**: shadcn/ui + Radix UI

---

## 🧠 Global Architecture

### Component Diagram (Text Format):

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                            │
│  React App (Vite Dev Server - Port 8080)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend Components                                  │  │
│  │  - Pages (Login, Catalogue, Admin, etc.)              │  │
│  │  - Components (Header, Footer, Product Cards)         │  │
│  │  - Services (api.ts, uploadService.ts)               │  │
│  │  - Hooks (useAuth, useImageUpload)                   │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │ HTTP Requests                         │
│                      │ (fetch/axios)                         │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API SERVER                              │
│  Express.js Server (Port 3000)                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes Layer                                        │  │
│  │  - /auth (login, register, check-email)             │  │
│  │  - /users (CRUD operations)                         │  │
│  │  - /searchOptions (mock data)                       │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │ SQL Queries                          │
│                      │ (pg Pool)                            │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE LAYER                                  │
│  PostgreSQL (Port 5432)                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database: testdb                                    │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Table: users                                │   │  │
│  │  │  - id, name, email, password, phone,         │   │  │
│  │  │    address, is_admin, created_at, updated_at │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow:

1. **User Authentication Flow:**
   ```
   Frontend (Login.tsx) 
   → POST /auth/login 
   → Backend (routes/auth.js) 
   → PostgreSQL (SELECT users WHERE email)
   → bcrypt.compare(password)
   → Return user data (no password)
   → Frontend stores in localStorage
   ```

2. **Product Data Flow:**
   ```
   Frontend (database.ts)
   → GET /products (NOT IMPLEMENTED IN BACKEND!)
   → Falls back to localStorage
   → Uses db.json mock data
   ```

3. **Image Upload Flow:**
   ```
   Frontend (useImageUpload.ts)
   → Compresses image client-side
   → POST /upload/image (NOT IMPLEMENTED IN BACKEND!)
   → Currently returns mock URL (blob URL)
   → Images NOT saved to server
   ```

---

## 🗃 Database Schema

### Current Database Structure:

**Database Name:** `testdb`

**Table: `users`**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,        -- bcrypt hashed
  phone VARCHAR(20),
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes:
CREATE INDEX idx_users_email ON users(email);

-- Triggers:
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Missing Tables (Referenced but NOT Created):

1. **`products`** - Referenced in frontend but doesn't exist
2. **`search_options`** - Currently mock data in server.js
3. **`car_brands`** - Referenced in frontend but doesn't exist
4. **`section_content`** - Referenced in frontend but doesn't exist
5. **`uploads`** or **`images`** - No table for uploaded files

---

## 🌐 API Endpoints

### Authentication Endpoints (`/auth`):

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | ✅ Working |
| POST | `/auth/login` | Authenticate user | ✅ Working |
| GET | `/auth/check-email/:email` | Check email availability | ✅ Working |

### User Management Endpoints (`/users`):

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/users` | Get all users | ✅ Working |
| GET | `/users/:id` | Get user by ID | ✅ Working |
| POST | `/users` | Create user (admin) | ✅ Working |
| PUT | `/users/:id` | Update user | ✅ Working |
| DELETE | `/users/:id` | Delete user | ✅ Working |

### Search Options Endpoints:

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/searchOptions` | Get search options | ⚠️ Mock data |
| POST | `/searchOptions` | Add search option | ⚠️ Mock data (not saved) |
| DELETE | `/searchOptions/:id` | Delete search option | ⚠️ Mock data (not saved) |

### Missing Endpoints (Referenced in Frontend):

| Method | Endpoint | Frontend Usage | Status |
|--------|----------|----------------|--------|
| GET | `/products` | `database.ts:44` | ❌ NOT IMPLEMENTED |
| GET | `/products/:id` | `database.ts:289` | ❌ NOT IMPLEMENTED |
| POST | `/products` | `database.ts:304` | ❌ NOT IMPLEMENTED |
| PUT | `/products/:id` | `database.ts:335` | ❌ NOT IMPLEMENTED |
| DELETE | `/products/:id` | `database.ts:360` | ❌ NOT IMPLEMENTED |
| POST | `/upload/image` | `uploadService.ts:20` | ❌ NOT IMPLEMENTED |
| DELETE | `/upload/image` | `uploadService.ts:38` | ❌ NOT IMPLEMENTED |
| GET | `/carBrands` | `database.ts:505` | ❌ NOT IMPLEMENTED |
| POST | `/carBrands` | `database.ts:579` | ❌ NOT IMPLEMENTED |
| DELETE | `/carBrands/:id` | `database.ts:609` | ❌ NOT IMPLEMENTED |
| GET | `/sectionContent` | `database.ts:378` | ❌ NOT IMPLEMENTED |
| POST | `/sectionContent` | `database.ts:408` | ❌ NOT IMPLEMENTED |
| PUT | `/sectionContent/:id` | `database.ts:397` | ❌ NOT IMPLEMENTED |

### Utility Endpoints:

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/` | API root with endpoints list | ✅ Working |
| GET | `/health` | Health check | ✅ Working |

---

## 👤 Authentication Logic

### Current Implementation:

**Backend (`routes/auth.js`):**
1. **Registration:**
   - Validates email format and password length (min 6 chars)
   - Checks for duplicate email in PostgreSQL
   - Hashes password with bcrypt (10 rounds)
   - Inserts user into `users` table
   - Returns user data (without password)

2. **Login:**
   - Finds user by email in PostgreSQL
   - Compares password with bcrypt.compare()
   - Returns user data (without password)
   - **NO JWT TOKEN GENERATED**
   - **NO SESSION CREATED**

**Frontend (`pages/Login.tsx`):**
1. Makes direct `fetch()` call to `/auth/login`
2. Stores user object in `localStorage.setItem('user', ...)`
3. Dispatches `userLogin` custom event
4. **NO TOKEN STORAGE** (authService.ts expects token but backend doesn't provide)

**Authentication State Management:**
- Uses `localStorage` for persistence
- `useAuth` hook reads from localStorage
- Custom events (`userLogin`, `userLogout`) for cross-component sync
- **NO server-side session validation**
- **NO token refresh mechanism**

### Security Issues:

1. ❌ **No JWT/Session Tokens** - Authentication state only in localStorage
2. ❌ **No Token Expiration** - User stays logged in forever
3. ❌ **No Protected Routes** - Any user can access admin pages if they know URL
4. ❌ **No CSRF Protection** - No CSRF tokens
5. ❌ **No Rate Limiting** - Vulnerable to brute force attacks
6. ⚠️ **CORS allows all origins** - Should be restricted in production

---

## 📁 File Upload System

### Current Implementation:

**Frontend (`hooks/useImageUpload.ts`):**
1. ✅ Image compression (client-side, max 800x800px, quality 0.7)
2. ✅ File validation (type, size max 1MB)
3. ✅ Preview generation (blob URL)
4. ❌ **Upload API call is COMMENTED OUT** (line 122-125)
5. ❌ **Returns mock blob URL instead of server URL**

**Frontend (`services/uploadService.ts`):**
- Defines API calls to `/upload/image` (POST) and `/upload/image` (DELETE)
- **These endpoints DO NOT EXIST in backend**

**Backend:**
- ❌ **NO upload endpoint implemented**
- ❌ **NO multer middleware configured**
- ❌ **NO static file serving**
- ❌ **NO uploads directory**
- ❌ **NO database table for images**

### Where Images Are Currently "Stored":

1. **Product Images**: Static files in `auto-display-replicator-main/public/`
2. **Uploaded Images**: **NOWHERE** - Only blob URLs in memory (lost on refresh)
3. **No Database Relation**: Images not linked to products/users

### Image Storage Paths:

- **Static Assets**: `auto-display-replicator-main/public/`
  - Filters: `public/filters/*.svg`
  - Car logos: `public/cars.logo/*`
  - Product images: `public/phf/*.jpeg`
- **Uploaded Images**: **NO PATH** - Not implemented

---

## 🔌 DB Connection Layer

### Implementation (`backend/db.js`):

**Connection Pool Configuration:**
```javascript
const pool = new Pool({
  user: process.env.DB_USER,           // From .env
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME,         // From .env
  password: process.env.DB_PASSWORD,     // From .env
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: 20,                              // Max connections
  min: 2,                               // Min connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
  query_timeout: 30000,
});
```

**Connection Verification:**
- Tests connection on module load (non-blocking)
- Retries 3 times with 2-second delay
- Verifies database name matches `DB_NAME`
- **Never exits process on error** (logs only)

**Environment Variables Required:**
- `DB_USER` - PostgreSQL username (required)
- `DB_NAME` - Database name (required)
- `DB_PASSWORD` - PostgreSQL password (required)
- `DB_HOST` - Host (default: 127.0.0.1)
- `DB_PORT` - Port (default: 5432)

**Current Status:**
- ✅ Uses PostgreSQL (not SQLite or in-memory)
- ✅ Connection pooling configured
- ✅ Environment variables from .env
- ✅ Error handling implemented
- ⚠️ Connection test is non-blocking (server starts even if DB fails)

---

## 🧩 Key Files Explained

### Backend Files:

#### `backend/server.js` (MAIN SERVER - Production Ready)
- **Purpose**: Main Express server with PostgreSQL integration
- **Routes**: `/auth`, `/users`, `/searchOptions`, `/health`
- **Features**: Error handling, port conflict detection, graceful shutdown
- **Status**: ✅ Production-ready

#### `backend/final-server.js` (LEGACY - In-Memory)
- **Purpose**: Old server with in-memory user array
- **Users**: Hardcoded array `[{id: 1, email: 'admin@example.com', ...}]`
- **Database**: ❌ No database connection
- **Status**: ⚠️ Legacy file, should be deleted

#### `backend/working-server.js` (LEGACY - In-Memory)
- **Purpose**: Another old server with in-memory users
- **Users**: Array with 2 hardcoded users
- **CORS**: Restricted to `http://localhost:8080`
- **Database**: ❌ No database connection
- **Status**: ⚠️ Legacy file, should be deleted

#### `backend/db.js` (Database Connection)
- **Purpose**: PostgreSQL connection pool
- **Features**: Environment variables, connection testing, error handling
- **Status**: ✅ Production-ready

#### `backend/routes/auth.js` (Authentication Routes)
- **Purpose**: User registration and login
- **Database**: ✅ Uses PostgreSQL `users` table
- **Security**: ✅ bcrypt password hashing
- **Status**: ✅ Production-ready

#### `backend/routes/users.js` (User Management Routes)
- **Purpose**: CRUD operations for users
- **Database**: ✅ Uses PostgreSQL `users` table
- **Security**: ✅ Passwords never returned
- **Status**: ✅ Production-ready

### Frontend Files:

#### `auto-display-replicator-main/src/services/api.ts`
- **Purpose**: Axios instance with interceptors
- **Base URL**: `http://69.169.108.182:3000/api` (from env or hardcoded)
- **Features**: Token interceptor (expects JWT but backend doesn't provide), error handling
- **Status**: ⚠️ Configured but backend doesn't match `/api` prefix

#### `auto-display-replicator-main/src/pages/Login.tsx`
- **Purpose**: Login/Register page
- **API Calls**: Direct `fetch()` to `http://69.169.108.182:3000/auth/login`
- **Storage**: `localStorage.setItem('user', ...)`
- **Status**: ✅ Working but bypasses api.ts service

#### `auto-display-replicator-main/src/api/database.ts`
- **Purpose**: Product and data management API calls
- **Base URL**: `http://69.169.108.182:3000`
- **Endpoints Called**: `/products`, `/carBrands`, `/sectionContent`, `/searchOptions`
- **Status**: ⚠️ Most endpoints don't exist in backend (falls back to localStorage)

#### `auto-display-replicator-main/src/hooks/useImageUpload.ts`
- **Purpose**: Image upload hook with compression
- **Upload**: ❌ Commented out, returns mock blob URL
- **Status**: ⚠️ Not functional (no backend endpoint)

#### `auto-display-replicator-main/src/services/uploadService.ts`
- **Purpose**: Upload service definitions
- **Endpoints**: `/upload/image` (POST/DELETE)
- **Status**: ❌ Endpoints don't exist in backend

---

## 🐛 Current Potential Bugs

### Critical Production-Breaking Issues:

#### 1. **Image Upload Not Implemented** 🔴
- **Problem**: Frontend calls `POST /upload/image` but endpoint doesn't exist
- **Impact**: Uploaded images are never saved, only blob URLs (lost on refresh)
- **Location**: 
  - Frontend: `useImageUpload.ts:122-132` (commented out)
  - Backend: No `/upload/image` route
- **Fix Needed**: Implement multer middleware + upload endpoint + file storage

#### 2. **Products API Missing** 🔴
- **Problem**: Frontend calls `/products` endpoints but backend has none
- **Impact**: Products fall back to localStorage, data not persistent
- **Location**: 
  - Frontend: `database.ts` calls `/products`
  - Backend: No `/products` routes
- **Fix Needed**: Create products table + CRUD routes

#### 3. **API Base URL Mismatch** 🟡
- **Problem**: Frontend `api.ts` uses `/api` prefix but backend routes don't
- **Impact**: Axios calls fail, Login.tsx uses direct fetch instead
- **Location**: 
  - Frontend: `api.ts:11` → `baseURL: '...3000/api'`
  - Backend: Routes are `/auth`, `/users` (no `/api` prefix)
- **Fix Needed**: Either add `/api` prefix to backend or remove from frontend

#### 4. **No Authentication Middleware** 🟡
- **Problem**: No route protection, anyone can access admin endpoints
- **Impact**: Security vulnerability
- **Location**: `routes/users.js` - no auth check
- **Fix Needed**: Add JWT middleware or session validation

#### 5. **Database Tables Missing** 🔴
- **Problem**: Frontend expects tables that don't exist:
  - `products` table
  - `car_brands` table
  - `section_content` table
  - `search_options` table (currently mock)
- **Impact**: Data not persisted, falls back to localStorage
- **Fix Needed**: Create database schema for all tables

#### 6. **Search Options Not Saved** 🟡
- **Problem**: `/searchOptions` endpoints return mock data, not saved to DB
- **Impact**: Search options reset on server restart
- **Location**: `server.js:58-142` (mock data)
- **Fix Needed**: Create `search_options` table + move to database

#### 7. **No Static File Serving** 🟡
- **Problem**: No `express.static()` middleware for uploaded files
- **Impact**: Even if uploads work, files won't be accessible via URL
- **Location**: `server.js` - missing static middleware
- **Fix Needed**: Add `app.use('/uploads', express.static('uploads'))`

#### 8. **CORS Too Permissive** 🟡
- **Problem**: `app.use(cors())` allows all origins
- **Impact**: Security risk in production
- **Location**: `server.js:11`
- **Fix Needed**: Restrict to frontend domain

#### 9. **No Input Sanitization** 🟡
- **Problem**: SQL queries use parameterized queries (good) but no XSS protection
- **Impact**: Potential XSS if data displayed without sanitization
- **Fix Needed**: Add input sanitization middleware

#### 10. **Environment Variables Not Validated** 🟡
- **Problem**: Server starts even if DB connection fails
- **Impact**: Server runs but database operations fail silently
- **Location**: `db.js:74` - testConnection is non-blocking
- **Fix Needed**: Block server start if DB connection fails

---

## 🛠 Recommended Fixes

### Priority 1: Critical (Production-Breaking)

#### 1. **Implement Image Upload System**
```javascript
// backend/server.js - Add multer
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Upload endpoint
app.post('/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});
```

#### 2. **Create Products Table and Routes**
```sql
-- backend/database.sql - Add products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount VARCHAR(20),
  image VARCHAR(500),
  brand VARCHAR(100) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  loyalty_points INTEGER DEFAULT 0,
  has_preview BOOLEAN DEFAULT FALSE,
  has_options BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
```

```javascript
// backend/routes/products.js - Create new file
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  // GET /products - List all products
});

router.get('/:id', async (req, res) => {
  // GET /products/:id - Get product by ID
});

router.post('/', async (req, res) => {
  // POST /products - Create product
});

router.put('/:id', async (req, res) => {
  // PUT /products/:id - Update product
});

router.delete('/:id', async (req, res) => {
  // DELETE /products/:id - Delete product
});

module.exports = router;
```

#### 3. **Fix API Base URL Mismatch**
**Option A**: Add `/api` prefix to backend
```javascript
// backend/server.js
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
```

**Option B**: Remove `/api` from frontend
```typescript
// auto-display-replicator-main/src/services/api.ts
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://69.169.108.182:3000',
```

### Priority 2: Important (Security & Stability)

#### 4. **Add JWT Authentication**
```javascript
// Install: npm install jsonwebtoken
const jwt = require('jsonwebtoken');

// In routes/auth.js - After successful login
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);

res.json({
  success: true,
  token: token,
  user: userWithoutPassword
});
```

#### 5. **Add Authentication Middleware**
```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
```

#### 6. **Create Missing Database Tables**
```sql
-- Add to database.sql
CREATE TABLE IF NOT EXISTS products (...);
CREATE TABLE IF NOT EXISTS car_brands (...);
CREATE TABLE IF NOT EXISTS section_content (...);
CREATE TABLE IF NOT EXISTS search_options (...);
```

#### 7. **Fix CORS Configuration**
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
```

### Priority 3: Improvements

#### 8. **Block Server Start on DB Failure**
```javascript
// backend/server.js - Modify startServer()
async function startServer() {
  // Test DB connection first
  const dbTest = await testConnection();
  if (!dbTest.success) {
    console.error('❌ Cannot start server: Database connection failed');
    process.exit(1);
  }
  
  // Then start server...
}
```

#### 9. **Add Rate Limiting**
```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per window
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
```

#### 10. **Add Input Sanitization**
```javascript
// Install: npm install express-validator
const { body, validationResult } = require('express-validator');

// In routes/auth.js
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... rest of handler
});
```

---

## 📋 Environment Variables Summary

### Required for Backend (`.env`):

```env
# Database (REQUIRED)
DB_USER=postgres
DB_NAME=testdb
DB_PASSWORD=123456
DB_HOST=127.0.0.1
DB_PORT=5432

# Server (REQUIRED)
PORT=3000
NODE_ENV=development

# API (OPTIONAL)
API_BASE_URL=http://localhost:3000

# Security (RECOMMENDED)
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=24h

# Frontend URL (RECOMMENDED)
FRONTEND_URL=http://localhost:8080
```

### Required for Frontend (`.env`):

```env
VITE_API_BASE_URL=http://69.169.108.182:3000
```

---

## 🔗 Frontend-Backend Communication

### How Frontend Calls Backend:

1. **Direct Fetch (Login.tsx)**:
   ```typescript
   fetch('http://69.169.108.182:3000/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   })
   ```

2. **Axios Instance (api.ts)**:
   ```typescript
   import api from './services/api';
   api.post('/auth/login', credentials);
   // Base URL: http://69.169.108.182:3000/api
   // ⚠️ Problem: Backend doesn't have /api prefix
   ```

3. **Direct Fetch (database.ts, search.ts)**:
   ```typescript
   fetch(`${API_BASE_URL}/products`)
   // API_BASE_URL = 'http://69.169.108.182:3000'
   ```

### API Endpoint Mapping:

| Frontend Call | Backend Endpoint | Status |
|---------------|------------------|--------|
| `POST /auth/login` | `POST /auth/login` | ✅ Works |
| `POST /auth/register` | `POST /auth/register` | ✅ Works |
| `GET /products` | `GET /products` | ❌ Missing |
| `POST /upload/image` | `POST /upload/image` | ❌ Missing |
| `GET /searchOptions` | `GET /searchOptions` | ⚠️ Mock data |
| `GET /users` | `GET /users` | ✅ Works |

---

## 📊 Dependencies Between Modules

### Backend Dependencies:
```
server.js
  ├── db.js (PostgreSQL pool)
  ├── routes/auth.js
  │   └── db.js (uses pool)
  └── routes/users.js
      └── db.js (uses pool)
```

### Frontend Dependencies:
```
App.tsx
  ├── pages/Login.tsx
  │   └── fetch() → Backend /auth/login
  ├── pages/Catalogue.tsx
  │   └── api/database.ts → Backend /products (missing!)
  ├── services/api.ts
  │   └── Axios instance (baseURL configured)
  └── hooks/useImageUpload.ts
      └── services/uploadService.ts → Backend /upload/image (missing!)
```

---

## 🎯 Summary of Server File Differences

| File | Database | Users Storage | Status |
|------|----------|---------------|--------|
| `server.js` | ✅ PostgreSQL | ✅ Database | ✅ **USE THIS** |
| `final-server.js` | ❌ None | ❌ In-memory array | ⚠️ Legacy |
| `working-server.js` | ❌ None | ❌ In-memory array | ⚠️ Legacy |
| `server-sqlite.js` | ⚠️ SQLite | ✅ SQLite DB | ⚠️ Alternative |
| `simple-server.js` | ❌ None | ❌ In-memory | ⚠️ Legacy |
| `mega-simple-server.js` | ❌ None | ❌ In-memory | ⚠️ Legacy |

**Recommendation**: Delete all legacy server files, use only `server.js`

---

## ✅ Final Recommendations

1. **Immediate Actions**:
   - ✅ Use `server.js` as main server (already done)
   - ❌ Delete legacy server files (`final-server.js`, `working-server.js`, etc.)
   - ❌ Implement `/upload/image` endpoint
   - ❌ Create products table and routes
   - ❌ Fix API base URL mismatch

2. **Security Enhancements**:
   - Add JWT authentication
   - Add route protection middleware
   - Restrict CORS
   - Add rate limiting
   - Add input validation

3. **Database Schema**:
   - Create all missing tables
   - Add foreign key constraints
   - Add indexes for performance

4. **Code Cleanup**:
   - Remove legacy server files
   - Standardize API calls (use api.ts everywhere)
   - Remove mock implementations
   - Add proper error handling

---

**Analysis Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status**: ⚠️ Partially Production-Ready (Core auth works, but many features missing)

