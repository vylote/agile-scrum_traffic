const Queue = require('bull');
const redisConfig = require('../config/redis');
const Incident = require('../models/Incident');
const { findBestRescueTeam } = require('../services/assignment');
const socketService = require('../services/socket');
const { INCIDENT_STATUS } = require('../utils/constants/incidentConstants');

// 1. Khởi tạo Queue
const autoDispatchQueue = new Queue('auto-dispatch', redisConfig);

autoDispatchQueue.on('error', function (error) {
    console.error('❌ [BullQueue] Lỗi kết nối Redis:', error);
});

autoDispatchQueue.on('ready', function () {
    console.log('✅ [BullQueue] Đã kết nối thành công với Redis và sẵn sàng nhận Job!');
});

// 2. Logic xử lý của Worker
autoDispatchQueue.process(async (job, done) => {
    const { incidentId, rejectedTeamIds = [] } = job.data;
    console.log(`[BullQueue] 🔄 Đang tìm đội cho sự cố: ${incidentId}`);

    try {
        const incident = await Incident.findById(incidentId);
        
        // Nếu sự cố không còn PENDING (đã có đội nhận, hoặc Admin đã hủy/gán tay), dừng Queue
        if (!incident || incident.status !== INCIDENT_STATUS.PENDING) {
            console.log(`[BullQueue] 🛑 Sự cố ${incidentId} không còn PENDING. Hủy bỏ quy trình.`);
            return done();
        }

        // Gọi thuật toán tìm đội tốt nhất, loại trừ những đội đã từ chối
        const result = await findBestRescueTeam(incident, rejectedTeamIds);

        if (!result) {
            console.log(`[BullQueue] ⚠️ Không còn đội rảnh/phù hợp cho sự cố ${incidentId}. Cần Dispatcher can thiệp!`);
            // Bắn còi báo động cho Dispatcher trên Web Admin
            const io = socketService.getIO();
            if (io) io.emit('dispatcher:manual_intervention_required', { incident });
            return done();
        }

        const { team: bestTeam, etaMinutes } = result;
        console.log(`[BullQueue] 🎯 Đề xuất sự cố cho đội: ${bestTeam.name} (ETA: ${etaMinutes} phút)`);

        // 🚀 BẮN SOCKET GỌI ĐỘI CỨU HỘ (KHÔNG SỬA DB THÀNH ASSIGNED Ở BƯỚC NÀY)
        // Chúng ta vẫn giữ status PENDING, chờ họ phản hồi
        socketService.sendRequestToTeam(bestTeam._id, {
            message: "Bạn có yêu cầu cứu hộ mới. Vui lòng phản hồi trong 30 giây!",
            incident: incident,
            etaMinutes: etaMinutes,
            timeoutSec: 30
        });

        // ⏱ TẠO CRONJOB ĐỂ THU HỒI NẾU ĐỘI KHÔNG TRẢ LỜI SAU 30 GIÂY
        // Nếu sau 30s sự cố vẫn còn PENDING (tức là xe kia chưa gọi API gán ASSIGNED), ta tự động thử xe khác.
        setTimeout(async () => {
            const checkIncident = await Incident.findById(incidentId);
            if (checkIncident && checkIncident.status === INCIDENT_STATUS.PENDING) {
                console.log(`[BullQueue] ⏰ Đội ${bestTeam.name} không phản hồi. Chuyển ca sang đội khác...`);
                // Bắn socket thu hồi popup trên máy đội trưởng
                socketService.sendRequestToTeam(bestTeam._id, { action: "revoke_request" });
                
                // Ném lại job vào Queue, đẩy ID xe này vào "danh sách đen" của lượt tìm kiếm này
                autoDispatchQueue.add({
                    incidentId: incidentId,
                    rejectedTeamIds: [...rejectedTeamIds, bestTeam._id]
                });
            }
        }, 30000); // 30.000 ms = 30 giây

        done();
    } catch (error) {
        console.error(`[BullQueue] Lỗi job ${job.id}:`, error);
        done(error);
    }
});

module.exports = autoDispatchQueue;