const Message = require('../models/Message');
const { sendSuccess } = require('../utils/response');
const SuccessCodes = require('../utils/constants/successCodes');

exports.getIncidentMessages = async (req, res, next) => {
    try {
        const incidentId = req.params.id;
        
        // Truy vấn dựa trên Index đã tạo, lấy 100 tin nhắn gần nhất
        const messages = await Message.find({ incidentId })
            .sort({ createdAt: 1 }) // Cũ xếp trên, mới xếp dưới (chuẩn UX Chat)
            .limit(100)
            .lean(); // Dùng lean() để tối ưu tốc độ đọc DB < 300ms

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, messages);
    } catch (error) {
        next(error);
    }
};