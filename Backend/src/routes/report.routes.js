const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getDashboard,
  getWeeklyReport,
  getReportHistory,
  submitReflection,
  getStats,
  getReflections
} = require('../controllers/report.controller');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/weekly', getWeeklyReport);
router.get('/history', getReportHistory);
router.post('/reflection', submitReflection);
router.get('/reflections', getReflections);
router.get('/stats', getStats);

module.exports = router;
