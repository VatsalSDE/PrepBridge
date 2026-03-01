const WeeklyReport = require('../models/WeeklyReport');
const Reflection = require('../models/Reflection');
const ActivityLog = require('../models/ActivityLog');
const UserStreak = require('../models/UserStreak');
const Task = require('../models/Task');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { getWeekStart, getStartOfDay, getDaysAgo } = require('../utils/date.utils');

// Get current week report
exports.getWeeklyReport = asyncHandler(async (req, res) => {
  const weekStart = getWeekStart();

  let report = await WeeklyReport.findOne({
    userId: req.user.id,
    weekStartDate: weekStart
  }).populate('badgesEarned', 'name icon');

  if (!report) {
    report = await WeeklyReport.generateReport(req.user.id, weekStart);
  }

  res.json({
    success: true,
    data: report
  });
});

// Get past reports
exports.getReportHistory = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;

  const reports = await WeeklyReport.getReportHistory(req.user.id, parseInt(limit));

  res.json({
    success: true,
    data: reports
  });
});

// Submit reflection
exports.submitReflection = asyncHandler(async (req, res) => {
  const { 
    type = 'daily', 
    mood, 
    accomplishments, 
    challenges, 
    learnings, 
    tomorrowGoals, 
    gratitude,
    energyLevel,
    focusLevel,
    tags
  } = req.body;

  if (!mood) {
    throw new AppError('Mood is required', 400);
  }

  const today = getStartOfDay();

  const existingReflection = await Reflection.findOne({
    userId: req.user.id,
    date: today,
    type
  });

  let reflection;
  if (existingReflection) {
    reflection = await Reflection.findByIdAndUpdate(
      existingReflection._id,
      { mood, accomplishments, challenges, learnings, tomorrowGoals, gratitude, energyLevel, focusLevel, tags },
      { new: true }
    );
  } else {
    reflection = await Reflection.create({
      userId: req.user.id,
      date: today,
      type,
      mood,
      accomplishments,
      challenges,
      learnings,
      tomorrowGoals,
      gratitude,
      energyLevel,
      focusLevel,
      tags
    });
  }

  res.status(201).json({
    success: true,
    data: reflection
  });
});

// Get overall stats
exports.getStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = getDaysAgo(parseInt(days));
  const endDate = new Date();

  const [streak, reflectionStats, activityStats] = await Promise.all([
    UserStreak.findOne({ userId: req.user.id }),
    Reflection.getStats(req.user.id),
    ActivityLog.getAggregatedStats(req.user.id, startDate, endDate)
  ]);

  const totalTasks = await Task.countDocuments({ userId: req.user.id });
  const completedTasks = await Task.countDocuments({ userId: req.user.id, completed: true });

  res.json({
    success: true,
    data: {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      streak: streak ? {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        totalActiveDays: streak.totalActiveDays
      } : null,
      reflections: reflectionStats,
      activity: activityStats
    }
  });
});

// Get reflections history
exports.getReflections = asyncHandler(async (req, res) => {
  const { type, limit = 30 } = req.query;

  const reflections = await Reflection.getReflections(req.user.id, { type, limit: parseInt(limit) });

  res.json({
    success: true,
    data: reflections
  });
});
