// src/models/ActivityLog.js
// ================================
// ACTIVITY LOG MODEL - Daily activity summary for heatmap
// ================================
// Stores aggregated daily stats for each user. Powers the calendar
// heatmap showing productivity over time.

const mongoose = require("mongoose");

/**
 * ActivityLog Schema
 * 
 * WHY THIS MODEL:
 * - Calendar heatmap needs quick access to daily productivity data
 * - Aggregating tasks every time would be slow
 * - One document per user per day = fast queries
 * 
 * HOW IT WORKS:
 * 1. When task is completed → update today's ActivityLog
 * 2. Calendar page fetches all ActivityLogs for date range
 * 3. Heatmap color intensity = productivityScore
 */
const activityLogSchema = new mongoose.Schema(
  {
    // ============ RELATIONSHIP ============
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // ============ DATE ============
    // The date this log represents (stored at midnight)
    activityDate: {
      type: Date,
      required: true,
      index: true
    },

    // ============ TASK STATS ============
    
    // How many tasks were completed this day
    tasksCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // How many tasks were planned for this day
    tasksTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Completion percentage (for quick access)
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // ============ TIME TRACKING ============
    
    // Total minutes spent on tasks
    minutesSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Number of Pomodoro sessions completed
    pomodoroSessions: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============ PRODUCTIVITY SCORE ============
    // 0-100 score used for heatmap intensity
    // Calculated based on tasks completed, time spent, etc.
    productivityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // ============ CATEGORY BREAKDOWN ============
    // Minutes spent per category (for reports)
    categoryBreakdown: {
      dsa: { type: Number, default: 0, min: 0 },
      coreCS: { type: Number, default: 0, min: 0 },
      development: { type: Number, default: 0, min: 0 },
      aptitude: { type: Number, default: 0, min: 0 },
      softSkills: { type: Number, default: 0, min: 0 },
      mockInterview: { type: Number, default: 0, min: 0 },
      project: { type: Number, default: 0, min: 0 }
    },

    // ============ TASKS BY CATEGORY COUNT ============
    categoryCount: {
      dsa: { type: Number, default: 0, min: 0 },
      coreCS: { type: Number, default: 0, min: 0 },
      development: { type: Number, default: 0, min: 0 },
      aptitude: { type: Number, default: 0, min: 0 },
      softSkills: { type: Number, default: 0, min: 0 },
      mockInterview: { type: Number, default: 0, min: 0 },
      project: { type: Number, default: 0, min: 0 }
    }
  },
  {
    timestamps: true
  }
);

// ================================
// COMPOUND INDEX
// ================================
/**
 * Unique compound index: userId + activityDate
 * 
 * WHY:
 * - Ensures only one log per user per day
 * - Makes queries like "get user's activity for March" super fast
 */
activityLogSchema.index({ userId: 1, activityDate: 1 }, { unique: true });

// ================================
// INSTANCE METHODS
// ================================

/**
 * Recalculate productivity score
 * 
 * FORMULA:
 * - Base: 40% from completion rate
 * - Time: 30% from time spent (capped at 4 hours)
 * - Tasks: 30% from tasks completed (capped at 10)
 */
activityLogSchema.methods.calculateProductivityScore = function () {
  // Completion rate component (40%)
  const completionComponent = (this.completionRate / 100) * 40;
  
  // Time component (30%) - Max at 4 hours (240 minutes)
  const timeRatio = Math.min(this.minutesSpent / 240, 1);
  const timeComponent = timeRatio * 30;
  
  // Tasks component (30%) - Max at 10 tasks
  const taskRatio = Math.min(this.tasksCompleted / 10, 1);
  const taskComponent = taskRatio * 30;
  
  this.productivityScore = Math.round(completionComponent + timeComponent + taskComponent);
  
  return this.productivityScore;
};

/**
 * Update log when a task is completed
 * 
 * @param {Object} task - The completed task
 */
activityLogSchema.methods.addCompletedTask = async function (task) {
  this.tasksCompleted += 1;
  this.minutesSpent += task.actualTime || 0;
  this.pomodoroSessions += task.pomodoroCount || 0;
  
  // Update category breakdown
  const categoryMap = {
    "dsa": "dsa",
    "core-cs": "coreCS",
    "development": "development",
    "aptitude": "aptitude",
    "soft-skills": "softSkills",
    "mock-interview": "mockInterview",
    "project": "project"
  };
  
  const categoryKey = categoryMap[task.category] || "dsa";
  this.categoryBreakdown[categoryKey] += task.actualTime || 0;
  this.categoryCount[categoryKey] += 1;
  
  // Recalculate completion rate
  if (this.tasksTotal > 0) {
    this.completionRate = Math.round((this.tasksCompleted / this.tasksTotal) * 100);
  }
  
  // Recalculate productivity score
  this.calculateProductivityScore();
  
  await this.save();
};

