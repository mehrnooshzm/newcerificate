const authenticateUser = require('../middleware/authenticateUser');
const {
  getAllDesigns,
  getDesign,
  createDesign,
  updateDesign,
  deleteDesign,
} = require('../controllers/designsController'); // Design controllers
const designsRouter = require('express').Router(); // Create a router

designsRouter.use(authenticateUser); // Protect all design routes

// CRUD routes for designs
designsRouter.get('/', getAllDesigns);
designsRouter.get('/:designId', getDesign);
designsRouter.post('/', createDesign);
designsRouter.put('/:designId', updateDesign);
designsRouter.delete('/:designId', deleteDesign);

module.exports = designsRouter;
