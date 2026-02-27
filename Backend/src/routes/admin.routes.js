const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/admin.middleware");
const admin = require("../controllers/admin.controller");

router.use(protect, isAdmin);

// dashboard
router.get("/dashboard", admin.getDashboard);

// users
router.get("/users", admin.getUsers);
router.get("/users/:id", admin.getUserDetails);
router.patch("/users/:id/ban", admin.banUser);
router.patch("/users/:id/unban", admin.unbanUser);

// companies
router.get("/companies", admin.getCompanies);
router.post("/companies", admin.createCompany);
router.get("/companies/:id", admin.getCompany);
router.put("/companies/:id", admin.updateCompany);
router.delete("/companies/:id", admin.deleteCompany);
router.patch("/companies/:id/approve", admin.approveCompany);
router.post("/companies/:id/generate-guidelines", admin.generateGuidelines);

// moderation
router.get("/community/reports", admin.getCommunityReports);
router.patch("/community/posts/:id/hide", admin.hidePost);
router.patch("/community/posts/:id/unhide", admin.unhidePost);
router.patch("/reports/:id/resolve", admin.resolveReport);
router.patch("/reports/:id/dismiss", admin.dismissReport);

module.exports = router;