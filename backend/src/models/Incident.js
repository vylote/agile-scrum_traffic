// import thu vien de dung cong cu tạo schema và model
const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //ref tới collection users
  title: { type: String, required: true }, //validation
  description: String, // ghi tắt của {type: String, required: false}
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, //(kinh do, vi do)
    address: String
  },
  images: [String], //mảng chuỗi 
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Resolved', 'Rejected'], 
    default: 'Pending' // mặc định tạo mới, k truyền status auto là pending (unresolve)
  }
}, { timestamps: true }); // tự động thêm 2 field createAt và updateAt

// tạo index địa lý -> cho phép query
/* 2d = 2 chiều (kinh độ + vĩ độ)
sphere = hình cầu (vì Trái Đất là hình cầu, không phải mặt phẳng) */
incidentSchema.index({ location: '2dsphere' }); 
//xuát model 
module.exports = mongoose.model('Incident', incidentSchema);