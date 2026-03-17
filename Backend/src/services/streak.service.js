const UserStreak = require('../models/UserStreak');
const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');

/**
 * Streak Service
 * Handles all streak-related business logic
 */

// Update streak when task is completed
const updateStreakOnTaskComplete = async (userId) => {
  let streak = await UserStreak.findOne({ userId });
  
  if (!streak) {
    streak = await UserStreak.create({ userId });
  }

  const result = await streak.updateStreak();
  return result;
};

// Get streak info for a user
const getStreakInfo = async (userId) => {
  let streak = await UserStreak.findOne({ userId });
  
  if (!streak) {
    streak = await UserStreak.create({ userId });
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalActiveDays: streak.totalActiveDays,
    weeklyActiveDays: streak.weeklyActiveDays,
    lastActiveDate: streak.lastActiveDate,
    streakStartDate: streak.streakStartDate
  };
};

// Check if streak should be broken (called by daily cron job)
const checkStreakHealth = async (userId) => {
  const streak = await UserStreak.findOne({ userId });
  if (!streak || !streak.lastActiveDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = new Date(streak.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1 && streak.currentStreak > 0) {
    streak.currentStreak = 0;
    streak.streakStartDate = null;
    await streak.save();
    return { streakBroken: true, previousStreak: streak.longestStreak };
  }

  return { streakBroken: false };
};

// Reset weekly stats (called every Monday)
const resetWeeklyStats = async () => {
  const result = await UserStreak.updateMany(
    {},
    { 
      weeklyActiveDays: 0, 
      weekStartDate: new Date() 
    }
  );
  return result.modifiedCount;
};

const buildDateRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const getTaskMinutes = (task) => {
  if (!task) return 0;
  if (typeof task.actualTime === 'number' && task.actualTime > 0) return task.actualTime;
  if (task.completed && typeof task.estimatedTime === 'number' && task.estimatedTime > 0) return task.estimatedTime;
  return 0;
};

// Rebuild an activity log for a specific day from tasks to keep calendar aggregates consistent.
const updateActivityLog = async (userId, date = new Date()) => {
  const { start, end } = buildDateRange(date);

  let activityLog = await ActivityLog.findOne({
    userId,
    activityDate: { $gte: start, $lt: end }
  });

  if (!activityLog) {
    activityLog = await ActivityLog.create({
      userId,
      activityDate: start,
      tasksCompleted: 0,
      tasksTotal: 0,
      minutesSpent: 0,
      pomodoroSessions: 0,
      productivityScore: 0,
      categoryBreakdown: {},
      categoryCount: {}
    });
  }

  const tasksForDay = await Task.find({
    userId,
    date: { $gte: start, $lt: end }
  });

  const completedTasks = tasksForDay.filter((task) => task.completed);
  const categoryMap = {
    'dsa': 'dsa',
    'core-cs': 'coreCS',
    'development': 'development',
    'aptitude': 'aptitude',
    'soft-skills': 'softSkills',
    'mock-interview': 'mockInterview',
    'project': 'project',
  };

  const initialCategoryBreakdown = {
    dsa: 0,
    coreCS: 0,
    development: 0,
    aptitude: 0,
    softSkills: 0,
    mockInterview: 0,
    project: 0,
  };

  const initialCategoryCount = {
    dsa: 0,
    coreCS: 0,
    development: 0,
    aptitude: 0,
    softSkills: 0,
    mockInterview: 0,
    project: 0,
  };

  const categoryBreakdown = { ...initialCategoryBreakdown };
  const categoryCount = { ...initialCategoryCount };

  for (const task of completedTasks) {
    const categoryKey = categoryMap[task.category] || 'dsa';
    categoryBreakdown[categoryKey] += getTaskMinutes(task);
    categoryCount[categoryKey] += 1;
  }

  activityLog.tasksTotal = tasksForDay.length;
  activityLog.tasksCompleted = completedTasks.length;
  activityLog.minutesSpent = completedTasks.reduce((sum, task) => sum + getTaskMinutes(task), 0);
  activityLog.pomodoroSessions = completedTasks.reduce((sum, task) => sum + (task.pomodoroCount || 0), 0);
  activityLog.categoryBreakdown = categoryBreakdown;
  activityLog.categoryCount = categoryCount;

  const completionRate = activityLog.tasksTotal > 0
    ? Math.round((activityLog.tasksCompleted / activityLog.tasksTotal) * 100)
    : 0;

  activityLog.completionRate = Math.min(100, Math.max(0, completionRate));
  activityLog.calculateProductivityScore();

  await activityLog.save();
  return activityLog;
};

module.exports = {
  updateStreakOnTaskComplete,
  getStreakInfo,
  checkStreakHealth,
  resetWeeklyStats,
  updateActivityLog
};