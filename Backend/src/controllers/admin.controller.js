const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const PostReport = require("../models/PostReport");
const CommunityPost = require("../models/CommunityPost");
const PostComment = require("../models/PostComment");
const PostUpvote = require("../models/PostUpvote");
const PostBookmark = require("../models/PostBookmark");
const RoadmapProgress = require("../models/RoadmapProgress");
const RoadmapTemplate = require("../models/RoadmapTemplate");
const anonymousService = require("../services/anonymous.service");
const analyticsService = require("../services/analytics.service");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const axios = require("axios");

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password are required", 400);

  const admin = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!admin) throw new AppError("Invalid credentials", 401);
  if (admin.role !== "admin") throw new AppError("Not an admin account", 403);

  const ok = await admin.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  res.json({
    success: true,
    token: signToken(admin._id),
    user: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, status: admin.status },
  });
});

// User management
const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({})
      .select("-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({}),
  ]);

  res.json({ success: true, data: users, pagination: { page, limit, total } });
});

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpire"
  );
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, data: user });
});

const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  if (user.status === "banned") throw new AppError("User already banned", 400);
  user.status = "banned";
  await user.save();
  res.json({ success: true, message: "User banned", data: { _id: user._id, status: user.status } });
});

const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  if (user.status === "active") throw new AppError("User already active", 400);
  user.status = "active";
  await user.save();
  res.json({ success: true, message: "User unbanned", data: { _id: user._id, status: user.status } });
});

// Company management
const getCompanies = asyncHandler(async (_req, res) => {
  const companies = await Company.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: companies });
});

const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: company });
});

const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new AppError("Company not found", 404);
  res.json({ success: true, data: company });
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) throw new AppError("Company not found", 404);
  res.json({ success: true, data: company });
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) throw new AppError("Company not found", 404);
  res.json({ success: true, message: "Company deleted" });
});

const approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
  if (!company) throw new AppError("Company not found", 404);
  res.json({ success: true, message: "Company approved", data: company });
});


// this is the static so adding the one of the puython service okk so yes 

// const generateGuidelines = asyncHandler(async (req, res) => {
//   const { rawAlumniInput = "" } = req.body;
//   if (!rawAlumniInput.trim()) throw new AppError("rawAlumniInput is required", 400);

//   const guidelines = rawAlumniInput
//     .split(/\n|\./)
//     .map((v) => v.trim())
//     .filter(Boolean)
//     .slice(0, 8);

//   const company = await Company.findByIdAndUpdate(
//     req.params.id,
//     { rawAlumniInput, guidelines },
//     { new: true, runValidators: true }
//   );
//   if (!company) throw new AppError("Company not found", 404);

//   res.json({ success: true, data: company });
// });

