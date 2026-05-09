const Incident = require('../models/Incident');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');
const { calculateHaversine } = require('../utils/geoUtils');
const geoService = require('../services/geoService');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { INCIDENT_TYPES, INCIDENT_STATUS, INCIDENT_SEVERITY, ALL_STATUS } = require('../utils/constants/incidentConstants');
const { USER_ROLES } = require('../utils/constants/userConstants');
const { timeStamp } = require('console');
const RescueTeam = require('../models/RescueTeam')
const { RESCUE_TEAM_STATUS } = require('../utils/constants/rescueConstants')
const autoDispatchQueue = require('../jobs/autoAssign');
const notificationService = require('../services/notificationService');

exports.createIncident = async (req, res, next) => {
    try {
        const { title, description, latitude, longitude, type, severity } = req.body;

        const geoData = await geoService.reverseGeocode(latitude, longitude);
        const address = geoData.display_name;
        const detectedZone = geoData.zone_detected;

        console.log("full address from OSM: ", address);
        console.log("zone was cut for saving into db: ", detectedZone);

        const photos = req.files ? req.files.map(file => file.path) : [];

        const initTimeLine = [{
            status: INCIDENT_STATUS.PENDING,
            updatedBy: req.user._id,
            note: 'Người dân đã báo cáo chi tiết',
            timeStamp: Date.now()
        }]

        const newIncident = await Incident.create({
            reportedBy: req.user._id,
            title,
            description,
            type: type,
            severity: severity || INCIDENT_SEVERITY.LOW,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: address
            },
            zone: detectedZone,
            photos: photos,
            status: INCIDENT_STATUS.PENDING,
            timeline: initTimeLine
        });

        if (req.user && req.user.fcmToken) {
            notificationService.notifyCitizenStatus(req.user, newIncident, "Đã tiếp nhận yêu cầu. Hệ thống đang tìm đội cứu hộ gần nhất...")
                .catch(err => console.error("Lỗi Push PENDING (Thường):", err.message));
        }

        const io = req.app.get('io');
        if (io) {
            io.to('room:dispatchers').emit('incident:new', { incident: newIncident });
            io.to(`zone:${detectedZone}`).emit('incident:new', { incident: newIncident });
        }

        const dispatchQueue = require('../jobs/autoAssign');
        dispatchQueue.add({
            incidentId: newIncident._id
        }, {
            delay: 1000, // Chờ 1 giây để đảm bảo DB đã lưu xong và Socket đã phát
            attempts: 3, // Thử lại 3 lần nếu OSRM lỗi mạng
            backoff: 5000 // Cách nhau 5s
        });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, newIncident);
    } catch (err) {
        next(err);
    }
};

exports.createSOS = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.body;

        // if (!latitude || !longitude) {
        //     return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        // }

        const geoData = await geoService.reverseGeocode(latitude, longitude);
        const address = geoData.display_name;
        const detectedZone = geoData.zone_detected;

        console.log("Địa chỉ full từ OSM:", address);
        console.log("ZONE cắt ra được để lưu vào DB:", detectedZone);

        const sosIncident = await Incident.create({
            reportedBy: req.user._id,
            title: "YÊU CẦU CỨU HỘ KHẨN CẤP (SOS)",
            description: "ưu tiên cứu hộ khẩn cấp",
            type: INCIDENT_TYPES.OTHER,
            severity: INCIDENT_SEVERITY.CRITICAL,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: address
            },
            zone: detectedZone,
            status: INCIDENT_STATUS.PENDING,
            timeline: [{
                status: INCIDENT_STATUS.PENDING,
                updatedBy: req.user._id,
                note: 'Tín hiệu SOS khẩn cấp được phát đi.',
                timestamp: Date.now()
            }]
        });

        if (req.user && req.user.fcmToken) {
            notificationService.notifyCitizenStatus(req.user, sosIncident, "SOS ĐÃ ĐƯỢC KÍCH HOẠT! Vui lòng giữ bình tĩnh, hệ thống đang điều phối xe khẩn cấp.")
                .catch(err => console.error("Lỗi Push PENDING (SOS):", err.message));
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('alert:sos', {
                incident: sosIncident,
                priority: 'HIGH'
            });
            io.to('room:dispatchers').emit('incident:new', { incident: sosIncident });
        }

        // THÊM ĐOẠN NÀY ĐỂ GỌI XE TỰ ĐỘNG CHO SOS:
        const dispatchQueue = require('../jobs/autoAssign');
        dispatchQueue.add({
            incidentId: sosIncident._id
        }, {
            delay: 500,  // Chạy nhanh hơn bình thường (0.5s)
            attempts: 5, // Thử lại 5 lần nếu gọi OSRM lỗi
            backoff: 3000
        });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, sosIncident);
    } catch (err) {
        next(err);
    }
};


