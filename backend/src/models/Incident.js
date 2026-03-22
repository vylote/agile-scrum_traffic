const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    // 1. Mã định danh duy nhất (Unique Tracking Code)
    code: { type: String, unique: true }, 

    // 2. Loại sự cố (Bắt buộc theo tài liệu)
    type: { 
        type: String, 
        enum: ['ACCIDENT', 'BREAKDOWN', 'FLOOD', 'FIRE', 'OTHER'], 
        required: true 
    },

    // 3. Trạng thái (Cập nhật danh sách Enum mới)
    status: { 
        type: String, 
        enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 
        default: 'PENDING' 
    },

    // 4. Độ nghiêm trọng (Tính năng mới cực xịn)
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },

    // 5. Thông tin địa lý (Giữ nguyên logic 2dsphere)
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
        address: String
    },

    title: { type: String, required: true },
    description: String,

    // 6. Đổi images -> photos theo tài liệu
    photos: [String], 

    // 7. Đổi reporterId -> reportedBy (Ref User)
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // 8. Đội cứu hộ được giao (Tính năng điều phối)
    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'RescueTeam' },

    // 9. Lịch sử xử lý (Timeline - Dùng để vẽ biểu đồ tiến độ)
    timeline: [{
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        note: String
    }],

    // 10. Thời gian dự kiến & Kết thúc
    estimatedArrival: Date,
    completedAt: Date

}, { timestamps: true });

// --- MIDDLEWARE: Tự động sinh mã Code trước khi lưu ---
incidentSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    // Ví dụ: ACC-20260322-1234
    this.code = `${this.type.slice(0, 3)}-${dateStr}-${randomStr}`;
    next();
});

// Index địa lý để tìm sự cố gần đây nhất
incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);