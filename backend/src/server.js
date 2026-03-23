require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); 
const connectDB = require('./config/db');
const cron = require('node-cron');
const cleanupOrphanPhotos = require('./utils/cleanupTask');

const server = http.createServer(app);

// Cấu hình Socket.io
const io = new Server(server, { 
    cors: { 
        origin: process.env.NODE_ENV === 'development' ? "*" : "https://yourdomain.com",
        methods: ["GET", "POST"]
    } 
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log('🔥 User disconnected');
    });
});

// --- PHẦN QUAN TRỌNG: KHỞI ĐỘNG CÓ THỨ TỰ ---

const startServer = async () => {
    try {
        // 1. Kết nối Database trước
        await connectDB();
        console.log('✅ Database connected successfully');

        // 2. CHẠY NGAY BÂY GIỜ: Kiểm tra rác ngay khi server vừa bật
        // Việc này giải quyết yêu cầu "check ngay bây giờ" của bạn
        console.log('🧹 Đang kiểm tra ảnh mồ côi lần đầu...');
        cleanupOrphanPhotos(); 

        // 3. Lập lịch chạy định kỳ (3 giờ sáng mỗi ngày)
        cron.schedule('0 3 * * *', () => {
            console.log('🕒 [CronJob] Bắt đầu dọn dẹp định kỳ...');
            cleanupOrphanPhotos();
        });

        // 4. Cuối cùng mới lắng nghe các kết nối (Listen)
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode`);
            console.log(`📡 Listening on: http://localhost:${PORT}`);
            console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error('❌ Không thể khởi động server do lỗi DB:', error);
        process.exit(1); // Thoát nếu DB không kết nối được
    }
};

startServer();