// here i have added the api call to the python service for generating the guidelines based on the jd provided by the user and then updating the company with the generated guidelines
const generateGuidelines = asyncHandler(async (req, res) => {
  const { rawAlumniInput = "" } = req.body;
  if (!rawAlumniInput.trim()) throw new AppError("rawAlumniInput is required", 400);

  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

  let mlResult;

  try {
    // Call FastAPI ML service
    const response = await axios.post(`${ML_SERVICE_URL}/admin/generate-guidelines`, {
      rawAlumniInput,
    });
    mlResult = response.data.data;

  } catch (err) {
    // If ML service is down → graceful fallback to rule-based
    console.error("ML service unavailable, using fallback:", err.message);
    mlResult = {
      roundStructure: ["Technical Round", "HR Round"],
      difficultyEstimate: "Medium",
      focusDistribution: { dsa: 30, coreCS: 25, systemDesign: 20, hr: 25 },
      keyTopics: [],
      preparationGuidelines: rawAlumniInput
        .split(/\n|\./)
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 8),
    };
  }
  // here ends the model result processing and now we will update the company with the generated guidelines and other details
  // Save everything to MongoDB
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      rawAlumniInput,
      guidelines:          mlResult.preparationGuidelines  || [],
      roundStructure:      mlResult.roundStructure         || [],
      difficultyEstimate:  mlResult.difficultyEstimate     || "Medium",
      keyTopics:           mlResult.keyTopics              || [],
      focusDistribution: {
        dsa:          mlResult.focusDistribution?.dsa          || mlResult.focusDistribution?.DSA          || 25,
        coreCS:       mlResult.focusDistribution?.coreCS       || mlResult.focusDistribution?.["Core CS"]  || 25,
        systemDesign: mlResult.focusDistribution?.systemDesign || mlResult.focusDistribution?.["System Design"] || 25,
        hr:           mlResult.focusDistribution?.hr           || mlResult.focusDistribution?.HR           || 25,
      },
    },
    { new: true, runValidators: true }
  );

  if (!company) throw new AppError("Company not found", 404);

  res.json({ success: true, data: company });
});
// Moderation
const getCommunityPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;
  const search = (req.query.search || "").trim();
  const onlyReported = req.query.onlyReported === "true";

  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  if (onlyReported) {
    const reportedPostIds = await PostReport.distinct("postId", {});
    if (!reportedPostIds.length) {
      return res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0 },
      });
    }
    query._id = { $in: reportedPostIds };
  }

  const [posts, total] = await Promise.all([
    CommunityPost.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CommunityPost.countDocuments(query),
  ]);

  const postIds = posts.map((post) => post._id);
  const userIds = posts.map((post) => post.userId);

  const reportStats = postIds.length
    ? await PostReport.aggregate([
        { $match: { postId: { $in: postIds } } },
        {
          $group: {
            _id: "$postId",
            totalReports: { $sum: 1 },
            pendingReports: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
              },
            },
          },
        },
      ])
    : [];

  const reportMap = new Map(reportStats.map((row) => [row._id.toString(), row]));
  const identities = await anonymousService.getMultipleIdentities(userIds);

  const data = posts.map((post, index) => {
    const stats = reportMap.get(post._id.toString());
    return {
      ...post.toObject(),
      authorName: identities[index]?.displayName || "Anonymous User",
      totalReports: stats?.totalReports ?? post.reportCount ?? 0,
      pendingReports: stats?.pendingReports ?? 0,
    };
  });

  res.json({
    success: true,
    data,
    pagination: { page, limit, total },
  });
});

const deleteCommunityPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await CommunityPost.findById(id);
  if (!post) throw new AppError("Post not found", 404);

  await Promise.all([
    CommunityPost.findByIdAndDelete(id),
    PostReport.deleteMany({ postId: id }),
    PostComment.deleteMany({ postId: id }),
    PostUpvote.deleteMany({ postId: id }),
    PostBookmark.deleteMany({ postId: id }),
  ]);

  res.json({ success: true, message: "Post deleted" });
});

const getCommunityReports = asyncHandler(async (_req, res) => {
  const reports = await PostReport.find({})
    .populate("postId", "title content isHidden reportCount")
    .populate("reporterId", "name email")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reports });
});

const hidePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findByIdAndUpdate(
    req.params.id,
    { isHidden: true, hiddenAt: new Date() },
    { new: true }
  );
  if (!post) throw new AppError("Post not found", 404);
  res.json({ success: true, message: "Post hidden", data: post });
});

const unhidePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findByIdAndUpdate(
    req.params.id,
    { isHidden: false, hiddenAt: null },
    { new: true }
  );
  if (!post) throw new AppError("Post not found", 404);
  res.json({ success: true, message: "Post unhidden", data: post });
});

const resolveReport = asyncHandler(async (req, res) => {
  const report = await PostReport.findById(req.params.id);
  if (!report) throw new AppError("Report not found", 404);
  if (report.status !== "pending") throw new AppError("Only pending report can be resolved", 400);

  const actionTaken = req.body.actionTaken || "hidden";
  const now = new Date();

  if (actionTaken === "deleted") {
    await Promise.all([
      CommunityPost.findByIdAndDelete(report.postId),
      PostComment.deleteMany({ postId: report.postId }),
      PostUpvote.deleteMany({ postId: report.postId }),
      PostBookmark.deleteMany({ postId: report.postId }),
    ]);
  } else if (actionTaken === "hidden") {
    await CommunityPost.findByIdAndUpdate(report.postId, { isHidden: true, hiddenAt: now });
  } else if (actionTaken === "unhidden") {
    await CommunityPost.findByIdAndUpdate(report.postId, { isHidden: false, hiddenAt: null });
  }

  await PostReport.updateMany(
    { postId: report.postId, status: "pending" },
    {
      status: "resolved",
      reviewedBy: req.user._id,
      reviewedAt: now,
      actionTaken,
    }
  );

  if (actionTaken !== "deleted") {
    const pendingCount = await PostReport.countDocuments({ postId: report.postId, status: "pending" });
    await CommunityPost.findByIdAndUpdate(report.postId, { reportCount: pendingCount });
  }

  const updatedReport = await PostReport.findById(req.params.id)
    .populate("postId", "title content isHidden reportCount")
    .populate("reporterId", "name email")
    .populate("reviewedBy", "name email");

  res.json({ success: true, message: "Report resolved", data: updatedReport });
});

