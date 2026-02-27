const JDAnalysis = require('../models/JDAnalysis');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Analyze JD (ML integration placeholder)
exports.analyzeJD = asyncHandler(async (req, res) => {
  const { jobTitle, company, jdText } = req.body;

  if (!jobTitle || !jdText) {
    throw new AppError('Job title and JD text are required', 400);
  }

  // TODO: Call ML service for actual analysis
  // For now, creating placeholder analysis
  const analysis = await JDAnalysis.create({
    userId: req.user.id,
    jobTitle,
    company,
    jdText,
    extractedSkills: [],
    matchedSkills: [],
    missingSkills: [],
    matchScore: 0,
    recommendations: []
  });

  res.status(201).json({
    success: true,
    data: analysis,
    message: 'Analysis created. ML integration pending.'
  });
});

// Get analysis history
exports.getHistory = asyncHandler(async (req, res) => {
  const { savedOnly, page = 1, limit = 10 } = req.query;

  const analyses = await JDAnalysis.getUserAnalyses(req.user.id, {
    savedOnly: savedOnly === 'true',
    limit: parseInt(limit),
    skip: (page - 1) * limit
  });

  res.json({
    success: true,
    data: analyses
  });
});

// Get single analysis
exports.getAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const analysis = await JDAnalysis.findById(id);

  if (!analysis) {
    throw new AppError('Analysis not found', 404);
  }

  if (analysis.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  res.json({
    success: true,
    data: analysis
  });
});

// Toggle save analysis
exports.toggleSave = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const analysis = await JDAnalysis.findById(id);

  if (!analysis) {
    throw new AppError('Analysis not found', 404);
  }

  if (analysis.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  analysis.isSaved = !analysis.isSaved;
  await analysis.save();

  res.json({
    success: true,
    data: { isSaved: analysis.isSaved }
  });
});

// Delete analysis
exports.deleteAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const analysis = await JDAnalysis.findById(id);

  if (!analysis) {
    throw new AppError('Analysis not found', 404);
  }

  if (analysis.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  await JDAnalysis.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Analysis deleted'
  });
});

// Get skill gaps across analyses
exports.getSkillGaps = asyncHandler(async (req, res) => {
  const skillGaps = await JDAnalysis.getSkillGaps(req.user.id);

  res.json({
    success: true,
    data: skillGaps
  });
});
