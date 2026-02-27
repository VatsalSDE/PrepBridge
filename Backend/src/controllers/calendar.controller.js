const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

// Get heatmap data (1 year)
exports.getHeatmap = asyncHandler(async (req, res) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const heatmapData = await ActivityLog.getHeatmapData(req.user.id, startDate, endDate);

  res.json({
    success: true,
    data: heatmapData
  });
});

// Get day details
exports.getDayDetails = asyncHandler(async (req, res) => {
  const { date } = req.params;

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const [activityLog, tasks] = await Promise.all([
    ActivityLog.findOne({ 
      userId: req.user.id, 
      activityDate: { $gte: targetDate, $lt: nextDay } 
    }),
    Task.find({ 
      userId: req.user.id, 
      date: { $gte: targetDate, $lt: nextDay } 
    }).sort({ priority: -1, createdAt: 1 })
  ]);

  res.json({
    success: true,
    data: {
      date: targetDate,
      activity: activityLog || {
        tasksCompleted: 0,
        tasksTotal: 0,
        minutesSpent: 0,
        productivityScore: 0
      },
      tasks
    }
  });
});
