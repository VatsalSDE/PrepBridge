const User = require('../models/User');
const Task = require('../models/Task');
const UserStreak = require('../models/UserStreak');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { uploadResumeMw } = require('../config/upload');

const resumesDir = path.join(__dirname, '..', '..', 'uploads', 'resumes');

const getLocalResumePath = (userId) => path.join(resumesDir, `resume_${userId}.pdf`);

const toProfilePayload = (user, stats = {}) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  college: user.college,
  branch: user.branch,
  year: user.year,
  cgpa: user.cgpa,
  targetRole: user.targetRole,
  skills: user.skills || [],
  resumeUrl: user.resumeUrl,
  codingProfiles: user.codingProfiles || { leetcode: '', codolio: '', gfg: '' },
  projects: user.projects || [],
  weeklyStudyGoal: user.weeklyStudyGoal,
  dailyTaskGoal: user.dailyTaskGoal,
  streak: stats.currentStreak || 0,
  longestStreak: stats.longestStreak || 0,
  tasksCompleted: stats.tasksCompleted || 0,
  avgProductivity: stats.avgProductivity || 0,
  createdAt: user.createdAt,
});

const getProfileStats = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [streakDoc, tasksCompleted, productivityRows] = await Promise.all([
    UserStreak.findOne({ userId }).select('currentStreak longestStreak'),
    Task.countDocuments({ userId, completed: true }),
    ActivityLog.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, avgProductivity: { $avg: '$productivityScore' } } },
    ]),
  ]);

  return {
    currentStreak: streakDoc?.currentStreak || 0,
    longestStreak: streakDoc?.longestStreak || 0,
    tasksCompleted,
    avgProductivity: Math.round(productivityRows?.[0]?.avgProductivity || 0),
  };
};

// Get profile
exports.getProfile = asyncHandler(async (req, res) => {
  const [user, stats] = await Promise.all([
    User.findById(req.user.id),
    getProfileStats(req.user.id),
  ]);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: toProfilePayload(user, stats)
  });
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    college,
    branch,
    year,
    cgpa,
    targetRole,
    skills,
    codingProfiles,
    projects,
    weeklyStudyGoal,
    dailyTaskGoal,
    resumeUrl,
  } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (college !== undefined) updateData.college = college;
  if (branch !== undefined) updateData.branch = branch;
  if (year !== undefined) updateData.year = year;
  if (cgpa !== undefined) updateData.cgpa = cgpa;
  if (targetRole !== undefined) updateData.targetRole = targetRole;
  if (skills !== undefined) updateData.skills = skills;
  if (codingProfiles !== undefined) updateData.codingProfiles = codingProfiles;
  if (projects !== undefined) updateData.projects = projects;
  if (weeklyStudyGoal !== undefined) updateData.weeklyStudyGoal = weeklyStudyGoal;
  if (dailyTaskGoal !== undefined) updateData.dailyTaskGoal = dailyTaskGoal;
  if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const stats = await getProfileStats(req.user.id);

  res.json({
    success: true,
    data: toProfilePayload(user, stats)
  });
});

// Upload resume — accepts multipart/form-data with field 'resume' (PDF)
exports.uploadResume = (req, res, next) => {
  uploadResumeMw(req, res, async (multerErr) => {
    try {
      if (multerErr) {
        // multer validation error (file type / size)
        return res.status(400).json({ success: false, message: multerErr.message });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded. Send a PDF as form-data field "resume".' });
      }

      // Primary storage: local file for faster and more reliable uploads/previews.
      await fs.mkdir(resumesDir, { recursive: true });
      const localResumePath = getLocalResumePath(req.user.id);
      await fs.writeFile(localResumePath, req.file.buffer);

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { resumeUrl: '/api/users/resume/view' },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          resumeUrl: user.resumeUrl,
          originalName: req.file.originalname,
        },
      });
    } catch (error) {
      next(error);
    }
  });
};

// View resume as inline PDF through backend (auth protected)
exports.viewResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('resumeUrl');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const localResumePath = getLocalResumePath(req.user.id);

  try {
    await fs.access(localResumePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    return res.sendFile(localResumePath);
  } catch {
    // Local file not found, continue with remote fallback for older records.
  }

  const resumeUrl = String(user.resumeUrl || '').trim();
  if (!resumeUrl || !/^https?:\/\//i.test(resumeUrl)) {
    throw new AppError('No valid resume found. Please upload resume again.', 400);
  }

  const upstream = await fetch(resumeUrl);
  if (!upstream.ok) {
    throw new AppError('Failed to fetch resume file', 502);
  }

  const contentType = upstream.headers.get('content-type') || 'application/pdf';
  const fileBuffer = Buffer.from(await upstream.arrayBuffer());

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
  res.send(fileBuffer);
});
