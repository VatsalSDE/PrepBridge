const CommunityPost = require('../models/CommunityPost');
const PostUpvote = require('../models/PostUpvote');
const PostComment = require('../models/PostComment');
const PostBookmark = require('../models/PostBookmark');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const anonymousService = require('../services/anonymous.service');

// Get posts (paginated)
exports.getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, sortBy = 'recent' } = req.query;

  const result = await CommunityPost.getPosts({ 
    page: parseInt(page), 
    limit: parseInt(limit), 
    category, 
    sortBy 
  });

  const postIds = result.posts.map(p => p._id);
  const userIds = result.posts.map(p => p.userId);
  const [upvoteStatus, bookmarkStatus, identities] = await Promise.all([
    PostUpvote.getUpvoteStatus(postIds, req.user.id),
    PostBookmark.getBookmarkStatus(postIds, req.user.id),
    anonymousService.getMultipleIdentities(userIds)
  ]);

  const posts = result.posts.map((post, i) => ({
    ...post.toObject(),
    authorName: identities[i].displayName,
    isUpvoted: upvoteStatus[post._id.toString()] || false,
    isBookmarked: bookmarkStatus[post._id.toString()] || false,
    isOwner: post.userId.toString() === req.user.id
  }));

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

  res.status(201).json({
    success: true,
    data: {
      ...post.toObject(),
      authorName: identity.displayName
    }
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

  res.json({
    success: true,
    data: updatedPost
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

  res.json({
    success: true,
    data: result
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

  res.json({
    success: true,
    data: result
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

  res.status(201).json({
    success: true,
    data: {
      ...comment.toObject(),
      authorName: identity.displayName
    }
  });
});

// Delete own comment
exports.deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await PostComment.deleteComment(id, req.user.id);

  if (!result) {
    throw new AppError('Comment not found or not authorized', 404);
  }

  res.json({
    success: true,
    message: 'Comment deleted'
  });
});

// Report post
exports.reportPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  await CommunityPost.findByIdAndUpdate(id, { $inc: { reportCount: 1 } });

  res.json({
    success: true,
    message: 'Post reported'
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

  res.json({
    success: true,
    data: posts,
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

  res.json({
    success: true,
    data: posts
  });
});
