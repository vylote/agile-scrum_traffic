const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Dispatcher', 'Rescue', 'Citizen'], 
    default: 'Citizen' 
  },
  fullName: String,
  phoneNumber: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);