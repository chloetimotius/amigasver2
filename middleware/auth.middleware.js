/**
 * Authentication Middleware
 * Shared middleware functions for authentication and authorization
 */

/**
 * Require Authentication Middleware
 * Ensures user is logged in before accessing protected routes
 */
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Optional Authentication Middleware
 * Sets user info if logged in, but doesn't block access
 */
function optionalAuth(req, res, next) {
  // User info is already available in req.session if logged in
  // No blocking, just proceed
  next();
}

/**
 * Attach User Info Middleware
 * Adds user information to request object
 */
function attachUserInfo(req, res, next) {
  if (req.session.userId) {
    req.user = {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail
    };
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  attachUserInfo
};