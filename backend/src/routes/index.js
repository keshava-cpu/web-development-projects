const express = require('express');
const authRoutes = require('./auth.routes');
const publicationsRoutes = require('./publications.routes');
const patentsRoutes = require('./patents.routes');
const consultancyRoutes = require('./consultancy.routes');
const projectsRoutes = require('./projects.routes');
const reportsRoutes = require('./reports.routes');
const notificationsRoutes = require('./notifications.routes');

const router = express.Router();

router.use(authRoutes);
router.use('/publications', publicationsRoutes);
router.use('/patents', patentsRoutes);
router.use('/consultancy', consultancyRoutes);
router.use('/projects', projectsRoutes);
router.use('/reports', reportsRoutes);
router.use('/notifications', notificationsRoutes);

module.exports = router;
