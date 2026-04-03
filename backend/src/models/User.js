const mongoose = require('mongoose');
const {USER_ROLES, ALL_ROLES} = require('../utils/constants/userConstants')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: ALL_ROLES,
        default: USER_ROLES.CITIZEN
    },
    rescueTeam: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'RescueTeam' 
    },
    fcmToken: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);