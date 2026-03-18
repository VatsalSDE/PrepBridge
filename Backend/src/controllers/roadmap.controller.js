const RoadmapProgress = require('../models/RoadmapProgress');
const RoadmapTemplate = require('../models/RoadmapTemplate');
const badgeService = require('../services/badge.service');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const triggerBadgeRefresh = (userId) => {
  Promise.resolve(badgeService.checkBadgeProgress(userId)).catch(() => {});
};

// Get full roadmap progress
exports.getRoadmap = asyncHandler(async (req, res) => {
  let roadmap = await RoadmapProgress.findOne({ userId: req.user.id });

  if (!roadmap) {
    roadmap = await RoadmapProgress.initializeDefault(req.user.id);
  }

  const template = await RoadmapTemplate.getActiveTemplate();
  await roadmap.syncWithTemplate(template);
  triggerBadgeRefresh(req.user.id);

  res.json({
    success: true,
    data: roadmap
  });
});

// Update foundation topic (DSA, CoreCS, Aptitude, SystemDesign)
exports.updateFoundation = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const { sectionName, topicName } = req.body;

  const validSections = ['dsa', 'coreCS', 'aptitude', 'systemDesign'];
  if (!validSections.includes(section)) {
    throw new AppError('Invalid section', 400);
  }

  if (!sectionName || !topicName) {
    throw new AppError('sectionName and topicName are required', 400);
  }

  let roadmap = await RoadmapProgress.findOne({ userId: req.user.id });

  if (!roadmap) {
    roadmap = await RoadmapProgress.initializeDefault(req.user.id);
  }

  await roadmap.toggleTopic(section, sectionName, topicName);
  triggerBadgeRefresh(req.user.id);

  res.json({
    success: true,
    data: roadmap
  });
});

// Update domain skill (Frontend, Backend, etc.)
exports.updateDomain = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const { skillName } = req.body;

  if (!skillName) {
    throw new AppError('skillName is required', 400);
  }

  let roadmap = await RoadmapProgress.findOne({ userId: req.user.id });

  if (!roadmap) {
    roadmap = await RoadmapProgress.initializeDefault(req.user.id);
  }

  const role = roadmap.domainRoles.find(r => r.roleId === roleId);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  const skill = role.skills.find(s => s.name === skillName);
  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  await roadmap.toggleDomainSkill(roleId, skillName);
  triggerBadgeRefresh(req.user.id);

  res.json({
    success: true,
    data: roadmap
  });
});
