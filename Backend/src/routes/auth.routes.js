// src/routes/auth.routes.js
// ================================
// AUTH ROUTES - All authentication endpoints
// ================================
// These routes handle user registration, login, verification, etc.
// Base path: /api/auth

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  register,
  verifyOTP,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  resendOTP
} = require("../controllers/auth.controller");

const { adminLogin } = require("../controllers/admin.controller");

// Import auth middleware
const { protect } = require("../middleware/auth.middleware");

/**
 * ROUTE DEFINITIONS
 * 
 * Each route is mapped to a controller function.
 * 'protect' middleware is added for protected routes.
 * 
 * PUBLIC ROUTES (no token needed):
 * - POST /register - Create new account
 * - POST /verify-otp - Verify email with OTP
 * - POST /login - Login and get token
 * - POST /forgot-password - Request password reset
 * - POST /reset-password - Reset password with token
 * - POST /resend-otp - Resend verification OTP
 * 
 * PROTECTED ROUTES (token required):
 * - GET /me - Get current user
 * - POST /logout - Logout (client-side)
 */

// ============ PUBLIC ROUTES ============

// @route   POST /api/auth/admin/login
// @desc    Login admin
// @access  Public
router.post("/admin/login", adminLogin);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate account
// @access  Public
router.post("/verify-otp", verifyOTP);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", resetPassword);

// @route   POST /api/auth/resend-otp
// @desc    Resend verification OTP
// @access  Public
router.post("/resend-otp", resendOTP);

// ============ PROTECTED ROUTES ============

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get("/me", protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", protect, logout);

// @route   PUT /api/auth/change-password
// @desc    Change password (logged in)
// @access  Private
router.put("/change-password", protect, changePassword);

module.exports = router;
