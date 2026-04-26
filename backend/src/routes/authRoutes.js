const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản người dùng mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name, email, phone]
 *             properties:
 *               username: { type: string, example: "vy_le_2026" }
 *               password: { type: string, format: password, example: "SecurePass123" }
 *               name: { type: string, example: "Le Thanh Vy" }
 *               email: { type: string, example: "vy.le@student.utc.edu.vn" }
 *               phone: { type: string, example: "0987654321" }
 *               role: { type: string, enum: [CITIZEN, DISPATCHER, ADMIN, RESCUE], default: CITIZEN }
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.post('/register', authController.register);
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Đăng nhập để lấy Token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: "vy_le_2026" }
 *               password: { type: string, format: password, example: "SecurePass123" }
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post('/login', authController.login);
router.get('/logout', authController.logout)
router.post('/refresh-token', authController.refreshToken)
router.get('/me', protect, authController.getMe);

module.exports = router;