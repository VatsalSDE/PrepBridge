const mongoose = require('mongoose');

const jdAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  jdText: {
    type: String,
    required: true
  },
  extractedSkills: [{
    skill: String,
    category: {
      type: String,
      enum: ['technical', 'soft', 'tool', 'domain']
    },
    importance: {
      type: String,
      enum: ['required', 'preferred', 'nice-to-have']
    }
  }],
  matchedSkills: [{
    skill: String,
    userLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }
  }],
  missingSkills: [{
    skill: String,
    category: String,
    importance: String
  }],
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  recommendations: [{
    skill: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    suggestedResources: [String]
  }],
  isSaved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

jdAnalysisSchema.index({ userId: 1, createdAt: -1 });
jdAnalysisSchema.index({ userId: 1, isSaved: 1 });
jdAnalysisSchema.index({ userId: 1, companyId: 1, createdAt: -1 });

jdAnalysisSchema.statics.getUserAnalyses = async function(userId, options = {}) {
  const { savedOnly = false, limit = 10, skip = 0 } = options;
  
  const query = { userId };
  if (savedOnly) query.isSaved = true;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-jdText');
};

jdAnalysisSchema.statics.getSkillGaps = async function(userId) {
  const analyses = await this.find({ userId }).sort({ createdAt: -1 }).limit(5);
  
  const skillGaps = {};
  analyses.forEach(analysis => {
    analysis.missingSkills.forEach(item => {
      if (!skillGaps[item.skill]) {
        skillGaps[item.skill] = { count: 0, importance: item.importance, category: item.category };
      }
      skillGaps[item.skill].count++;
    });
  });
  
  return Object.entries(skillGaps)
    .map(([skill, data]) => ({ skill, ...data }))
    .sort((a, b) => b.count - a.count);
};

module.exports = mongoose.model('JDAnalysis', jdAnalysisSchema);