class AppError extends Error {
    constructor(errorConfig) {
        super(errorConfig.message);
        this.code = errorConfig.code;           // Mã định nghĩa riêng (1001, 1002...)
        this.statusCode = errorConfig.statusCode; // Mã HTTP (400, 401...)
        this.isOperational = true;             // Đánh dấu đây là lỗi nghiệp vụ (có thể tin tưởng)

        /* Bằng cách truyền this.constructor vào tham số thứ hai, Vy đang bảo với Node.js rằng:
        "Này, khi ghi lại dấu vết, hãy bỏ qua cái hàm khởi tạo (constructor) của lớp AppError này đi. 
        Hãy bắt đầu ghi dấu vết từ cái chỗ mà tôi gọi 'new AppError' ấy!" */
        Error.captureStackTrace(this, this.constructor);
        // ngay sau code này một thuộc tính ẩn .stack sinh ra
    }
}

module.exports = AppError;