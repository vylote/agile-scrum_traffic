const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect)

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout)
router.post('/refresh-token', authController.refreshToken)
router.get('/me', authController.getMe);

module.exports = router;