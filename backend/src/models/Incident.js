const mongoose = require('mongoose');
const { ALL_TYPES, ALL_STATUS, ALL_SEVERITIES, INCIDENT_STATUS, INCIDENT_SEVERITY } = require('../utils/constants/incidentConstants');

const incidentSchema = new mongoose.Schema({
    code: { type: String, unique: true }, 

    type: { 
        type: String, 
        enum: ALL_TYPES,
        required: true 
    },

    status: { 
        type: String, 
        enum: ALL_STATUS,
        default: INCIDENT_STATUS.PENDING 
    },

    severity: {
        type: String,
        enum: ALL_SEVERITIES,
        default: INCIDENT_SEVERITY.MEDIUM
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

    timeline: [{
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        note: String
    }],

    estimatedArrival: Date,
    completedAt: Date

}, { timestamps: true });

//Tự động sinh mã Code trước khi lưu
incidentSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    
    // Lấy 3 chữ cái đầu, ví dụ: ACCIDENT -> ACC, OTHER -> OTH
    const prefix = this.type ? this.type.slice(0, 3).toUpperCase() : 'UNK';
    this.code = `${prefix}-${dateStr}-${randomStr}`;
    next();
});

// Index địa lý để tìm sự cố gần đây nhất
incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);