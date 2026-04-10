const Queue = require('bull');
const redisConfig = require('../config/redis');
const Incident = require('../models/Incident');
const { findBestRescueTeam } = require('../services/assignment');
const socketService = require('../services/socket');
const { INCIDENT_STATUS } = require('../utils/constants/incidentConstants');

const autoDispatchQueue = new Queue('auto-dispatch', {
    redis: { host: redisConfig.host, port: redisConfig.port }
});

autoDispatchQueue.process(5, async (job) => {
    // 🔥 Lấy startTime từ data, nếu không có thì dùng hiện tại
    const { incidentId, lastTargetTeamId, startTime = Date.now() } = job.data;
    const now = Date.now();
    const elapsed = ((now - startTime) / 1000).toFixed(1);
    const logPrefix = `[⏱️ T+${elapsed}s][Vụ:${incidentId}]`;

    console.log(`\n--- 🚀 ${logPrefix} WORKER START ---`);
    console.log(`🔍 JobID: ${job.id} | Dữ liệu cũ: ${lastTargetTeamId || 'Không'}`);

    try {
        let incident = await Incident.findById(incidentId);
        if (!incident) return console.log(`${logPrefix} ❌ Lỗi: Incident không tồn tại trong DB`);

        console.log(`${logPrefix} 📊 Status: ${incident.status} | Lần thử (attemptCount): ${incident.attemptCount}`);

        if (incident.status !== INCIDENT_STATUS.PENDING) {
            console.log(`${logPrefix} 🛑 Dừng: Đơn đã được xử lý (Status != PENDING)`);
            return;
        }

        // 1. Kiểm tra Escalation (Báo Dispatcher)
        if (incident.attemptCount >= 2) {
            console.log(`${logPrefix} 🚨 TRẠNG THÁI: KÍCH HOẠT SOS DISPATCHER`);
            const io = socketService.getIO();
            
            if (io) {
                const clients = await io.in('room:dispatchers').allSockets();
                console.log(`${logPrefix} 👥 Số Dispatcher đang chờ trong room: ${clients.size}`);
                io.to('room:dispatchers').emit('dispatcher:manual_intervention_required', { 
                    incident: incident.toObject(),
                    reason: "Đã hết lượt điều phối tự động"
                });
            } else {
                console.log(`${logPrefix} ❌ LỖI: Socket IO chưa được khởi tạo!`);
            }
            return;
        }

        // 2. Blacklist đội cũ nếu có
        if (lastTargetTeamId) {
            console.log(`${logPrefix} ⏰ Xử lý Timeout/Blacklist cho Đội: ${lastTargetTeamId}`);
            incident = await Incident.findByIdAndUpdate(
                incidentId, 
                { $addToSet: { rejectedTeams: lastTargetTeamId } }, 
                { new: true }
            );
            socketService.getIO()?.to(`team:${lastTargetTeamId}`).emit('rescue:revoke_request');
        }

        // 3. Tìm đội mới
        const result = await findBestRescueTeam(incident);
        if (result) {
            const { team } = result;
            console.log(`${logPrefix} ✅ Tìm thấy đội phù hợp: ${team.name} (ID: ${team._id})`);

            const updatedInc = await Incident.findByIdAndUpdate(
                incidentId, 
                { assignedTeam: team._id, $inc: { attemptCount: 1 } },
                { new: true }
            ).populate('reportedBy', 'name phone').populate('assignedTeam', 'name code');

            const waitingJobId = `dispatch_${incidentId}`;
            
            await autoDispatchQueue.add(
                { incidentId, lastTargetTeamId: team._id.toString(), startTime },
                { 
                    delay: 30500, 
                    jobId: waitingJobId,
                    removeOnComplete: true 
                } 
            );

            console.log(`${logPrefix} 🎯 Thực hiện gán Lần ${updatedInc.attemptCount}.`);

            socketService.sendRequestToTeam(team._id.toString(), {
                incident: updatedInc.toObject(),
                timeout: 30
            });

            // Đồng bộ ID cố định để dễ quản lý
            const nextJobId = `dispatch_${incidentId}_timeout_${Date.now()}`;
await autoDispatchQueue.add(
    { incidentId, lastTargetTeamId: team._id.toString(), startTime },
    { delay: 30500, jobId: nextJobId }
);
        } else {
            console.log(`${logPrefix} ❌ Không tìm thấy đội nào Online/Gần. Báo Dispatcher ngay.`);
            socketService.getIO()?.to('room:dispatchers').emit('dispatcher:manual_intervention_required', { incident });
        }
    } catch (e) {
        console.error(`${logPrefix} 🔥 LỖI WORKER:`, e);
    }
});

module.exports = autoDispatchQueue;