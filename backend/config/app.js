/**
 * Application Configuration
 * Centralized app settings and environment variables
 */

require('dotenv').config();

// Validate and normalize PORT
const getPort = () => {
  const envPort = process.env.PORT;
  
  if (!envPort) {
    console.warn('⚠️  PORT environment variable not set. Using default: 5000');
    return 5000;
  }
  
  const port = parseInt(envPort, 10);
  
  if (isNaN(port) || port < 1 || port > 65535) {
    console.warn(`⚠️  Invalid PORT value "${envPort}". Using default: 5000`);
    return 5000;
  }
  
  return port;
};

// Production environment validation
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Validate production environment variables
if (isProduction) {
  const requiredProdVars = ['CORS_ORIGIN'];
  const missingProdVars = requiredProdVars.filter(varName => !process.env[varName]);
  
  if (missingProdVars.length > 0) {
    console.error(`[CONFIG] Missing required production environment variables: ${missingProdVars.join(', ')}`);
    console.error(`[CONFIG] Server will start but CORS may fail. Set these in your .env file.`);
    // Don't throw - allow server to start but log warning
  }
}

module.exports = {
  port: getPort(),
  nodeEnv: nodeEnv,
  // Remove localhost reference - API base URL should be set by frontend, not backend
  // Backend doesn't need to know its own public URL
  apiBaseUrl: process.env.API_BASE_URL || (isProduction ? null : `http://localhost:${getPort()}`),
  
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
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    directory: 'uploads'
  },
  
  // CORS - Production requires explicit origin, development allows all
  cors: {
    origin: (() => {
      if (isProduction) {
        if (!process.env.CORS_ORIGIN) {
          // Log warning but don't throw - allows health check to work
          console.warn('[CORS] WARNING: CORS_ORIGIN not set in production. CORS requests may fail.');
          console.warn('[CORS] Set CORS_ORIGIN in .env (e.g., CORS_ORIGIN=https://yourdomain.com)');
          return '*'; // Fallback to allow all (less secure but allows server to start)
        }
        // Support comma-separated origins for multiple frontend domains
        return process.env.CORS_ORIGIN.includes(',') 
          ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
          : process.env.CORS_ORIGIN;
      }
      // Development: allow all origins
      return '*';
    })(),
    credentials: true
  }
};

