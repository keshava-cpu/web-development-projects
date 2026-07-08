const express = require('express');
const protect = require('../middleware/protect');
const projectsController = require('../controllers/projects.controller');
const { uploadUtilizationReport } = require('../services/upload.service');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  uploadUtilizationReport.single('utilization_report'),
  projectsController.createProject
);
router.get('/', projectsController.getProjects);

module.exports = router;
