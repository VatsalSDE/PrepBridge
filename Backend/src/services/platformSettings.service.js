const PlatformSettings = require("../models/PlatformSettings");
const { AppError } = require("../middleware/errorHandler");

const SETTINGS_CACHE_TTL_MS = 10000;

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  communityModeration: true,
  maxTasksPerDay: 20,
};

const ALLOWED_UPDATE_KEYS = Object.keys(DEFAULT_SETTINGS);

let settingsCache = null;
let settingsCacheAt = 0;

const normalizeSettings = (doc) => ({
  ...DEFAULT_SETTINGS,
  ...(doc || {}),
  maxTasksPerDay: Number(doc?.maxTasksPerDay || DEFAULT_SETTINGS.maxTasksPerDay),
});

const getSettings = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();
  if (!forceRefresh && settingsCache && now - settingsCacheAt < SETTINGS_CACHE_TTL_MS) {
    return settingsCache;
  }

  const doc = await PlatformSettings.getSingleton();
  settingsCache = normalizeSettings(doc.toObject());
  settingsCacheAt = now;
  return settingsCache;
};

const updateSettings = async (payload = {}, updatedBy = null) => {
  const doc = await PlatformSettings.getSingleton();

  for (const key of ALLOWED_UPDATE_KEYS) {
    if (payload[key] === undefined) continue;

    if (key === "maxTasksPerDay") {
      const numeric = Number(payload[key]);
      if (!Number.isInteger(numeric) || numeric < 1 || numeric > 100) {
        throw new AppError("maxTasksPerDay must be an integer between 1 and 100", 400);
      }
      doc.maxTasksPerDay = numeric;
      continue;
    }

    doc[key] = Boolean(payload[key]);
  }

  if (updatedBy) {
    doc.updatedBy = updatedBy;
  }

  await doc.save();
  settingsCache = null;
  settingsCacheAt = 0;

  return getSettings({ forceRefresh: true });
};

module.exports = {
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings,
};