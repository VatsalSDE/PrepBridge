const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getProfile,
  updateProfile,
  uploadResume
} = require('../controllers/user.controller');

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.post('/resume', uploadResume);

module.exports = router;
