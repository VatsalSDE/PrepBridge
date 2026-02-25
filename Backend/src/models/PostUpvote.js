// src/models/PostUpvote.js - Track who upvoted which post
const mongoose = require("mongoose");

const postUpvoteSchema = new mongoose.Schema(
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

// One upvote per user per post
postUpvoteSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Toggle upvote (add if not exists, remove if exists)
postUpvoteSchema.statics.toggleUpvote = async function (postId, userId) {
  const CommunityPost = mongoose.model("CommunityPost");
  
  const existing = await this.findOne({ postId, userId });
  
  if (existing) {
    await this.deleteOne({ _id: existing._id });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { upvoteCount: -1 } });
    return { upvoted: false };
  } else {
    await this.create({ postId, userId });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { upvoteCount: 1 } });
    return { upvoted: true };
  }
};

// Check if user upvoted a post
postUpvoteSchema.statics.hasUpvoted = async function (postId, userId) {
  const count = await this.countDocuments({ postId, userId });
  return count > 0;
};

// Get upvote status for multiple posts
postUpvoteSchema.statics.getUpvoteStatus = async function (postIds, userId) {
  const upvotes = await this.find({ postId: { $in: postIds }, userId });
  const upvotedSet = new Set(upvotes.map(u => u.postId.toString()));
  return postIds.reduce((acc, id) => {
    acc[id.toString()] = upvotedSet.has(id.toString());
    return acc;
  }, {});
};

const PostUpvote = mongoose.model("PostUpvote", postUpvoteSchema);

module.exports = PostUpvote;
