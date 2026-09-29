const multer = require('multer');
const path = require('path');

// Upload only CSV files
const fileFilter = (_, file, cb) => {
  const ok =
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel';
  cb(ok ? null : new Error('Only CSV allowed'), ok);
};

// Temporary save
const uploadFile = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = uploadFile;
