const UserBadge = require('../models/UserBadge');
const UserStreak = require('../models/UserStreak');
const badgeService = require('../services/badge.service');
const { asyncHandler } = require('../middleware/errorHandler');

// Get badges + progress
exports.getBadges = asyncHandler(async (req, res) => {
  await badgeService.checkBadgeProgress(req.user.id);
  const badges = await UserBadge.getBadgesWithProgress(req.user.id);

  const earned = badges.filter(b => b.earned);
  const inProgress = badges.filter(b => !b.earned);

  res.json({
    success: true,
    data: {
      earned,
      inProgress,
      totalEarned: earned.length,
      totalBadges: badges.length
    }
  });
});

// Get streak info
exports.getStreaks = asyncHandler(async (req, res) => {
  let streak = await UserStreak.findOne({ userId: req.user.id });

  if (!streak) {
    streak = await UserStreak.create({ userId: req.user.id });
  }

  res.json({
    success: true,
    data: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalActiveDays: streak.totalActiveDays,
      weeklyActiveDays: streak.weeklyActiveDays,
      lastActiveDate: streak.lastActiveDate,
      streakStartDate: streak.streakStartDate
    }
  });
});

// Get weekly leaderboard
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await UserStreak.find({ weeklyActiveDays: { $gt: 0 } })
    .sort({ weeklyActiveDays: -1, currentStreak: -1 })
    .limit(10)
    .populate('userId', 'name');

  const formattedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    name: entry.userId?.name || 'Anonymous',
    weeklyActiveDays: entry.weeklyActiveDays,
    currentStreak: entry.currentStreak
  }));

  const userStreak = await UserStreak.findOne({ userId: req.user.id });
  let userRank = null;
  
  if (userStreak && userStreak.weeklyActiveDays > 0) {
    const usersAbove = await UserStreak.countDocuments({
      weeklyActiveDays: { $gt: userStreak.weeklyActiveDays }
    });
    userRank = usersAbove + 1;
  }

  res.json({
    success: true,
    data: {
      leaderboard: formattedLeaderboard,
      userRank,
      userStats: userStreak ? {
        weeklyActiveDays: userStreak.weeklyActiveDays,
        currentStreak: userStreak.currentStreak
      } : null
    }
  });
});
