const express = require('express');
const protect = require('../middleware/protect');
const patentsController = require('../controllers/patents.controller');

const router = express.Router();

router.use(protect);

router.post('/', patentsController.createPatent);
router.get('/', patentsController.getPatents);

module.exports = router;
