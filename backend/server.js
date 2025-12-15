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

// 🔥 AUTO-FIX MIGRATION: Fix acha_products schema at startup
const fixAchaProductsSchema = require('./migrations/fix_acha_products_schema');

// 🔥 AUTO-FIX MIGRATION: Add missing columns (brand_name, model_name) to acha_products
const fixMissingAchaColumns = require('./migrations/fix_missing_acha_columns');

// 🔥 AUTO-FIX MIGRATION: Add promotion_percentage column to acha_products
const addPromotionPercentage = require('./migrations/add_promotion_percentage');
// 🔥 AUTO-FIX MIGRATION: Add promotion_price column to acha_products
const addPromotionPrice = require('./migrations/add_promotion_price');
// 🔥 AUTO-FIX MIGRATION: Convert price column from TEXT to NUMERIC(12,3)
const convertPriceToNumeric = require('./migrations/convert_price_to_numeric');
// 🔥 AUTO-FIX MIGRATION: Fix price column type
const fixPriceColumnType = require('./migrations/fix_price_column_type');
// 🔥 COMPREHENSIVE MIGRATION: Fix entire Acha promotion system (price + promotion columns)
const fixAchaPromotionSystem = require('./migrations/fix_acha_promotion_system');
// 🔥 MIGRATION: Add quantity column to dashboard_products
const addQuantityToDashboardProducts = require('./migrations/add_quantity_to_dashboard_products');

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
const heroRouter = require('./routes/hero');
const brandsRouter = require('./routes/brands');
const subcategoriesRouter = require('./routes/subcategories');
// OLD route file - kept for reference but not used
// const dashboardProductsRouter = require('./routes/dashboardProducts');
const dashboardProductsRoutes = require("./dashboardProducts/dashboardProducts.routes");

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

// API routes (must be before static files)
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
const acha2Router = require('./routes/acha2Router');
app.use('/api/acha2', acha2Router);
app.use('/api/modeles', require('./routes/modeles'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/hero', heroRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use("/api/sectionContent", require("./routes/sectionContent"));
app.use("/api", dashboardProductsRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Serve static files from public/hero directory for hero images
const heroDir = path.join(__dirname, 'public/hero');
if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}
app.use('/hero', express.static(heroDir));

// Serve static files from brands directory
const brandsDir = path.join(__dirname, 'public/brands');
if (!fs.existsSync(brandsDir)) {
  fs.mkdirSync(brandsDir, { recursive: true });
  console.log('📁 Created /public/brands directory');
}
console.log('📁 Serving brands static files from:', brandsDir);
app.use('/brands', express.static(brandsDir));

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
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          checkEmail: 'GET /api/auth/check-email/:email'
        },
        users: {
          getAll: 'GET /api/users',
          getById: 'GET /api/users/:id',
          create: 'POST /api/users',
          update: 'PUT /api/users/:id',
          delete: 'DELETE /api/users/:id'
        },
        upload: {
          uploadImage: 'POST /api/upload/image',
          deleteImage: 'DELETE /api/upload/image'
        },
        products: {
          getAll: 'GET /api/products',
          getById: 'GET /api/products/:id',
          create: 'POST /api/products',
          update: 'PUT /api/products/:id',
          delete: 'DELETE /api/products/:id'
        },
        searchOptions: {
          getAll: 'GET /api/searchOptions',
          getById: 'GET /api/searchOptions/:id',
          create: 'POST /api/searchOptions',
          delete: 'DELETE /api/searchOptions/:id'
        },
        carBrands: {
          getAll: 'GET /api/carBrands',
          getById: 'GET /api/carBrands/:id',
          create: 'POST /api/carBrands',
          update: 'PUT /api/carBrands/:id',
          delete: 'DELETE /api/carBrands/:id'
        },
        vehicles: {
          getAll: 'GET /api/vehicles',
          getById: 'GET /api/vehicles/:id',
          create: 'POST /api/vehicles',
          update: 'PUT /api/vehicles/:id',
          delete: 'DELETE /api/vehicles/:id',
          search: 'GET /api/vehicles/search?q=query'
        },
        hero: {
          get: 'GET /api/hero',
          update: 'POST /api/hero',
          uploadImages: 'POST /api/hero/upload'
        },
        sectionContent: {
          get: 'GET /api/sectionContent?sectionType=xxx',
          create: 'POST /api/sectionContent',
          update: 'PUT /api/sectionContent/:id'
        }
      }
    }
  });
});

