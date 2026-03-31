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
const { maintenanceGuard } = require("./middleware/maintenance.middleware");

// Import error handling middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize Express app
const app = express();

const defaultAllowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
];

const configuredOrigins = `${process.env.FRONTEND_URL || ''},${process.env.FRONTEND_URLS || ''}`
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  ...defaultAllowedOrigins,
  ...configuredOrigins,
]));

const isDevelopment = (process.env.NODE_ENV || '').toLowerCase() !== 'production';

const isPrivateIpv4 = (host) => {
  const parts = host.split('.').map((value) => Number(value));
  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return false;
  }

  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  return false;
};

const isAllowedDevLanOrigin = (origin) => {
  try {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol)) return false;

    const host = (url.hostname || '').toLowerCase();
    if (host === 'localhost') return true;
    if (host.endsWith('.local')) return true;
    return isPrivateIpv4(host);
  } catch {
    return false;
  }
};

// ================================
// MIDDLEWARE
// ================================

/**
 * CORS - Cross-Origin Resource Sharing
 * 
 * WHY: Frontend (localhost:8080/5173) needs to access Backend (localhost:5000)
 * Without CORS, browser blocks the requests (Same-Origin Policy)
 */
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser and same-origin requests that do not send Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Development convenience: allow local/LAN frontend origins.
    if (isDevelopment && isAllowedDevLanOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

app.use(maintenanceGuard);


// ================================
// SESSION + PASSPORT (OAuth)
// ================================
const session = require("express-session");
const passport = require("./config/passport");

app.use(session({
  secret: process.env.SESSION_SECRET || "prepbridge_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

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
