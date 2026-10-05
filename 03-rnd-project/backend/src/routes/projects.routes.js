const express = require('express');
const protect = require('../middleware/cookieAuth');
const projectsController = require('../controllers/projects.controller');

const router = express.Router();

router.use(protect);

router.post('/', projectsController.createProject);
router.get('/', projectsController.getProjects);
router.get('/:id', projectsController.getProjectById);
router.put('/:id', projectsController.updateProject);
router.delete('/:id', projectsController.deleteProject);

module.exports = router;
