// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");

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
const { protect } = require("../middleware/auth.middleware");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// ============ PUBLIC ROUTES ============
router.post("/admin/login", adminLogin);
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);

// ============ PROTECTED ROUTES ============
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);

// ============ GOOGLE OAUTH ============
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login"
  }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.redirect(
      `${FRONTEND_URL}/oauth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`
    );
  }
);

// ============ GITHUB OAUTH ============
router.get("/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get("/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login"
  }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.redirect(
      `${FRONTEND_URL}/oauth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`
    );
  }
);

module.exports = router;