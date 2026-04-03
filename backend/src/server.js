require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); 
const connectDB = require('./config/db');
const cron = require('node-cron');
const cleanupOrphanPhotos = require('./utils/cleanupTask');
const initApp = require('./utils/initApp');

const server = http.createServer(app);

const io = new Server(server, { 
    cors: { 
        origin: process.env.CLIENT_URL,
        credentials: true,
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

const startServer = async () => {
    try {
        await connectDB();
        console.log('Database connected successfully');

        initApp();

        console.log('Đang kiểm tra ảnh mồ côi lần đầu...');
        cleanupOrphanPhotos(); 

        // 3. Lập lịch chạy định kỳ (3 giờ sáng mỗi ngày)
        cron.schedule('0 3 * * *', () => {
            console.log('[CronJob] Bắt đầu dọn dẹp định kỳ...');
            cleanupOrphanPhotos();
        });

        // 4. Cuối cùng mới lắng nghe các kết nối (Listen)
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server is running in ${process.env.NODE_ENV} mode`);
            console.log(`Listening on: http://localhost:${PORT}`);
            console.log(`API Docs: http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error('Không thể khởi động server do lỗi DB:', error);
        process.exit(1); // Thoát nếu DB không kết nối được
    }
};

startServer();