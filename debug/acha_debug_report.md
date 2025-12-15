# 🔥 ACHA DEBUG REPORT

**Generated:** December 8, 2025  
**Issue:** GET /api/acha-products/sub/:subId returns 500 Internal Server Error  
**Status:** 🟥 CRITICAL BUG IDENTIFIED

---

## 🔥 1. BACKEND FILES INVOLVED IN ACHA LOGIC

### 📁 FILE: backend/models/AchaProduct.js
**Path:** `C:\Users\PC\Desktop\newprej\backend\models\AchaProduct.js`

```javascript
/**
 * AchaProduct Model
 * Database operations for Acha page products
 * Stores quantity, product_references, and other product-specific data
 * 
 * FIXED: Renamed "references" to "product_references" (PostgreSQL reserved keyword)
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
          brand_name TEXT,
          model_name TEXT,
          description TEXT,
          price TEXT,
          images TEXT[],
          quantity INTEGER DEFAULT 0,
          product_references TEXT[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // FIX APPLIED FROM DIAGNOSTIC DOCUMENT: Create index for faster lookups
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_acha_products_sub_id ON acha_products(sub_id)
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
        // FIX APPLIED FROM DIAGNOSTIC DOCUMENT: Added ON CONFLICT for idempotency
        const result = await pool.query(
          `INSERT INTO acha_products (sub_id, name, brand_name, model_name, description, price, images, quantity, product_references)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (sub_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [
            subId,
            decodeURIComponent(subId),
            null,
            null,
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
      brand_name,
      model_name,
      description,
      price,
      images,
      quantity,
      product_references
    } = productData;

    const result = await pool.query(
      `INSERT INTO acha_products (sub_id, name, brand_name, model_name, description, price, images, quantity, product_references)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        sub_id,
        name || '',
        brand_name || null,
        model_name || null,
        description || '',
        price || '0.000',
        images || [],
        quantity || 0,
        product_references || []
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

    const fields = ['name', 'brand_name', 'model_name', 'description', 'price', 'images', 'quantity', 'product_references'];

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

### 📁 FILE: backend/controllers/achaProductController.js
**Path:** `C:\Users\PC\Desktop\newprej\backend\controllers\achaProductController.js`

```javascript
/**
 * AchaProduct Controller
 * Handles Acha product CRUD operations including quantity and product_references
 * 
 * FIXED: Uses "product_references" instead of "references"
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
   * 
   * FIX APPLIED FROM DIAGNOSTIC DOCUMENT: Added decodeURIComponent for special characters
   */
  static async getOrCreate(req, res) {
    try {
      let { subId } = req.params;
      
      // FIX APPLIED FROM DIAGNOSTIC DOCUMENT: Decode URL-encoded characters (apostrophes, accents, etc.)
      subId = decodeURIComponent(subId);
      
      if (!subId) {
        return res.status(400).json({
          success: false,
          error: 'subId is required'
        });
      }
      
      // FIX APPLIED FROM DIAGNOSTIC DOCUMENT: Added logging for debugging
      console.log('📦 Getting or creating product for sub_id:', subId);
      
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

  // ... (rest of controller methods)
}

module.exports = AchaProductController;
```

---

### 📁 FILE: backend/routes/achaProducts.js
**Path:** `C:\Users\PC\Desktop\newprej\backend\routes\achaProducts.js`

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

### 📁 FILE: backend/server.js (Route Registration)
**Path:** `C:\Users\PC\Desktop\newprej\backend\server.js`

**Relevant Lines (Routes + Static Files + Middleware):**

```javascript
// Line 18: Migration import
const fixAchaProductsSchema = require('./migrations/fix_acha_products_schema');

// Line 31: Router import
const achaProductsRouter = require('./routes/achaProducts');

// Lines 44-48: CORS + Middleware
app.use(cors({
  origin: corsConfig.origin,
  credentials: corsConfig.credentials
}));

// Lines 50-52: Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lines 54-55: Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Lines 73-78: Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Line 165: Route registration
app.use('/api/acha-products', achaProductsRouter);

// Line 181: Legacy route
app.use('/acha-products', achaProductsRouter);

// Lines 211-216: Migration at startup
try {
  await fixAchaProductsSchema();
} catch (migrationError) {
  console.error('⚠️ Acha products schema migration had issues (continuing anyway)');
}
```

---

### 📁 FILE: backend/config/database.js
**Path:** `C:\Users\PC\Desktop\newprej\backend\config\database.js`

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
  // ... connection logic
}

module.exports = {
  pool,
  testConnection,
  connectionVerified: () => connectionVerified
};
```

---

### 📁 FILE: backend/db/initTables.js (acha_products section)
**Path:** `C:\Users\PC\Desktop\newprej\backend\db\initTables.js`

```javascript
// Lines 151-169: acha_products table definition
{
  name: 'acha_products',
  createSQL: `
    CREATE TABLE acha_products (
      id SERIAL PRIMARY KEY,
      sub_id TEXT UNIQUE NOT NULL,
      name TEXT,
      brand_name TEXT,
      model_name TEXT,
      description TEXT,
      price TEXT,
      images TEXT[],
      quantity INTEGER DEFAULT 0,
      product_references TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
}
```

---

### 📁 FILE: backend/migrations/fix_acha_products_schema.js
**Path:** `C:\Users\PC\Desktop\newprej\backend\migrations\fix_acha_products_schema.js`

```javascript
/**
 * ACHA PRODUCTS SCHEMA AUTO-FIX MIGRATION
 * ==========================================
 * This script automatically runs at server startup to ensure
 * the acha_products table has the correct schema.
 * 
 * FIXES:
 * 1. Renames 'references' column to 'product_references' if needed
 * 2. Creates table if it doesn't exist
 * 3. Adds performance index
 */

const { pool } = require('../config/database');

async function fixAchaProductsSchema() {
  console.log('🔥 [MIGRATION] Starting acha_products schema fix...');
  
  let client;
  try {
    client = await pool.connect();
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'acha_products'
    `);
    
    const tableExists = tableCheck.rows.length > 0;
    
    if (!tableExists) {
      // Create table with correct schema
      await client.query(`
        CREATE TABLE acha_products (
          id SERIAL PRIMARY KEY,
          sub_id TEXT UNIQUE NOT NULL,
          name TEXT,
          brand_name TEXT,
          model_name TEXT,
          description TEXT,
          price TEXT,
          images TEXT[],
          quantity INTEGER DEFAULT 0,
          product_references TEXT[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('🟩 [MIGRATION] Created new acha_products table');
      
      // Add index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_acha_products_sub_id
        ON acha_products(sub_id)
      `);
      
    } else {
      // Check for old column name and rename
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'acha_products' 
        AND column_name = 'references'
      `);
      
      if (columnCheck.rows.length > 0) {
        await client.query(`
          ALTER TABLE acha_products 
          RENAME COLUMN references TO product_references
        `);
        console.log('🟩 [MIGRATION] Column renamed: references → product_references');
      }
    }
    
    console.log('🟩 [MIGRATION] ✅ SCHEMA FIX COMPLETE - READY FOR USE');
    
  } catch (error) {
    console.error('🟥 [MIGRATION] ERROR during schema fix:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = fixAchaProductsSchema;
```

---

## 🔥 2. DATABASE SCHEMA

### SQL Statements Related to acha_products

#### CREATE TABLE (from AchaProduct.js)
```sql
CREATE TABLE IF NOT EXISTS acha_products (
  id SERIAL PRIMARY KEY,
  sub_id TEXT UNIQUE NOT NULL,
  name TEXT,
  brand_name TEXT,        -- ❌ THIS COLUMN MISSING IN ACTUAL DATABASE!
  model_name TEXT,        -- ❌ THIS COLUMN MISSING IN ACTUAL DATABASE!
  description TEXT,
  price TEXT,
  images TEXT[],
  quantity INTEGER DEFAULT 0,
  product_references TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### CREATE TABLE (from initTables.js)
```sql
CREATE TABLE acha_products (
  id SERIAL PRIMARY KEY,
  sub_id TEXT UNIQUE NOT NULL,
  name TEXT,
  brand_name TEXT,        -- ❌ THIS COLUMN MISSING IN ACTUAL DATABASE!
  model_name TEXT,        -- ❌ THIS COLUMN MISSING IN ACTUAL DATABASE!
  description TEXT,
  price TEXT,
  images TEXT[],
  quantity INTEGER DEFAULT 0,
  product_references TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### INSERT Query (from AchaProduct.js:getOrCreate)
```sql
INSERT INTO acha_products (sub_id, name, brand_name, model_name, description, price, images, quantity, product_references)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (sub_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
RETURNING *
```

---

## 🔥 3. FRONTEND CODE CALLING THIS API

### 📁 FILE: auto-display-replicator-main/src/api/database.ts
**Path:** `C:\Users\PC\Desktop\newprej\auto-display-replicator-main\src\api\database.ts`

```typescript
// Lines 1221-1261: AchaProduct interface and getOrCreateAchaProduct function

export interface AchaProductData {
  id?: number;
  sub_id: string;
  name?: string;
  brand_name?: string;
  model_name?: string;
  description?: string;
  price?: string;
  images?: string[];
  quantity?: number;
  product_references?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Get or create an Acha product by sub_id
 */
export const getOrCreateAchaProduct = async (subId: string): Promise<AchaProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/acha-products/sub/${encodeURIComponent(subId)}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get or create acha product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Acha product loaded:', result.data.sub_id);
    return result.data;
  } catch (error) {
    console.error('❌ Error getting/creating acha product:', error);
    throw error;
  }
};

/**
 * Update an Acha product
 */
export const updateAchaProduct = async (id: number, data: Partial<AchaProductData>): Promise<AchaProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/acha-products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update acha product: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response');
    }
    
    console.log('✅ Acha product updated');
    return result.data;
  } catch (error) {
    console.error('❌ Error updating acha product:', error);
    throw error;
  }
};
```

---

### 📁 FILE: auto-display-replicator-main/src/pages/Acha.tsx
**Path:** `C:\Users\PC\Desktop\newprej\auto-display-replicator-main\src\pages\Acha.tsx`

```typescript
// Lines 24-29: Import API functions
import { 
  getOrCreateAchaProduct, 
  updateAchaProduct, 
  venteHorsLigneAchaProduct,
  AchaProductData 
} from "@/api/database";

// Lines 95-97: Component setup
const Acha = () => {
  const { subId } = useParams();
  const navigate = useNavigate();

// Lines 177-205: Load product when page opens
useEffect(() => {
  const loadProduct = async () => {
    if (!subId) return;
    
    setIsLoading(true);
    try {
      const productFromDb = await getOrCreateAchaProduct(subId);  // <-- API CALL HERE
      setProduct(productFromDb);

      setProductData({
        images: productFromDb.images || [],
        description: productFromDb.description || "",
        price: productFromDb.price || "0.000",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le produit.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  loadProduct();
}, [subId]);
```

---

### 📁 Components Generating Links to /acha/

**File:** `auto-display-replicator-main/src/components/FamillesPiecesSectionCompact.tsx`

```typescript
// Line 551
<button onClick={() => navigate(`/acha/${encodeURIComponent(item)}`)}>

// Line 731
<button onClick={() => navigate(`/acha/${encodeURIComponent(item)}`)}>
```

**File:** `auto-display-replicator-main/src/App.tsx`

```typescript
// Line 123: Route definition
<Route path="/acha/:subId" element={<Acha />} />
```

---

## 🔥 4. LOG INFORMATION

### All Log Statements Related to Acha

**From AchaProduct.js:**
```javascript
console.log('✅ acha_products table ready');
console.error('❌ Error creating acha_products table:', error.message);
console.error('❌ Error in findAll:', error.message);
console.error('❌ Error in findById:', error.message);
console.error('❌ Error in findBySubId:', error.message);
console.log('✅ Created new acha_product for sub_id:', subId);
console.error('❌ Error in getOrCreate:', error.message);
console.error('❌ Error in delete:', error.message);
console.error('❌ Error in decreaseQuantity:', error.message);
```

**From achaProductController.js:**
```javascript
console.error('❌ Error in getAll:', error.message);
console.error('❌ Error in getById:', error.message);
console.log('📦 Getting or creating product for sub_id:', subId);
console.error('❌ Error in getOrCreate:', error.message);
console.error('❌ Error in create:', error.message);
console.error('❌ Error in update:', error.message);
console.error('❌ Error in venteHorsLigne:', error.message);
console.error('❌ Error in delete:', error.message);
```

**From database.ts (Frontend):**
```typescript
console.log('✅ Acha product loaded:', result.data.sub_id);
console.error('❌ Error getting/creating acha product:', error);
console.log('✅ Acha product updated');
console.error('❌ Error updating acha product:', error);
console.log('✅ Vente hors ligne successful, new quantity:', result.data.quantity);
console.error('❌ Error performing vente hors ligne:', error);
```

---

## 🔥 5. BACKEND TERMINAL ERROR LOG

### ACTUAL ERROR FROM TERMINAL (LIVE)

```
[2025-12-08T16:56:42.910Z] GET /api/acha-products/sub/Disque%20d'embrayage
📦 Getting or creating product for sub_id: Disque d'embrayage
❌ Error in getOrCreate: la colonne « brand_name » de la relation « acha_products » n'existe pas
❌ Error in getOrCreate: la colonne « brand_name » de la relation « acha_products » n'existe pas
```

**Translation:**
- `la colonne « brand_name » de la relation « acha_products » n'existe pas`
- **English:** Column 'brand_name' of relation 'acha_products' does not exist

### Other Relevant Errors from Terminal

```
[2025-12-08T15:18:47.836Z] GET /api/acha-products/sub/Kit%20embrayage%20complet
[2025-12-08T15:18:58.114Z] GET /api/acha-products/sub/Disque%20d'embrayage
❌ Error in getOrCreate: la colonne « brand_name » de la relation « acha_products » n'existe pas
❌ Error in getOrCreate: la colonne « brand_name » de la relation « acha_products » n'existe pas
[2025-12-08T15:20:02.832Z] GET /api/acha-products/sub/Disque%20d'embrayage
❌ Error in getOrCreate: la colonne « brand_name » de la relation « acha_products » n'existe pas
[2025-12-08T15:23:05.532Z] GET /api/acha-products/sub/Kit%20embrayage%20complet
[2025-12-08T15:24:14.869Z] GET /api/acha-products/sub/Disque%20d'embrayage
❌ Error in getOrCreate: la colonne « brand_name » de la relation « acha_products » n'existe pas
```

### Server Status
```
✓ Table exists: acha_products
```

**NOTE:** The table EXISTS but is missing the `brand_name` and `model_name` columns!

---

## 🔥 6. SUMMARY & ROOT CAUSE ANALYSIS

### ✅ What I Found

1. **The table `acha_products` EXISTS** in the database
2. **BUT it was created with an OLD SCHEMA** that doesn't have `brand_name` and `model_name` columns
3. **The backend code NOW tries to INSERT into these columns**
4. **PostgreSQL throws error:** `column 'brand_name' does not exist`
5. **This triggers the 500 Internal Server Error**

### 🔴 EXACT ROOT CAUSE

**The `acha_products` table was created BEFORE the schema was updated to include `brand_name` and `model_name` columns.**

The current table schema (in database) is:
```sql
id, sub_id, name, description, price, images, quantity, product_references, created_at, updated_at
```

The code EXPECTS the schema to be:
```sql
id, sub_id, name, brand_name, model_name, description, price, images, quantity, product_references, created_at, updated_at
```

**Missing columns:**
- `brand_name TEXT`
- `model_name TEXT`

### 🔴 Why Migration Didn't Fix It

The migration script (`fix_acha_products_schema.js`) only checks:
1. If table exists → does nothing (table already exists)
2. If `references` column exists → renames to `product_references`

**IT DOES NOT CHECK** for missing columns like `brand_name` and `model_name`!

---

## 📋 LIKELY ROOT CAUSES

| # | Cause | Likelihood |
|---|-------|------------|
| 1 | **Missing columns `brand_name` and `model_name` in actual database table** | 🔴 100% |
| 2 | Table was created before schema was updated | 🔴 100% |
| 3 | Migration script doesn't add missing columns | 🔴 100% |
| 4 | `CREATE TABLE IF NOT EXISTS` doesn't update existing tables | 🔴 100% |

---

## 📍 EXACT LINES THAT ARE FAILING

### Line 140-143 in `backend/models/AchaProduct.js`
```javascript
const result = await pool.query(
  `INSERT INTO acha_products (sub_id, name, brand_name, model_name, description, price, images, quantity, product_references)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   ON CONFLICT (sub_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
   RETURNING *`,
```

**Error occurs on `brand_name` and `model_name` columns that don't exist in the actual table!**

---

## 🛠️ RECOMMENDATIONS FOR FIX

### Option 1: Add Missing Columns (RECOMMENDED)

Run SQL to add the missing columns:

```sql
ALTER TABLE acha_products ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE acha_products ADD COLUMN IF NOT EXISTS model_name TEXT;
```

### Option 2: Update Migration Script

Update `fix_acha_products_schema.js` to add missing columns:

```javascript
// Check if brand_name column exists
const brandNameCheck = await client.query(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'acha_products' 
  AND column_name = 'brand_name'
`);

if (brandNameCheck.rows.length === 0) {
  console.log('🟥 [MIGRATION] Column "brand_name" MISSING → adding...');
  await client.query(`ALTER TABLE acha_products ADD COLUMN brand_name TEXT`);
  console.log('🟩 [MIGRATION] Column added: brand_name');
}

// Check if model_name column exists
const modelNameCheck = await client.query(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'acha_products' 
  AND column_name = 'model_name'
`);

if (modelNameCheck.rows.length === 0) {
  console.log('🟥 [MIGRATION] Column "model_name" MISSING → adding...');
  await client.query(`ALTER TABLE acha_products ADD COLUMN model_name TEXT`);
  console.log('🟩 [MIGRATION] Column added: model_name');
}
```

### Option 3: Drop and Recreate Table (DESTRUCTIVE)

```sql
DROP TABLE IF EXISTS acha_products CASCADE;
-- Then restart server to recreate table
```

---

## ✅ FINAL DIAGNOSIS

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  🔴 ROOT CAUSE IDENTIFIED                                     ║
║                                                               ║
║  The acha_products table is MISSING two columns:              ║
║                                                               ║
║    ❌ brand_name TEXT                                         ║
║    ❌ model_name TEXT                                         ║
║                                                               ║
║  The table was created before the schema was updated.         ║
║  The backend code tries to INSERT into these columns.         ║
║  PostgreSQL throws: "column 'brand_name' does not exist"      ║
║  This triggers: 500 Internal Server Error                     ║
║                                                               ║
║  FIX: Run ALTER TABLE to add the missing columns              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🚀 IMMEDIATE ACTION REQUIRED

Run this SQL in PostgreSQL:

```sql
ALTER TABLE acha_products ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE acha_products ADD COLUMN IF NOT EXISTS model_name TEXT;
```

OR update the migration script to add missing columns automatically.

---

**End of Debug Report**  
**Generated:** December 8, 2025  
**Status:** 🔴 CRITICAL BUG IDENTIFIED - Missing Database Columns

