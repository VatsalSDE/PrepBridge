const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getProfile,
  updateProfile,
  uploadResume,
  viewResume,
  getDashboardSummary,
} = require('../controllers/user.controller');

router.use(protect);

router.get('/dashboard', getDashboardSummary);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.post('/resume', uploadResume);
router.get('/resume/view', viewResume);

module.exports = router;
