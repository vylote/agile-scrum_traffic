const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Middleware check Token
const notificationController = require('../controllers/notificationController');

router.use(protect); // Bắt buộc đăng nhập

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;