exports.deleteIncident = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleteDoc = await Incident.findByIdAndDelete(id);
        if (!deleteDoc) return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));

        if (deleteDoc.assignedTeam) {
            await RescueTeam.findByIdAndUpdate(deleteDoc.assignedTeam, {
                status: RESCUE_TEAM_STATUS.AVAILABLE,
                activeIncident: null
            });
            console.log(`Đã giải phóng đội ${deleteDoc.assignedTeam} sau khi xóa vụ.`);
        }

        if (deleteDoc.photos && deleteDoc.photos.length > 0) {
            const cloudinary = require('cloudinary').v2;
            
            deleteDoc.photos.forEach(photoUrl => {
                // Tách lấy public_id từ URL để xóa
                // Ví dụ: .../incident_photos/abcxyz.jpg -> public_id là "incident_photos/abcxyz"
                const parts = photoUrl.split('/');
                const fileName = parts[parts.length - 1].split('.')[0];
                const publicId = `incident_photos/${fileName}`;
                
                cloudinary.uploader.destroy(publicId).catch(err => console.error("Lỗi xóa Cloudinary:", err));
            });
        }

        const io = req.app.get('io');
        if (io) io.emit('incident:delete', { incidentId: id });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, deleteDoc);
    } catch (err) {
        next(err);
    }
};

exports.getAllIncidents = async (req, res, next) => {
    try {
        const { page, type, severity, status, zone, assignedTeam, search } = req.query

        let limit = req.user.role === USER_ROLES.CITIZEN ? 100 : 10;
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit

        const filter = {}
        if (type) filter.type = type
        if (severity) filter.severity = severity
        if (assignedTeam) filter.assignedTeam = assignedTeam;

        if (zone) filter.zone = { $regex: new RegExp(zone, 'i') };

        if (status) {
            if (status.includes(',')) {
                // Nếu có dấu phẩy (PENDING,ASSIGNED...), biến thành mảng và dùng $in
                const statusArray = status.split(',');
                filter.status = { $in: statusArray };
            } else {
                // Nếu chỉ có 1 status
                filter.status = status;
            }
        }

        if (req.user.role === USER_ROLES.CITIZEN) {
            filter.reportedBy = req.user._id;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { code: searchRegex },
                { title: searchRegex },
                { description: searchRegex } // Nơi chứa biển số xe
            ];
        }

        const total = await Incident.countDocuments(filter)
        const totalPages = Math.ceil(total / limit)

        const incidents = await Incident.find(filter)
            .sort('-createdAt')
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('reportedBy', 'name phone email')
            .populate('assignedTeam', 'name code');

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, {
            pagination: {
                total,
                totalPages,
                currentPage,
                limit
            },
            data: incidents
        });
    } catch (err) {
        next(err);
    }
};

exports.getIncidentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        const incident = await Incident.findById(id).populate('reportedBy', 'name phone email');
        if (!incident) return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incident);
    } catch (err) {
        next(err);
    }
};

exports.getIncidentByCode = async (req, res, next) => {
    try {
        const { code } = req.params;

        const codeRegex = /^[A-Z]{3}-\d{8}-\d{4}$/;

        if (!codeRegex.test(code)) {
            return next(new AppError(ErrorCodes.INCIDENT_INVALID_CODE_FORMAT));
        }

        const incident = await Incident.findOne({ code })
            .populate('reportedBy', 'name phone')
            .select('title status timeLine location.address')

        if (!incident)
            return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incident);
    } catch (err) {
        next(err);
    }
};

