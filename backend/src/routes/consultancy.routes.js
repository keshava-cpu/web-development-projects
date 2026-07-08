const express = require('express');
const protect = require('../middleware/protect');
const consultancyController = require('../controllers/consultancy.controller');

const router = express.Router();

router.use(protect);

router.post('/', consultancyController.createConsultancy);
router.get('/', consultancyController.getConsultancy);

module.exports = router;
