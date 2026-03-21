const SuccessCodes = require('./constants/successCodes')

/**
 * @param {Object} res - Express Response object aka import('express').Response
 * @param {Object} successConfig - Cấu hình từ SuccessCodes (chứa code, message, statusCode)
 * @param {any} data - Dữ liệu thực tế trả về (result)
 */
const sendSuccess = (res, successConfig, data) => {
    const config = successConfig || SuccessCodes.DEFAULT_SUCCESS

    return res.status(config.statusCode).json({
        success: true,
        code: config.code,
        message: config.message,
        result: data
    });
};

module.exports = { sendSuccess };