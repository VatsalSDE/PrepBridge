const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserStreak = require('../models/UserStreak');
const Task = require('../models/Task');
const RoadmapProgress = require('../models/RoadmapProgress');
const CommunityPost = require('../models/CommunityPost');
const JDAnalysis = require('../models/JDAnalysis');

/**
 * Badge Service
 * Handles badge checking, awarding, and progress tracking
 */

// Check all badge criteria for a user
const checkBadgeProgress = async (userId) => {
  const badges = await Badge.getActiveBadges();
  const updates = [];

  for (const badge of badges) {
    const progress = await calculateBadgeProgress(userId, badge);
    const existing = await UserBadge.findOne({ userId, badgeId: badge._id });
    const update = await UserBadge.updateProgress(userId, badge._id, progress);
    updates.push({
      badge: badge.name,
      progress: update.progress,
      earned: update.earned,
      justEarned: !existing?.earned && update.earned,
    });
  }

  return updates.filter(u => u.justEarned);
};

// Calculate progress for a specific badge
const calculateBadgeProgress = async (userId, badge) => {
  const { criteriaType, criteriaValue } = badge;

  switch (criteriaType) {
    case 'streak': {
      const streak = await UserStreak.findOne({ userId });
      if (!streak) return 0;
      return Math.min(100, Math.round((streak.currentStreak / criteriaValue) * 100));
    }

    case 'task_count': {
      const count = await Task.countDocuments({ userId, completed: true });
      return Math.min(100, Math.round((count / criteriaValue) * 100));
    }

    case 'roadmap_percent': {
      const roadmap = await RoadmapProgress.findOne({ userId });
      if (!roadmap) return 0;
      return Math.min(100, Math.round((roadmap.totalProgress / criteriaValue) * 100));
    }

    case 'upvotes': {
      const posts = await CommunityPost.find({ userId });
      const totalUpvotes = posts.reduce((sum, p) => sum + p.upvoteCount, 0);
      return Math.min(100, Math.round((totalUpvotes / criteriaValue) * 100));
    }

    case 'jd_score': {
      const analyses = await JDAnalysis.find({ userId }).sort({ matchScore: -1 }).limit(1);
      if (analyses.length === 0) return 0;
      return Math.min(100, Math.round((analyses[0].matchScore / criteriaValue) * 100));
    }

    default:
      return 0;
  }
};

// Award badge directly
const awardBadge = async (userId, badgeId) => {
  return await UserBadge.awardBadge(userId, badgeId);
};

// Get all badges with progress for a user
const getAllBadgesWithProgress = async (userId) => {
  return await UserBadge.getBadgesWithProgress(userId);
};

// Get earned badges only
const getEarnedBadges = async (userId) => {
  const badges = await getAllBadgesWithProgress(userId);
  return badges.filter(b => b.earned);
};

// Get badges in progress
const getInProgressBadges = async (userId) => {
  const badges = await getAllBadgesWithProgress(userId);
  return badges.filter(b => !b.earned && b.progress > 0);
};

module.exports = {
  checkBadgeProgress,
  calculateBadgeProgress,
  awardBadge,
  getAllBadgesWithProgress,
  getEarnedBadges,
  getInProgressBadges
};
