const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getRoadmap,
  updateFoundation,
  updateDomain
} = require('../controllers/roadmap.controller');

router.use(protect);

router.get('/', getRoadmap);
router.patch('/foundations/:section', updateFoundation);
router.patch('/domains/:roleId', updateDomain);

module.exports = router;
