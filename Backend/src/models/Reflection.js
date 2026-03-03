const mongoose = require('mongoose');

const MOOD_ALIASES = {
  productive: 'productive',
  excellent: 'great',
  amazing: 'great',
  happy: 'good',
  neutral: 'okay',
  low: 'bad',
  tired: 'bad',
  burnedout: 'terrible',
  burnout: 'terrible',
  '💪': 'productive',
  '🔥': 'productive',
  '😊': 'good',
  '😐': 'okay',
  '😔': 'bad',
  '😴': 'terrible'
};

const normalizeMood = (value) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  return MOOD_ALIASES[normalized] || normalized;
};

const toStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (value == null) return [];

  const asString = String(value).trim();
  return asString ? [asString] : [];
};

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
    enum: ['great', 'good', 'okay', 'bad', 'terrible', 'productive'],
    set: normalizeMood,
    required: true
  },
  accomplishments: {
    type: [{ type: String, trim: true }],
    default: [],
    set: toStringList
  },
  challenges: {
    type: [{ type: String, trim: true }],
    default: [],
    set: toStringList
  },
  learnings: {
    type: [{ type: String, trim: true }],
    default: [],
    set: toStringList
  },
  tomorrowGoals: {
    type: [{ type: String, trim: true }],
    default: [],
    set: toStringList
  },
  gratitude: {
    type: String,
    trim: true
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  focusLevel: {
    type: Number,
    min: 1,
    max: 10
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
  
  const moodValues = { great: 5, productive: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
  
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
  
  const moodCounts = { great: 0, productive: 0, good: 0, okay: 0, bad: 0, terrible: 0 };
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
