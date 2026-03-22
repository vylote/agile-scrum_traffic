const ErrorCodes = {
    // Auth Errors (1000 - 1099)
    AUTH_USER_EXISTS: { 
        code: 1001, 
        message: "Người dùng đã tồn tại trên hệ thống.", 
        statusCode: 400 
    },
    AUTH_USERNAME_EXISTS: { 
        statusCode: 400, 
        code: 1007, 
        message: 'Tên đăng nhập đã được sử dụng.' 
    },
    AUTH_EMAIL_EXISTS: { 
        statusCode: 400, 
        code: 1008, 
        message: 'Email này đã được đăng ký tài khoản khác.' 
    },
    AUTH_PHONE_EXISTS: { 
        statusCode: 400, 
        code: 1009, 
        message: 'Số điện thoại này đã được đăng ký tài khoản khác.' 
    },
    AUTH_INVALID_CREDENTIALS: { 
        code: 1002, 
        message: "Tài khoản hoặc mật khẩu không chính xác.", 
        statusCode: 401 
    },
    AUTH_TOKEN_EXPIRED: { 
        code: 1003, 
        message: "Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.", 
        statusCode: 401 
    },
    AUTH_UNAUTHORIZED: { 
        code: 1004, 
        message: "Bạn không có quyền thực hiện hành động này.", 
        statusCode: 403 
    },
    
    INVALID_ID_FORMAT: {
        code: 1005, 
        message: 'Định dạng ID không hợp lệ. Vui lòng kiểm tra lại!',
        statusCode: 400
    },
    AUTH_USER_DISABLED: { 
        code: 1006, 
        statusCode: 403, 
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.' 
    },

    // Incident Errors (2000 - 2099)
    INCIDENT_NOT_FOUND: { 
        code: 2001, 
        message: "Không tìm thấy sự cố yêu cầu.", 
        statusCode: 404 
    },

    INCIDENT_MISSING_COORDINATES: {
        code: 2002,
        message: "Thiếu tọa độ sự cố!",
        statusCode: 400
    },
    
    URL_NOT_FOUND: { 
        code: 2002, 
        message: "Đường dẫn không tồn tại.", 
        statusCode: 404 
    },

    
    // System Errors (5000+)
    SYSTEM_INTERNAL_ERROR: { 
        code: 5000, 
        message: "Đã có lỗi xảy ra trên hệ thống, vui lòng thử lại sau.", 
        statusCode: 500 
    },

};

Object.freeze(ErrorCodes); // Chặn việc sửa đổi mã lỗi lúc runtime
module.exports = ErrorCodes;