const multer = require('multer');
const path = require('path');

const fileFilter = (_, file, cb) => {
  const ok = file.mimetype === 'application/pdf';

  cb(ok ? null : new Error('Only PDF files allowed'), ok);
};

const uploadCertificateFiles = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 100,
  },
  fileFilter,
});

module.exports = uploadCertificateFiles;