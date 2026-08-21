const multer = require("multer");
const { AppError } = require("../middleware/errorHandler");

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx)$/i;

const uploadResumeMw = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    // Browsers do not always send a usable mimetype (on Windows it comes from the
    // registry and is frequently "" or application/octet-stream), so accept the
    // file when either the mimetype or the extension looks right.
    const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const extOk = ALLOWED_EXTENSIONS.test(file.originalname || "");

    if (mimeOk || extOk) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are allowed"));
    }
  },
}).single("resume");

/**
 * Route-level wrapper that turns multer failures into 400s.
 * Without this, a rejected file type or oversized upload reaches the global
 * error handler as a plain Error and surfaces as a generic 500.
 */
const uploadResume = (req, res, next) => {
  uploadResumeMw(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("Resume file is too large. Maximum size is 5MB.", 400));
    }

    return next(new AppError(err.message || "Resume upload failed", 400));
  });
};

module.exports = { uploadResumeMw, uploadResume };
