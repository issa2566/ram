/**
 * Main Server File
 * Express application with PostgreSQL integration
 * Clean architecture: routes -> controllers -> models -> database
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { port, cors: corsConfig } = require('./config/app');
const { pool, testConnection } = require('./config/database');
const migrate = require('./db/migrate');
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

// Rate limiting middleware (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

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

// Health check endpoint - MUST always respond, even if database is down
// This allows load balancers and monitoring to check server availability
app.get('/health', async (req, res) => {
  try {
    // Quick database ping (non-blocking, timeout after 2 seconds)
    let dbStatus = 'unknown';
    try {
      const quickTest = await Promise.race([
        testConnection(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      dbStatus = quickTest.success ? 'connected' : 'disconnected';
    } catch (err) {
      dbStatus = 'timeout';
    }
    
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    // Health check should never fail - return basic status even on error
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'unknown',
        environment: process.env.NODE_ENV || 'development',
        warning: 'Health check query failed but server is running'
      }
    });
  }
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

// REMOVED: Legacy routes without /api prefix (duplicates removed for localhost cleanup)
// All routes are now accessed via /api/* prefix only

// Serve React app build files ONLY in development mode
// In production, Nginx should serve static files - backend only handles API
const distPath = path.join(__dirname, '../auto-display-replicator-main/dist');
const isProduction = process.env.NODE_ENV === 'production';

if (fs.existsSync(distPath) && !isProduction) {
  console.log('📁 [DEV] Serving React app build files from:', distPath);
  // Serve static files from dist
  app.use(express.static(distPath));
  
  // SPA fallback: serve index.html for all non-API routes (development only)
  app.get('*', (req, res, next) => {
    // Skip API routes and static file routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/brands') || req.path.startsWith('/hero') || req.path.startsWith('/auth') || req.path.startsWith('/users') || req.path.startsWith('/upload') || req.path.startsWith('/products') || req.path.startsWith('/searchOptions') || req.path.startsWith('/carBrands') || req.path.startsWith('/vehicles') || req.path.startsWith('/vehicleModels') || req.path.startsWith('/models') || req.path.startsWith('/parts') || req.path.startsWith('/acha-products') || req.path.startsWith('/subcategories')) {
      return next();
    }
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else if (isProduction && fs.existsSync(distPath)) {
  console.log('📁 [PROD] Frontend dist folder exists but will be served by Nginx, not Node.js');
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
    // PHASE 1: Load and validate environment variables
    console.log('📋 Loading environment variables...');
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProduction = nodeEnv === 'production';
    
    // Validate required environment variables
    const requiredVars = ['DB_USER', 'DB_NAME', 'DB_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.error('   Please set these in your .env file');
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    if (isProduction && !process.env.CORS_ORIGIN) {
      console.warn('⚠️  CORS_ORIGIN not set in production. CORS may fail.');
      console.warn('   Set CORS_ORIGIN in .env (e.g., CORS_ORIGIN=https://yourdomain.com)');
    }
    
    console.log('✅ Environment variables validated');
    
    // PHASE 2: Connect to database (FAIL if error)
    console.log('🔄 Connecting to database...');
    const dbTest = await testConnection();
    
    if (!dbTest.success) {
      console.error('❌ Database connection FAILED');
      console.error(`   Error: ${dbTest.error}`);
      if (dbTest.code) {
        console.error(`   Code: ${dbTest.code}`);
      }
      throw new Error(`Database connection failed: ${dbTest.error}`);
    }
    console.log('✅ Database connection successful');
    
    // PHASE 3: Run database migration (FAIL if error)
    console.log('🔄 Running database migration...');
    await migrate();
    console.log('✅ Database migration completed');
    
    // PHASE 4: Start server - ALWAYS listen on 0.0.0.0 for production
    const host = process.env.HOST || '0.0.0.0';
    
    console.log('\n🚀 Starting server...');
    console.log(`   Environment: ${nodeEnv}`);
    console.log(`   Port: ${port}`);
    console.log(`   Host: ${host} (listening on all interfaces)`);
    if (isProduction) {
      console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || 'NOT SET (WARNING)'}`);
    }
    
    const server = app.listen(port, host, () => {
      console.log(`\n✅ Server running on ${host}:${port}`);
      // Don't show localhost in production logs - use actual hostname or IP
      const displayHost = host === '0.0.0.0' 
        ? (isProduction ? '0.0.0.0 (all interfaces)' : 'localhost')
        : host;
      console.log(`📍 API URL: http://${displayHost}:${port}`);
      console.log(`📍 Health check: http://${displayHost}:${port}/health`);
      console.log(`📍 Database: ${process.env.DB_NAME}`);
      if (isProduction) {
        console.log('\n📋 Production mode - API endpoints available at /api/*');
      } else {
        console.log('\n📋 Available API endpoints:');
        console.log('   - GET  /api/vehicles       → List all vehicles');
        console.log('   - POST /api/vehicles       → Create vehicle');
        console.log('   - GET  /api/vehicles/:id   → Get vehicle');
        console.log('   - PUT  /api/vehicles/:id   → Update vehicle');
        console.log('   - DELETE /api/vehicles/:id → Delete vehicle');
        console.log('   - GET  /api/carBrands      → List car brands');
        console.log('   - GET  /api/searchOptions  → List search options');
        console.log('   - GET  /api/products       → List products');
      }
    });

    // Handle server errors - NO AUTO-SWITCH
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${port} is already in use`);
        console.error(`💡 Solutions:`);
        console.error(`   1. Stop the process using port ${port}`);
        console.error(`   2. Set a different PORT in .env file (e.g., PORT=5001)`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }
    });
    
    // Graceful shutdown handlers remain unchanged
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
