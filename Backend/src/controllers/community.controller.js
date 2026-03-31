const CommunityPost = require('../models/CommunityPost');
const PostUpvote = require('../models/PostUpvote');
const PostComment = require('../models/PostComment');
const PostBookmark = require('../models/PostBookmark');
const PostReport = require('../models/PostReport');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const anonymousService = require('../services/anonymous.service');
const { getSettings } = require('../services/platformSettings.service');
const createSocketEmitters = require('../sockets/community.socket');

const enrichPostsForUser = async (posts, userId) => {
  const postIds = posts.map((post) => post._id);
  const userIds = posts.map((post) => post.userId);

  const [upvoteStatus, bookmarkStatus, identities] = await Promise.all([
    PostUpvote.getUpvoteStatus(postIds, userId),
    PostBookmark.getBookmarkStatus(postIds, userId),
    anonymousService.getMultipleIdentities(userIds),
  ]);

  const userReports = postIds.length
    ? await PostReport.find({ postId: { $in: postIds }, reporterId: userId, status: 'pending' }).select('postId')
    : [];
  const reportedPostIds = new Set(userReports.map((report) => report.postId.toString()));

  return posts.map((post, index) => ({
    ...post.toObject(),
    authorName: identities[index]?.displayName || 'Anonymous',
    isUpvoted: upvoteStatus[post._id.toString()] || false,
    isBookmarked: bookmarkStatus[post._id.toString()] || false,
    isReported: reportedPostIds.has(post._id.toString()),
    isOwner: post.userId.toString() === userId,
  }));
};

// Get posts (paginated)
exports.getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, sortBy = 'recent' } = req.query;

  const result = await CommunityPost.getPosts({ 
    page: parseInt(page), 
    limit: parseInt(limit), 
    category, 
    sortBy 
  });

  const posts = await enrichPostsForUser(result.posts, req.user.id);

  res.json({
    success: true,
    data: posts,
    pagination: result.pagination
  });
});

// Create post
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  const identity = await anonymousService.getIdentity(req.user.id);

  const post = await CommunityPost.create({
    userId: req.user.id,
    title,
    content,
    category,
    tags
  });

  const postData = {
    ...post.toObject(),
    authorName: identity.displayName,
    isOwner: true,
    isUpvoted: false,
    isBookmarked: false,
    upvoteCount: 0,
    commentCount: 0,
    bookmarkCount: 0
  };

  const socketPostData = {
    ...post.toObject(),
    authorName: identity.displayName,
    upvoteCount: 0,
    commentCount: 0,
    bookmarkCount: 0
  };

  // Emit socket event for real-time update
  if (req.app.io) {
    const socketEmitters = createSocketEmitters(req.app.io);
    socketEmitters.emitNewPost(socketPostData);
  }

  res.status(201).json({
    success: true,
    data: postData
  });
});

// Get post with comments
exports.getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await CommunityPost.findById(id);
  if (!post || post.isHidden) {
    throw new AppError('Post not found', 404);
  }

  const [comments, identity, isUpvoted, isBookmarked] = await Promise.all([
    PostComment.getComments(id),
    anonymousService.getIdentity(post.userId),
    PostUpvote.hasUpvoted(id, req.user.id),
    PostBookmark.find({ postId: id, userId: req.user.id }).countDocuments()
  ]);
  const hasReported = await PostReport.exists({ postId: id, reporterId: req.user.id, status: 'pending' });

  const commentUserIds = comments.map(c => c.userId);
  const commentIdentities = await anonymousService.getMultipleIdentities(commentUserIds);

  const formattedComments = comments.map((c, i) => ({
    ...c.toObject(),
    authorName: commentIdentities[i].displayName,
    isOwner: c.userId.toString() === req.user.id
  }));

  res.json({
    success: true,
    data: {
      ...post.toObject(),
      authorName: identity.displayName,
      isUpvoted,
      isBookmarked: isBookmarked > 0,
      isReported: Boolean(hasReported),
      isOwner: post.userId.toString() === req.user.id,
      comments: formattedComments
    }
  });
});

// Edit own post
exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, category, tags } = req.body;

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (tags !== undefined) updateData.tags = tags;

  const updatedPost = await CommunityPost.findByIdAndUpdate(id, updateData, { new: true });
  const identity = await anonymousService.getIdentity(req.user.id);
  const formattedPost = {
    ...updatedPost.toObject(),
    authorName: identity.displayName,
    isOwner: true,
  };

  const socketPostData = {
    ...updatedPost.toObject(),
    authorName: identity.displayName,
  };

  // Emit socket event for real-time update
  if (req.app.io) {
    const socketEmitters = createSocketEmitters(req.app.io);
    socketEmitters.emitPostUpdate(socketPostData);
  }

  res.json({
    success: true,
    data: formattedPost
  });
});

// Delete own post
exports.deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  await CommunityPost.findByIdAndDelete(id);
  await PostComment.deleteMany({ postId: id });
  await PostUpvote.deleteMany({ postId: id });
  await PostBookmark.deleteMany({ postId: id });

  // Emit socket event for real-time update
  if (req.app.io) {
    const socketEmitters = createSocketEmitters(req.app.io);
    socketEmitters.emitPostDelete(id);
  }

  res.json({
    success: true,
    message: 'Post deleted'
  });
});