const dismissReport = asyncHandler(async (req, res) => {
  const report = await PostReport.findById(req.params.id);
  if (!report) throw new AppError("Report not found", 404);
  if (report.status !== "pending") throw new AppError("Only pending report can be dismissed", 400);

  const now = new Date();

  await PostReport.updateMany(
    { postId: report.postId, status: "pending" },
    {
      status: "dismissed",
      reviewedBy: req.user._id,
      reviewedAt: now,
      actionTaken: "dismissed",
    }
  );

  const pendingCount = await PostReport.countDocuments({ postId: report.postId, status: "pending" });
  await CommunityPost.findByIdAndUpdate(report.postId, { reportCount: pendingCount });

  const updatedReport = await PostReport.findById(req.params.id)
    .populate("postId", "title content isHidden reportCount")
    .populate("reporterId", "name email")
    .populate("reviewedBy", "name email");

  res.json({ success: true, message: "Report dismissed", data: updatedReport });
});

// Dashboard
const getDashboard = asyncHandler(async (_req, res) => {
  const stats = await analyticsService.getDashboardStats();
  res.json({ success: true, data: stats });
});

const normalizeSections = (sections = []) =>
  sections
    .map((section) => ({
      name: String(section?.name || "").trim(),
      topics: Array.from(
        new Set(
          (section?.topics || [])
            .map((topic) => String(topic || "").trim())
            .filter(Boolean)
        )
      ),
    }))
    .filter((section) => section.name && section.topics.length > 0);

const normalizeRoles = (roles = []) =>
  roles
    .map((role) => {
      const roleName = String(role?.roleName || role?.name || "").trim();
      const roleIdRaw = String(role?.roleId || role?.id || roleName).trim().toLowerCase();
      const roleId = roleIdRaw.replace(/\s+/g, "-");
      const skills = Array.from(
        new Set(
          (role?.skills || [])
            .map((skill) => String(skill || "").trim())
            .filter(Boolean)
        )
      );

      return {
        roleId,
        roleName,
        skills,
      };
    })
    .filter((role) => role.roleId && role.roleName);

const syncAllRoadmapsWithTemplate = async (templateDoc) => {
  const allRoadmaps = await RoadmapProgress.find({});
  for (const roadmap of allRoadmaps) {
    await roadmap.syncWithTemplate(templateDoc);
  }
};

const getRoadmapTemplate = asyncHandler(async (_req, res) => {
  const template = await RoadmapTemplate.getActiveTemplate();
  res.json({ success: true, data: template });
});

const updateRoadmapTemplateFoundation = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const validSections = ["dsa", "coreCS", "aptitude", "systemDesign"];
  if (!validSections.includes(section)) throw new AppError("Invalid section", 400);

  const sections = normalizeSections(req.body?.sections || []);
  if (!sections.length) throw new AppError("At least one section with topics is required", 400);

  const template = await RoadmapTemplate.getActiveTemplate();
  const currentTitle = template.foundations?.[section]?.title || `${section} roadmap`;
  template.foundations[section] = {
    title: String(req.body?.title || currentTitle),
    sections,
  };

  await template.save();
  await syncAllRoadmapsWithTemplate(template);

  res.json({
    success: true,
    message: "Foundation template updated",
    data: template,
  });
});

const updateRoadmapTemplateDomains = asyncHandler(async (req, res) => {
  const roles = normalizeRoles(req.body?.roles || req.body?.domainRoles || []);
  if (!roles.length) throw new AppError("At least one role with skills is required", 400);

  const template = await RoadmapTemplate.getActiveTemplate();
  template.domainRoles = roles;
  await template.save();
  await syncAllRoadmapsWithTemplate(template);

  res.json({
    success: true,
    message: "Domain roles template updated",
    data: template,
  });
});

