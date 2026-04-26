require('dotenv').config();

require('../src/config/firebase');
const { TEAM_ROLES } = require('../src/utils/constants/rescueConstants');
const { USER_ROLES } = require('../src/utils/constants/userConstants');

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const cron = require('node-cron');
const cleanupOrphanPhotos = require('./utils/cleanupTask');
const initApp = require('./utils/initApp');

const socketService = require('./services/socket');
const Incident = require('./models/Incident');

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

// lúc này file socket.js đóng vai trò là Singleton Service (Công cụ hỗ trợ dùng chung).
//lây ra cái loa phát thanh (io) từ server.js cất vào một biến toàn cục trong socket.js 
socketService.init(io);

io.on('connection', (socket) => {
    console.log(`Connected device: ${socket.id}`);

    socket.on('rescue:register', (data) => {
        const { teamId, role, zone } = data;
        if (teamId) {
            socket.join(`team:${teamId}`);
            if (zone) { socket.join(`zone:${zone}`) }

            if (role === TEAM_ROLES.LEADER) {
                socket.registeredTeamId = teamId;
                socketService.addOnlineTeam(teamId); 
            }
            console.log(`LEADER Đội [${teamId}] báo danh thành công.`);
        }
    });

    socket.on('dispatcher:register', () => {
        socket.join('room:dispatchers');
        console.log(`DISPATCHER [${socket.id}] đã vào phòng điều hành.`);
    });

    socket.on('disconnect', () => {
        if (socket.registeredTeamId) {
            socketService.removeOnlineTeam(socket.registeredTeamId)
            console.log(`LEADER Đội [${socket.registeredTeamId}] đã OFFLINE.`);
        }

        if (socket.currentChatRoom) {
            socket.leave(socket.currentChatRoom);
        }
    });

    socket.on('rescue:updateLocation', (data) => {
        const { teamId, lat, lng, incidentId, status, teamName } = data;

        const payload = { 
            teamId, 
            lat: parseFloat(lat), 
            lng: parseFloat(lng) 
        };

        io.emit('rescue:location', payload)

        if (incidentId) {
            io.to(`incident_chat:${incidentId}`).emit('rescue:location', payload)
        }
    });

    socket.on('chat:join', (data) => {
        const { incidentId, userId, role } = data;
        const roomName = `incident_chat:${incidentId}`;

        /* try {
            const incident = await Incident.findById(incidentId)
            if (!incident) {
                return socket.emit('chat:error', { message: 'Sự cố không tồn tại.' })
            }
        } catch () {

        } */

        // Đưa user vào phòng chat của sự cố
        socket.join(roomName);
        
        // Lưu lại vết phòng đang join vào socket để tiện dọn dẹp nếu đột ngột mất mạng
        socket.currentChatRoom = roomName;

        console.log(`[CHAT] ${role} (${userId}) đã tham gia phòng: ${roomName}`);
        
        // (Tùy chọn) Có thể phát thông báo cho người trong phòng biết có người vừa vào
        // io.to(roomName).emit('chat:system_msg', { text: 'Đối tác đã tham gia cuộc trò chuyện.' });
    });

    socket.on('chat:message', async (data) => {
        const { incidentId, text, senderName, senderId } = data;
        const roomName = `incident_chat:${incidentId}`;

        const messagePayload = {
            senderId: senderId,
            sender: senderName,
            text: text,
            time: new Date().toISOString()
        };

        // Phát tin nhắn cho tất cả những người đang ở trong phòng (Bao gồm cả người gửi)
        io.to(roomName).emit('chat:message', messagePayload);

        //Chỗ này sau này sẽ gọi hàm lưu tin nhắn vào Database (MongoDB) 
        // Ví dụ: await ChatMessage.create({ incidentId, senderId, text });
    });

    socket.on('chat:leave', (data) => {
        const { incidentId, userId } = data;
        const roomName = `incident_chat:${incidentId}`;

        socket.leave(roomName);
        socket.currentChatRoom = null;
        console.log(`[CHAT] User (${userId}) đã rời phòng: ${roomName}`);
    });
});

const startServer = async () => {
    try {
        await connectDB();
        console.log('Database connected successfully');

        require('./jobs/autoAssign');
        console.log('Bull Queue Worker đã được khởi động!');

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
            console.log(`🔗 API docs: http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error('Không thể khởi động server do lỗi DB:', error);
        process.exit(1); // Thoát nếu DB không kết nối được
    }
};

startServer();