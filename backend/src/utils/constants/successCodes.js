const SuccessCodes = {
    // Auth (1000 - 1099)
    REGISTER_SUCCESS: { 
        code: 1000, 
        message: "Đăng ký tài khoản thành công.", 
        statusCode: 201 
    },
    LOGIN_SUCCESS: { 
        code: 1000, 
        message: "Đăng nhập thành công.", 
        statusCode: 200 
    },

    // Mặc định cho các thao tác chung
    DEFAULT_SUCCESS: { 
        code: 1000, 
        message: "Thao tác thực hiện thành công.", 
        statusCode: 200 
    }
};

Object.freeze(SuccessCodes); // Chặn việc sửa đổi mã lỗi lúc runtime
module.exports = SuccessCodes;