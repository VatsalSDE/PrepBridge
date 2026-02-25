// src/middleware/errorHandler.js
// ================================
// SHARED MIDDLEWARE - Centralized Error Handling
// ================================
// This middleware catches all errors thrown in the app and sends
// consistent error responses. It's the last middleware in the chain.

/**
 * Custom Error Class - For throwing custom errors with status codes
 * 
 * USAGE: 
 * throw new AppError("User not found", 404);
 * throw new AppError("Invalid credentials", 401);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;  // Distinguishes from programming errors
    
    // Captures stack trace (where error originated)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Handler Middleware
 * 
 * HOW EXPRESS ERROR HANDLING WORKS:
 * 1. Error is thrown or passed to next(error)
 * 2. Express skips all regular middleware
 * 3. Finds error handling middleware (4 params: err, req, res, next)
 * 4. Sends error response
 * 
 * WHY CENTRALIZED ERROR HANDLING:
 * - Consistent error response format across all routes
 * - One place to handle all error types
 * - Clean controllers (just throw errors, don't handle responses)
 * - Proper logging in one place
 * 
 * USAGE: app.use(errorHandler); // Must be last middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging (in development)
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 ERROR:", err);
  }

  // ============ MONGOOSE ERRORS ============
  
  /**
   * CastError - Invalid ObjectId
   * Example: GET /api/users/invalid-id
   * MongoDB can't convert "invalid-id" to ObjectId
   */
  if (err.name === "CastError") {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  
  /**
   * Duplicate Key Error - Unique constraint violation
   * Example: Creating user with existing email
   * Error code 11000 is MongoDB's duplicate key error
   */
  if (err.code === 11000) {
    // Extract the duplicate field name
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new AppError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists.`,
      400
    );
  }
  
  /**
   * Validation Error - Schema validation failed
   * Example: Missing required field, invalid enum value
   */
  if (err.name === "ValidationError") {
    // Extract all validation error messages
    const messages = Object.values(err.errors).map(e => e.message);
    error = new AppError(messages.join(". "), 400);
  }

  // ============ JWT ERRORS ============
  
  /**
   * JsonWebTokenError - Invalid token signature
   */
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please login again.", 401);
  }
  
  /**
   * TokenExpiredError - Token has expired
   */
  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired. Please login again.", 401);
  }

  // ============ SEND RESPONSE ============
  
  // Determine status code
  const statusCode = error.statusCode || err.statusCode || 500;
  
  // Send different response based on environment
  if (process.env.NODE_ENV === "development") {
    // Development: Include stack trace for debugging
    res.status(statusCode).json({
      success: false,
      message: error.message || "Server Error",
      error: err.name,
      stack: err.stack
    });
  } else {
    // Production: Don't expose internal details
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 
        ? "Something went wrong. Please try again later." 
        : error.message
    });
  }
};

/**
 * Not Found Handler - For undefined routes
 * 
 * USAGE: app.use(notFound); // Before errorHandler
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Async Handler - Wrapper to catch async errors
 * 
 * WHY: Without try-catch, async errors crash the server
 * This wrapper catches async errors and passes to errorHandler
 * 
 * USAGE: 
 * const getUsers = asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * });
 * 
 * Instead of:
 * const getUsers = async (req, res, next) => {
 *   try {
 *     const users = await User.find();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler
};
