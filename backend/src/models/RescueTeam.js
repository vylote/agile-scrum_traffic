const mongoose = require('mongoose');
const { ALL_RESCUE_TYPES, ALL_RESCUE_STATUS, RESCUE_TEAM_STATUS } = require('../utils/constants/rescueConstants');

const rescueTeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Mã định danh đội (Ví dụ: TEAM-CG-01)
    code: { type: String, required: true, unique: true },
    type: { 
        type: String, 
        enum: ALL_RESCUE_TYPES, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ALL_RESCUE_STATUS, 
        default: RESCUE_TEAM_STATUS.AVAILABLE 
    },
    currentLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    zone: { type: String, required: true },
    members: {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        role: String
    },
    // khả năng: sơ cứu, chữa cháy, cẩu nặng
    capablities: [String],
    activeIncident:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Incident'},
    
    // thống kê hiệu suất
    stats:{
        totalCompleted: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 }
    },
    lastLocationUpdate: { type: Date, default: Date.now()},

}, { timestamps: true });

rescueTeamSchema.index({currentLocation: '2dsphere'})
module.exports = mongoose.model('User', userSchema);