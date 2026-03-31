const { getSettings } = require("../services/platformSettings.service");

const isAllowedDuringMaintenance = (path = "") => {
  if (path === "/api/health") return true;
  if (path.startsWith("/api/admin")) return true;
  if (path.startsWith("/api/auth/admin/login")) return true;
  return false;
};

const maintenanceGuard = async (req, res, next) => {
  try {
    if (req.method === "OPTIONS") return next();

    const path = req.path || req.originalUrl || "";
    if (isAllowedDuringMaintenance(path)) return next();

    const settings = await getSettings();
    if (!settings.maintenanceMode) return next();

    return res.status(503).json({
      success: false,
      message: "Platform is under maintenance. Please try again later.",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  maintenanceGuard,
};