/**
 * Keshava router index
 * Aggregates all routes from the migrated server/ (Keshava-stdnt branch).
 * Mounted at: /api/keshava/
 *
 * Middleware: The JWT from req.user is populated by the keshava verifyToken
 * middleware (cookie-based) registered in app.js before this router.
 */
const express = require('express');
const keshavaAuthRoutes = require('./keshavaAuth.routes');
const keshavaPublicationsRoutes = require('./keshavaPublications.routes');

const router = express.Router();

// Health check for keshava API namespace
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'rnd-keshava-publications-api',
    time: new Date().toISOString(),
  });
});

router.use('/auth', keshavaAuthRoutes);
router.use('/publications', keshavaPublicationsRoutes);

module.exports = router;