console.log("✅ DashboardProducts routes mounted at /api/dashboard-products");

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
app.use('/hero', heroRouter);
app.use('/brands', brandsRouter);
app.use('/subcategories', subcategoriesRouter);
// OLD dashboard-products route removed - using new PostgreSQL-based route at /api/dashboard-products
// app.use('/dashboard-products', dashboardProductsRouter);

// Serve React app build files (if dist folder exists - for production)
const distPath = path.join(__dirname, '../auto-display-replicator-main/dist');
if (fs.existsSync(distPath)) {
  console.log('📁 Serving React app build files from:', distPath);
  // Serve static files from dist
  app.use(express.static(distPath));
  
  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes and static file routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/brands') || req.path.startsWith('/hero') || req.path.startsWith('/auth') || req.path.startsWith('/users') || req.path.startsWith('/upload') || req.path.startsWith('/products') || req.path.startsWith('/searchOptions') || req.path.startsWith('/carBrands') || req.path.startsWith('/vehicles') || req.path.startsWith('/vehicleModels') || req.path.startsWith('/models') || req.path.startsWith('/parts') || req.path.startsWith('/acha-products') || req.path.startsWith('/subcategories')) {
      return next();
    }
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 handler (only for API routes)
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
      console.error('❌ Database connection failed. Server will start but database operations will fail.');
      console.error('   Error:', dbTest.error);
    } else {
      console.log('✅ Database connection successful');
      
      // 🔥 AUTO-FIX: Run acha_products schema migration FIRST
      try {
        await fixAchaProductsSchema();
      } catch (migrationError) {
        console.error('⚠️ Acha products schema migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Add missing columns (brand_name, model_name) to acha_products
      try {
        await fixMissingAchaColumns();
      } catch (migrationError) {
        console.error('⚠️ Missing columns migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Add promotion_percentage column to acha_products
      try {
        await addPromotionPercentage();
      } catch (migrationError) {
        console.error('⚠️ Promotion percentage migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Add promotion_price column to acha_products
      try {
        await addPromotionPrice();
      } catch (migrationError) {
        console.error('⚠️ Promotion price migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Add Acha2 fields (quantity2, description2, price2, references2, images2)
      try {
        const addAcha2Fields = require('./migrations/add_acha2_fields');
        await addAcha2Fields();
      } catch (migrationError) {
        console.error('⚠️ Acha2 fields migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Create acha2_products table
      try {
        const createAcha2ProductsTable = require('./migrations/create_acha2_products_table');
        await createAcha2ProductsTable();
      } catch (migrationError) {
        console.error('⚠️ Acha2 products table migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Create global_settings table
      try {
        const createGlobalSettingsTable = require('./migrations/create_global_settings_table');
        await createGlobalSettingsTable();
      } catch (migrationError) {
        console.error('⚠️ Global settings table migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Convert price column from TEXT to NUMERIC(12,3)
      try {
        await convertPriceToNumeric();
      } catch (migrationError) {
        console.error('⚠️ Price to numeric migration had issues (continuing anyway)');
      }
      
      // 🔥 AUTO-FIX: Fix price column type
      try {
        await fixPriceColumnType();
      } catch (migrationError) {
        console.error('⚠️ Fix price column type migration had issues (continuing anyway)');
      }
      
      // 🔥 COMPREHENSIVE FIX: Run unified migration for entire promotion system
      // This migration handles: price conversion, promotion_percentage, promotion_price
      try {
        await fixAchaPromotionSystem();
      } catch (migrationError) {
        console.error('⚠️ Comprehensive promotion system migration had issues (continuing anyway)');
        console.error('   Error details:', migrationError.message);
      }
      
      // 🔥 AUTO-FIX: Add quantity column to dashboard_products
      try {
        await addQuantityToDashboardProducts();
      } catch (migrationError) {
        console.error('⚠️ Add quantity to dashboard_products migration had issues (continuing anyway)');
      }
      
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
      console.log(`📍 Health check: http://localhost:${port}/health`);
      console.log(`📍 Database: ${process.env.DB_NAME || 'not configured'}`);
      console.log('\n📋 Available API endpoints:');
      console.log('   - GET  /api/vehicles       → List all vehicles');
      console.log('   - POST /api/vehicles       → Create vehicle');
      console.log('   - GET  /api/vehicles/:id   → Get vehicle');
      console.log('   - PUT  /api/vehicles/:id   → Update vehicle');
      console.log('   - DELETE /api/vehicles/:id → Delete vehicle');
      console.log('   - GET  /api/carBrands      → List car brands');
      console.log('   - GET  /api/searchOptions  → List search options');
      console.log('   - GET  /api/products       → List products');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error(`💡 Try using a different port by setting PORT in .env file`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\nSIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
