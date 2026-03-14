const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../config/errorCodes');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        
        if (!token) 
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED))

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const currentUser = await User.findById(jwt.decoded.id)
        if (!currentUser)
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED))

        req.user = currentUser
        next()
    } catch (err) {
        return next(new AppError(ErrorCodes.AUTH_TOKEN_EXPIRED))
    }
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED))

        next()
    }
}