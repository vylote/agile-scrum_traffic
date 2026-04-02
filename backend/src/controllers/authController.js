const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');
const { USER_ROLES } = require('../utils/constants/userConstants');

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

        const existingUser = await User.findOne({
            $or: [
                { username },
                { email },
                { phone }
            ]
        });

        if (existingUser) {
            if (existingUser.username === username) 
                return next(new AppError(ErrorCodes.AUTH_USERNAME_EXISTS))
            if (existingUser.email === email)
                return next(new AppError(ErrorCodes.AUTH_EMAIL_EXISTS))
            if (existingUser.phone === phone)
                return next(new AppError(ErrorCodes.AUTH_PHONE_EXISTS))
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            passwordHash: hashedPassword,
            name,
            email,
            phone,
            role: role ? role.toUpperCase() : USER_ROLES.CITIZEN
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

        const user = await User.findOne({ username });

        const isMatch = user && user.passwordHash
            ? await bcrypt.compare(password, user.passwordHash)
            : false;

        if (!user || !isMatch) {
            return next(new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS));
        }

        user.lastLogin = Date.now();
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d', algorithm: 'HS256'}
        );

        const options = {
            expires: new Date(Date.now() +24*60*60*1000),
            httpOnly: true,
            // secure: true, 
            // sameSite: 'strict'
        }

        res.cookie('token', token, options);

        return sendSuccess(res, SuccessCodes.LOGIN_SUCCESS, {
            user: {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res) => {
    const options = {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production', 
        // sameSite: 'strict'
    }
    res.clearCookie('token',options);
    return sendSuccess(res, SuccessCodes.LOGOUT_SUCCESS);
};