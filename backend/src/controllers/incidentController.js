const Incident = require('../models/Incident');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');
const geoService = require('../services/geoService');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); 

/**
 * @swagger
 * /api/v1/incidents/create:
 *   post:
 *     summary: Báo cáo sự cố mới
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
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
 *               type:
 *                 type: string
 *                 enum: [ACCIDENT, BREAKDOWN, FLOOD, FIRE, OTHER]
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Thành công
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
            type: type || 'OTHER',
            severity: severity || 'MEDIUM',
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)], // [Kinh độ, Vĩ độ]
                address: finalAddress
            },
            photos: photos, 
            status: 'PENDING' 
        });

        // Socket thông báo thời gian thực
        const io = req.app.get('io');
        if (io) {
            io.emit('new_incident', {
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
 * /api/v1/incidents/update/{id}:
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
 *               photos: 
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 *       404:
 *         description: Không tìm thấy sự cố
 */
exports.updateIncident = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, latitude, longitude, address, status, type, severity } = req.body;

        const existIncident = await Incident.findById(id);
        if (!existIncident) {
            return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));
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

        const photos = req.files && req.files.length > 0
            ? req.files.map(file => file.filename)
            : existIncident.photos;

        const updateDoc = await Incident.findByIdAndUpdate(
            id,
            {
                title: title || existIncident.title,
                description: description || existIncident.description,
                type: type || existIncident.type,
                severity: severity || existIncident.severity,
                location: finalLocation,
                photos: photos,
                status: status || existIncident.status
            },
            { new: true, runValidators: true }
        );

        const io = req.app.get('io');
        if (io) io.emit('update_incident', { incident: updateDoc });

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

        // Xóa file vật lý bằng tên trường mới 'photos'
        if (deleteDoc.photos && deleteDoc.photos.length > 0) {
            deleteDoc.photos.forEach(imgName => {
                const filePath = path.join(__dirname, '../../uploads', imgName);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
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
        const incidents = await Incident.find()
            .populate('reportedBy', 'name phone email') // Cập nhật theo Schema 7.3
            .sort('-createdAt');

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incidents);
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