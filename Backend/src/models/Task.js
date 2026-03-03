// src/models/Task.js
// ================================
// TASK MODEL - Core of Daily Planning feature
// ================================
// Tasks are the heart of PrepBridge. Students create daily tasks,
// track time with Pomodoro, and mark them complete. This data feeds
// into streaks, achievements, and productivity reports.

const mongoose = require("mongoose");

/**
 * Task Schema
 * 
 * WHY THIS DESIGN:
 * - Each task belongs to one user (userId reference)
 * - Categories match the roadmap topics (DSA, Core CS, etc.)
 * - Time tracking for productivity analysis
 * - Date field for calendar/heatmap features
 */
const taskSchema = new mongoose.Schema(
  {
    // ============ RELATIONSHIP ============
    // Links task to the user who created it
    // 'ref' allows us to use populate() to get user details
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true  // Index for faster queries by user
    },

    // ============ TASK CONTENT ============
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"]
    },
    
    // Optional description for longer tasks
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },

    // ============ CATEGORIZATION ============
    // Category determines which roadmap section this task belongs to
    // Used for productivity breakdown in reports
    category: {
      type: String,
      enum: {
        values: [
          "dsa",           // Data Structures & Algorithms
          "core-cs",       // DBMS, OS, Networks, OOP
          "development",   // Frontend/Backend/Fullstack work
          "aptitude",      // Quant, Verbal, Logical
          "soft-skills",   // Communication, HR prep
          "mock-interview", // Interview practice
          "project"        // Project work
        ],
        message: "{VALUE} is not a valid category"
      },
      default: "dsa"
    },

    // Priority helps users focus on important tasks first
    priority: {
      type: String,
      enum: {
        values: ["high", "medium", "low"],
        message: "{VALUE} is not a valid priority"
      },
      default: "medium"
    },

    // ============ TIME TRACKING ============
    // Estimated time helps users plan their day
    estimatedTime: {
      type: Number,  // in minutes
      default: 30,
      min: [5, "Minimum time is 5 minutes"],
      max: [480, "Maximum time is 8 hours (480 minutes)"]
    },
    
    // Actual time tracked (updated by Pomodoro timer)
    actualTime: {
      type: Number,  // in minutes
      default: 0,
      min: 0
    },
    
    // Number of Pomodoro sessions completed for this task
    pomodoroCount: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============ COMPLETION STATUS ============
    completed: {
      type: Boolean,
      default: false
    },
    
    // When was the task marked complete (for analytics)
    completedAt: {
      type: Date
    },

    // ============ DATE ASSIGNMENT ============
    // The date this task is scheduled for (not when it was created)
    // Used for calendar view and daily task list
    date: {
      type: Date,
      default: function() {
        // Default to today at midnight (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
      index: true  // Index for date-based queries
    }
  },
  {
    timestamps: true  // createdAt, updatedAt
  }
);

// ================================
// INDEXES
// ================================

/**
 * Compound Index: userId + date
 * 
 * WHY: Most common query is "get all tasks for user X on date Y"
 * This makes that query extremely fast (uses index instead of scanning)
 */
taskSchema.index({ userId: 1, date: 1 });

/**
 * Compound Index: userId + completed + date
 * 
 * WHY: Dashboard shows incomplete tasks for today
 * Query: { userId: X, completed: false, date: today }
 */
taskSchema.index({ userId: 1, completed: 1, date: 1 });

// ================================
// MONGOOSE MIDDLEWARE
// ================================

/**
 * Pre-save Hook - Set completedAt when task is marked complete
 * 
 * WHY: We need to know WHEN a task was completed for:
 * - Streak calculation (was it completed on time?)
 * - Productivity reports (which hours are most productive?)
 */
taskSchema.pre("save", function () {
  // If task is being marked complete for the first time
  if (this.isModified("completed") && this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // If task is being unmarked (user unchecks it)
  if (this.isModified("completed") && !this.completed) {
    this.completedAt = null;
  }
});

// ================================
// STATIC METHODS (called on Model)
// ================================

/**
 * Get tasks for a specific user on a specific date
 * 
 * @param {ObjectId} userId - User's ID
 * @param {Date} date - Date to fetch tasks for
 * @returns {Promise<Task[]>} - Array of tasks
 * 
 * USAGE: const tasks = await Task.getTasksForDate(userId, new Date());
 */
taskSchema.statics.getTasksForDate = async function (userId, date) {
  // Create date range for the given day (00:00:00 to 23:59:59)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.find({
    userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ priority: -1, createdAt: 1 });  // High priority first, then by creation time
};

/**
 * Get completion stats for a user on a date
 * 
 * @param {ObjectId} userId - User's ID
 * @param {Date} date - Date to get stats for
 * @returns {Promise<Object>} - { total, completed, completionRate }
 * 
 * USAGE: Used for streak calculation and daily reports
 */
taskSchema.statics.getDailyStats = async function (userId, date) {
  const tasks = await this.getTasksForDate(userId, date);
  
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, completionRate };
};

/**
 * Get tasks by category for productivity breakdown
 * 
 * @param {ObjectId} userId - User's ID
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Object>} - Category breakdown stats
 */
taskSchema.statics.getCategoryBreakdown = async function (userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        completed: true
      }
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalTime: { $sum: "$actualTime" }
      }
    }
  ]);
};

// ================================
// INSTANCE METHODS (called on document)
// ================================

/**
 * Toggle task completion status
 * 
 * @returns {Promise<Task>} - Updated task
 * 
 * USAGE: await task.toggleComplete();
 */
taskSchema.methods.toggleComplete = async function () {
  this.completed = !this.completed;
  return await this.save();
};

/**
 * Add Pomodoro session time
 * 
 * @param {number} minutes - Minutes to add (default 25 for one pomodoro)
 * @returns {Promise<Task>} - Updated task
 */
taskSchema.methods.addPomodoroTime = async function (minutes = 25) {
  this.actualTime += minutes;
  this.pomodoroCount += 1;
  return await this.save();
};

// Create the model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
