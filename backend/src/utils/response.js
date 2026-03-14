/**
 * @param {Object} res - Express Response object
 * @param {Object} successConfig - Cấu hình từ SuccessCodes (chứa code, message, statusCode)
 * @param {any} data - Dữ liệu thực tế trả về (result)
 */
const sendSuccess = (res, successConfig, data) => {
    const config = successConfig || { code: 1000, message: "Thành công", statusCode: 200 };

    return res.status(config.statusCode).json({
        success: true,
        code: config.code,
        message: config.message,
        result: data
    });
};

module.exports = { sendSuccess };