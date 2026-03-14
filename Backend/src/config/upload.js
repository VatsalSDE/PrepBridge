const multer = require('multer');

// Local upload middleware (memory buffer), used for resume PDFs.
const uploadResumeMw = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
}).single('resume');

module.exports = { uploadResumeMw };
