const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Các API liên quan đến Xác thực người dùng
 */

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
 *             required:
 *               - username
 *               - password
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *                 example: "vy_le_2026"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123"
 *               fullName:
 *                 type: string
 *                 example: "Le Thanh Vy"
 *               role:
 *                 type: string
 *                 enum: [Citizen, Dispatcher, Admin]
 *                 default: Citizen
 *                 example: "Citizen"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Tên đăng nhập đã tồn tại (Mã lỗi 1001)
 */
exports.register = async (req, res, next) => {
    try {
        const { username, password, role, fullName } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return next(new AppError(ErrorCodes.AUTH_USER_EXISTS));
        }

        //hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role, 
            fullName
        });

        return sendSuccess(res, SuccessCodes.REGISTER_SUCCESS, { 
            userId: newUser._id, 
            username: newUser.username
        });

    } catch (err) {
        /* Trong JS thuần túy, k hề tồn tại hàm next(), đây là do vy khai báo
        khi có một request tới, express(framework) sẽ tạo ra nó   */
        next(err); // Đẩy vào phễu Global Error Handler
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
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "vy_le_2026"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về Token và thông tin cơ bản
 *       401:
 *         description: Tài khoản hoặc mật khẩu không chính xác (Mã lỗi 1002)
 */
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isMatch) {
            return next(new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS));
        }

        /* tự tạo header mặc định 
        { "alg": "HS256", "typ": "JWT" } */
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return sendSuccess(res, SuccessCodes.LOGIN_SUCCESS, {
            token,
            user: {
                role: user.role,
                fullName: user.fullName
            }
        });

    } catch (err) { 
        /* Lệnh next(something): Khi gọi next và truyền vào bất cứ thứ gì (ngoại trừ chữ 'route'),
        Express sẽ mặc định coi cái "something" đó là một lỗi (Error) */
        next(err);
    }
};

/* Token trông như này 
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYwZDUiLCJyb2xlIjoiQ2l0aXplbiJ9.xK9abc...
|_____ header ______|.___________ payload _____________|.__signature___| */