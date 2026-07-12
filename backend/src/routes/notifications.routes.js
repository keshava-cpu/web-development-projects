const express = require('express');
const protect = require('../middleware/cookieAuth');
const notificationsController = require('../controllers/notifications.controller');

const router = express.Router();

router.use(protect);

router.post('/', notificationsController.createNotification);
router.get('/', notificationsController.getNotifications);
router.patch('/:id/read', notificationsController.markNotificationRead);
router.patch('/read-all', notificationsController.markAllNotificationsRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
