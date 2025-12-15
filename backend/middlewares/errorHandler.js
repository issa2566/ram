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

