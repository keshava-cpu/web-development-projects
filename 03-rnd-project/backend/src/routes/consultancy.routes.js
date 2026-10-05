const express = require('express');
const protect = require('../middleware/cookieAuth');
const consultancyController = require('../controllers/consultancy.controller');

const router = express.Router();

router.use(protect);

router.post('/', consultancyController.createConsultancy);
router.get('/', consultancyController.getConsultancy);
router.get('/:id', consultancyController.getConsultancyById);
router.put('/:id', consultancyController.updateConsultancy);
router.delete('/:id', consultancyController.deleteConsultancy);

module.exports = router;
