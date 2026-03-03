// src/models/CommunityPost.js - Community posts with anonymous identity
const mongoose = require("mongoose");

const CATEGORY_ALIASES = {
  "interview-tips": "interview",
  interviewtips: "interview",
  interviews: "interview",
  experience: "interview",
  resource: "core-cs",
  doubt: "dsa"
};

const COMMUNITY_CATEGORIES = [
  "dsa",
  "core-cs",
  "development",
  "aptitude",
  "interview",
  "motivation",
  "career",
  "other"
];

const normalizeCategory = (value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] || normalized;
};

const communityPostSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },

    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    content: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 5000
    },

    category: {
      type: String,
      enum: COMMUNITY_CATEGORIES,
      set: normalizeCategory,
      default: "other"
    },

    tags: [{ type: String, trim: true }],

    // Counts (denormalized for performance)
    upvoteCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    bookmarkCount: { type: Number, default: 0, min: 0 },

    // Moderation
    isHidden: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// Indexes for listing
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ upvoteCount: -1 });
communityPostSchema.index({ category: 1, createdAt: -1 });

// Get posts with pagination
communityPostSchema.statics.getPosts = async function (options = {}) {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    sortBy = "recent" 
  } = options;

  const query = { isHidden: false };
  if (category) query.category = normalizeCategory(category);

  const sort = sortBy === "popular" 
    ? { upvoteCount: -1, createdAt: -1 } 
    : { createdAt: -1 };

  const posts = await this.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

module.exports = CommunityPost;
