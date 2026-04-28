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

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        }

        const geoData = await geoService.reverseGeocode(latitude, longitude);
        const address = geoData.display_name;
        const detectedZone = geoData.zone_detected;

        console.log("📍 Địa chỉ full từ OSM:", address);
        console.log("📍 ZONE cắt ra được để lưu vào DB:", detectedZone);

        const photos = req.files ? req.files.map(file => file.filename) : [];

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

        const io = req.app.get('io');
        if (io) {
            io.to('room:dispatchers').emit('incident:new', { incident: newIncident });
            io.to(`zone:${detectedZone}`).emit('incident:new', { incident: newIncident });
        }

        const dispatchQueue = require('../jobs/autoAssign');
        await dispatchQueue.add({
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

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        }

        const geoData = await geoService.reverseGeocode(latitude, longitude);
        const address = geoData.display_name;
        const detectedZone = geoData.zone_detected;

        console.log("📍 Địa chỉ full từ OSM:", address);
        console.log("📍 ZONE cắt ra được để lưu vào DB:", detectedZone);

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

        const io = req.app.get('io');
        if (io) {
            // Cảnh báo SOS khẩn cấp toàn hệ thống với priority 'HIGH'
            io.emit('alert:sos', {
                incident: sosIncident,
                priority: 'HIGH'
            });
            io.to('room:dispatchers').emit('incident:new', { incident: sosIncident });
        }

        // 🔥 THÊM ĐOẠN NÀY ĐỂ GỌI XE TỰ ĐỘNG CHO SOS:
        const dispatchQueue = require('../jobs/autoAssign');
        await dispatchQueue.add({
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

exports.updateIncidentInfo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, latitude, longitude, address, status, type, severity, keepPhotos } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        const existIncident = await Incident.findById(id);
        if (!existIncident) {
            return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));
        }

        let finalPhotos = [];
        let photosToDelete = [];
        if (keepPhotos === undefined && (!req.files || req.files.length === 0)) {
            finalPhotos = existIncident.photos;
        } else {
            let finalKeepPhotos = [];
            if (keepPhotos) {
                finalKeepPhotos = Array.isArray(keepPhotos) ? keepPhotos : [keepPhotos];
            }

            photosToDelete = existIncident.photos.filter(p => !finalKeepPhotos.includes(p));
            console.log(`so luog anh xoa la: ${photosToDelete.length}`)

            const newPhotos = req.files && req.files.length > 0
                ? req.files.map(file => file.filename)
                : [];

            finalPhotos = [...finalKeepPhotos, ...newPhotos];
        }

        let finalLocation = existIncident.location;
        if (latitude && longitude) {
            let finalAddress;
            if (address) {
                finalAddress = address;
            } else {
                const geoData = await geoService.reverseGeocode(latitude, longitude);
                finalAddress = geoData.display_name;
            }
            finalLocation = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: finalAddress
            };
        }

        const updateDoc = await Incident.findByIdAndUpdate(
            id,
            {
                title: title || existIncident.title,
                description: description || existIncident.description,
                type: type || existIncident.type,
                severity: severity || existIncident.severity,
                location: finalLocation,
                photos: finalPhotos,
                status: status || existIncident.status
            },
            { new: true, runValidators: true }
        );

        if (photosToDelete.length > 0) {
            // Không dùng await ở đây để tránh block response trả về cho user
            photosToDelete.forEach(async (imgName) => {
                const filePath = path.join(__dirname, '../../uploads', imgName);
                try {
                    await fs.access(filePath);
                    await fs.unlink(filePath);
                    console.log(`Đã xóa file thừa: ${imgName}`);
                } catch (err) {
                    console.log(`File không tồn tại hoặc lỗi xóa: ${imgName}`);
                }
            });
        }

        const io = req.app.get('io');
        if (io) io.emit('incident:infor_updated', { incident: updateDoc });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, updateDoc);
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
            const deletePromise = deleteDoc.photos.map(async (imgName) => {
                const filePath = path.join(__dirname, '../../uploads', imgName)

                try {
                    await fs.access(filePath)
                    return fs.unlink(filePath)
                } catch (err) {
                    console.log(`file k ton tai: ${imgName}`)
                    return null
                }
            })

            // === là sao sánh k ép kiểu nó khác với == có ép kiểu
            Promise.allSettled(deletePromise).then(result => {
                result.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value !== null)
                        console.log(`Da xoa xong anh: ${deleteDoc.photos[index]} `)
                })
            })
        }

        const io = req.app.get('io');
        if (io) io.emit('delete_incident', { incidentId: id });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, deleteDoc);
    } catch (err) {
        next(err);
    }
};

