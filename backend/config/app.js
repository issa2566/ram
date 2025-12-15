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

module.exports = {
  port: getPort(),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  
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
  
  // CORS
  cors: {
    origin: (() => {
      if (process.env.NODE_ENV === 'production') {
        if (!process.env.CORS_ORIGIN) {
          throw new Error('CORS_ORIGIN environment variable is required in production');
        }
        // Support comma-separated origins
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