// Toggle upvote
exports.toggleUpvote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await CommunityPost.findById(id);
  if (!post || post.isHidden) {
    throw new AppError('Post not found', 404);
  }

  const result = await PostUpvote.toggleUpvote(id, req.user.id);
  const updatedPost = await CommunityPost.findById(id).select('upvoteCount');
  const payload = {
    postId: id,
    upvoteCount: updatedPost?.upvoteCount || 0,
    isUpvoted: result.upvoted,
  };

  // Emit socket event for real-time update
  if (req.app.io) {
    const socketEmitters = createSocketEmitters(req.app.io);
    socketEmitters.emitUpvoteToggle(payload);
  }

  res.json({
    success: true,
    data: payload
  });
});

// Toggle bookmark
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await CommunityPost.findById(id);
  if (!post || post.isHidden) {
    throw new AppError('Post not found', 404);
  }

  const result = await PostBookmark.toggleBookmark(id, req.user.id);
  const updatedPost = await CommunityPost.findById(id).select('bookmarkCount');
  const payload = {
    postId: id,
    bookmarkCount: updatedPost?.bookmarkCount || 0,
    isBookmarked: result.bookmarked,
  };

  // Emit socket event for real-time update
  if (req.app.io) {
    const socketEmitters = createSocketEmitters(req.app.io);
    socketEmitters.emitBookmarkToggle(payload);
  }

  res.json({
    success: true,
    data: payload
  });
});

// Add comment
exports.addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new AppError('Comment content is required', 400);
  }

  const post = await CommunityPost.findById(id);
  if (!post || post.isHidden) {
    throw new AppError('Post not found', 404);
  }

  const comment = await PostComment.addComment(id, req.user.id, content);
  const identity = await anonymousService.getIdentity(req.user.id);

  const commentData = {
    ...comment.toObject(),
    authorName: identity.displayName,
    isOwner: true
  };

  // Emit socket event for real-time update
  if (req.app.io) {
    const socketEmitters = createSocketEmitters(req.app.io);
    socketEmitters.emitNewComment(id, commentData);
  }

  res.status(201).json({
    success: true,
    data: commentData
  });
});

// Delete own comment
exports.deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await PostComment.deleteComment(id, req.user.id);

  if (!result) {
    throw new AppError('Comment not found or not authorized', 404);
  }

  // Emit socket event for real-time update
  if (req.app.io) {
    const socketEmitters = createSocketEmitters(req.app.io);
    socketEmitters.emitCommentDelete(result.postId, id);
  }

  res.json({
    success: true,
    message: 'Comment deleted'
  });
});

// Report post
exports.reportPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, description } = req.body || {};
  const settings = await getSettings();

  if (!settings.communityModeration) {
    throw new AppError('Community moderation is currently disabled', 403);
  }

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const allowedReasons = ['spam', 'harassment', 'offensive', 'cheating', 'scam', 'other'];
  const normalizedReason = allowedReasons.includes(String(reason || '').toLowerCase())
    ? String(reason).toLowerCase()
    : 'other';

  const existingPendingReport = await PostReport.findOne({ postId: id, reporterId: req.user.id, status: 'pending' });
  let isReported;

  if (existingPendingReport) {
    await existingPendingReport.deleteOne();
    isReported = false;
  } else {
    const existingHistoricalReport = await PostReport.findOne({ postId: id, reporterId: req.user.id });

    if (existingHistoricalReport) {
      existingHistoricalReport.status = 'pending';
      existingHistoricalReport.reason = normalizedReason;
      existingHistoricalReport.description = String(description || '').trim();
      existingHistoricalReport.reviewedBy = null;
      existingHistoricalReport.reviewedAt = null;
      existingHistoricalReport.actionTaken = 'none';
      await existingHistoricalReport.save();
    } else {
      await PostReport.create({
        postId: id,
        reporterId: req.user.id,
        reason: normalizedReason,
        description: String(description || '').trim(),
      });
    }

    isReported = true;
  }

  const reportCount = await PostReport.countDocuments({ postId: id, status: 'pending' });
  await CommunityPost.findByIdAndUpdate(id, { reportCount });

  res.json({
    success: true,
    message: isReported ? 'Post reported' : 'Post report removed',
    data: {
      postId: id,
      isReported,
      reportCount,
    }
  });
});

// Get user's posts
exports.getMyPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const posts = await CommunityPost.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await CommunityPost.countDocuments({ userId: req.user.id });

  const formattedPosts = await enrichPostsForUser(posts, req.user.id);

  res.json({
    success: true,
    data: formattedPosts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get user's bookmarks
exports.getBookmarks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const posts = await PostBookmark.getUserBookmarks(req.user.id, parseInt(page), parseInt(limit));
  const formattedPosts = await enrichPostsForUser(posts, req.user.id);

  res.json({
    success: true,
    data: formattedPosts
  });
});
