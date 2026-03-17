const mongoose = require('mongoose');
const WeeklyReport = require('../models/WeeklyReport');
const Reflection = require('../models/Reflection');
const ActivityLog = require('../models/ActivityLog');
const UserStreak = require('../models/UserStreak');
const Task = require('../models/Task');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { getWeekStart, getStartOfDay, getDaysAgo } = require('../utils/date.utils');

const CATEGORY_META = {
  dsa: { label: 'DSA', color: '#4F6BFF' },
  coreCS: { label: 'Core CS', color: '#7C3AED' },
  development: { label: 'Development', color: '#22C55E' },
  aptitude: { label: 'Aptitude', color: '#F59E0B' },
  softSkills: { label: 'Soft Skills', color: '#FB923C' },
  mockInterview: { label: 'Mock Interview', color: '#06B6D4' },
  project: { label: 'Project', color: '#EC4899' }
};

const TASK_CATEGORY_TO_ACTIVITY_KEY = {
  dsa: 'dsa',
  'core-cs': 'coreCS',
  development: 'development',
  aptitude: 'aptitude',
  'soft-skills': 'softSkills',
  'mock-interview': 'mockInterview',
  project: 'project'
};

const MOOD_EMOJIS = {
  great: '😄',
  productive: '💪',
  good: '😊',
  okay: '🙂',
  bad: '😓',
  terrible: '😴'
};

const createEmptyCategoryMinutes = () => ({
  dsa: 0,
  coreCS: 0,
  development: 0,
  aptitude: 0,
  softSkills: 0,
  mockInterview: 0,
  project: 0,
});

const getDateKey = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (value, amount) => {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
};

const getEndOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const getStartOfMonth = (value = new Date()) => {
  const date = new Date(value);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const calculateProductivityScore = ({ totalTasks = 0, completedTasks = 0, minutesSpent = 0 }) => {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completionComponent = (completionRate / 100) * 40;
  const timeComponent = Math.min(minutesSpent / 240, 1) * 30;
  const taskComponent = Math.min(completedTasks / 10, 1) * 30;
  return Math.round(completionComponent + timeComponent + taskComponent);
};

const getTaskMinutes = (task) => {
  if (!task) return 0;
  if (typeof task.actualTime === 'number' && task.actualTime > 0) return task.actualTime;
  if (task.completed && typeof task.estimatedTime === 'number' && task.estimatedTime > 0) return task.estimatedTime;
  return 0;
};

const buildTaskStatsByDay = (tasks) => {
  const byDay = new Map();

  for (const task of tasks) {
    const key = getDateKey(task.date);
    if (!byDay.has(key)) {
      byDay.set(key, {
        totalTasks: 0,
        completedTasks: 0,
        minutesSpent: 0,
        categoryMinutes: createEmptyCategoryMinutes(),
      });
    }

    const entry = byDay.get(key);
    entry.totalTasks += 1;

    if (task.completed) {
      entry.completedTasks += 1;
      const taskMinutes = getTaskMinutes(task);
      entry.minutesSpent += taskMinutes;
      const categoryKey = TASK_CATEGORY_TO_ACTIVITY_KEY[task.category] || 'dsa';
      entry.categoryMinutes[categoryKey] += taskMinutes;
    }
  }

  return byDay;
};

const buildLogStatsByDay = (logs) => {
  const byDay = new Map();

  for (const log of logs) {
    byDay.set(getDateKey(log.activityDate), {
      totalTasks: log.tasksTotal || 0,
      completedTasks: log.tasksCompleted || 0,
      minutesSpent: log.minutesSpent || 0,
      productivityScore: log.productivityScore || 0,
    });
  }

  return byDay;
};

const buildTrendSeries = ({ startDate, endDate, taskStatsByDay, logStatsByDay }) => {
  const series = [];

  for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays(cursor, 1)) {
    const dayKey = getDateKey(cursor);
    const taskStats = taskStatsByDay.get(dayKey) || {
      totalTasks: 0,
      completedTasks: 0,
      minutesSpent: 0,
    };
    const logStats = logStatsByDay.get(dayKey);

    const minutesSpent = Math.max(logStats?.minutesSpent || 0, taskStats.minutesSpent || 0);
    const totalTasks = Math.max(logStats?.totalTasks || 0, taskStats.totalTasks || 0);
    const completedTasks = Math.max(logStats?.completedTasks || 0, taskStats.completedTasks || 0);

    series.push({
      date: new Date(cursor),
      totalTasks,
      completedTasks,
      minutesSpent,
      productivityScore: logStats?.productivityScore > 0
        ? logStats.productivityScore
        : calculateProductivityScore({ totalTasks, completedTasks, minutesSpent }),
    });
  }

  return series;
};

