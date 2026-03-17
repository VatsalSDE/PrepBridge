const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');
const { getDateRange } = require('../utils/date.utils');

const summarizeTasks = (tasks = []) => {
  const tasksCompleted = tasks.filter((task) => task.completed).length;
  const tasksTotal = tasks.length;
  const minutesSpent = tasks
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + (task.actualTime || 0), 0);
  const completionRate = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const timeComponent = Math.min(minutesSpent / 240, 1) * 30;
  const taskComponent = Math.min(tasksCompleted / 10, 1) * 30;
  const productivityScore = Math.round((completionRate / 100) * 40 + timeComponent + taskComponent);

  return {
    tasksCompleted,
    tasksTotal,
    minutesSpent,
    productivityScore,
  };
};

// Get heatmap data (1 year)
exports.getHeatmap = asyncHandler(async (req, res) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const userObjectId = new mongoose.Types.ObjectId(req.user.id);
  const heatmapData = await Task.aggregate([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$date',
        tasksCompleted: {
          $sum: { $cond: ['$completed', 1, 0] },
        },
        tasksTotal: { $sum: 1 },
        minutesSpent: {
          $sum: { $cond: ['$completed', { $ifNull: ['$actualTime', 0] }, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        tasksCompleted: 1,
        tasksTotal: 1,
        minutesSpent: 1,
        completionRate: {
          $cond: [
            { $gt: ['$tasksTotal', 0] },
            { $round: [{ $multiply: [{ $divide: ['$tasksCompleted', '$tasksTotal'] }, 100] }, 0] },
            0,
          ],
        },
      },
    },
    {
      $project: {
        date: 1,
        tasksCompleted: 1,
        score: {
          $round: [
            {
              $add: [
                { $multiply: [{ $divide: ['$completionRate', 100] }, 40] },
                { $multiply: [{ $min: [{ $divide: ['$minutesSpent', 240] }, 1] }, 30] },
                { $multiply: [{ $min: [{ $divide: ['$tasksCompleted', 10] }, 1] }, 30] },
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { date: 1 } },
  ]);

  res.json({
    success: true,
    data: heatmapData,
  });
});

// Get day details
exports.getDayDetails = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const { start, end } = getDateRange(new Date(date));

  const [activityLog, tasks] = await Promise.all([
    ActivityLog.findOne({
      userId: req.user.id,
      activityDate: { $gte: start, $lt: end },
    }),
    Task.find({
      userId: req.user.id,
      date: { $gte: start, $lt: end },
    }).sort({ priority: -1, createdAt: 1 }),
  ]);

  const activity = activityLog || summarizeTasks(tasks);

  res.json({
    success: true,
    data: {
      date: start,
      activity,
      tasks,
    },
  });
});
