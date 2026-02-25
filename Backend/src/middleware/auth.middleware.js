// src/middleware/auth.middleware.js
// ================================
// SHARED MIDDLEWARE - Authentication & Authorization
// ================================
// This middleware protects routes by verifying JWT tokens
// and checking user roles. Used by both student and admin routes.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect Middleware - Verify JWT Token
 * 
 * HOW JWT AUTHENTICATION WORKS:
 * 1. User logs in → Server creates JWT with user ID and signs it with secret
 * 2. Client stores JWT (localStorage/cookie) and sends it in headers
 * 3. This middleware extracts token, verifies signature, and attaches user to req
 * 
 * TOKEN FORMAT: "Bearer <token>" in Authorization header
 * 
 * USAGE: router.get('/profile', protect, getProfile);
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // ============ STEP 1: Extract Token ============
    // Check if Authorization header exists and has correct format
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      // Split "Bearer <token>" and get the token part
      token = req.headers.authorization.split(" ")[1];
    }
    
    // No token provided
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    
    // ============ STEP 2: Verify Token ============
    // jwt.verify() does two things:
    // 1. Checks if token signature is valid (not tampered)
    // 2. Checks if token is not expired
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Token verification failed
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again."
        });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please login again."
        });
      }
      throw error;
    }
    
    // ============ STEP 3: Get User from Database ============
    // Token is valid, now fetch the user
    // WHY: Token might be valid but user might be deleted/banned
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again."
      });
    }
    
    // Check if user is banned
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support."
      });
    }
    
    // Check if user is verified (for students)
    if (!user.isVerified && user.role === "student") {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first."
      });
    }
    
    // ============ STEP 4: Attach User to Request ============
    // Now all subsequent middleware/controllers can access req.user
    req.user = user;
    
    next();
    
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error. Please try again."
    });
  }
};

/**
 * Authorize Middleware - Role-Based Access Control
 * 
 * HOW RBAC WORKS:
 * 1. Define which roles can access a route
 * 2. This middleware checks if req.user.role is in allowed list
 * 3. If not, return 403 Forbidden
 * 
 * USAGE: 
 * router.get('/admin/users', protect, authorize('admin'), getUsers);
 * router.get('/data', protect, authorize('admin', 'student'), getData);
 * 
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};

/**
 * Optional Auth Middleware - For routes that work with or without auth
 * 
 * USAGE: Community posts - logged in users see their upvote status
 * router.get('/posts', optionalAuth, getPosts);
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user && user.status === "active") {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but that's okay for optional auth
        // Just continue without req.user
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
