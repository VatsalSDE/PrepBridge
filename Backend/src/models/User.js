// src/models/User.js
// ================================
// SHARED MODEL - Used by both Student & Admin sides
// ================================
// This is the core User model for PrepBridge. Every user (student or admin) 
// is stored here. It handles authentication, profile data, and user preferences.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * 
 * WHY THIS DESIGN:
 * - Single collection for both students and admins (role-based access)
 * - Profile info stored here directly (no separate Profile model needed)
 * - OTP fields for email verification during signup
 * - Status field allows admin to ban/unban users
 */
const userSchema = new mongoose.Schema(
  {
    // ============ BASIC AUTH FIELDS ============
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,  // Creates unique index automatically
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false  // Won't be returned in queries by default (security)
    },
    
    // Role determines what the user can access
    // 'student' = normal user, 'admin' = full admin access
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    
    // Admin can ban users - banned users can't login
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active"
    },

    // ============ PROFILE INFO ============
    // These fields are optional - filled in Profile page
    college: {
      type: String,
      trim: true
    },
    
    branch: {
      type: String,
      trim: true
    },
    
    year: {
      type: Number,
      min: 1,
      max: 5
    },
    
    cgpa: {
      type: Number,
      min: 0,
      max: 10
    },
    
    targetRole: {
      type: String,
      trim: true
    },
    
    // Array of skill strings like ["JavaScript", "React", "Node.js"]
    skills: [{
      type: String,
      trim: true
    }],
    
    // URL to uploaded resume (stored in cloud storage later)
    resumeUrl: {
      type: String
    },

    // ============ CODING PROFILES ============
    // Links to user's coding profiles for verification/display
    codingProfiles: {
      leetcode: { type: String, trim: true },
      codolio: { type: String, trim: true },
      gfg: { type: String, trim: true }
    },

    // ============ PROJECTS ============
    // User's projects displayed on profile
    projects: [{
      name: { type: String, trim: true },
      url: { type: String, trim: true }
    }],

    // ============ GOALS ============
    // Customizable goals for dashboard
    weeklyStudyGoal: {
      type: Number,
      default: 25,  // 25 hours per week default
      min: 1,
      max: 100
    },
    
    dailyTaskGoal: {
      type: Number,
      default: 6,  // 6 tasks per day default
      min: 1,
      max: 20
    },

    // ============ OTP VERIFICATION ============
    // Used during signup to verify email
    otp: {
      type: String,
      select: false  // Don't expose OTP in queries
    },
    
    otpExpiry: {
      type: Date,
      select: false
    },
    
    // User can only login after email verification
    isVerified: {
      type: Boolean,
      default: false
    },

    // ============ PASSWORD RESET ============
    resetPasswordToken: {
      type: String,
      select: false
    },
    
    resetPasswordExpiry: {
      type: Date,
      select: false
    }
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true
  }
);

// ================================
// MONGOOSE MIDDLEWARE (Hooks)
// ================================

/**
 * Pre-save Hook - Hash password before saving
 * 
 * WHY: We never store plain text passwords (security risk)
 * HOW: bcrypt creates a one-way hash that can be verified but not reversed
 * WHEN: Only runs if password field is modified (not on every save)
 * 
 * NOTE: In Mongoose 9.x, async hooks don't need next() - just return
 */
userSchema.pre("save", async function () {
  // Only hash if password is new or modified
  if (!this.isModified("password")) {
    return;
  }
  
  // Generate salt (random string to make hash unique)
  // 12 rounds = good balance of security and speed
  const salt = await bcrypt.genSalt(12);
  
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

// ================================
// INSTANCE METHODS
// ================================

/**
 * Compare entered password with hashed password
 * 
 * @param {string} enteredPassword - Plain text password from login form
 * @returns {boolean} - True if passwords match
 * 
 * USAGE: const isMatch = await user.comparePassword(req.body.password);
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare handles the hashing and comparison
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate OTP for email verification
 * 
 * @returns {string} - 6-digit OTP
 * 
 * WHY: Email verification prevents fake accounts
 * OTP expires in 10 minutes for security
 */
userSchema.methods.generateOTP = function () {
  // Generate random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store hashed OTP (even OTPs should be hashed)
  this.otp = otp;  // We'll hash this in production
  
  // OTP expires in 10 minutes
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  return otp;
};

/**
 * Verify OTP
 * 
 * @param {string} enteredOTP - OTP from user input
 * @returns {boolean} - True if OTP is valid and not expired
 */
userSchema.methods.verifyOTP = function (enteredOTP) {
  // Check if OTP matches and hasn't expired
  return this.otp === enteredOTP && this.otpExpiry > Date.now();
};

// ================================
// INDEXES
// ================================
// Email index is created automatically due to unique: true
// Add more indexes for frequently queried fields if needed

// Create the model
const User = mongoose.model("User", userSchema);

module.exports = User;
