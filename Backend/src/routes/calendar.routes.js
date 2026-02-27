const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getHeatmap,
  getDayDetails
} = require('../controllers/calendar.controller');

router.use(protect);

router.get('/heatmap', getHeatmap);
router.get('/day/:date', getDayDetails);

module.exports = router;
