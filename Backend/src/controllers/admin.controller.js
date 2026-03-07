const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const PostReport = require("../models/PostReport");
const CommunityPost = require("../models/CommunityPost");
const PostComment = require("../models/PostComment");
const PostUpvote = require("../models/PostUpvote");
const PostBookmark = require("../models/PostBookmark");
const anonymousService = require("../services/anonymous.service");
const analyticsService = require("../services/analytics.service");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

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

const generateGuidelines = asyncHandler(async (req, res) => {
  const { rawAlumniInput = "" } = req.body;
  if (!rawAlumniInput.trim()) throw new AppError("rawAlumniInput is required", 400);

  const guidelines = rawAlumniInput
    .split(/\n|\./)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 8);

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { rawAlumniInput, guidelines },
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
    query.reportCount = { $gt: 0 };
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
    .populate("postId", "title content")
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

  report.status = "resolved";
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  report.actionTaken = req.body.actionTaken || "hidden";
  await report.save();

  res.json({ success: true, message: "Report resolved", data: report });
});

const dismissReport = asyncHandler(async (req, res) => {
  const report = await PostReport.findById(req.params.id);
  if (!report) throw new AppError("Report not found", 404);
  if (report.status !== "pending") throw new AppError("Only pending report can be dismissed", 400);

  report.status = "dismissed";
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  report.actionTaken = "dismissed";
  await report.save();

  res.json({ success: true, message: "Report dismissed", data: report });
});

// Dashboard
const getDashboard = asyncHandler(async (_req, res) => {
  const stats = await analyticsService.getDashboardStats();
  res.json({ success: true, data: stats });
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
};