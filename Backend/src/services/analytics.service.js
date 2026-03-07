const mongoose = require("mongoose");
const User = require("../models/User");
const Company = require("../models/Company");
const PostReport = require("../models/PostReport");
const CommunityPost = require("../models/CommunityPost");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const UserStreak = require("../models/UserStreak");

const startOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const toDateKey = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

const toMonthKey = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
};

const monthStart = (date) => {
  const value = new Date(date);
  value.setDate(1);
  value.setHours(0, 0, 0, 0);
  return value;
};

const getUserGrowthData = async (months = 12) => {
  const now = new Date();
  const from = monthStart(now);
  from.setMonth(from.getMonth() - (months - 1));

  const [countBeforeRange, groupedInRange] = await Promise.all([
    User.countDocuments({ createdAt: { $lt: from } }),
    User.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          createdUsers: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const groupedMap = new Map();
  for (const item of groupedInRange) {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
    groupedMap.set(key, item.createdUsers);
  }

  const points = [];
  let runningUsers = countBeforeRange;
  for (let index = 0; index < months; index += 1) {
    const cursor = new Date(from);
    cursor.setMonth(from.getMonth() + index);
    const key = toMonthKey(cursor);
    runningUsers += groupedMap.get(key) || 0;
    points.push({
      date: toDateKey(cursor),
      users: runningUsers,
    });
  }

  return points;
};

const getActivityData = async (days = 7) => {
  const from = startOfDay(new Date());
  from.setDate(from.getDate() - (days - 1));

  const [taskStats, loginStats] = await Promise.all([
    Task.aggregate([
      {
        $match: {
          $or: [{ completed: true }, { isCompleted: true }],
          completedAt: { $gte: from },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          completedTasks: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", completedTasks: 1 } },
    ]),
    ActivityLog.aggregate([
      { $match: { activityDate: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$activityDate" } },
          logins: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", logins: 1 } },
    ]),
  ]);

  const taskMap = new Map(taskStats.map((item) => [item.date, item.completedTasks]));
  const loginMap = new Map(loginStats.map((item) => [item.date, item.logins]));

  const data = [];
  for (let index = 0; index < days; index += 1) {
    const cursor = new Date(from);
    cursor.setDate(from.getDate() + index);
    const key = toDateKey(cursor);
    data.push({
      date: key,
      logins: loginMap.get(key) || 0,
      completedTasks: taskMap.get(key) || 0,
    });
  }

  return data;
};

const getCategoryDistribution = async () => {
  const distribution = await Task.aggregate([
    { $match: { completed: true } },
    { $group: { _id: "$category", value: { $sum: 1 } } },
    { $sort: { value: -1 } },
  ]);

  const total = distribution.reduce((sum, entry) => sum + entry.value, 0);
  if (!total) return [];

  const labelMap = {
    dsa: "DSA",
    "core-cs": "Core CS",
    development: "Development",
    aptitude: "Aptitude",
    "soft-skills": "Soft Skills",
    "mock-interview": "Mock Interview",
    project: "Project",
  };

  return distribution.map((entry) => ({
    name: labelMap[entry._id] || entry._id || "Other",
    value: Math.round((entry.value / total) * 100),
  }));
};

const getConsistentPerformers = async (limit = 5) => {
  const streakRows = await UserStreak.find({})
    .sort({ currentStreak: -1, longestStreak: -1 })
    .limit(limit)
    .populate("userId", "name college");

  const userIds = streakRows
    .map((row) => row.userId?._id)
    .filter(Boolean)
    .map((id) => id.toString());

  let productivityMap = new Map();
  if (userIds.length) {
    const from = startOfDay(new Date());
    from.setDate(from.getDate() - 30);

    const productivity = await ActivityLog.aggregate([
      {
        $match: {
          userId: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
          activityDate: { $gte: from },
        },
      },
      {
        $group: {
          _id: "$userId",
          avgProductivity: { $avg: "$productivityScore" },
        },
      },
    ]);

    productivityMap = new Map(
      productivity.map((entry) => [entry._id.toString(), Math.round(entry.avgProductivity || 0)])
    );
  }

  return streakRows
    .filter((row) => row.userId)
    .map((row) => {
      const userId = row.userId._id.toString();
      return {
        name: row.userId.name || "User",
        college: row.userId.college || "College not set",
        streak: row.currentStreak || 0,
        avgProductivity: productivityMap.get(userId) || 0,
      };
    });
};

const getOverviewStats = async () => {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [totalUsers, bannedUsers, totalCompanies, approvedCompanies, totalPosts, pendingReports, resolvedReports] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "banned" }),
      Company.countDocuments(),
      Company.countDocuments({ approved: true }),
      CommunityPost.countDocuments(),
      PostReport.countDocuments({ status: "pending" }),
      PostReport.countDocuments({ status: "resolved" }),
    ]);

  const [activeUsersToday, tasksCompleted] = await Promise.all([
    ActivityLog.countDocuments({ activityDate: { $gte: todayStart, $lte: todayEnd } }),
    Task.countDocuments({
      $or: [
        { completed: true },
        {
          $and: [
            { completed: { $exists: false } },
            { isCompleted: true },
          ],
        },
      ],
    }),
  ]);

  const avgEngagement = totalUsers > 0 ? Math.round((activeUsersToday / totalUsers) * 100) : 0;

  return {
    totalUsers,
    bannedUsers,
    totalCompanies,
    approvedCompanies,
    totalPosts,
    pendingReports,
    resolvedReports,
    activeUsersToday,
    tasksCompleted,
    avgEngagement,
  };
};

const getDashboardStats = async () => {
  const [overview, userGrowth, activityChart, categoryDistribution, consistentPerformers] = await Promise.all([
    getOverviewStats(),
    getUserGrowthData(12),
    getActivityData(7),
    getCategoryDistribution(),
    getConsistentPerformers(5),
  ]);

  return {
    ...overview,
    userGrowth,
    activityChart,
    categoryDistribution,
    consistentPerformers,
  };
};

module.exports = { getDashboardStats, getUserGrowthData, getActivityData, getCategoryDistribution, getConsistentPerformers };