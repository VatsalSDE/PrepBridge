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

weeklyReportSchema.statics.generateReport = async function(userId, weekStartDate) {
  const ActivityLog = mongoose.model('ActivityLog');
  const Task = mongoose.model('Task');
  const UserStreak = mongoose.model('UserStreak');
  const UserBadge = mongoose.model('UserBadge');
  
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const weekNum = getWeekNumber(weekStartDate);
  const year = weekStartDate.getFullYear();
  
  const activities = await ActivityLog.find({
    userId,
    date: { $gte: weekStartDate, $lte: weekEnd }
  });
  
  const tasks = await Task.find({
    userId,
    date: { $gte: weekStartDate, $lte: weekEnd }
  });
  
  const streak = await UserStreak.findOne({ userId });
  
  const badges = await UserBadge.find({
    userId,
    earnedAt: { $gte: weekStartDate, $lte: weekEnd }
  }).select('badgeId');
  
  const summary = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.isCompleted).length,
    totalMinutes: activities.reduce((sum, a) => sum + a.minutesSpent, 0),
    activeDays: activities.length,
    avgProductivityScore: activities.length > 0 
      ? Math.round(activities.reduce((sum, a) => sum + a.productivityScore, 0) / activities.length)
      : 0
  };
  
  const categoryBreakdown = {};
  ['DSA', 'CoreCS', 'Aptitude', 'Projects', 'SystemDesign', 'Behavioral'].forEach(cat => {
    const catTasks = tasks.filter(t => t.category === cat);
    categoryBreakdown[cat] = {
      tasks: catTasks.length,
      minutes: catTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0)
    };
  });
  
  const report = await this.findOneAndUpdate(
    { userId, year, weekNumber: weekNum },
    {
      userId,
      weekStartDate,
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
      badgesEarned: badges.map(b => b.badgeId)
    },
    { upsert: true, new: true }
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
