const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  summary: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    activeDays: { type: Number, default: 0 },
    avgProductivityScore: { type: Number, default: 0 }
  },
  categoryBreakdown: {
    DSA: { tasks: Number, minutes: Number },
    CoreCS: { tasks: Number, minutes: Number },
    Aptitude: { tasks: Number, minutes: Number },
    Projects: { tasks: Number, minutes: Number },
    SystemDesign: { tasks: Number, minutes: Number },
    Behavioral: { tasks: Number, minutes: Number }
  },
  streakData: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    streakMaintained: { type: Boolean, default: false }
  },
  badgesEarned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  topicsCompleted: [{
    category: String,
    topic: String
  }],
  insights: [{
    type: {
      type: String,
      enum: ['strength', 'improvement', 'suggestion']
    },
    message: String
  }],
  comparedToPrevious: {
    tasksChange: { type: Number, default: 0 },
    minutesChange: { type: Number, default: 0 },
    productivityChange: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

weeklyReportSchema.index({ userId: 1, year: 1, weekNumber: 1 }, { unique: true });
weeklyReportSchema.index({ userId: 1, weekStartDate: -1 });

const getTaskMinutes = (task) => {
  if (!task) return 0;
  if (typeof task.actualTime === 'number' && task.actualTime > 0) return task.actualTime;
  if (task.completed && typeof task.estimatedTime === 'number' && task.estimatedTime > 0) return task.estimatedTime;
  return 0;
};

weeklyReportSchema.statics.generateReport = async function(userId, weekStartDate) {
  const ActivityLog = mongoose.model('ActivityLog');
  const Task = mongoose.model('Task');
  const UserStreak = mongoose.model('UserStreak');
  const UserBadge = mongoose.model('UserBadge');
  
  const weekStart = new Date(weekStartDate);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekNum = getWeekNumber(weekStart);
  const year = weekStart.getFullYear();
  
  const activities = await ActivityLog.find({
    userId,
    activityDate: { $gte: weekStart, $lte: weekEnd }
  });
  
  const tasks = await Task.find({
    userId,
    date: { $gte: weekStart, $lte: weekEnd }
  });
  
  const streak = await UserStreak.findOne({ userId });
  
  const badges = await UserBadge.find({
    userId,
    earnedAt: { $gte: weekStart, $lte: weekEnd }
  }).select('badgeId');
  
  const summary = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    totalMinutes: tasks.reduce((sum, t) => sum + getTaskMinutes(t), 0),
    activeDays: activities.length,
    avgProductivityScore: activities.length > 0 
      ? Math.round(activities.reduce((sum, a) => sum + a.productivityScore, 0) / activities.length)
      : 0
  };
  
  const categoryBreakdown = {
    DSA: { tasks: 0, minutes: 0 },
    CoreCS: { tasks: 0, minutes: 0 },
    Aptitude: { tasks: 0, minutes: 0 },
    Projects: { tasks: 0, minutes: 0 },
    SystemDesign: { tasks: 0, minutes: 0 },
    Behavioral: { tasks: 0, minutes: 0 },
  };

  const categoryMap = {
    'dsa': 'DSA',
    'core-cs': 'CoreCS',
    'aptitude': 'Aptitude',
    'project': 'Projects',
    'development': 'SystemDesign',
    'soft-skills': 'Behavioral',
    'mock-interview': 'Behavioral',
  };

  tasks.forEach((task) => {
    const key = categoryMap[task.category] || 'DSA';
    categoryBreakdown[key].tasks += 1;
    categoryBreakdown[key].minutes += getTaskMinutes(task);
  });

  const topicsCompleted = tasks
    .filter((task) => task.completed)
    .map((task) => ({
      category: task.category,
      topic: task.title,
    }));

  const previousWeekStart = new Date(weekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const previousReport = await this.findOne({ userId, weekStartDate: previousWeekStart });

  const comparedToPrevious = previousReport
    ? {
        tasksChange: summary.completedTasks - (previousReport.summary?.completedTasks || 0),
        minutesChange: summary.totalMinutes - (previousReport.summary?.totalMinutes || 0),
        productivityChange: summary.avgProductivityScore - (previousReport.summary?.avgProductivityScore || 0),
      }
    : {
        tasksChange: 0,
        minutesChange: 0,
        productivityChange: 0,
      };

  const insights = [];
  if (summary.completedTasks >= 25) {
    insights.push({ type: 'strength', message: 'Strong weekly consistency with high task completion.' });
  }
  if (summary.activeDays <= 3) {
    insights.push({ type: 'improvement', message: 'Increase active days to build stronger momentum.' });
  }
  if (summary.avgProductivityScore < 70) {
    insights.push({ type: 'suggestion', message: 'Try shorter focused sessions and clearer daily priorities.' });
  }
  
  const report = await this.findOneAndUpdate(
    { userId, year, weekNumber: weekNum },
    {
      userId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      weekNumber: weekNum,
      year,
      summary,
      categoryBreakdown,
      streakData: {
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        streakMaintained: streak?.currentStreak > 0
      },
      badgesEarned: badges.map(b => b.badgeId),
      topicsCompleted,
      comparedToPrevious,
      insights,
    },
    { upsert: true, returnDocument: 'after' }
  );
  
  return report;
};

weeklyReportSchema.statics.getReportHistory = async function(userId, limit = 12) {
  return this.find({ userId })
    .sort({ weekStartDate: -1 })
    .limit(limit)
    .populate('badgesEarned', 'name icon');
};

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
