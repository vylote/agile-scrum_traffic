const ErrorCodes = {
    // Auth Errors (1000 - 1099)
    AUTH_USER_EXISTS: { 
        code: 1001, 
        message: "Tên đăng nhập đã tồn tại trên hệ thống.", 
        statusCode: 400 
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

    // Incident Errors (2000 - 2099)
    INCIDENT_NOT_FOUND: { 
        code: 2001, 
        message: "Không tìm thấy sự cố yêu cầu.", 
        statusCode: 404 
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