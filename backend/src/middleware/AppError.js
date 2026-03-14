class AppError extends Error {
    constructor(errorConfig) {
        super(errorConfig.message);
        this.code = errorConfig.code;           // Mã định nghĩa riêng (1001, 1002...)
        this.statusCode = errorConfig.statusCode; // Mã HTTP (400, 401...)
        this.isOperational = true;             // Đánh dấu đây là lỗi nghiệp vụ (có thể tin tưởng)

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;