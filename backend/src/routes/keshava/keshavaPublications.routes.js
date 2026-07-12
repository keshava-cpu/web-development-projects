/**
 * Keshava Publications Routes
 * Mounted at: /api/keshava/publications
 */
const express = require('express');
const protect = require('../../middleware/cookieAuth');
const keshavaPublicationsController = require('../../controllers/keshavaPublications.controller');

const router = express.Router();

// All publications tracker routes are protected via session cookies
router.use(protect);

router.get('/', keshavaPublicationsController.getPublications);
router.post('/', keshavaPublicationsController.createPublication);
router.post('/:id/status', keshavaPublicationsController.updatePublicationStatus);
router.post('/:id/update', keshavaPublicationsController.updatePublication);

module.exports = router;
