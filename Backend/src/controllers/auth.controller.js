// src/controllers/auth.controller.js
// ================================
// AUTH CONTROLLER - Handles all authentication logic
// ================================
// Registration, Login, OTP Verification, Password Reset, etc.
// This is where the actual business logic lives.

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError, asyncHandler } = require("../middleware/errorHandler");
const emailService = require("../services/email.service");
const { getSettings } = require("../services/platformSettings.service");

/**
 * Helper: Generate JWT Token
 * 
 * @param {ObjectId} userId - User's MongoDB ID
 * @returns {string} - Signed JWT token
 * 
 * JWT STRUCTURE:
 * - Header: { alg: "HS256", typ: "JWT" }
 * - Payload: { userId: "...", iat: timestamp, exp: timestamp }
 * - Signature: HMAC-SHA256(header + payload, secret)
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },                          // Payload
    process.env.JWT_SECRET,              // Secret key
    { expiresIn: process.env.JWT_EXPIRE || "7d" }  // Expiry
  );
};

/**
 * Helper: Send Token Response
 * 
 * Standardized response format for auth endpoints
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  
  // Remove sensitive fields from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    college: user.college,
    targetRole: user.targetRole
  };
  
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userResponse
  });
};

// ================================
// @route   POST /api/auth/register
// @desc    Register new user + send OTP
// @access  Public
// ================================
/**
 * REGISTRATION FLOW:
 * 1. Validate input (email, password, name)
 * 2. Check if email already exists
 * 3. Create user with isVerified: false
 * 4. Generate OTP and save to user
 * 5. Send OTP via email (simulated for now)
 * 6. Return success (user must verify OTP to login)
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const settings = await getSettings();

  if (!settings.allowRegistration) {
    throw new AppError("New registrations are currently disabled", 403);
  }
  
  // ============ VALIDATION ============
  if (!name || !email || !password) {
    throw new AppError("Please provide name, email and password", 400);
  }
  
  // Check password strength
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }
  
  // ============ CHECK DUPLICATE ============
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  
  if (existingUser) {
    // If user exists but not verified, resend OTP
    if (!existingUser.isVerified) {
      const otp = existingUser.generateOTP();
      await existingUser.save();
      
      await emailService.sendOTP(email, otp, existingUser.name);
      
      return res.status(200).json({
        success: true,
        message: "OTP resent to your email. Please verify.",
        email: existingUser.email
      });
    }
    
    throw new AppError("Email already registered. Please login.", 400);
  }
  
  // ============ CREATE USER ============
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,  // Will be hashed by pre-save hook
    isVerified: false
  });
  
  // ============ GENERATE OTP ============
  const otp = user.generateOTP();
  await user.save();

  const emailResult = await emailService.sendOTP(email, otp, name);
  if (!emailResult?.success) {
    throw new AppError("Unable to send OTP email. Please try again.", 500);
  }
  
  res.status(201).json({
    success: true,
    message: "Registration successful! Please check your email for OTP.",
    email: user.email
  });
});

// ================================
// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate account
// @access  Public
// ================================
/**
 * OTP VERIFICATION FLOW:
 * 1. Find user by email
 * 2. Check if OTP matches and not expired
 * 3. Set isVerified: true
 * 4. Clear OTP fields
 * 5. Return token (user is now logged in)
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    throw new AppError("Please provide email and OTP", 400);
  }
  
  // Find user with OTP fields (select: false by default)
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+otp +otpExpiry");
  
  if (!user) {
    throw new AppError("User not found with this email", 404);
  }
  
  if (user.isVerified) {
    throw new AppError("Email already verified. Please login.", 400);
  }
  
  // Verify OTP
  if (!user.verifyOTP(otp)) {
    throw new AppError("Invalid or expired OTP", 400);
  }
  
  // Activate account
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  
  // Send token (auto-login after verification)
  sendTokenResponse(user, 200, res, "Email verified successfully!");
});

// ================================
// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
// ================================
/**
 * LOGIN FLOW:
 * 1. Validate email and password
 * 2. Find user by email (include password for comparison)
 * 3. Check if account is verified
 * 4. Check if account is banned
 * 5. Compare passwords using bcrypt
 * 6. Generate and return JWT token
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const settings = await getSettings();
  
  // ============ VALIDATION ============
  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }
  
  // ============ FIND USER ============
  // Need to explicitly select password (it's hidden by default)
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password");
  
  if (!user) {
    // Generic message to prevent email enumeration
    throw new AppError("Invalid email or password", 401);
  }

  // ============ CHECK ACCOUNT STATUS ============
  if (settings.requireEmailVerification && !user.isVerified) {
    throw new AppError("Please verify your email first", 403);
  }
  
  if (user.status === "banned") {
    throw new AppError("Your account has been suspended", 403);
  }
  
  // ============ VERIFY PASSWORD ============
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }
  
  // ============ SUCCESS ============
  sendTokenResponse(user, 200, res, "Login successful!");
});

// ================================
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private (requires token)
// ================================
/**
 * GET ME:
 * - req.user is already set by protect middleware
 * - Just return the user data
 * - Used by frontend to check auth state on page load
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  const user = await User.findById(req.user._id);
  
  res.status(200).json({
    success: true,
    user
  });
});

// ================================
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
// ================================
/**
 * FORGOT PASSWORD FLOW:
 * 1. Find user by email
 * 2. Generate reset token
 * 3. Save hashed token to database
 * 4. Send reset link via email
 * 5. User clicks link → redirects to reset page
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new AppError("Please provide your email", 400);
  }
  
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    // Don't reveal if email exists (security)
    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, you will receive a reset link."
    });
  }
  
  // Generate 6-digit reset OTP
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = Date.now() + 30 * 60 * 1000;  // 30 minutes
  await user.save();
  
  const resetEmailResult = await emailService.sendPasswordReset(
    user.email,
    resetToken,
    user.name
  );

  if (!resetEmailResult?.success) {
    throw new AppError("Unable to send password reset email. Please try again.", 500);
  }
  
  res.status(200).json({
    success: true,
    message: "If an account exists with this email, you will receive a reset link."
  });
});

// ================================
// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
// ================================
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    throw new AppError("Please provide token and new password", 400);
  }
  
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }
  
  // Find user with valid reset token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() }
  }).select("+resetPasswordToken +resetPasswordExpiry");
  
  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }
  
  // Update password
  user.password = password;  // Will be hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
  
  sendTokenResponse(user, 200, res, "Password reset successful!");
});

// ================================
// @route   POST /api/auth/logout
// @desc    Logout user (client-side token deletion)
// @access  Private
// ================================
/**
 * LOGOUT:
 * - JWT is stateless - server doesn't track tokens
 * - Logout = client deletes the token
 * - This endpoint just confirms logout
 * - For extra security, implement token blacklist (Redis)
 */
const logout = asyncHandler(async (req, res) => {
  // Could implement token blacklisting here if needed
  // For now, just send success response
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

// ================================
// @route   PUT /api/auth/change-password
// @desc    Change password (logged in user)
// @access  Private
// ================================
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Please provide current and new password", 400);
  }

  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
});

// ================================
// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for verification
// @access  Public
// ================================
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new AppError("Please provide your email", 400);
  }
  
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+otp +otpExpiry");
  
  if (!user) {
    throw new AppError("No account found with this email", 404);
  }
  
  if (user.isVerified) {
    throw new AppError("Email already verified. Please login.", 400);
  }
  
  // Generate new OTP
  const otp = user.generateOTP();
  await user.save();
  
  const resendEmailResult = await emailService.sendOTP(user.email, otp, user.name);
  if (!resendEmailResult?.success) {
    throw new AppError("Unable to resend OTP email. Please try again.", 500);
  }
  
  res.status(200).json({
    success: true,
    message: "OTP sent to your email"
  });
});

module.exports = {
  register,
  verifyOTP,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  resendOTP
};
