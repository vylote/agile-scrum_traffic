const Queue = require('bull');
const redisConfig = require('../config/redis');
const Incident = require('../models/Incident');
const User = require('../models/User'); 
const { findBestRescueTeam } = require('../services/assignment');
const socketService = require('../services/socket');
const notificationService = require('../services/notificationService'); 
const { INCIDENT_STATUS } = require('../utils/constants/incidentConstants');
const { TEAM_ROLES } = require('../utils/constants/rescueConstants');

const autoDispatchQueue = new Queue('auto-dispatch', {
    redis: { host: redisConfig.host, port: redisConfig.port }
});

// chạy tối đa 5 job song song
autoDispatchQueue.process(5, async (job) => {
    const { incidentId, lastTargetTeamId } = job.data;

    let logPrefix = `[Vụ:${incidentId}]`;
    try {
        let incident = await Incident.findById(incidentId);
        if (!incident) return console.log(`${logPrefix} Incident không tồn tại`);

        const startTime = incident.createdAt.getTime();
        const now = Date.now();
        const elapsed = ((now - startTime) / 1000).toFixed(1); //elapse: thời gian đã trôi qua
        logPrefix = `[T+${elapsed}s][Vụ:${incidentId}]`;

        if (incident.status !== INCIDENT_STATUS.PENDING) {
            console.log(`${logPrefix} Đơn đã được xử lý (Status: ${incident.status})`);
            return;
        }

        // --- CHIẾN THUẬT ĐIỀU PHỐI TẦNG (TIERED DISPATCH) ---

        //GIAI ĐOẠN 4: SOS (Khi đã thử gán 2 lần và Broadcast 1 lần vẫn thất bại)
        if (incident.attemptCount >= 3) {
            console.log(`${logPrefix} SOS: Toàn bộ khu vực không phản hồi. Báo Dispatcher.`);
            const io = socketService.getIO();
            if (io) {
                await Incident.findByIdAndUpdate(incidentId, { needsIntervention: true });
                io.to('room:dispatchers').emit('dispatcher:manual_intervention_required', { 
                    incident: incident.toObject(),
                    reason: "Không có đội nào nhận sau khi đã phát loa toàn vùng."
                });
                // Bắn thêm Push cho Dispatcher nếu cần
            }
            return;
        }

        //GIAI ĐOẠN 3: PHÁT LOA TOÀN KHU VỰC (Sau 2 lần gán đơn lẻ thất bại)
        if (incident.attemptCount === 2) {
            console.log(`${logPrefix} BROADCAST: Đang phát loa cho toàn bộ đội trong vùng [${incident.zone}]`);
            
            const io = socketService.getIO();
            if (io) {
                // 1. Socket: Hiện slider "giật đơn" cho tất cả đội trong Zone
                io.to(`zone:${incident.zone}`).emit('incident:broadcast', { incident });

                // 2. Firebase: Bắn thông báo đẩy cho toàn bộ khu vực (dùng Topic)
                notificationService.sendPushNotificationToTopic(
                    `zone_${incident.zone}`, // Các máy cứu hộ khi login phải subscribe vào topic này
                    "CẦN CỨU HỘ KHẨN CẤP",
                    `Vụ việc tại ${incident.location.address} vẫn chưa có đội tiếp nhận!`,
                    { incidentId: incidentId.toString(), type: "BROADCAST" }
                ).catch(e => console.error("Firebase Broadcast Error:", e.message));
            }

            // Tăng count lên 3 để lần sau (30s nữa) nếu vẫn ế thì mới báo SOS Dispatcher
            await Incident.findByIdAndUpdate(incidentId, { $inc: { attemptCount: 1 } });
            
            // Tiếp tục đợi 30s nữa cho giai đoạn Broadcast
            const nextJobId = `dispatch_${incidentId}_broadcast`;
            await autoDispatchQueue.add(
                { incidentId, startTime },
                { delay: 30500, jobId: nextJobId, removeOnComplete: true }
            );
            return;
        }

        //GIAI ĐOẠN 1 & 2: GÁN ĐÍCH DANH (Targeted Assignment)
        
        // Blacklist đội vừa timeout (nếu có)
        if (lastTargetTeamId) {
            console.log(`${logPrefix} Timeout: Blacklist đội [${lastTargetTeamId}]`);
            incident = await Incident.findByIdAndUpdate(
                incidentId, 
                { $addToSet: { rejectedTeams: lastTargetTeamId } }, 
                { new: true } //yêu cầu trả về doc mới sau update
            );
            socketService.getIO()?.to(`team:${lastTargetTeamId}`).emit('rescue:revoke_request');
        }

        const result = await findBestRescueTeam(incident);
        
        if (result) {
            //ES6 object destructuring syntax
            const { team } = result; 
            //ATOMIC UPDATE TRONG WORKER (OPTIMISTIC LOCK) khóa lạc quan
            const updatedInc = await Incident.findOneAndUpdate(
                { _id: incidentId, status: INCIDENT_STATUS.PENDING},
                { assignedTeam: team._id, $inc: { attemptCount: 1 } },
                { new: true }
            ).populate('reportedBy', 'name phone').populate('assignedTeam', 'name code');

            if (!updatedInc) {
                console.log('hủy gán: sự cố đã thay đổi trạng thái')
                return;
            }

            // 1. Socket: Gửi popup yêu cầu trực tiếp tới Leader
            socketService.sendRequestToTeam(team._id.toString(), {
                incident: updatedInc.toObject(),
                etaMinutes: result.eta,
                distance: result.distance,
                timeout: 30
            });

            // 2. Firebase: Bắn Push báo Đội trưởng (NFR: Đảm bảo nhận được kể cả khi tắt App)
            const leader = await User.findOne({ 
                rescueTeam: team._id, 
                'members.role': TEAM_ROLES.LEADER 
            });
            if (leader?.fcmToken) {
                notificationService.notifyRescueAssignment(leader, updatedInc)
                    .catch(e => console.error("FCM targeted error:", e.message));
            }

            //Sau 30.5s tự động chạy lại job
            const nextTimeoutJobId = `dispatch_${incidentId}_step_${updatedInc.attemptCount}`;
            await autoDispatchQueue.add(
                { incidentId, lastTargetTeamId: team._id.toString(), startTime },
                { delay: 30500, jobId: nextTimeoutJobId, removeOnComplete: true }
            );
            
            console.log(`${logPrefix} Đã gán đích danh lần ${updatedInc.attemptCount} cho đội: ${team.name}`);

        } else {
            console.log(`${logPrefix} Không tìm thấy đội rảnh. Chuyển sang phát loa ngay.`);
            await Incident.findByIdAndUpdate(incidentId, { attemptCount: 2 });
            await autoDispatchQueue.add({ incidentId, startTime }, { delay: 50 });
        }
    } catch (e) {
        console.error(`${logPrefix} LỖI WORKER:`, e);
    }
});

module.exports = autoDispatchQueue;