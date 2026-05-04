const Notification = require('../models/Notification');
const AppError = require('../middleware/AppError');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');

// 1. Lấy danh sách thông báo của tôi (Frontend gọi lúc mở trang)
exports.getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user._id })
            .sort('-createdAt')
            .limit(50); // Giới hạn lấy 50 thông báo gần nhất cho nhẹ app
            
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, notifications);
    } catch (err) {
        next(err);
    }
};

// 2. Đánh dấu 1 thông báo đã đọc (Frontend gọi khi bấm vào 1 tin)
exports.markAsRead = async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user._id },
            { isRead: true }
        );
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, { message: "Đã đánh dấu đọc." });
    } catch (err) {
        next(err);
    }
};

// 3. Đánh dấu ĐỌC TẤT CẢ
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user._id, isRead: false },
            { isRead: true }
        );
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, { message: "Đã đọc tất cả." });
    } catch (err) {
        next(err);
    }
};