const express = require('express');
const protect = require('../middleware/cookieAuth');
const reportsController = require('../controllers/reports.controller');

const router = express.Router();

router.use(protect);

router.get('/', reportsController.getReports);

module.exports = router;
