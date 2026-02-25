// src/models/PostComment.js - Comments on community posts
const mongoose = require("mongoose");

const postCommentSchema = new mongoose.Schema(
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
    },

    content: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 1000
    },

    // For nested replies (optional feature)
    parentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PostComment",
      default: null
    },

    isHidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Get comments for a post
postCommentSchema.statics.getComments = async function (postId) {
  return await this.find({ postId, isHidden: false })
    .sort({ createdAt: 1 });
};

// Add comment and update post count
postCommentSchema.statics.addComment = async function (postId, userId, content) {
  const CommunityPost = mongoose.model("CommunityPost");
  
  const comment = await this.create({ postId, userId, content });
  await CommunityPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
  
  return comment;
};

// Delete comment and update post count
postCommentSchema.statics.deleteComment = async function (commentId, userId) {
  const CommunityPost = mongoose.model("CommunityPost");
  
  const comment = await this.findOne({ _id: commentId, userId });
  if (!comment) return null;
  
  await this.deleteOne({ _id: commentId });
  await CommunityPost.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
  
  return comment;
};

const PostComment = mongoose.model("PostComment", postCommentSchema);

module.exports = PostComment;
