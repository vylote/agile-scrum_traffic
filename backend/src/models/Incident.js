const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  status: { type: String, default: 'pending' }, // pending, processing, resolved
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', IncidentSchema);