const summarizeTrendWindow = (series) => {
  const totals = series.reduce(
    (accumulator, item) => {
      accumulator.totalTasks += item.totalTasks || 0;
      accumulator.completedTasks += item.completedTasks || 0;
      accumulator.minutesSpent += item.minutesSpent || 0;
      accumulator.productivityTotal += item.productivityScore || 0;
      if ((item.completedTasks || 0) > 0 || (item.minutesSpent || 0) > 0 || (item.productivityScore || 0) > 0) {
        accumulator.activeDays += 1;
      }
      return accumulator;
    },
    {
      totalTasks: 0,
      completedTasks: 0,
      minutesSpent: 0,
      productivityTotal: 0,
      activeDays: 0,
    }
  );

  return {
    totalTasks: totals.totalTasks,
    completedTasks: totals.completedTasks,
    minutesSpent: totals.minutesSpent,
    totalHours: Math.round((totals.minutesSpent / 60) * 10) / 10,
    activeDays: totals.activeDays,
    avgProductivity: series.length > 0 ? Math.round(totals.productivityTotal / series.length) : 0,
  };
};

const buildTimeDistribution = (taskStatsByDay, startDate, endDate) => {
  const totals = createEmptyCategoryMinutes();

  for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays(cursor, 1)) {
    const entry = taskStatsByDay.get(getDateKey(cursor));
    if (!entry) continue;

    Object.keys(totals).forEach((key) => {
      totals[key] += entry.categoryMinutes[key] || 0;
    });
  }

  const totalMinutes = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    name: meta.label,
    minutes: totals[key] || 0,
    hours: Math.round(((totals[key] || 0) / 60) * 10) / 10,
    percentage: totalMinutes > 0 ? Math.round(((totals[key] || 0) / totalMinutes) * 100) : 0,
    color: meta.color,
  }));
};

const buildMonthlyOverview = (series, startOfMonth) => {
  const currentMonth = startOfMonth.getMonth();
  const currentYear = startOfMonth.getFullYear();
  const buckets = new Map();

  for (const item of series) {
    const itemDate = new Date(item.date);
    if (itemDate.getMonth() !== currentMonth || itemDate.getFullYear() !== currentYear) continue;

    const weekIndex = Math.floor((itemDate.getDate() - 1) / 7) + 1;
    if (!buckets.has(weekIndex)) {
      buckets.set(weekIndex, {
        label: `Week ${weekIndex}`,
        productivityTotal: 0,
        days: 0,
        completedTasks: 0,
        minutesSpent: 0,
      });
    }

    const bucket = buckets.get(weekIndex);
    bucket.productivityTotal += item.productivityScore || 0;
    bucket.days += 1;
    bucket.completedTasks += item.completedTasks || 0;
    bucket.minutesSpent += item.minutesSpent || 0;
  }

  return Array.from(buckets.values())
    .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }))
    .map((bucket) => ({
      label: bucket.label,
      productivity: bucket.days > 0 ? Math.round(bucket.productivityTotal / bucket.days) : 0,
      completedTasks: bucket.completedTasks,
      hours: Math.round((bucket.minutesSpent / 60) * 10) / 10,
    }));
};

const formatReflectionPreview = (reflection) => ({
  _id: reflection._id,
  date: reflection.date,
  mood: reflection.mood,
  moodEmoji: MOOD_EMOJIS[reflection.mood] || '🙂',
  accomplishments: reflection.accomplishments || [],
  challenges: reflection.challenges || [],
  tomorrowGoals: reflection.tomorrowGoals || [],
});

const createCardMetric = (value, delta, suffix = '') => ({
  value,
  delta,
  suffix,
  trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
});

