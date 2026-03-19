const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { uploadResumeMw } = require('../config/resumeUpload');
const {
  getCompanies,
  analyzeJD,
  getHistory,
  getAnalysis,
  toggleSave,
  deleteAnalysis,
  getSkillGaps
} = require('../controllers/jd.controller');

router.use(protect);

router.get('/companies', getCompanies);
router.post('/analyze', uploadResumeMw, analyzeJD);
router.get('/history', getHistory);
router.get('/skill-gaps', getSkillGaps);

router.route('/:id')
  .get(getAnalysis)
  .delete(deleteAnalysis);

router.patch('/:id/save', toggleSave);

module.exports = router;