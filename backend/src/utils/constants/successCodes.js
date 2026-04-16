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
    LOGOUT_SUCCESS: {
        code: 1000,
        message: 'Đăng xuất thành công. Hẹn gặp lại!',
        statusCode: 202
    },

    GET_DASHBOARD_STATS_SUCCESS: {
        code: 1100,
        message: "Lấy dữ liệu thống kê dashboard thành công.",
        statusCode: 200
    },
    EXPORT_REPORT_SUCCESS: {
        code: 1101,
        message: "Xuất báo cáo hệ thống thành công.",
        statusCode: 200
    },

    // Incidents (1200 - 1299)
    GET_INCIDENT_SUCCESS: {
        code: 1200,
        message: "Lấy dữ liệu sự cố thành công.",
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