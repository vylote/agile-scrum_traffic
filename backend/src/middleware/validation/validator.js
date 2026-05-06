const ErrorCodes = require('../../utils/constants/errorCodes');

// Middleware dùng chung để kiểm tra dữ liệu đầu vào
const validate = (schema) => {
    return (req, res, next) => {
        // abortEarly: false -> Quét toàn bộ lỗi rồi mới báo (không dừng ở lỗi đầu tiên)
        // stripUnknown: true -> BẢO MẬT: Tự động vứt bỏ các trường dữ liệu rác
        const { error, value } = schema.validate(req.body, { 
            abortEarly: false, 
            stripUnknown: true 
        });

        if (error) {
            // Gom tất cả thông báo lỗi chi tiết của Joi thành một chuỗi
            const errorMessages = error.details.map(err => err.message)

            return res.status(ErrorCodes.INVALID_INPUT.statusCode).json({
                success: false,
                error: {
                    code: ErrorCodes.INVALID_INPUT.code,
                    message: errorMessages // Ghi đè message chi tiết để FE hiển thị cho User
                }
            });
        }

        // Ghi đè lại req.body bằng dữ liệu đã được làm sạch
        req.body = value;
        next();
    };
};

module.exports = { validate };