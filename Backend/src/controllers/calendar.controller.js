const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');
const { getDateRange } = require('../utils/date.utils');

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
  const { start, end } = getDateRange(new Date(date));

  const [activityLog, tasks] = await Promise.all([
    ActivityLog.findOne({ 
      userId: req.user.id, 
      activityDate: { $gte: start, $lt: end } 
    }),
    Task.find({ 
      userId: req.user.id, 
      date: { $gte: start, $lt: end } 
    }).sort({ priority: -1, createdAt: 1 })
  ]);

  res.json({
    success: true,
    data: {
      date: start,
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
