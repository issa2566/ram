/**
 * Require Admin Middleware
 * Verifies that the user is an admin
 * 
 * NOTE: This is a basic implementation. In production, you should use
 * JWT tokens or sessions for proper authentication.
 */

const requireAdmin = (req, res, next) => {
  // Check the user from request headers
  // Frontend sends user data in 'x-user' header
  const userHeader = req.headers['x-user'];
  
  if (!userHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    // Parse user from header
    const user = typeof userHeader === 'string' ? JSON.parse(userHeader) : userHeader;
    
    // Check if user is admin (multiple ways to check based on existing codebase patterns)
    const isAdmin = 
      user.role === 'admin' || 
      user.is_admin === true || 
      user.isAdmin === true ||
      user.role === 'administrator' ||
      user.role === 'superadmin';
    
    if (isAdmin) {
      req.user = user;
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication'
    });
  }
};

module.exports = requireAdmin;

