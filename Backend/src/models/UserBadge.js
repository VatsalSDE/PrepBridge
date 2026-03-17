// src/models/UserBadge.js - Tracks user's badge progress & earned badges
const mongoose = require("mongoose");

const userBadgeSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    badgeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Badge", 
      required: true,
      index: true
    },

    progress: { type: Number, default: 0, min: 0, max: 100 },
    earned: { type: Boolean, default: false },
    earnedAt: { type: Date }
  },
  { timestamps: true }
);

// Compound unique index - one badge per user
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Get all badges with progress for a user
userBadgeSchema.statics.getBadgesWithProgress = async function (userId) {
  const Badge = mongoose.model("Badge");
  const allBadges = await Badge.getActiveBadges();
  const userBadges = await this.find({ userId });

  const badgeMap = {};
  userBadges.forEach(ub => {
    badgeMap[ub.badgeId.toString()] = ub;
  });

  return allBadges.map(badge => ({
    ...badge.toObject(),
    progress: badgeMap[badge._id.toString()]?.progress || 0,
    earned: badgeMap[badge._id.toString()]?.earned || false,
    earnedAt: badgeMap[badge._id.toString()]?.earnedAt || null
  }));
};

// Award badge to user
userBadgeSchema.statics.awardBadge = async function (userId, badgeId) {
  const userBadge = await this.findOneAndUpdate(
    { userId, badgeId },
    { 
      progress: 100, 
      earned: true, 
      earnedAt: new Date() 
    },
    { upsert: true, new: true }
  );
  return userBadge;
};

// Update badge progress
userBadgeSchema.statics.updateProgress = async function (userId, badgeId, progress) {
  const normalizedProgress = Math.max(0, Math.min(progress, 100));
  const earned = progress >= 100;
  const existing = await this.findOne({ userId, badgeId });

  const updateData = {
    progress: normalizedProgress,
    earned,
    earnedAt: earned ? existing?.earnedAt || new Date() : null,
  };

  const userBadge = await this.findOneAndUpdate(
    { userId, badgeId },
    updateData,
    { upsert: true, new: true }
  );
  return userBadge;
};

const UserBadge = mongoose.model("UserBadge", userBadgeSchema);

module.exports = UserBadge;
