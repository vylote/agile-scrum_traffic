const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // 1. Lấy token từ Header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED));
        }

        // 2. Giải mã Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Kiểm tra xem User còn tồn tại và có đang bị khóa không
        const currentUser = await User.findById(decoded.id);
        
        if (!currentUser) {
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED));
        }

        // 🚀 Tính năng mới: Chặn nếu tài khoản bị khóa (isActive = false)
        if (!currentUser.isActive) {
            return next(new AppError(ErrorCodes.AUTH_USER_DISABLED)); // Nhớ thêm mã lỗi này vào constants nhé Vy
        }

        // 4. Lưu User vào request để dùng ở các bước sau
        req.user = currentUser;
        next();
    } catch (err) {
        // Phân loại lỗi JWT để trả về message chính xác hơn
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(ErrorCodes.AUTH_TOKEN_EXPIRED));
        }
        return next(new AppError(ErrorCodes.AUTH_INVALID_TOKEN));
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // 🚀 Cải tiến: Tự động viết hoa quyền hạn để so khớp với Schema mới
        // Ví dụ: Vy gọi restrictTo('admin') thì nó sẽ so sánh với 'ADMIN'
        const upperRoles = roles.map(role => role.toUpperCase());

        if (!upperRoles.includes(req.user.role)) {
            return next(new AppError(ErrorCodes.AUTH_UNAUTHORIZED));
        }

        next();
    };
};