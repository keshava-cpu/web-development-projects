const express = require('express');
const protect = require('../middleware/protect');
const publicationsController = require('../controllers/publications.controller');

const router = express.Router();

router.use(protect);

router.post('/', publicationsController.createPublication);
router.get('/', publicationsController.getPublications);
router.put('/:id', publicationsController.updatePublication);
router.delete('/:id', publicationsController.deletePublication);

module.exports = router;