exports.updateIncidentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, teamData, note } = req.body;

        if (!ALL_STATUS.includes(status)) {
            return next(new AppError(ErrorCodes.INCIDENT_INVALID_STATUS));
        }

        const isRescue = req.user.role === USER_ROLES.RESCUE;
        if (req.user.role === USER_ROLES.CITIZEN) return next(new AppError(ErrorCodes.AUTH_FORBIDDEN));
        
        const currentInc = await Incident.findById(id);
        if (!currentInc) return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));
        const oldTeamId = currentInc.assignedTeam;

        // ── 1. Atomic query filter (Vá lỗi "Sự cố đã có đội khác nhận") ─────────
        let updateQuery = { _id: id };

        if (status === INCIDENT_STATUS.ASSIGNED) {
            // Cho phép nhận nếu đơn đang PENDING hoặc đã được gán cho chính đội này (do Worker làm)
            updateQuery.$or = [
                { status: INCIDENT_STATUS.PENDING },
                { status: INCIDENT_STATUS.ASSIGNED, assignedTeam: teamData?._id || req.user.rescueTeam?._id }
            ];
        } else if (status === INCIDENT_STATUS.IN_PROGRESS) {
            updateQuery.status = INCIDENT_STATUS.ASSIGNED;
            updateQuery.assignedTeam = teamData?._id || oldTeamId;
        }

        const statusMessages = {
            [INCIDENT_STATUS.ASSIGNED]: 'Đội cứu hộ đã tiếp nhận yêu cầu, đang trên đường.',
            [INCIDENT_STATUS.IN_PROGRESS]: 'Đội cứu hộ đã đến hiện trường, đang xử lý.',
            [INCIDENT_STATUS.COMPLETED]: 'Sự cố đã được xử lý hoàn tất. Cảm ơn bạn!',
            [INCIDENT_STATUS.CANCELLED]: note || 'Sự cố đã bị hủy bởi quản trị viên.'
        };

        const updateData = {
            status,
            $push: {
                timeline: {
                    status,
                    updatedBy: req.user._id,
                    note: note || statusMessages[status] || `Trạng thái: ${status}`,
                    timestamp: Date.now()
                }
            }
        };

        if (status === INCIDENT_STATUS.ASSIGNED && teamData?._id) {
            updateData.assignedTeam = teamData._id;
        } else if (status === INCIDENT_STATUS.CANCELLED) {
            updateData.assignedTeam = null; 
        }
        if (status === INCIDENT_STATUS.COMPLETED) {
            updateData.resolvedAt = Date.now();
        }

        const updatedIncident = await Incident.findOneAndUpdate(
            updateQuery,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedTeam', 'name code').populate('reportedBy');

        if (!updatedIncident) {
            return next(new AppError(ErrorCodes.INCIDENT_INVALID_STATUS));
        }

        if (status === INCIDENT_STATUS.ASSIGNED && teamData?._id) {
            const updatedTeam = await RescueTeam.findByIdAndUpdate(
                teamData._id, 
                { status: RESCUE_TEAM_STATUS.BUSY, activeIncident: id },
                { new: true }
            ).populate('members.userId'); 

            if (updatedTeam) {
                const leader = updatedTeam.members.find(m => m.role === 'LEADER');
                if (leader?.userId?.fcmToken) {
                    // Bắn thông báo cho đội cứu hộ 
                    notificationService.notifyRescueAssignment(leader.userId, currentInc)
                        .catch(err => console.error("Lỗi FCM Rescue:", err.message));
                }
            }
        } else if (status === INCIDENT_STATUS.COMPLETED || status === INCIDENT_STATUS.CANCELLED) {
            if (oldTeamId) {
                await RescueTeam.findByIdAndUpdate(oldTeamId, {
                    status: RESCUE_TEAM_STATUS.AVAILABLE,
                    activeIncident: null
                });
            }
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('incident:updated', { id, status, incident: updatedIncident });

            io.emit('rescue:location', { 
                teamId: updatedIncident.assignedTeam?._id || oldTeamId, 
                status: status === INCIDENT_STATUS.ASSIGNED ? 'BUSY' : 'AVAILABLE' 
            });

            if (status === INCIDENT_STATUS.PENDING) {
                io.to(`zone:${updatedIncident.zone}`).emit('incident:new', { incident: updatedIncident });
            }
        }

        const citizen = updatedIncident.reportedBy;
        if (citizen?.fcmToken && statusMessages[status]) {
            notificationService.notifyCitizenStatus(citizen, updatedIncident, statusMessages[status])
                .catch(err => console.error("Lỗi FCM Citizen:", err.message));
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, updatedIncident);
    } catch (err) {
        next(err);
    }
};