exports.getAllIncidents = async (req, res, next) => {
    try {
        const { page, type, severity, status, zone, assignedTeam } = req.query

        let limit;
        if (req.user.role === USER_ROLES.CITIZEN) {
            limit = 100; // Người dân: cho xem nhiều để cuộn (scroll)
        } else {
            limit = 10;  // Dispatcher/Admin: cố định 10 dòng để giữ Layout Desktop chuẩn
        }
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit

        const filter = {}
        if (type) filter.type = type
        if (severity) filter.severity = severity
        if (zone) filter.zone = zone
        if (assignedTeam) filter.assignedTeam = assignedTeam;

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
            
            // Populate members.userId để lấy fcmToken của Leader
            const updatedTeam = await RescueTeam.findByIdAndUpdate(
                teamData._id, 
                { status: RESCUE_TEAM_STATUS.BUSY, activeIncident: id },
                { new: true }
            ).populate('members.userId'); 

            if (updatedTeam) {
                const leader = updatedTeam.members.find(m => m.role === 'LEADER');
                if (leader?.userId?.fcmToken) {
                    // Bắn thông báo cho đội cứu hộ (dùng hàm đã sửa của Vy)
                    notificationService.notifyRescueAssignment(leader.userId, currentInc)
                        .catch(err => console.error("Lỗi FCM Rescue:", err.message));
                }
            }
        } else if (status === INCIDENT_STATUS.COMPLETED || status === INCIDENT_STATUS.CANCELLED) {
            if (status === INCIDENT_STATUS.CANCELLED) {
                updateData.assignedTeam = null; 
            }
            if (oldTeamId) {
                await RescueTeam.findByIdAndUpdate(oldTeamId, {
                    status: RESCUE_TEAM_STATUS.AVAILABLE,
                    activeIncident: null
                });
            }
            if (status === INCIDENT_STATUS.COMPLETED) updateData.resolvedAt = Date.now();
        }

        const updatedIncident = await Incident.findOneAndUpdate(
            updateQuery,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedTeam', 'name code').populate('reportedBy');

        if (!updatedIncident) {
            return next(new AppError(ErrorCodes.INCIDENT_INVALID_STATUS));
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('incident:updated', { id, status, incident: updatedIncident });
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

    try {
        const incident = await Incident.findByIdAndUpdate(
            incidentId,
            { $addToSet: { rejectedTeams: teamId } },
            { new: true }
        );

        const ghostJobIds = [
            `dispatch_${incidentId}_step_1`,
            `dispatch_${incidentId}_step_2`,
            `dispatch_${incidentId}_broadcast`
        ];

        for (const ghostId of ghostJobIds) {
            const oldJob = await autoDispatchQueue.getJob(ghostId);
            if (oldJob) {
                // Phải gọi remove() để xóa nó khỏi Redis hoàn toàn
                await oldJob.remove();
                console.log(`Đã tiêu diệt Ghost Job đang đếm ngược: [${ghostId}]`);
            }
        }

        // 3. Thu hồi popup máy vừa bấm
        const io = req.app.get('io'); // Lấy instance io từ app
        if (io) {
            io.to(`team:${teamId}`).emit('rescue:revoke_request');
        }

        // 4. KIỂM TRA ĐIỀU KIỆN NHẢY ĐƠN
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
    } catch (error) {
        console.error("Lỗi tại rejectIncident:", error);
        next(error);
    }
};

exports.confirmArrival = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { currentLat, currentLng } = req.body; // Vị trí GPS hiện tại của đội

        const incident = await Incident.findById(id);
        if (!incident) return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));

        // 🚩 KIỂM TRA KHOẢNG CÁCH 100M
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

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incident);
    } catch (error) { next(error); }
};