/**
 * Update when a new task is created for this day
 */
activityLogSchema.methods.addPlannedTask = async function () {
  this.tasksTotal += 1;
  
  // Recalculate completion rate
  if (this.tasksTotal > 0) {
    this.completionRate = Math.round((this.tasksCompleted / this.tasksTotal) * 100);
  }
  
  await this.save();
};

/**
 * Update when a task is deleted
 * 
 * @param {Object} task - The deleted task
 */
activityLogSchema.methods.removeTask = async function (task) {
  this.tasksTotal = Math.max(0, this.tasksTotal - 1);
  
  if (task.completed) {
    this.tasksCompleted = Math.max(0, this.tasksCompleted - 1);
    this.minutesSpent = Math.max(0, this.minutesSpent - (task.actualTime || 0));
    this.pomodoroSessions = Math.max(0, this.pomodoroSessions - (task.pomodoroCount || 0));
    
    // Update category breakdown
    const categoryMap = {
      "dsa": "dsa",
      "core-cs": "coreCS",
      "development": "development",
      "aptitude": "aptitude",
      "soft-skills": "softSkills",
      "mock-interview": "mockInterview",
      "project": "project"
    };
    
    const categoryKey = categoryMap[task.category] || "dsa";
    this.categoryBreakdown[categoryKey] = Math.max(0, this.categoryBreakdown[categoryKey] - (task.actualTime || 0));
    this.categoryCount[categoryKey] = Math.max(0, this.categoryCount[categoryKey] - 1);
  }
  
  // Recalculate
  if (this.tasksTotal > 0) {
    this.completionRate = Math.round((this.tasksCompleted / this.tasksTotal) * 100);
  } else {
    this.completionRate = 0;
  }
  
  this.calculateProductivityScore();
  
  await this.save();
};

// ================================
// STATIC METHODS
// ================================

/**
 * Get or create activity log for a user on a specific date
 * 
 * @param {ObjectId} userId - User's ID
 * @param {Date} date - Date (defaults to today)
 * @returns {ActivityLog}
 */
activityLogSchema.statics.getOrCreate = async function (userId, date = new Date()) {
  // Normalize date to midnight
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  let log = await this.findOne({
    userId,
    activityDate: normalizedDate
  });
  
  if (!log) {
    log = await this.create({
      userId,
      activityDate: normalizedDate
    });
  }
  
  return log;
};

/**
 * Get heatmap data for a user over a date range
 * 
 * @param {ObjectId} userId - User's ID
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {Array} - Array of { date, productivityScore }
 */
activityLogSchema.statics.getHeatmapData = async function (userId, startDate, endDate) {
  const logs = await this.find({
    userId,
    activityDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .select("activityDate productivityScore tasksCompleted")
    .sort({ activityDate: 1 });
  
  // Convert to simple format for heatmap
  return logs.map(log => ({
    date: log.activityDate,
    score: log.productivityScore,
    tasksCompleted: log.tasksCompleted
  }));
};

/**
 * Get aggregated stats for a date range (for weekly reports)
 * 
 * @param {ObjectId} userId 
 * @param {Date} startDate 
 * @param {Date} endDate 
 */
activityLogSchema.statics.getAggregatedStats = async function (userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        activityDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: "$tasksCompleted" },
        totalMinutes: { $sum: "$minutesSpent" },
        totalPomodoros: { $sum: "$pomodoroSessions" },
        avgProductivity: { $avg: "$productivityScore" },
        activeDays: { $sum: 1 },
        dsaMinutes: { $sum: "$categoryBreakdown.dsa" },
        coreCSMinutes: { $sum: "$categoryBreakdown.coreCS" },
        developmentMinutes: { $sum: "$categoryBreakdown.development" },
        aptitudeMinutes: { $sum: "$categoryBreakdown.aptitude" }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      totalTasks: 0,
      totalMinutes: 0,
      totalPomodoros: 0,
      avgProductivity: 0,
      activeDays: 0,
      categoryBreakdown: {}
    };
  }
  
  const data = result[0];
  return {
    totalTasks: data.totalTasks,
    totalMinutes: data.totalMinutes,
    totalHours: Math.round(data.totalMinutes / 60 * 10) / 10,
    totalPomodoros: data.totalPomodoros,
    avgProductivity: Math.round(data.avgProductivity),
    activeDays: data.activeDays,
    categoryBreakdown: {
      dsa: data.dsaMinutes,
      coreCS: data.coreCSMinutes,
      development: data.developmentMinutes,
      aptitude: data.aptitudeMinutes
    }
  };
};

// Create the model
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
