// src/models/PostBookmark.js - User's bookmarked posts
const mongoose = require("mongoose");

const postBookmarkSchema = new mongoose.Schema(
  {
    postId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CommunityPost", 
      required: true,
      index: true
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// One bookmark per user per post
postBookmarkSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Toggle bookmark
postBookmarkSchema.statics.toggleBookmark = async function (postId, userId) {
  const CommunityPost = mongoose.model("CommunityPost");
  
  const existing = await this.findOne({ postId, userId });
  
  if (existing) {
    await this.deleteOne({ _id: existing._id });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { bookmarkCount: -1 } });
    return { bookmarked: false };
  } else {
    await this.create({ postId, userId });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { bookmarkCount: 1 } });
    return { bookmarked: true };
  }
};

// Get user's bookmarked posts
postBookmarkSchema.statics.getUserBookmarks = async function (userId, page = 1, limit = 10) {
  const CommunityPost = mongoose.model("CommunityPost");
  
  const bookmarks = await this.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const postIds = bookmarks.map(b => b.postId);
  const posts = await CommunityPost.find({ _id: { $in: postIds }, isHidden: false });
  const postMap = new Map(posts.map((post) => [post._id.toString(), post]));

  // Keep the same order as bookmark creation sort (most recently bookmarked first).
  return postIds
    .map((postId) => postMap.get(postId.toString()))
    .filter(Boolean);
};

// Check bookmark status for multiple posts
postBookmarkSchema.statics.getBookmarkStatus = async function (postIds, userId) {
  const bookmarks = await this.find({ postId: { $in: postIds }, userId });
  const bookmarkedSet = new Set(bookmarks.map(b => b.postId.toString()));
  return postIds.reduce((acc, id) => {
    acc[id.toString()] = bookmarkedSet.has(id.toString());
    return acc;
  }, {});
};

const PostBookmark = mongoose.model("PostBookmark", postBookmarkSchema);

module.exports = PostBookmark;