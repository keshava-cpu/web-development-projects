const express = require('express');
const protect = require('../middleware/protect');
const notificationsController = require('../controllers/notifications.controller');

const router = express.Router();

router.use(protect);

router.get('/', notificationsController.getNotifications);

module.exports = router;
