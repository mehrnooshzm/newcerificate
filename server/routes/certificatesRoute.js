const express = require('express');

const {
  createBatchExport,
  getBatchExportStatus,
  downloadBatchExport,
} = require('../controllers/certificatesController');

const uploadCertificateFiles = require('../middleware/uploadCertificateFiles');

const router = express.Router();

router.post(
  '/batch-export',
  uploadCertificateFiles.array('files', 100),
  createBatchExport
);

router.get('/batch-export/:jobId', getBatchExportStatus);

router.get(
  '/batch-export/:jobId/download',
  downloadBatchExport
);

module.exports = router;