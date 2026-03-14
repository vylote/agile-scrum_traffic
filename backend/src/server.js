// 1. PHẢI LÀ DÒNG ĐẦU TIÊN: Nạp biến môi trường trước khi nạp bất kỳ file nào khác
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); 
const connectDB = require('./config/db');

// 2. Kết nối Database
connectDB();

const server = http.createServer(app);

// 3. Cấu hình Socket.io
const io = new Server(server, { 
    cors: { 
        origin: process.env.NODE_ENV === 'development' ? "*" : "https://yourdomain.com",
        methods: ["GET", "POST"]
    } 
});

// Mẹo Pro: Gắn io vào app để Vy có thể dùng req.app.get('io') trong Controller (ví dụ báo cáo sự cố xong thì phát tin ngay)
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log('🔥 User disconnected');
    });
});

// 4. Khởi động Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode`);
    console.log(`📡 Listening on: http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
});