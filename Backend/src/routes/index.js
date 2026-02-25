// src/routes/index.js
// ================================
// ROUTES INDEX - Central route mounting
// ================================
// This file imports all route modules and exports a function
// to mount them on the Express app with proper prefixes.

const authRoutes = require("./auth.routes");
// TODO: Import more routes as we build them
// const userRoutes = require("./user.routes");
// const taskRoutes = require("./task.routes");
// const roadmapRoutes = require("./roadmap.routes");
// const achievementRoutes = require("./achievement.routes");
// const communityRoutes = require("./community.routes");
// const calendarRoutes = require("./calendar.routes");
// const reportRoutes = require("./report.routes");
// const jdRoutes = require("./jd.routes");

/**
 * Mount all routes on the Express app
 * 
 * WHY THIS PATTERN:
 * - Clean app.js (just calls mountRoutes once)
 * - Easy to see all API prefixes in one place
 * - Modular - each feature has its own route file
 * 
 * @param {Express} app - Express application instance
 */
const mountRoutes = (app) => {
  // Auth routes: /api/auth/*
  app.use("/api/auth", authRoutes);
  
  // TODO: Mount more routes as we build them
  // app.use("/api/users", userRoutes);
  // app.use("/api/tasks", taskRoutes);
  // app.use("/api/roadmap", roadmapRoutes);
  // app.use("/api/achievements", achievementRoutes);
  // app.use("/api/community", communityRoutes);
  // app.use("/api/calendar", calendarRoutes);
  // app.use("/api/reports", reportRoutes);
  // app.use("/api/jd", jdRoutes);
};

module.exports = mountRoutes;
