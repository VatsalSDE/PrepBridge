const mongoose = require("mongoose");

const postReportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: true,
      index: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ["spam", "harassment", "offensive", "cheating", "scam", "other"],
      default: "other",
    },
    description: { type: String, trim: true, default: "", maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    actionTaken: {
      type: String,
      enum: ["none", "hidden", "unhidden", "deleted", "warned", "dismissed"],
      default: "none",
    },
  },
  { timestamps: true }
);

postReportSchema.index({ status: 1, createdAt: -1 });
postReportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });

module.exports = mongoose.model("PostReport", postReportSchema);