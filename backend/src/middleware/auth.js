const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        
        if (!currentUser) {
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED));
        }

        // Tính năng mới: Chặn nếu tài khoản bị khóa (isActive = false)
        if (!currentUser.isActive) {
            return next(new AppError(ErrorCodes.AUTH_USER_DISABLED)); 
        }

        req.user = currentUser;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(ErrorCodes.AUTH_TOKEN_EXPIRED));
        }
        return next(new AppError(ErrorCodes.AUTH_INVALID_TOKEN));
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        const upperRoles = roles.map(role => role.toUpperCase());

        if (!upperRoles.includes(req.user.role)) {
            return next(new AppError(ErrorCodes.AUTH_FORBIDDEN));
        }

        next();
    };
};