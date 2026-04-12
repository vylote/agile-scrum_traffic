const mongoose = require('mongoose');

const connectDB = async () => {
    const options = {
        serverSelectionTimeoutMS: 5000,
    };
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        console.log(`Đã kết nối MongoDB: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Lỗi kết nối MongoDB: ${error.message}`);
        console.log('Đang thử lại sau 5 giây...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;