// Roadmap management
const getRoadmapUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;
  const search = (req.query.search || "").trim();

  const query = { role: "student" };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("name email status targetRole createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  const userIds = users.map((user) => user._id);
  const roadmaps = await RoadmapProgress.find({ userId: { $in: userIds } }).select(
    "userId totalProgress dsa.overallProgress coreCS.overallProgress aptitude.overallProgress systemDesign.overallProgress updatedAt"
  );

  const roadmapMap = new Map(roadmaps.map((roadmap) => [roadmap.userId.toString(), roadmap]));

  const data = users.map((user) => {
    const roadmap = roadmapMap.get(user._id.toString());
    return {
      ...user.toObject(),
      roadmap: {
        hasRoadmap: Boolean(roadmap),
        totalProgress: roadmap?.totalProgress || 0,
        foundations: {
          dsa: roadmap?.dsa?.overallProgress || 0,
          coreCS: roadmap?.coreCS?.overallProgress || 0,
          aptitude: roadmap?.aptitude?.overallProgress || 0,
          systemDesign: roadmap?.systemDesign?.overallProgress || 0,
        },
        lastUpdatedAt: roadmap?.updatedAt || null,
      },
    };
  });

  res.json({
    success: true,
    data,
    pagination: { page, limit, total },
  });
});

const getUserRoadmap = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("name email status targetRole role");
  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "student") throw new AppError("Roadmap is available for students only", 400);

  let roadmap = await RoadmapProgress.findOne({ userId: user._id });
  if (!roadmap) {
    roadmap = await RoadmapProgress.initializeDefault(user._id);
  }

  res.json({
    success: true,
    data: {
      user,
      roadmap,
    },
  });
});

const updateUserRoadmapFoundation = asyncHandler(async (req, res) => {
  const { id, section } = req.params;
  const { sectionName, topicName } = req.body;

  const validSections = ["dsa", "coreCS", "aptitude", "systemDesign"];
  if (!validSections.includes(section)) throw new AppError("Invalid section", 400);
  if (!sectionName || !topicName) throw new AppError("sectionName and topicName are required", 400);

  const user = await User.findById(id).select("role");
  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "student") throw new AppError("Roadmap is available for students only", 400);

  let roadmap = await RoadmapProgress.findOne({ userId: id });
  if (!roadmap) {
    roadmap = await RoadmapProgress.initializeDefault(id);
  }

  try {
    await roadmap.toggleTopic(section, sectionName, topicName);
  } catch (error) {
    throw new AppError(error.message || "Failed to update roadmap topic", 400);
  }

  const refreshed = await RoadmapProgress.findOne({ userId: id });

  res.json({
    success: true,
    message: "User roadmap topic updated",
    data: refreshed,
  });
});

const updateUserRoadmapDomain = asyncHandler(async (req, res) => {
  const { id, roleId } = req.params;
  const { skillName } = req.body;

  if (!skillName) throw new AppError("skillName is required", 400);

  const user = await User.findById(id).select("role");
  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "student") throw new AppError("Roadmap is available for students only", 400);

  let roadmap = await RoadmapProgress.findOne({ userId: id });
  if (!roadmap) {
    roadmap = await RoadmapProgress.initializeDefault(id);
  }

  try {
    await roadmap.toggleDomainSkill(roleId, skillName);
  } catch (error) {
    throw new AppError(error.message || "Failed to update roadmap domain skill", 400);
  }

  const refreshed = await RoadmapProgress.findOne({ userId: id });

  res.json({
    success: true,
    message: "User domain skill updated",
    data: refreshed,
  });
});

module.exports = {
  adminLogin,
  getUsers,
  getUserDetails,
  banUser,
  unbanUser,
  getCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  approveCompany,
  generateGuidelines,
  getCommunityPosts,
  deleteCommunityPost,
  getCommunityReports,
  hidePost,
  unhidePost,
  resolveReport,
  dismissReport,
  getDashboard,
  getRoadmapTemplate,
  updateRoadmapTemplateFoundation,
  updateRoadmapTemplateDomains,
  getRoadmapUsers,
  getUserRoadmap,
  updateUserRoadmapFoundation,
  updateUserRoadmapDomain,
};