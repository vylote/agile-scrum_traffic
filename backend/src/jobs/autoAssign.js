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
    const { incidentId, lastTargetTeamId, startTime = Date.now() } = job.data;
    const now = Date.now();
    const elapsed = ((now - startTime) / 1000).toFixed(1);
    const logPrefix = `[⏱️ T+${elapsed}s][Vụ:${incidentId}]`;

    console.log(`\n--- 🚀 ${logPrefix} WORKER START ---`);

    try {
        let incident = await Incident.findById(incidentId);
        if (!incident) return console.log(`${logPrefix} ❌ Lỗi: Incident không tồn tại`);

        // Kiểm tra trạng thái: Nếu đã có đội nhận (ASSIGNED/IN_PROGRESS) thì dừng Job thừa ngay
        if (incident.status !== INCIDENT_STATUS.PENDING) {
            console.log(`${logPrefix} 🛑 Dừng: Đơn đã được xử lý (Status: ${incident.status})`);
            return;
        }

        // 1. Kiểm tra Chốt chặn SOS (Báo Dispatcher nếu quá 2 lần gán thất bại)
        if (incident.attemptCount >= 2) {
            console.log(`${logPrefix} 🚨 KÍCH HOẠT SOS: Chuyển điều phối tay cho Dispatcher`);
            const io = socketService.getIO();
            if (io) {
                // Đánh dấu vào DB để giao diện Dispatcher hiện màu đỏ
                await Incident.findByIdAndUpdate(incidentId, { needsIntervention: true });
                
                io.to('room:dispatchers').emit('dispatcher:manual_intervention_required', { 
                    incident: incident.toObject(),
                    reason: "Không có đội nào tiếp nhận sau 2 lần gán tự động."
                });
            }
            return;
        }

        // 2. Blacklist đội cũ (nếu Job này chạy do đội trước đó hết 30s mà không phản hồi)
        if (lastTargetTeamId) {
            console.log(`${logPrefix} ⏰ Timeout: Blacklist đội [${lastTargetTeamId}]`);
            incident = await Incident.findByIdAndUpdate(
                incidentId, 
                { $addToSet: { rejectedTeams: lastTargetTeamId } }, 
                { new: true }
            );
            // Thu hồi Popup trên máy của đội bị timeout
            socketService.getIO()?.to(`team:${lastTargetTeamId}`).emit('rescue:revoke_request');
        }

        // 3. Tìm đội cứu hộ mới phù hợp nhất (Online + Gần nhất + Không nằm trong Blacklist)
        const result = await findBestRescueTeam(incident);
        
        if (result) {
            const { team } = result;
            console.log(`${logPrefix} ✅ Đã tìm thấy đội: ${team.name}`);

            // Cập nhật đơn hàng: Gán đội và tăng số lần thử (attemptCount)
            const updatedInc = await Incident.findByIdAndUpdate(
                incidentId, 
                { assignedTeam: team._id, $inc: { attemptCount: 1 } },
                { new: true }
            ).populate('reportedBy', 'name phone').populate('assignedTeam', 'name code');

            // 📡 Phát lệnh điều động trực tiếp tới máy Leader của đội đó
            socketService.sendRequestToTeam(team._id.toString(), {
                incident: updatedInc.toObject(),
                timeout: 30
            });

            // 🔥 FIX CHÍ MẠNG: CHỈ ADD 1 JOB DUY NHẤT
            // Job này sẽ đợi 30.5 giây. Nếu đội không Accept/Reject, Worker sẽ tự "thức dậy" để tìm đội khác.
            // Sử dụng jobId cố định để Controller có thể dễ dàng xóa (remove) khi có người bấm nút.
            const nextTimeoutJobId = `dispatch_${incidentId}`;
            
            // Xóa Job cũ nếu còn tồn tại (để chắc chắn không bị trùng)
            const oldJob = await autoDispatchQueue.getJob(nextTimeoutJobId);
            if (oldJob) await oldJob.remove();

            // Thêm Job mới
            await autoDispatchQueue.add(
                { incidentId, lastTargetTeamId: team._id.toString(), startTime },
                { 
                    delay: 30500, 
                    jobId: nextTimeoutJobId, // ID cố định theo vụ việc
                    removeOnComplete: true 
                } 
            );
            
            console.log(`${logPrefix} 🎯 Đã gán đơn lần ${updatedInc.attemptCount}. Đang đợi 30s...`);

        } else {
            // Trường hợp không tìm thấy bất kỳ đội nào Online trong vùng
            console.log(`${logPrefix} ❌ Không tìm thấy đội khả dụng. Báo SOS ngay.`);
            socketService.getIO()?.to('room:dispatchers').emit('dispatcher:manual_intervention_required', { incident });
        }
    } catch (e) {
        console.error(`${logPrefix} 🔥 LỖI WORKER:`, e);
    }
});

module.exports = autoDispatchQueue;