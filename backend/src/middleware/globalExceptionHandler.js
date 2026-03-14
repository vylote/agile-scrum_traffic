const ErrorCodes = require('../config/errorCodes');

const globalExceptionHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    const businessCode = err.code || ErrorCodes.SYSTEM_INTERNAL_ERROR.code;
    
    const message = err.message || ErrorCodes.SYSTEM_INTERNAL_ERROR.message;

    res.status(statusCode).json({
        success: false,
        error: {
            code: businessCode,
            message: message
        },
        // Hiện stack trace để Vy dễ fix bug khi đang Dev
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = globalExceptionHandler;