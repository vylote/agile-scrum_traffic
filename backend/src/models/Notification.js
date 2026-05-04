const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../utils/constants/notificationConstants');

const notificationSchema = new mongoose.Schema({
    recipientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Gửi cho ai
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { 
        type: String, 
        enum: Object.values(NOTIFICATION_TYPES)
    },
    targetUrl: { type: String }, // Link khi bấm vào
    incidentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Incident' 
    }, // (Tùy chọn) Lưu ID sự cố để dễ truy xuất
    isRead: { type: Boolean, default: false } // Trạng thái đọc
}, { timestamps: true });

// Tạo Index để query nhanh hơn khi lấy danh sách theo User và thời gian
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);