const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/projects');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `utilization-report-${uniqueSuffix}-${sanitizedOriginal}`);
  },
});

const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }

  cb(new Error('Only PDF files are allowed for utilization reports.'), false);
};

const uploadUtilizationReport = multer({
  storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const getUtilizationReportPath = (filename) =>
  `/uploads/projects/${filename}`.replace(/\\/g, '/');

module.exports = {
  uploadUtilizationReport,
  getUtilizationReportPath,
  UPLOAD_DIR,
};
