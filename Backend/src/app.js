// src/app.js
// ================================
// EXPRESS APP CONFIGURATION
// ================================
// This file sets up the Express app with all middleware and routes.
// Server.js imports this and starts the server.

const express = require("express");
const cors = require("cors");

// Import routes
const mountRoutes = require("./routes");

// Import error handling middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize Express app
const app = express();

// ================================
// MIDDLEWARE
// ================================

/**
 * CORS - Cross-Origin Resource Sharing
 * 
 * WHY: Frontend (localhost:5173) needs to access Backend (localhost:5000)
 * Without CORS, browser blocks the requests (Same-Origin Policy)
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true  // Allow cookies if needed
}));

/**
 * Body Parsers
 * 
 * express.json() - Parses JSON request bodies
 * express.urlencoded() - Parses URL-encoded form data
 * 
 * WHY: req.body would be undefined without these
 */
app.use(express.json({ limit: "10mb" }));  // Limit to prevent large payload attacks
app.use(express.urlencoded({ extended: true }));

// ================================
// HEALTH CHECK ROUTE
// ================================

/**
 * Health Check Endpoint
 * 
 * WHY: Used to verify server is running
 * - Frontend can ping this on startup
 * - Deployment health checks (AWS, Vercel, etc.)
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "PrepBridge Backend Running 🚀",
    timestamp: new Date().toISOString()
  });
});

// ================================
// MOUNT ALL ROUTES
// ================================

/**
 * Mount routes from routes/index.js
 * 
 * Routes mounted:
 * - /api/auth/* - Authentication
 * - /api/users/* - User profile (coming soon)
 * - /api/tasks/* - Task management (coming soon)
 * - etc.
 */
mountRoutes(app);

// ================================
// ERROR HANDLING (Must be last)
// ================================

/**
 * 404 Handler - For undefined routes
 * 
 * WHY: Must be after all route definitions
 * If no route matched, this catches it
 */
app.use(notFound);

/**
 * Global Error Handler
 * 
 * WHY: Catches all errors thrown in the app
 * - Mongoose errors
 * - JWT errors
 * - Custom AppError
 * - Unexpected errors
 */
app.use(errorHandler);

module.exports = app;
