const authenticateUser = require('../middleware/authenticateUser'); // Middleware to verify user
const {
  getUpload,
  createUpload,
  deleteUpload,
} = require('../controllers/uploadsController'); // Controller functions for uploads
const uploadFile = require('../middleware/uploadFile'); // Middleware for handling file uploads
const uploadsRouter = require('express').Router(); // Create a new router

uploadsRouter.use(authenticateUser); // Apply authentication to all upload routes

// Upload routes
uploadsRouter.get('/:uploadId', getUpload); // Fetch a specific upload
uploadsRouter.post('/', uploadFile.single('file'), createUpload); // Upload a CSV file
uploadsRouter.delete('/:uploadId', deleteUpload); // Delete a specific upload

module.exports = uploadsRouter;
