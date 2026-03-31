const Incident = require('../models/Incident');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');
const geoService = require('../services/geoService');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { INCIDENT_TYPES, INCIDENT_STATUS, INCIDENT_SEVERITY, ALL_STATUS } = require('../utils/constants/incidentConstants');
const { USER_ROLES } = require('../utils/constants/userConstants');

/**
 * @swagger
 * /api/v1/incidents/:
 *   post:
 *     summary: Báo cáo sự cố mới
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     description: Chỉ dành cho người dùng có role **CITIZEN**. Cho phép tải lên tối đa 5 ảnh.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, latitude, longitude, type]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tai nạn giao thông"
 *               description:
 *                 type: string
 *                 example: "Va chạm giữa xe máy và ô tô"
 *               type:
 *                 type: string
 *                 enum: [ACCIDENT, BREAKDOWN, FLOOD, FIRE, OTHER]
 *                 example: ACCIDENT
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 example: MEDIUM
 *               latitude:
 *                 type: number
 *                 example: 21.0285
 *               longitude:
 *                 type: number
 *                 example: 105.8542
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Tạo sự cố thành công
 *       400:
 *         description: Thiếu tọa độ latitude/longitude
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập (không phải CITIZEN)
 */
exports.createIncident = async (req, res, next) => {
    try {
        const { title, description, latitude, longitude, address, type, severity } = req.body;

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        }

        let finalAddress = address || await geoService.reverseGeocode(latitude, longitude);

        const photos = req.files ? req.files.map(file => file.filename) : [];

        const newIncident = await Incident.create({
            reportedBy: req.user._id,
            title,
            description,
            type: type || INCIDENT_TYPES.OTHER,
            severity: severity || INCIDENT_SEVERITY.MEDIUM,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)], // [Kinh độ, Vĩ độ]
                address: finalAddress
            },
            photos: photos,
            status: INCIDENT_STATUS.PENDING
        });

        // Socket thông báo thời gian thực
        const io = req.app.get('io');
        if (io) {
            io.emit('incident:new', {
                message: 'Có sự cố mới vừa được báo cáo!',
                incident: newIncident
            });
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, newIncident);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /api/v1/incidents/sos:
 *   post:
 *     summary: Gửi tín hiệu SOS khẩn cấp
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     description: Tạo ngay một sự cố với mức độ **CRITICAL** và loại **ACCIDENT**. Không cần tiêu đề hay mô tả.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 21.0285
 *               longitude:
 *                 type: number
 *                 example: 105.8542
 *     responses:
 *       200:
 *         description: Gửi SOS thành công, socket event `incident:sos` được phát đi
 *       400:
 *         description: Thiếu tọa độ latitude/longitude
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 */
exports.createSOS = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        }

        const address = await geoService.reverseGeocode(latitude, longitude);

        const sosIncident = await Incident.create({
            reportedBy: req.user._id,
            title: "YÊU CẦU CỨU HỘ KHẨN CẤP (SOS)",
            description: "ưu tiên cứu hộ khẩn cấp",
            type: INCIDENT_TYPES.ACCIDENT,
            severity: INCIDENT_SEVERITY.CRITICAL,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address
            },
            status: INCIDENT_STATUS.PENDING
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('alert:sos', {
                message: 'xuât hiện sự cố khẩn cấp!',
                incident: sosIncident
            });
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, sosIncident);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /api/v1/incidents/{id}/info:
 *   patch:
 *     summary: Cập nhật thông tin sự cố
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của sự cố cần cập nhật
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tai nạn đã được xử lý"
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ACCIDENT, BREAKDOWN, FLOOD, FIRE, OTHER]
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               keepPhotos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách TÊN các ảnh cũ muốn giữ lại (ví dụ ["image-123.jpg"])
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Tải lên các ảnh MỚI (nếu có)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy sự cố
 */
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
            const finalAddress = address || await geoService.reverseGeocode(latitude, longitude);
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

/**
 * @swagger
 * /api/v1/incidents/delete/{id}:
 *   delete:
 *     summary: Xóa sự cố và ảnh vật lý liên quan
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của sự cố cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 *       404:
 *         description: Không tìm thấy sự cố
 */
exports.deleteIncident = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleteDoc = await Incident.findByIdAndDelete(id);
        if (!deleteDoc) return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));

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

/**
 * @swagger
 * /api/v1/incidents:
 *   get:
 *     summary: Lấy danh sách tất cả sự cố
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sự cố, sắp xếp mới nhất lên đầu
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 */
exports.getAllIncidents = async (req, res, next) => {
    try {
        const { page, type, severity, status } = req.query

        const limit = 5
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit

        const filter = {}
        if (type) filter.type = type
        if (severity) filter.severity = severity
        if (status) filter.status = status

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

/**
 * @swagger
 * /api/v1/incidents/{id}:
 *   get:
 *     summary: Lấy chi tiết một sự cố theo ID
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID của sự cố cần xem
 *     responses:
 *       200:
 *         description: Chi tiết sự cố
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 *       404:
 *         description: Không tìm thấy sự cố
 */
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

/**
 * @swagger
 * /api/v1/incidents/track/{code}:
 *   get:
 *     summary: Lấy chi tiết một sự cố theo code
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         description: Mã của sự cố cần xem
 *     responses:
 *       200:
 *         description: Chi tiết sự cố
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 *       404:
 *         description: Không tìm thấy sự cố
 */
exports.getIncidentByCode = async (req, res, next) => {
    try {
        const { code } = req.params;

        const codeRegex = /^[A-Z]{3}-\d{8}-\d{4}$/;

        if (!codeRegex.test(code)) {
            return next(new AppError(ErrorCodes.INCIDENT_INVALID_CODE_FORMAT));
        }

        const incident = await Incident.findOne({ code })
            .populate('reportedBy', 'name phone')

        if (!incident)
            return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incident);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /api/v1/incidents/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái sự cố
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của sự cố
 *         example: "664f1b2c9a4e2d001f3a7b12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RESOLVED, CLOSED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 *       404:
 *         description: Không tìm thấy sự cố
 */
exports.updateIncidentStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!ALL_STATUS.includes(status)) {
            return next(new AppError(ErrorCodes.INCIDENT_INVALID_STATUS))
        }

        const incident = await Incident.findByIdAndUpdate(
            id,
            {
                status,
                // Dùng $push của MongoDB để nhét thêm 1 dòng lịch sử mới vào mảng timeline
                $push: {
                    timeline: {
                        status: status,
                        updatedBy: req.user._id,
                        note: `Trạng thái cập nhật thành ${status}`,
                        timestamp: Date.now()
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!incident)
            return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND))

        const io = req.app.get('io');
        if (io) {
            io.emit('incident:updated', {
                message: 'Sự cố đã được cập nhật!',
                incident: incident
            });
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incident)
    } catch (err) {
        next(err)
    }
}