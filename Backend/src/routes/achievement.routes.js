const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getBadges,
  getStreaks,
  getLeaderboard
} = require('../controllers/achievement.controller');

router.use(protect);

router.get('/', getBadges);
router.get('/streaks', getStreaks);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
