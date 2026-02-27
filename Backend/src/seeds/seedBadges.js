const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

let Badge;
try {
  Badge = require("../models/Badge");
} catch {
  console.error("Badge model missing. Pull shared/Vatsal model first.");
  process.exit(1);
}

const badges = [
  { key: "streak_7", name: "7 Day Streak", description: "Maintain a 7-day streak" },
  { key: "streak_30", name: "30 Day Streak", description: "Maintain a 30-day streak" },
  { key: "roadmap_25", name: "Roadmap Beginner", description: "Complete 25% roadmap" },
  { key: "roadmap_75", name: "Roadmap Pro", description: "Complete 75% roadmap" },
];

async function seedBadges() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const badge of badges) {
      await Badge.findOneAndUpdate({ key: badge.key }, badge, { upsert: true, new: true });
    }
    console.log("Badges seeded");
    process.exit(0);
  } catch (err) {
    console.error("seedBadges error:", err.message);
    process.exit(1);
  }
}

seedBadges();