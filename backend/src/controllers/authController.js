const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../config/errorCodes');
const SuccessCodes = require('../config/successCodes');
const { sendSuccess } = require('../utils/response');

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
            userId: newUser._id 
        });

    } catch (err) {
        next(err); // Đẩy vào phễu Global Error Handler
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isMatch) {
            return next(new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS));
        }

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
        next(err);
    }
};

/* Token trông như này 
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYwZDUiLCJyb2xlIjoiQ2l0aXplbiJ9.xK9abc...
|_____ header ______|.___________ payload _____________|.__signature___| */