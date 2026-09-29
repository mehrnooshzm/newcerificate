const { signup, migratePassword } = require('../controllers/authController'); // Import signup controller
const authRouter = require('express').Router(); // Create a new router

// Route for user signup
authRouter.post('/signup', signup);
authRouter.post('/migrate-password', migratePassword);

module.exports = authRouter; // Export the router
