const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');

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
exports.register = async (req, res, next) => {
    try {
        const { username, password, role, name, email, phone } = req.body;

        // 1. Kiểm tra trùng lặp (Cả username và email)
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return next(new AppError(ErrorCodes.AUTH_USER_EXISTS));
        }

        // 2. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Tạo User với các trường chuẩn 7.3
        const newUser = await User.create({
            username,
            passwordHash: hashedPassword, // Đổi từ password -> passwordHash
            name,                         // Đổi từ fullName -> name
            email,
            phone,                        // Đổi từ phoneNumber -> phone
            role: role ? role.toUpperCase() : 'CITIZEN' // Ép kiểu hoa
        });

        return sendSuccess(res, SuccessCodes.REGISTER_SUCCESS, { 
            userId: newUser._id, 
            username: newUser.username,
            name: newUser.name
        });

    } catch (err) {
        next(err);
    }
};

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
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // 1. Tìm user (Lưu ý: Schema giờ dùng passwordHash)
        const user = await User.findOne({ username });
        
        // 2. Kiểm tra mật khẩu
        const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

        if (!user || !isMatch) {
            return next(new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS));
        }

        // 3. Cập nhật lastLogin (Tính năng mới trong Schema)
        user.lastLogin = Date.now();
        await user.save();

        // 4. Tạo Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return sendSuccess(res, SuccessCodes.LOGIN_SUCCESS, {
            token,
            user: {
                id: user._id,
                role: user.role,
                name: user.name, // Đổi từ fullName -> name
                email: user.email
            }
        });

    } catch (err) { 
        next(err);
    }
};