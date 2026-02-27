const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  analyzeJD,
  getHistory,
  getAnalysis,
  toggleSave,
  deleteAnalysis,
  getSkillGaps
} = require('../controllers/jd.controller');

router.use(protect);

router.post('/analyze', analyzeJD);
router.get('/history', getHistory);
router.get('/skill-gaps', getSkillGaps);

router.route('/:id')
  .get(getAnalysis)
  .delete(deleteAnalysis);

router.patch('/:id/save', toggleSave);

module.exports = router;