// Get dashboard data for reports page
exports.getDashboard = asyncHandler(async (req, res) => {
  const today = getStartOfDay();
  const historyStart = getDaysAgo(364);
  const currentWindowStart = getDaysAgo(29);
  const previousWindowEnd = addDays(currentWindowStart, -1);
  const previousWindowStart = getStartOfDay(addDays(previousWindowEnd, -29));
  const startOfMonth = getStartOfMonth(today);
  const userId = req.user.id;
  const objectUserId = new mongoose.Types.ObjectId(userId);

  const [tasks, activityLogs, streak, reflectionStats, recentReflections] = await Promise.all([
    Task.find({
      userId,
      date: { $gte: historyStart, $lte: getEndOfDay(today) }
    }).select('date category completed actualTime estimatedTime title'),
    ActivityLog.find({
      userId,
      activityDate: { $gte: historyStart, $lte: getEndOfDay(today) }
    }).select('activityDate tasksTotal tasksCompleted minutesSpent productivityScore'),
    UserStreak.findOne({ userId }),
    Reflection.getStats(userId),
    Reflection.getReflections(userId, { type: 'weekly', limit: 5 })
  ]);

  const weekStart = getWeekStart();
  let weeklyReport = await WeeklyReport.generateReport(userId, weekStart);
  weeklyReport = await WeeklyReport.findById(weeklyReport._id).populate('badgesEarned', 'name icon');

  const reportHistory = await WeeklyReport.getReportHistory(userId, 12);

  const taskStatsByDay = buildTaskStatsByDay(tasks);
  const logStatsByDay = buildLogStatsByDay(activityLogs);
  const trendSeries = buildTrendSeries({
    startDate: historyStart,
    endDate: today,
    taskStatsByDay,
    logStatsByDay,
  });

  const currentWindowSeries = trendSeries.filter((item) => item.date >= currentWindowStart && item.date <= today);
  const previousWindowSeries = trendSeries.filter((item) => item.date >= previousWindowStart && item.date <= previousWindowEnd);

  const currentSummary = summarizeTrendWindow(currentWindowSeries);
  const previousSummary = summarizeTrendWindow(previousWindowSeries);
  const timeDistribution = buildTimeDistribution(taskStatsByDay, currentWindowStart, today);
  const monthlyOverview = buildMonthlyOverview(trendSeries, startOfMonth);
  const allTimeTaskCounts = await Task.aggregate([
    {
      $match: {
        userId: objectUserId,
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$completed', true] }, 1, 0]
          }
        }
      }
    }
  ]);

  const allTimeTaskSummary = allTimeTaskCounts[0] || { total: 0, completed: 0 };

  res.json({
    success: true,
    data: {
      cards: {
        avgProductivity: createCardMetric(currentSummary.avgProductivity, currentSummary.avgProductivity - previousSummary.avgProductivity, '%'),
        activeDays: {
          ...createCardMetric(currentSummary.activeDays, currentSummary.activeDays - previousSummary.activeDays),
          total: 30,
        },
        tasksCompleted: {
          ...createCardMetric(currentSummary.completedTasks, currentSummary.completedTasks - previousSummary.completedTasks),
          total: currentSummary.totalTasks,
        },
        totalHours: createCardMetric(currentSummary.totalHours, Math.round((currentSummary.totalHours - previousSummary.totalHours) * 10) / 10, 'h'),
      },
      comparisonLabel: 'vs previous 30 days',
      trendSeries: trendSeries.map((item) => ({
        date: item.date,
        productivity: item.productivityScore,
        completedTasks: item.completedTasks,
        totalTasks: item.totalTasks,
        minutesSpent: item.minutesSpent,
      })),
      timeDistribution,
      monthlyOverview,
      pastReflections: recentReflections.map(formatReflectionPreview),
      weeklyReport,
      reportHistory,
      stats: {
        tasks: {
          total: allTimeTaskSummary.total,
          completed: allTimeTaskSummary.completed,
          completionRate: allTimeTaskSummary.total > 0 ? Math.round((allTimeTaskSummary.completed / allTimeTaskSummary.total) * 100) : 0,
        },
        streak: streak ? {
          current: streak.currentStreak,
          longest: streak.longestStreak,
          totalActiveDays: streak.totalActiveDays,
        } : null,
        reflections: reflectionStats,
        activity: {
          totalTasks: currentSummary.completedTasks,
          totalMinutes: currentSummary.minutesSpent,
          totalHours: currentSummary.totalHours,
          avgProductivity: currentSummary.avgProductivity,
          activeDays: currentSummary.activeDays,
        },
      },
      lastUpdatedAt: new Date(),
    }
  });
});

// Get current week report
exports.getWeeklyReport = asyncHandler(async (req, res) => {
  const weekStart = getWeekStart();

  let report = await WeeklyReport.generateReport(req.user.id, weekStart);
  report = await WeeklyReport.findById(report._id).populate('badgesEarned', 'name icon');

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
      { returnDocument: 'after', runValidators: true }
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
