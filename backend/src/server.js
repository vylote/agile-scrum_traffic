require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const cron = require('node-cron');
const cleanupOrphanPhotos = require('./utils/cleanupTask');
const initApp = require('./utils/initApp');

const socketService = require('./services/socket');

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

// 🔥 THÊM 2: Khởi tạo socket service với instance io hiện tại
// Việc này giúp các file chạy ngầm (như Bull Queue) có thể dùng được io.emit
socketService.init(io);

io.on('connection', (socket) => {
    console.log(`🔌 Thiết bị mới kết nối: ${socket.id}`);

    socket.on('join_zone', (zone) => {
        socket.join(`zone:${zone}`);
        console.log(`Đội cứu hộ đã vào phòng zone: ${zone}`);
    });

    socket.on('rescue:updateLocation', (data) => {
        const { teamId, lat, lng, incidentId, status, teamName } = data;
        // Gửi cho TOÀN BỘ Dispatcher/Admin để theo dõi đội xe (Fleet Tracking)
        io.to('room:dispatchers').emit('rescue:location_update', {
            teamId,
            lat,
            lng,
            status,
            teamName,
            updatedAt: new Date()
        });
        // Nếu đang làm vụ nào thì gửi riêng cho người dân vụ đó
        if (incidentId) {
            io.to(`incident_chat:${incidentId}`).emit('rescue:location_client', { lat, lng });
        }
    });

    socket.on('chat:message', (data) => {
        const { incidentId, text, senderName } = data;
        const roomName = `incident_chat:${incidentId}`;

        // Tham gia phòng chat nếu chưa có
        socket.join(roomName);

        // Phát lại sự kiện: chat:message (Server -> Client)
        // Phân phối tin nhắn đến các thành viên trong kênh
        io.to(roomName).emit('chat:message', {
            sender: senderName,
            text: text,
            time: new Date().toISOString()
        });
    });
});

const startServer = async () => {
    try {
        await connectDB();
        console.log('Database connected successfully');

        require('./jobs/autoAssign');
        console.log('👷 Bull Queue Worker đã được khởi động!');

        initApp();

        console.log('Đang kiểm tra ảnh mồ côi lần đầu...');
        cleanupOrphanPhotos();

        // Lập lịch chạy định kỳ (3 giờ sáng mỗi ngày)
        cron.schedule('0 3 * * *', () => {
            console.log('[CronJob] Bắt đầu dọn dẹp định kỳ...');
            cleanupOrphanPhotos();
        });

        
        const PORT = process.env.PORT || 5000;
        
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running in ${process.env.NODE_ENV} mode`);
            console.log(`🔗 API: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Không thể khởi động server do lỗi DB:', error);
        process.exit(1); // Thoát nếu DB không kết nối được
    }
};

startServer();