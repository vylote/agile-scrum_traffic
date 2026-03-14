const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Import ứng dụng từ app.js
const connectDB = require('./config/db'); // Import cấu hình DB
require('dotenv').config();

// 1. Kết nối Cơ sở dữ liệu (MongoDB/Docker)
connectDB();

const server = http.createServer(app);

// 2. Cấu hình Socket.io cho các tính năng thời gian thực
const io = new Server(server, { 
    cors: { origin: "*" } 
});

io.on('connection', (socket) => {
    console.log('⚡ Người dùng kết nối:', socket.id);
    
    // Bạn có thể tách logic socket vào thư mục services/ sau này
    socket.on('disconnect', () => {
        console.log('🔥 Người dùng ngắt kết nối');
    });
});

// 3. Khởi động Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📖 Tài liệu API: http://localhost:${PORT}/api-docs`);
});