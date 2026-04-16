const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportId: { type: String, unique: true }, // Ví dụ: REP-20240601-1234
    name: { type: String, required: true },   // Tên file: Bao_cao_su_co_thang_6.xlsx
    type: { 
        type: String, 
        enum: ['Sự cố', 'Tài khoản', 'Đối tác', 'Tài chính'], 
        default: 'Sự cố' 
    },
    format: { type: String, default: 'XLSX' },
    size: { type: String }, // Ví dụ: 2.4 MB
    status: { type: String, default: 'Hoàn thành' },
    url: { type: String }, // Đường dẫn để tải file: /uploads/reports/filename.xlsx
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);