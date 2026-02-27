const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Get profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      branch: user.branch,
      year: user.year,
      cgpa: user.cgpa,
      targetRole: user.targetRole,
      skills: user.skills,
      resumeUrl: user.resumeUrl,
      createdAt: user.createdAt
    }
  });
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, college, branch, year, cgpa, targetRole, skills } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (college !== undefined) updateData.college = college;
  if (branch !== undefined) updateData.branch = branch;
  if (year !== undefined) updateData.year = year;
  if (cgpa !== undefined) updateData.cgpa = cgpa;
  if (targetRole !== undefined) updateData.targetRole = targetRole;
  if (skills !== undefined) updateData.skills = skills;

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      branch: user.branch,
      year: user.year,
      cgpa: user.cgpa,
      targetRole: user.targetRole,
      skills: user.skills,
      resumeUrl: user.resumeUrl
    }
  });
});

// Upload resume (stores URL - actual file upload handled by frontend to cloud)
exports.uploadResume = asyncHandler(async (req, res) => {
  const { resumeUrl } = req.body;

  if (!resumeUrl) {
    throw new AppError('Resume URL is required', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { resumeUrl },
    { new: true }
  );

  res.json({
    success: true,
    data: {
      resumeUrl: user.resumeUrl
    }
  });
});
