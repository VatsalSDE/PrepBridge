const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'terrible'],
    required: true
  },
  accomplishments: {
    type: String,
    trim: true
  },
  challenges: {
    type: String,
    trim: true
  },
  learnings: {
    type: String,
    trim: true
  },
  tomorrowGoals: {
    type: String,
    trim: true
  },
  gratitude: {
    type: String,
    trim: true
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  focusLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

reflectionSchema.index({ userId: 1, date: -1 });
reflectionSchema.index({ userId: 1, type: 1, date: -1 });

reflectionSchema.statics.getReflections = async function(userId, options = {}) {
  const { type, startDate, endDate, limit = 30 } = options;
  
  const query = { userId };
  if (type) query.type = type;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  return this.find(query)
    .sort({ date: -1 })
    .limit(limit);
};

reflectionSchema.statics.getMoodTrend = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const reflections = await this.find({
    userId,
    date: { $gte: startDate }
  }).select('date mood energyLevel focusLevel').sort({ date: 1 });
  
  const moodValues = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
  
  return reflections.map(r => ({
    date: r.date,
    mood: r.mood,
    moodScore: moodValues[r.mood],
    energyLevel: r.energyLevel,
    focusLevel: r.focusLevel
  }));
};

reflectionSchema.statics.getStats = async function(userId) {
  const reflections = await this.find({ userId });
  
  if (reflections.length === 0) return null;
  
  const moodCounts = { great: 0, good: 0, okay: 0, bad: 0, terrible: 0 };
  let totalEnergy = 0, totalFocus = 0, energyCount = 0, focusCount = 0;
  
  reflections.forEach(r => {
    moodCounts[r.mood]++;
    if (r.energyLevel) { totalEnergy += r.energyLevel; energyCount++; }
    if (r.focusLevel) { totalFocus += r.focusLevel; focusCount++; }
  });
  
  return {
    totalReflections: reflections.length,
    moodDistribution: moodCounts,
    avgEnergyLevel: energyCount > 0 ? (totalEnergy / energyCount).toFixed(1) : null,
    avgFocusLevel: focusCount > 0 ? (totalFocus / focusCount).toFixed(1) : null
  };
};

module.exports = mongoose.model('Reflection', reflectionSchema);
