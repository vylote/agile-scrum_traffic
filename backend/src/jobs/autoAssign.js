// src/jobs/autoAssign.js
const Queue = require('bull');
const redisConfig = require('../config/redis');
const Incident = require('../models/Incident');
const RescueTeam = require('../models/RescueTeam');
const { findBestRescueTeam } = require('../services/assignment');
const { INCIDENT_STATUS } = require('../utils/constants/incidentConstants');
const { RESCUE_TEAM_STATUS } = require('../utils/constants/rescueConstants');

// Khởi tạo Queue
const dispatchQueue = new Queue('auto-dispatch', { redis: redisConfig });

// Định nghĩa Worker xử lý job
dispatchQueue.process(async (job, done) => {
    const { incidentId } = job.data;
    console.log(`[Queue] Bắt đầu xử lý tự động phân công cho sự cố: ${incidentId}`);

    try {
        const incident = await Incident.findById(incidentId);
        
        // Kiểm tra xem sự cố có còn tồn tại và còn PENDING không
        if (!incident || incident.status !== INCIDENT_STATUS.PENDING) {
            console.log(`[Queue] Sự cố ${incidentId} không hợp lệ hoặc đã được xử lý.`);
            return done();
        }

        // Gọi service lõi để tìm đội tốt nhất
        const result = await findBestRescueTeam(incident);

        if (!result) {
            console.log(`[Queue] Không tìm thấy đội phù hợp cho sự cố ${incidentId}. Cần điều phối thủ công.`);
            // Bạn có thể phát một socket event ở đây báo cho Dispatcher biết phải xử lý tay
            return done();
        }

        const { team: bestTeam, etaMinutes } = result;
        console.log(`[Queue] Đã chọn được đội: ${bestTeam.name} (ETA: ${etaMinutes} phút)`);

        // --- Cập nhật Database (Giống logic trong updateIncidentStatus nhưng làm ngầm) ---
        
        // 1. Cập nhật Incident
        incident.status = INCIDENT_STATUS.ASSIGNED;
        incident.assignedTeam = bestTeam._id;
        incident.timeline.push({
            status: INCIDENT_STATUS.ASSIGNED,
            updatedBy: null, // Hoặc ID của System Admin
            note: `Hệ thống tự động phân công đội ${bestTeam.name} (ETA: ~${etaMinutes} phút)`,
            timestamp: Date.now()
        });
        await incident.save();

        // 2. Cập nhật RescueTeam
        await RescueTeam.findByIdAndUpdate(bestTeam._id, {
            status: RESCUE_TEAM_STATUS.BUSY,
            activeIncident: incident._id
        });

        // 3. Chuẩn bị dữ liệu đầy đủ để phát Socket
        await incident.populate('assignedTeam', 'name code');

        // Lấy instance socket (cần cấu trúc lại file server/app để export io)
        // Cách lấy io phụ thuộc vào setup của bạn. Giả sử bạn export từ app.js
        const io = require('../../server').io; 

        if (io) {
            // Phát sự kiện cho tất cả Dispatcher để cập nhật UI
            io.emit('incident:updated', { id: incident._id, status: INCIDENT_STATUS.ASSIGNED, incident });
            
            // Tùy chọn: Phát tin nhắn riêng cho đội vừa được gán để giật màn hình
            // Màn hình RescueHome sẽ nhận qua sự kiện incident:updated, nhưng bạn có thể bắn riêng
            // io.emit(`rescue:auto_assigned:${bestTeam._id}`, { incident });
        }

        done();
    } catch (error) {
        console.error(`[Queue] Lỗi khi xử lý job ${job.id}:`, error);
        done(error); // Báo lỗi để Bull cho vào tab failed
    }
});

module.exports = dispatchQueue;