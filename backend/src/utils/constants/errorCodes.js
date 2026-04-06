const ErrorCodes = {
    // --- AUTH & USER ERRORS (1000 - 1099) ---
    AUTH_UNAUTHORIZED: { statusCode: 401, code: 1000, message: "Không có quyền truy cập. Vui lòng xác thực." },

    // 1001-1004: Đăng nhập & Access Token
    AUTH_INVALID_CREDENTIALS: { statusCode: 401, code: 1001, message: "Tài khoản hoặc mật khẩu không chính xác." },
    AUTH_MISSING_TOKEN: { statusCode: 401, code: 1002, message: "Vui lòng đăng nhập để truy cập." },
    AUTH_TOKEN_EXPIRED: { statusCode: 401, code: 1003, message: "Phiên làm việc đã hết hạn, vui lòng đăng nhập lại." },
    AUTH_INVALID_TOKEN: { statusCode: 401, code: 1004, message: "Token không hợp lệ hoặc đã bị giả mạo." },

    // 1005-1006: Phân quyền & Trạng thái
    AUTH_FORBIDDEN: { statusCode: 403, code: 1005, message: "Bạn không có quyền thực hiện hành động này." },
    AUTH_USER_DISABLED: { statusCode: 403, code: 1006, message: "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Admin." },

    // 1007-1009: Đăng ký (Unique check)
    AUTH_USERNAME_EXISTS: { statusCode: 400, code: 1007, message: "Tên đăng nhập đã được sử dụng." },
    AUTH_EMAIL_EXISTS: { statusCode: 400, code: 1008, message: "Email này đã được đăng ký tài khoản khác." },
    AUTH_PHONE_EXISTS: { statusCode: 400, code: 1009, message: "Số điện thoại này đã được đăng ký tài khoản khác." },

    // 1010-1012: Tìm kiếm người dùng & Refresh Token
    USER_NOT_FOUND: { statusCode: 404, code: 1010, message: "Không tìm thấy người dùng trong hệ thống." },
    MISSING_REFRESH_TOKEN: { statusCode: 401, code: 1011, message: "Không tìm thấy thẻ gia hạn, vui lòng đăng nhập lại." },
    REFRESH_TOKEN_INVALID_OR_EXPIRED: { statusCode: 403, code: 1012, message: "Phiên đăng nhập đã hết hạn hoàn toàn. Vui lòng đăng nhập lại." },

    // --- INCIDENT ERRORS (2000 - 2099) ---
    INCIDENT_NOT_FOUND: { statusCode: 404, code: 2001, message: "Không tìm thấy thông tin sự cố." },
    INCIDENT_MISSING_COORDINATES: { statusCode: 400, code: 2002, message: "Thiếu thông tin tọa độ (latitude/longitude)." },
    INCIDENT_INVALID_CODE_FORMAT: { statusCode: 400, code: 2003, message: "Mã tra cứu không đúng định dạng (Ví dụ: ACC-20260322-1234)." },
    INCIDENT_INVALID_STATUS: { statusCode: 400, code: 2004, message: "Trạng thái sự cố không hợp lệ. Vui lòng kiểm tra lại!" },

    // --- RESCUE TEAM ERRORS (3000 - 3099) ---
    RESCUE_TEAM_NOT_FOUND: { statusCode: 404, code: 3001, message: "Không tìm thấy đội cứu hộ yêu cầu." },
    RESCUE_TEAM_BUSY: { statusCode: 400, code: 3002, message: "Đội cứu hộ này đang thực hiện nhiệm vụ khác." },
    USER_ALREADY_IN_TEAM: { statusCode: 400, code: 3003, message: "Nhân viên này hiện đã thuộc biên chế của một đội cứu hộ khác." },
    RESCUE_TEAM_CODE_EXISTS: {
        statusCode: 400,
        code: 3004,
        message: "Mã định danh đội cứu hộ đã tồn tại. Vui lòng kiểm tra lại số thứ tự."
    },

    // --- GENERAL VALIDATION & HTTP ERRORS (4000 - 4099) ---
    INVALID_INPUT: { statusCode: 400, code: 4000, message: "Dữ liệu đầu vào không hợp lệ hoặc bị thiếu thông tin bắt buộc." },
    INVALID_ID_FORMAT: { statusCode: 400, code: 4001, message: "Định dạng ID (ObjectId) không hợp lệ." },
    URL_NOT_FOUND: { statusCode: 404, code: 4004, message: "Đường dẫn (URL) API không tồn tại." },

    // --- SYSTEM ERRORS (5000+) ---
    SYSTEM_INTERNAL_ERROR: { statusCode: 500, code: 5000, message: "Lỗi hệ thống! Vui lòng thử lại sau." },
    FILE_UPLOAD_ERROR: { statusCode: 400, code: 5001, message: "Lỗi trong quá trình tải ảnh lên (Sai định dạng hoặc file quá lớn)." }
};

Object.freeze(ErrorCodes);
module.exports = ErrorCodes;