// src/models/UserStreak.js
// ================================
// USER STREAK MODEL - Tracks daily activity streaks
// ================================
// Streaks are a gamification feature that encourages daily consistency.
// A streak increases when user completes tasks on consecutive days.

const mongoose = require("mongoose");

/**
 * UserStreak Schema
 * 
 * HOW STREAKS WORK:
 * 1. User completes at least 1 task → day is "active"
 * 2. If yesterday was also active → streak continues (+1)
 * 3. If yesterday was NOT active → streak resets to 1
 */
const userStreakSchema = new mongoose.Schema(
  {
    // ============ RELATIONSHIP ============
    // One-to-one with User (each user has exactly one streak doc)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,  // Enforces one streak per user
      index: true
    },

    // ============ STREAK DATA ============
    
    // Current consecutive days of activity
    currentStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Best streak ever achieved (for achievements/badges)
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Total days user has been active (not necessarily consecutive)
    totalActiveDays: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============ DATES ============
    
    // Last date user was active (completed a task)
    // Used to determine if streak should continue or reset
    lastActiveDate: {
      type: Date,
      default: null
    },
    
    // When current streak started
    streakStartDate: {
      type: Date,
      default: null
    },

    // ============ WEEKLY STATS ============
    // For weekly leaderboard
    weeklyActiveDays: {
      type: Number,
      default: 0,
      min: 0,
      max: 7
    },
    
    // When weekly stats were last reset (every Monday)
    weekStartDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ================================
// INSTANCE METHODS
// ================================

/**
 * Check and update streak based on task completion
 * 
 * LOGIC:
 * - If lastActiveDate is today → already counted, do nothing
 * - If lastActiveDate is yesterday → streak continues
 * - If lastActiveDate is older → reset streak
 */
userStreakSchema.methods.updateStreak = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let result = {
    isNewDay: false,
    streakContinued: false,
    streakBroken: false,
    currentStreak: this.currentStreak
  };
  
  // Normalize lastActiveDate to midnight for comparison
  let lastActive = null;
  if (this.lastActiveDate) {
    lastActive = new Date(this.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
  }
  
  // Case 1: First time ever
  if (!lastActive) {
    this.currentStreak = 1;
    this.longestStreak = 1;
    this.totalActiveDays = 1;
    this.lastActiveDate = today;
    this.streakStartDate = today;
    result.isNewDay = true;
    result.currentStreak = 1;
  }
  // Case 2: Already active today
  else if (lastActive.getTime() === today.getTime()) {
    // Do nothing, already counted
    result.currentStreak = this.currentStreak;
  }
  // Case 3: Active yesterday - streak continues!
  else if (lastActive.getTime() === yesterday.getTime()) {
    this.currentStreak += 1;
    this.totalActiveDays += 1;
    this.lastActiveDate = today;
    
    // Update longest streak if this is a new record
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
    
    result.isNewDay = true;
    result.streakContinued = true;
    result.currentStreak = this.currentStreak;
  }
  // Case 4: Missed a day - reset streak
  else {
    this.currentStreak = 1;
    this.totalActiveDays += 1;
    this.lastActiveDate = today;
    this.streakStartDate = today;
    
    result.isNewDay = true;
    result.streakBroken = true;
    result.currentStreak = 1;
  }
  
  // Update weekly stats
  await this.updateWeeklyStats(today);
  
  await this.save();
  return result;
};

/**
 * Update weekly active days counter
 * Resets every Monday
 */
userStreakSchema.methods.updateWeeklyStats = async function (today) {
  // Get start of current week (Monday)
  const currentWeekStart = new Date(today);
  const dayOfWeek = currentWeekStart.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
  currentWeekStart.setDate(currentWeekStart.getDate() - diff);
  currentWeekStart.setHours(0, 0, 0, 0);
  
  // Check if we need to reset weekly stats
  if (!this.weekStartDate || this.weekStartDate.getTime() < currentWeekStart.getTime()) {
    this.weekStartDate = currentWeekStart;
    this.weeklyActiveDays = 1;
  } else {
    // Same week, increment if new day
    this.weeklyActiveDays = Math.min(this.weeklyActiveDays + 1, 7);
  }
};

/**
 * Get streak info for display
 */
userStreakSchema.methods.getStreakInfo = function () {
  return {
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak,
    totalActiveDays: this.totalActiveDays,
    weeklyActiveDays: this.weeklyActiveDays,
    lastActiveDate: this.lastActiveDate,
    streakStartDate: this.streakStartDate
  };
};

// ================================
// STATIC METHODS
// ================================

/**
 * Get or create streak document for a user
 * 
 * @param {ObjectId} userId - User's ID
 * @returns {UserStreak} - Streak document
 */
userStreakSchema.statics.getOrCreate = async function (userId) {
  let streak = await this.findOne({ userId });
  
  if (!streak) {
    streak = await this.create({ userId });
  }
  
  return streak;
};

/**
 * Get weekly leaderboard
 * 
 * @param {number} limit - Number of users to return
 * @returns {Array} - Top users by weekly activity
 */
userStreakSchema.statics.getWeeklyLeaderboard = async function (limit = 10) {
  return await this.find({ weeklyActiveDays: { $gt: 0 } })
    .sort({ weeklyActiveDays: -1, currentStreak: -1 })
    .limit(limit)
    .populate("userId", "name college");
};

/**
 * Get all-time streak leaderboard
 */
userStreakSchema.statics.getStreakLeaderboard = async function (limit = 10) {
  return await this.find({ currentStreak: { $gt: 0 } })
    .sort({ currentStreak: -1, longestStreak: -1 })
    .limit(limit)
    .populate("userId", "name college");
};

// Create the model
const UserStreak = mongoose.model("UserStreak", userStreakSchema);

module.exports = UserStreak;
