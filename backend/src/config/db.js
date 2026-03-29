const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Sử dụng biến môi trường MONGO_URI từ file .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Đã kết nối MongoDB: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Lỗi kết nối MongoDB: ${error.message}`);
        // Dừng hệ thống nếu không thể kết nối Database
        process.exit(1); 
    }
};

module.exports = connectDB;