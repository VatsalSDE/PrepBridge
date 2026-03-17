const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

let Badge;
try {
  Badge = require("../models/Badge");
} catch {
  console.error("Badge model missing.");
  process.exit(1);
}

const badges = [
  // Consistency (streak)
  { name: "7 Day Warrior",    description: "Maintain a 7-day streak",   category: "consistency", icon: "🔥", criteriaType: "streak",         criteriaValue: 7,   points: 10,  rarity: "common"    },
  { name: "30 Day Champion",  description: "Maintain a 30-day streak",  category: "consistency", icon: "💪", criteriaType: "streak",         criteriaValue: 30,  points: 30,  rarity: "rare"      },
  { name: "100 Day Legend",   description: "Maintain a 100-day streak", category: "consistency", icon: "👑", criteriaType: "streak",         criteriaValue: 100, points: 100, rarity: "legendary" },

  // Progress (roadmap_percent)
  { name: "First Steps",      description: "Complete 25% of your roadmap",  category: "progress", icon: "🌱", criteriaType: "roadmap_percent", criteriaValue: 25,  points: 15,  rarity: "common"    },
  { name: "Halfway Hero",     description: "Complete 50% of your roadmap",  category: "progress", icon: "⚡", criteriaType: "roadmap_percent", criteriaValue: 50,  points: 30,  rarity: "rare"      },
  { name: "Roadmap Pro",      description: "Complete 75% of your roadmap",  category: "progress", icon: "🎯", criteriaType: "roadmap_percent", criteriaValue: 75,  points: 50,  rarity: "epic"      },
  { name: "Roadmap Master",   description: "Complete 100% of your roadmap", category: "progress", icon: "🏆", criteriaType: "roadmap_percent", criteriaValue: 100, points: 100, rarity: "legendary" },

  // Milestone (task_count)
  { name: "First Step",       description: "Complete your first task",  category: "milestone", icon: "👣", criteriaType: "task_count", criteriaValue: 1,  points: 5,  rarity: "common" },
  { name: "Task Achiever",    description: "Complete 10 tasks",         category: "milestone", icon: "✅", criteriaType: "task_count", criteriaValue: 10, points: 15, rarity: "common" },
  { name: "Productivity Pro", description: "Complete 50 tasks",        category: "milestone", icon: "🎖️", criteriaType: "task_count", criteriaValue: 50, points: 40, rarity: "rare"   },

  // Milestone (upvotes)
  { name: "Community Helper", description: "Get 10 upvotes on your posts", category: "milestone", icon: "🤝", criteriaType: "upvotes", criteriaValue: 10, points: 20, rarity: "common" },
  { name: "Community Star",   description: "Get 50 upvotes on your posts", category: "milestone", icon: "⭐", criteriaType: "upvotes", criteriaValue: 50, points: 50, rarity: "rare"   },

  // Special (jd_score)
  { name: "Ready for Battle", description: "Achieve 80%+ JD match score", category: "special", icon: "⚔️", criteriaType: "jd_score", criteriaValue: 80, points: 40, rarity: "rare" },
];

async function seedBadges() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const badge of badges) {
      await Badge.findOneAndUpdate({ name: badge.name }, badge, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${badges.length} badges successfully`);
    process.exit(0);
  } catch (err) {
    console.error("seedBadges error:", err.message);
    process.exit(1);
  }
}

seedBadges();