const express = require('express');
const protect = require('../middleware/protect');
const patentsController = require('../controllers/patents.controller');

const router = express.Router();

// All patents routes require a valid Bearer JWT (Vinay's protect middleware)
router.use(protect);

// POST   /api/patents        — create a patent (any authenticated user)
// GET    /api/patents        — list patents (faculty: own; admin: all)
// GET    /api/patents/:id    — get single patent (faculty: own only; admin: any)
// PUT    /api/patents/:id    — update a patent (owner or admin)
// DELETE /api/patents/:id    — delete a patent (owner or admin)

router.post('/', patentsController.createPatent);
router.get('/', patentsController.getPatents);
router.get('/:id', patentsController.getPatentById);
router.put('/:id', patentsController.updatePatent);
router.delete('/:id', patentsController.deletePatent);

module.exports = router;
