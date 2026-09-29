const authenticateUser = require('../middleware/authenticateUser');
const { getAllTemplates } = require('../controllers/templatesController');
const templatesRouter = require('express').Router();

templatesRouter.use(authenticateUser); // Protect all template routes

// Route to get all templates
templatesRouter.get('/', getAllTemplates);

module.exports = templatesRouter;
