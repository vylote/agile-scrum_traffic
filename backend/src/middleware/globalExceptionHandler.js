const ErrorCodes = require('../config/errorCodes');

/* một lưu ý là về vị trí của các tham số
Số lượng | Vị trí 1 | Vị trí 2 | Vị trí 3 | Vị trí 4 
    2       req         res
    3       req         res         next
    4       err         req         res       next */

// tham số chỉ là cách đạt tên, vị trí luôn là như vậy!
const globalExceptionHandler = (err, req, res, next) => {
    // Dùng ?? thay cho || để chỉ lấy giá trị bên phải khi bên trái là null hoặc undefined
    const statusCode = err.statusCode ?? ErrorCodes.SYSTEM_INTERNAL_ERROR?.statusCode ?? 500;
    
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