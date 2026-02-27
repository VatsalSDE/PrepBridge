const mongoose = require("mongoose");
const User = require("../models/User");
const Company = require("../models/Company");
const PostReport = require("../models/PostReport");
const CommunityPost = require("../models/CommunityPost");

const safeModel = (name) => {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
};

const getUserGrowthData = async (days = 30) => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));

  return User.aggregate([
    { $match: { createdAt: { $gte: from } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, users: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", users: 1 } },
  ]);
};

const getActivityData = async (days = 7) => {
  const Task = safeModel("Task");
  if (!Task) return [];

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));

  return Task.aggregate([
    { $match: { createdAt: { $gte: from } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        completedTasks: {
          $sum: { $cond: [{ $or: [{ $eq: ["$completed", true] }, { $eq: ["$isCompleted", true] }] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", completedTasks: 1 } },
  ]);
};

const getCommunityStats = async () => {
  const [totalPosts, pendingReports, resolvedReports] = await Promise.all([
    CommunityPost.countDocuments(),
    PostReport.countDocuments({ status: "pending" }),
    PostReport.countDocuments({ status: "resolved" }),
  ]);
  return { totalPosts, pendingReports, resolvedReports };
};

const getDashboardStats = async () => {
  const [totalUsers, bannedUsers, totalCompanies, approvedCompanies, community, userGrowth, activityChart] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "banned" }),
      Company.countDocuments(),
      Company.countDocuments({ approved: true }),
      getCommunityStats(),
      getUserGrowthData(30),
      getActivityData(7),
    ]);

  return {
    totalUsers,
    bannedUsers,
    totalCompanies,
    approvedCompanies,
    totalPosts: community.totalPosts,
    pendingReports: community.pendingReports,
    resolvedReports: community.resolvedReports,
    userGrowth,
    activityChart,
  };
};

module.exports = { getDashboardStats, getUserGrowthData, getActivityData, getCommunityStats };