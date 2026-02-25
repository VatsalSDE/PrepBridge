// src/models/Badge.js - Master badge definitions
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["consistency", "progress", "milestone", "special"],
      required: true
    },
    icon: { type: String, required: true }, // Emoji

    criteriaType: { 
      type: String, 
      enum: ["streak", "task_count", "roadmap_percent", "upvotes", "jd_score"],
      required: true
    },
    criteriaValue: { type: Number, required: true },

    points: { type: Number, default: 10 },
    rarity: { 
      type: String, 
      enum: ["common", "rare", "epic", "legendary"],
      default: "common"
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Get all active badges
badgeSchema.statics.getActiveBadges = async function () {
  return await this.find({ isActive: true }).sort({ category: 1, points: 1 });
};

const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;