exports.rejectIncident = async (req, res, next) => {
    const incidentId = req.params.id;
    const teamId = req.user.rescueTeam?._id;

    const logPrefix = `[API BỎ QUA][Vụ:${incidentId}]`;

    try {
        console.log(`${logPrefix} Đội ${teamId} vừa gửi yêu cầu BỎ QUA đơn.`);

        // 1. DÙNG ATOMIC UPDATE ĐỂ MỞ KHÓA
        const incident = await Incident.findOneAndUpdate(
            { _id: incidentId, assignedTeam: teamId, status: INCIDENT_STATUS.PENDING },
            { 
                $addToSet: { rejectedTeams: teamId },
                $unset: { assignedTeam: "" } // Mở khóa cho đội khác
            },
            { new: true }
        );

        if (!incident) {
            console.log(`${logPrefix} Đơn không còn PENDING hoặc không thuộc về đội này nữa. Hủy thao tác.`);
            return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, { message: "Đơn này đã được xử lý." });
        }

        const ghostJobIds = [
            `dispatch_${incidentId}_step_1`,
            `dispatch_${incidentId}_step_2`,
            `dispatch_${incidentId}_broadcast`
        ];

        for (const ghostId of ghostJobIds) {
            try {
                const oldJob = await autoDispatchQueue.getJob(ghostId);
                if (oldJob) {
                    const state = await oldJob.getState();
                    console.log(`${logPrefix} Tìm thấy Job [${ghostId}] đang ở trạng thái: ${state}`);

                    if (state === 'delayed' || state === 'waiting') {
                        await oldJob.remove();
                        console.log(`${logPrefix} Đã chém thành công Job: [${ghostId}]`);
                    } else {
                        console.log(`${logPrefix} Bỏ qua Job [${ghostId}] vì nó đang chạy (active/completed).`);
                    }
                }
            } catch (jobErr) {
                console.log(`${logPrefix} LỖI KHI XÓA JOB [${ghostId}]: ${jobErr.message}`);
            }
        }

        const io = req.app.get('io'); // Lấy instance io từ app
        if (io) {
            io.to(`team:${teamId}`).emit('rescue:revoke_request');
            console.log(`${logPrefix} Đã báo Socket thu hồi UI của đội ${teamId}`);
        }

        if (incident.attemptCount >= 2) {
            console.log("Đã thử qua 2 đội. Báo SOS cho Dispatcher!");
            if (io) {
                io.to('room:dispatchers').emit('dispatcher:manual_intervention_required', {
                    incident: incident.toObject(),
                    reason: "Toàn bộ đội được gán tự động đều từ chối."
                });
            }
        } else {
            //Ép tạo Job mới chạy ngay (delay cực ngắn 50ms)
            // Dùng ID mới để không bị Bull Queue chặn
            const nextJobId = `dispatch_${incidentId}_retry_${Date.now()}`;
            await autoDispatchQueue.add(
                { incidentId, startTime: Date.now() },
                { jobId: nextJobId, delay: 50, priority: 1 }
            );
            console.log(`Chuyển đơn thành công! (Job: ${nextJobId})`);
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, { message: "Đã từ chối" });
    } catch (err) {
        console.error("Lỗi tại rejectIncident:", err);
        next(err);
    }
};

exports.confirmArrival = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { currentLat, currentLng } = req.body; // Vị trí GPS hiện tại của đội

        const incident = await Incident.findById(id);
        if (!incident) return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));

        //KIỂM TRA KHOẢNG CÁCH 100M
        const distance = calculateHaversine(
            currentLat, currentLng,
            incident.location.coordinates[1], incident.location.coordinates[0]
        );

        if (distance > 100) {
            return next(new AppError("Bạn phải cách hiện trường dưới 100m để xác nhận đến nơi.", 400));
        }

        // Cập nhật trạng thái
        incident.status = INCIDENT_STATUS.IN_PROGRESS;
        incident.timeline.push({
            status: INCIDENT_STATUS.IN_PROGRESS,
            updatedBy: req.user._id,
            note: 'Đội cứu hộ đã đến hiện trường.',
            timestamp: Date.now()
        });
        await incident.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('incident:updated', { 
                id: incident._id, 
                status: INCIDENT_STATUS.IN_PROGRESS, 
                incident: incident 
            });
        }

        //Bắn Push Notification báo người dân 
        await incident.populate('reportedBy'); // Lấy info người dân để lấy fcmToken
        const citizen = incident.reportedBy;
        if (citizen?.fcmToken) {
            notificationService.notifyCitizenStatus(
                citizen, 
                incident, 
                "Đội cứu hộ đã đến hiện trường, đang xử lý."
            ).catch(err => console.error("Lỗi Push IN_PROGRESS:", err.message));
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incident);
    } catch (error) { next(error); }
};