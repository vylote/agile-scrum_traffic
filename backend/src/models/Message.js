const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        required: true,
        index: true // Đánh index để truy vấn lịch sử chat theo sự cố nhanh hơn
    },
    sender: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: String,
        role: {
            type: String,
            enum: ['DISPATCHER', 'RESCUE'],
            required: true
        }
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    // Loại tin nhắn (để mở rộng gửi ảnh hoặc hệ thống tự động thông báo)
    messageType: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'SYSTEM'],
        default: 'TEXT'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);