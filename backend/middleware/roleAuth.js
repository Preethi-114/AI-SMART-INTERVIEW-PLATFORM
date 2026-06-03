// middleware/roleAuth.js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (from authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user role from token (make sure role is included in JWT)
    const userRole = req.user.role;

    // Check if user role is allowed
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

module.exports = authorize;