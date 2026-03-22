const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    code: { type: String, unique: true }, 

    type: { 
        type: String, 
        enum: ['ACCIDENT', 'BREAKDOWN', 'FLOOD', 'FIRE', 'OTHER'], 
        required: true 
    },

    status: { 
        type: String, 
        enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 
        default: 'PENDING' 
    },

    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },

    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
        address: String
    },

    title: { type: String, required: true },
    description: String,
    photos: [String], 
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'RescueTeam' },

    //Dùng để vẽ biểu đồ tiến độ)
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