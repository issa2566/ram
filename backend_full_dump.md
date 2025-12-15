# Backend Full Dump - AchaProduct Issue

**Generated:** December 5, 2025  
**Project:** Biessa Auto Backend  
**Database:** PostgreSQL (testdb)  
**Server Port:** 3000

---

## 🚨 CRITICAL ERROR IDENTIFIED

### Root Cause
The column name `references` is a **reserved keyword in PostgreSQL** and cannot be used without quoting.

### Error Messages from Terminal
```
❌ Error creating acha_products table: erreur de syntaxe sur ou près de « references »
❌ Error in findBySubId: la relation « acha_products » n'existe pas
❌ Error in getOrCreate: erreur de syntaxe sur ou près de « references »
```

### Required Fix
Rename `references` column to `product_references` in:
1. `/backend/models/AchaProduct.js` - All SQL queries
2. `/backend/controllers/achaProductController.js` - Field mappings
3. Frontend `database.ts` - Interface and API calls

---

## 📁 FILE: /backend/models/AchaProduct.js

```javascript
/**
 * AchaProduct Model
 * Database operations for Acha page products
 * Stores quantity, references, and other product-specific data
 */

const { pool } = require('../config/database');

class AchaProduct {
  /**
   * Initialize the acha_products table if it doesn't exist
   */
  static async initTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS acha_products (
          id SERIAL PRIMARY KEY,
          sub_id TEXT UNIQUE NOT NULL,
          name TEXT,
          description TEXT,
          price TEXT,
          images TEXT[],
          quantity INTEGER DEFAULT 0,
          references TEXT[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ acha_products table ready');
      return true;
    } catch (error) {
      console.error('❌ Error creating acha_products table:', error.message);
      return false;
    }
  }

  /**
   * Check if table exists
   */
  static async tableExists() {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'acha_products'
        )
      `);
      return result.rows[0].exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ensure table exists before any operation
   */
  static async ensureTable() {
    const exists = await this.tableExists();
    if (!exists) {
      await this.initTable();
    }
  }

  /**
   * Find all acha products
   */
  static async findAll() {
    try {
      await this.ensureTable();
      const result = await pool.query(
        'SELECT * FROM acha_products ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('❌ Error in findAll:', error.message);
      return [];
    }
  }

  /**
   * Find by ID
   */
  static async findById(id) {
    try {
      await this.ensureTable();
      const result = await pool.query(
        'SELECT * FROM acha_products WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error in findById:', error.message);
      return null;
    }
  }

  /**
   * Find by sub_id (product identifier from URL)
   */
  static async findBySubId(subId) {
    try {
      await this.ensureTable();
      const result = await pool.query(
        'SELECT * FROM acha_products WHERE sub_id = $1',
        [subId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error in findBySubId:', error.message);
      return null;
    }
  }

  /**
   * Get or create a product by sub_id
   * If product doesn't exist, create it with default values
   */
  static async getOrCreate(subId) {
    try {
      await this.ensureTable();
      
      // First try to find existing product
      let product = await this.findBySubId(subId);
      
      if (!product) {
        // Create new product with default values
        const result = await pool.query(
          `INSERT INTO acha_products (sub_id, name, description, price, images, quantity, references)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            subId,
            decodeURIComponent(subId),
            'Description du produit (modifiable par l\'administrateur).',
            '0.000',
            [],
            0,
            []
          ]
        );
        product = result.rows[0];
        console.log('✅ Created new acha_product for sub_id:', subId);
      }
      
      return product;
    } catch (error) {
      console.error('❌ Error in getOrCreate:', error.message);
      throw error;
    }
  }

  /**
   * Create a new acha product
   */
  static async create(productData) {
    await this.ensureTable();
    const {
      sub_id,
      name,
      description,
      price,
      images,
      quantity,
      references
    } = productData;

    const result = await pool.query(
      `INSERT INTO acha_products (sub_id, name, description, price, images, quantity, references)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        sub_id,
        name || '',
        description || '',
        price || '0.000',
        images || [],
        quantity || 0,
        references || []
      ]
    );
    return result.rows[0];
  }

  /**
   * Update an acha product
   */
  static async update(id, productData) {
    await this.ensureTable();
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = ['name', 'description', 'price', 'images', 'quantity', 'references'];

    fields.forEach(field => {
      if (productData[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(productData[field]);
      }
    });

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE acha_products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete an acha product
   */
  static async delete(id) {
    try {
      await this.ensureTable();
      const result = await pool.query(
        'DELETE FROM acha_products WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error in delete:', error.message);
      return null;
    }
  }

  /**
   * Decrease quantity by 1 (for vente hors ligne)
   */
  static async decreaseQuantity(id) {
    try {
      await this.ensureTable();
      const result = await pool.query(
        `UPDATE acha_products 
         SET quantity = GREATEST(0, quantity - 1), updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error in decreaseQuantity:', error.message);
      return null;
    }
  }
}

module.exports = AchaProduct;
```

---

## 📁 FILE: /backend/controllers/achaProductController.js

```javascript
/**
 * AchaProduct Controller
 * Handles Acha product CRUD operations including quantity and references
 */

const AchaProduct = require('../models/AchaProduct');

class AchaProductController {
  /**
   * Get all acha products
   */
  static async getAll(req, res) {
    try {
      const products = await AchaProduct.findAll();
      
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('❌ Error in getAll:', error.message);
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  }

  /**
   * Get acha product by ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      const product = await AchaProduct.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('❌ Error in getById:', error.message);
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
  }

  /**
   * Get or create acha product by sub_id
   * Used when loading the Acha page for a specific product
   */
  static async getOrCreate(req, res) {
    try {
      const { subId } = req.params;
      
      if (!subId) {
        return res.status(400).json({
          success: false,
          error: 'subId is required'
        });
      }
      
      const product = await AchaProduct.getOrCreate(subId);
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('❌ Error in getOrCreate:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get or create product'
      });
    }
  }

  /**
   * Create a new acha product
   */
  static async create(req, res) {
    try {
      const {
        sub_id,
        name,
        description,
        price,
        images,
        quantity,
        references
      } = req.body;
      
      if (!sub_id) {
        return res.status(400).json({
          success: false,
          error: 'sub_id is required'
        });
      }
      
      // Check if sub_id already exists
      const existing = await AchaProduct.findBySubId(sub_id);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Product with this sub_id already exists'
        });
      }
      
      const product = await AchaProduct.create({
        sub_id,
        name,
        description,
        price,
        images,
        quantity,
        references
      });
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('❌ Error in create:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to create product'
      });
    }
  }

  /**
   * Update an acha product
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      // Check if product exists
      const productExists = await AchaProduct.findById(id);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      const product = await AchaProduct.update(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('❌ Error in update:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update product'
      });
    }
  }

  /**
   * Decrease quantity (vente hors ligne)
   */
  static async venteHorsLigne(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      // Check if product exists and has quantity > 0
      const productExists = await AchaProduct.findById(id);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      if (productExists.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity is already 0'
        });
      }
      
      const product = await AchaProduct.decreaseQuantity(id);
      
      res.status(200).json({
        success: true,
        message: 'Quantity decreased successfully',
        data: product
      });
    } catch (error) {
      console.error('❌ Error in venteHorsLigne:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to decrease quantity'
      });
    }
  }

  /**
   * Delete an acha product
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      const product = await AchaProduct.delete(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: {
          id: product.id,
          sub_id: product.sub_id
        }
      });
    } catch (error) {
      console.error('❌ Error in delete:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product'
      });
    }
  }
}

module.exports = AchaProductController;
```

---

## 📁 FILE: /backend/routes/achaProducts.js

```javascript
/**
 * AchaProduct Routes
 * Acha product CRUD endpoints including quantity and references management
 */

const express = require('express');
const router = express.Router();
const AchaProductController = require('../controllers/achaProductController');
const asyncHandler = require('../middlewares/asyncHandler');

// Get all acha products
router.get('/', asyncHandler(AchaProductController.getAll));

// Get or create acha product by sub_id (used when loading Acha page)
router.get('/sub/:subId', asyncHandler(AchaProductController.getOrCreate));

// Get acha product by ID
router.get('/:id', asyncHandler(AchaProductController.getById));

// Create new acha product
router.post('/', asyncHandler(AchaProductController.create));

// Update acha product (quantity, references, etc.)
router.put('/:id', asyncHandler(AchaProductController.update));

// Vente hors ligne (decrease quantity by 1)
router.post('/:id/vente-hors-ligne', asyncHandler(AchaProductController.venteHorsLigne));

// Delete acha product
router.delete('/:id', asyncHandler(AchaProductController.delete));

module.exports = router;
```

---

## 📁 FILE: /backend/server.js

```javascript
/**
 * Main Server File
 * Express application with PostgreSQL integration
 * Clean architecture: routes -> controllers -> models -> database
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { port, cors: corsConfig } = require('./config/app');
const { pool, testConnection } = require('./config/database');
const { initializeTables } = require('./db/initTables');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const productsRouter = require('./routes/products');
const searchOptionsRouter = require('./routes/searchOptions');
const carBrandsRouter = require('./routes/carBrands');
const vehiclesRouter = require('./routes/vehicles');
const vehicleModelsRouter = require('./routes/vehicleModels');
const modelPartsRouter = require('./routes/modelParts');
const partsRouter = require('./routes/parts');
const achaProductsRouter = require('./routes/achaProducts');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: corsConfig.origin,
  credentials: corsConfig.credentials
}));

// Increase body size limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// API root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Node.js Backend API with PostgreSQL',
      version: '2.1.0',
      endpoints: {
        // ... endpoints documentation
      }
    }
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/products', productsRouter);
app.use('/api/searchOptions', searchOptionsRouter);
app.use('/api/carBrands', carBrandsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/vehicleModels', vehicleModelsRouter);
app.use('/api/models', modelPartsRouter);
app.use('/api/parts', partsRouter);
app.use('/api/acha-products', achaProductsRouter);

// Legacy routes without /api prefix (for backward compatibility)
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);
app.use('/products', productsRouter);
app.use('/searchOptions', searchOptionsRouter);
app.use('/carBrands', carBrandsRouter);
app.use('/vehicles', vehiclesRouter);
app.use('/vehicleModels', vehicleModelsRouter);
app.use('/models', modelPartsRouter);
app.use('/parts', partsRouter);
app.use('/acha-products', achaProductsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server with port conflict handling
async function startServer() {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    const dbTest = await testConnection();
    
    if (!dbTest.success) {
      console.error('❌ Database connection failed.');
      console.error('   Error:', dbTest.error);
    } else {
      console.log('✅ Database connection successful');
      
      // Initialize all database tables BEFORE starting the server
      console.log('🔄 Initializing database tables...');
      const initResult = await initializeTables(pool);
      
      if (!initResult.success) {
        console.error('⚠️ Some tables could not be created');
      }
    }

    // Start the server
    const server = app.listen(port, () => {
      console.log(`\n✅ Server running on port ${port}`);
      console.log(`📍 API URL: http://localhost:${port}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
```

---

## 📁 FILE: /backend/config/database.js

```javascript
/**
 * Database Configuration
 * Centralized database connection and utilities
 */

require('dotenv').config();
const { Pool } = require('pg');

const requiredEnvVars = ['DB_USER', 'DB_NAME', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`[DB] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('[DB] Please set these in your .env file');
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
  query_timeout: 30000,
});

pool.on('error', (err) => {
  console.error(`[DB] Pool error: ${err.message}`);
});

let connectionVerified = false;

async function testConnection(retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let client;
    try {
      client = await pool.connect();
      const dbCheck = await client.query('SELECT current_database()');
      const dbName = dbCheck.rows[0].current_database;
      
      if (dbName !== process.env.DB_NAME) {
        throw new Error(`Wrong database: ${dbName}, expected: ${process.env.DB_NAME}`);
      }
      
      await client.query('SELECT NOW()');
      client.release();
      
      connectionVerified = true;
      console.log(`[DB] Connected to ${dbName}`);
      return { success: true, database: dbName };
      
    } catch (error) {
      if (client) {
        client.release();
      }
      
      if (attempt === retries) {
        if (error.code === '28P01') {
          console.error('[DB] Authentication failed - check DB_USER and DB_PASSWORD');
        } else if (error.code === '3D000') {
          console.error(`[DB] Database '${process.env.DB_NAME}' does not exist`);
        } else if (error.code === 'ECONNREFUSED') {
          console.error(`[DB] Connection refused - check DB_HOST and DB_PORT`);
        } else {
          console.error(`[DB] Connection failed: ${error.message}`);
        }
        return { success: false, error: error.message, code: error.code };
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Test connection on module load
testConnection().catch((err) => {
  console.error(`[DB] Connection test failed: ${err.message}`);
});

module.exports = {
  pool,
  testConnection,
  connectionVerified: () => connectionVerified
};
```

---

## 📁 FILE: /backend/config/app.js

```javascript
/**
 * Application Configuration
 * Centralized app settings and environment variables
 */

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  
  // Database
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  
  // File uploads
  uploads: {
    maxFileSize: 1024 * 1024, // 1MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    directory: 'uploads'
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
```

---

## 📁 FILE: /backend/middlewares/asyncHandler.js

```javascript
/**
 * Async Handler Middleware
 * Wraps async route handlers to catch errors automatically
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
```

---

## 📁 FILE: /backend/middlewares/errorHandler.js

```javascript
/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  
  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: err.detail || 'This record already exists'
    });
  }
  
  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      error: 'Invalid reference',
      message: 'Referenced record does not exist'
    });
  }
  
  if (err.code === '23502') { // Not null violation
    return res.status(400).json({
      success: false,
      error: 'Missing required field',
      message: err.column ? `Field '${err.column}' is required` : 'Required field is missing'
    });
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: 'File size exceeds the maximum allowed size'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

---

## 📁 FILE: /backend/db/initTables.js

```javascript
/**
 * Database Table Initializer
 * Automatically creates all required tables if they don't exist
 */

async function tableExists(pool, tableName) {
  try {
    const result = await pool.query(
      `SELECT to_regclass($1) as exists`,
      [`public.${tableName}`]
    );
    return result.rows[0].exists !== null;
  } catch (error) {
    console.error(`❌ Error checking if table ${tableName} exists:`, error.message);
    return false;
  }
}

async function initializeTables(pool) {
  console.log('🔄 Database: Starting table initialization...');
  
  const tablesCreated = [];
  const errors = [];

  // Table definitions (acha_products NOT included - needs manual addition)
  const tables = [
    {
      name: 'car_brands',
      createSQL: `CREATE TABLE car_brands (...)`
    },
    {
      name: 'search_options',
      createSQL: `CREATE TABLE search_options (...)`
    },
    {
      name: 'vehicles',
      createSQL: `CREATE TABLE vehicles (...)`
    },
    {
      name: 'products',
      createSQL: `CREATE TABLE products (...)`
    },
    {
      name: 'users',
      createSQL: `CREATE TABLE users (...)`
    },
    {
      name: 'vehicle_models',
      createSQL: `CREATE TABLE vehicle_models (...)`
    },
    {
      name: 'vehicle_model_parts',
      createSQL: `CREATE TABLE vehicle_model_parts (...)`
    }
  ];

  // Check and create each table
  for (const table of tables) {
    try {
      const exists = await tableExists(pool, table.name);
      
      if (!exists) {
        console.log(`📦 Creating table: ${table.name}`);
        await pool.query(table.createSQL);
        tablesCreated.push(table.name);
        console.log(`✅ Table created: ${table.name}`);
      } else {
        console.log(`✓ Table exists: ${table.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating table ${table.name}:`, error.message);
      errors.push({ table: table.name, error: error.message });
    }
  }

  return { success: errors.length === 0, tablesCreated, errors };
}

module.exports = {
  initializeTables,
  tableExists
};
```

---

## 📊 DATABASE SCHEMA: acha_products

### Current (BROKEN) SQL:
```sql
CREATE TABLE IF NOT EXISTS acha_products (
  id SERIAL PRIMARY KEY,
  sub_id TEXT UNIQUE NOT NULL,
  name TEXT,
  description TEXT,
  price TEXT,
  images TEXT[],
  quantity INTEGER DEFAULT 0,
  references TEXT[] DEFAULT '{}',  -- ❌ RESERVED KEYWORD!
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Fixed SQL (Rename column):
```sql
CREATE TABLE IF NOT EXISTS acha_products (
  id SERIAL PRIMARY KEY,
  sub_id TEXT UNIQUE NOT NULL,
  name TEXT,
  description TEXT,
  price TEXT,
  images TEXT[],
  quantity INTEGER DEFAULT 0,
  product_references TEXT[] DEFAULT '{}',  -- ✅ FIXED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🛣️ API ROUTES: /api/acha-products

| Method | Route | Controller Function | Description |
|--------|-------|---------------------|-------------|
| GET | `/api/acha-products` | `getAll` | List all acha products |
| GET | `/api/acha-products/sub/:subId` | `getOrCreate` | Get or create by sub_id |
| GET | `/api/acha-products/:id` | `getById` | Get by ID |
| POST | `/api/acha-products` | `create` | Create new product |
| PUT | `/api/acha-products/:id` | `update` | Update product |
| POST | `/api/acha-products/:id/vente-hors-ligne` | `venteHorsLigne` | Decrease quantity |
| DELETE | `/api/acha-products/:id` | `delete` | Delete product |

---

## 🔍 DATABASE QUERIES (in AchaProduct.js)

1. **Table Creation**: `CREATE TABLE IF NOT EXISTS acha_products (...)`
2. **Table Exists Check**: `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'acha_products')`
3. **Find All**: `SELECT * FROM acha_products ORDER BY created_at DESC`
4. **Find By ID**: `SELECT * FROM acha_products WHERE id = $1`
5. **Find By SubId**: `SELECT * FROM acha_products WHERE sub_id = $1`
6. **Insert**: `INSERT INTO acha_products (...) VALUES (...) RETURNING *`
7. **Update**: `UPDATE acha_products SET ... WHERE id = $1 RETURNING *`
8. **Delete**: `DELETE FROM acha_products WHERE id = $1 RETURNING *`
9. **Decrease Quantity**: `UPDATE acha_products SET quantity = GREATEST(0, quantity - 1) WHERE id = $1 RETURNING *`

---

## ❌ TERMINAL ERRORS (from server logs)

```
[2025-12-05T22:33:55.738Z] GET /api/acha-products/sub/Kit%20embrayage%20complet
❌ Error creating acha_products table: erreur de syntaxe sur ou près de « references »
❌ Error creating acha_products table: erreur de syntaxe sur ou près de « references »
❌ Error in findBySubId: la relation « acha_products » n'existe pas
❌ Error in getOrCreate: erreur de syntaxe sur ou près de « references »
❌ Error in getOrCreate: erreur de syntaxe sur ou près de « references »
```

**Translation from French:**
- "erreur de syntaxe sur ou près de « references »" = "syntax error at or near 'references'"
- "la relation « acha_products » n'existe pas" = "relation 'acha_products' does not exist"

---

## 🌐 BROWSER CONSOLE ERRORS (Expected)

```
GET http://localhost:3000/api/acha-products/sub/Kit%20embrayage%20complet 500 (Internal Server Error)
❌ Error getting/creating acha product: Error: Failed to get or create acha product: Internal Server Error
```

---

## ✅ WHAT IS WORKING

1. ✅ Server starts successfully on port 3000
2. ✅ Database connection to `testdb` is successful
3. ✅ All other tables are created (car_brands, search_options, vehicles, products, users, vehicle_models, vehicle_model_parts)
4. ✅ Route `/api/acha-products` is registered in server.js
5. ✅ Controller and model files exist and are correctly imported
6. ✅ Other API endpoints work (products, vehicles, searchOptions, etc.)

---

## ❌ WHAT IS FAILING

1. ❌ `acha_products` table cannot be created due to reserved keyword `references`
2. ❌ All AchaProduct operations fail because table doesn't exist
3. ❌ Frontend Acha.tsx cannot load product data
4. ❌ Admin features (quantity, references) cannot be saved

---

## 🔧 REQUIRED FIX

### Step 1: Fix /backend/models/AchaProduct.js

Replace ALL occurrences of `references` with `product_references`:

```javascript
// In initTable()
await pool.query(`
  CREATE TABLE IF NOT EXISTS acha_products (
    id SERIAL PRIMARY KEY,
    sub_id TEXT UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    price TEXT,
    images TEXT[],
    quantity INTEGER DEFAULT 0,
    product_references TEXT[] DEFAULT '{}',  // FIXED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`);

// In getOrCreate()
const result = await pool.query(
  `INSERT INTO acha_products (sub_id, name, description, price, images, quantity, product_references)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING *`,
  [...]
);

// In create()
const result = await pool.query(
  `INSERT INTO acha_products (sub_id, name, description, price, images, quantity, product_references)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING *`,
  [...]
);

// In update()
const fields = ['name', 'description', 'price', 'images', 'quantity', 'product_references'];
```

### Step 2: Update controller to use `product_references` field name

### Step 3: Update frontend database.ts interface and Acha.tsx to use `product_references`

### Step 4: Restart backend server to create the table

---

## 📋 SUMMARY

| Component | Status | Issue |
|-----------|--------|-------|
| Model file | ⚠️ Broken | Uses reserved keyword `references` |
| Controller | ✅ OK | Works if model is fixed |
| Routes | ✅ OK | Correctly registered |
| Server | ✅ OK | Routes mounted correctly |
| Database | ⚠️ Blocked | Table cannot be created |
| Frontend API | ⚠️ Blocked | Waiting for backend fix |
| Frontend UI | ⚠️ Blocked | Waiting for backend fix |

---

**END OF DUMP**

