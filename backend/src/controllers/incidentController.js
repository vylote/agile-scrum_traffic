const Incident = require('../models/Incident');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');
const geoService = require('../services/geoService');
const path = require('path');
const fs = require('fs');
const { default: mongoose } = require('mongoose');

/**
 * @swagger
 * /api/v1/incidents/create:
 *   post:
 *     summary: Báo cáo sự cố mới (Dành cho Citizen)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tai nạn giao thông"
 *               description:
 *                 type: string
 *                 example: "Va chạm giữa 2 xe máy"
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               image:
 *                 type: array
 *                 items:
 *                   type: string    
 *                   format: binary
 *     responses:
 *       200:
 *         description: Thành công
 */
exports.createIncident = async (req, res, next) => {
    try {
        const { title, description, latitude, longitude, address } = req.body;

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        }

        let finalAddress = address;
        if (!finalAddress) {
            finalAddress = await geoService.reverseGeocode(latitude, longitude);
        }

        // const images = req.file ? [req.file.filename] : []; so it
        const images = req.files ? req.files.map(file => file.filename) : [];

        const newIncident = await Incident.create({
            reporterId: req.user.id,
            title,
            description,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: finalAddress
            },
            images: images,
            status: 'Pending'
        });

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
 *         schema:
 *           type: string
 *           description: id của sự cố    
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tai nạn giao thông"
 *               description:
 *                 type: string
 *                 example: "va chạm giữa 2 boi phố"
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Thành công
 */
exports.updateIncident = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, latitude, longitude, address } = req.body;

        const existIncident = await Incident.findById(id);

        if (!existIncident) {
            return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND));
        }

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        }

        let finalTitle = title || existIncident.title;
        let finalAddress = address || existIncident.location.address;
        let finalLocation = existIncident.location;

        if (latitude && longitude) {
            if (!address) {
                finalAddress = await geoService.reverseGeocode(latitude, longitude);
            }
            finalLocation = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: finalAddress
            }
        }

        const images = req.files && req.files.length > 0
            ? req.files.map(file => file.filename)
            : existIncident.images;

        const updateDoc = await Incident.findByIdAndUpdate(
            id,
            {
                title: finalTitle,
                description,
                location: finalLocation,
                images: images,
                status: 'Pending' || existIncident.status
            },
            {new: true, runValidators: true}
        );

        const io = req.app.get('io');
        if (io) {
            io.emit('update_incident', {
                message: 'Một sự cố mới vừa được cập nhật!',
                incident: updateDoc
            });
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, updateDoc);
    } catch (err) {
        next(err);
    }
};
/**
 * @swagger
 * /api/v1/incidents/delete/{id}:
 *   delete:
 *     summary: Xóa thông tin sự cố
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         require: true
 *         schema:
 *           type: string
 *           description: id cần xóa 
 *     responses:
 *       200:
 *         description: Thành công     
 */
exports.deleteIncident = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleteDoc = await Incident.findByIdAndDelete(id);

        if (!deleteDoc) 
            return next(new AppError(ErrorCodes.INCIDENT_NOT_FOUND))

        if (deleteDoc.images && deleteDoc.images.length > 0) {
            deleteDoc.images.forEach(imgName => {
                const filePath = path.join(__dirname, '../../uploads', imgName)
                if (fs.existsSync(filePath))
                    fs.unlinkSync(filePath)
            })
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('delete_incident', {
                message: 'Một sự cố mới vừa bị xóa',
                incident: id
            });
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, deleteDoc);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /api/v1/incidents:
 *   get:
 *     summary: Lấy danh sách sự cố (Dispatcher/Admin)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách sự cố
 */
exports.getAllIncidents = async (req, res, next) => {
    try {
        const incidents = await Incident.find()
            .populate('reporterId', 'fullName phoneNumber') // tương tự như lệnh join sql
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
 *     summary: Lấy ra sự cố cụ thể
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         require: true
 *         schema:
 *           type: string
 *           description: id cần tìm  
 *     responses:
 *       200:
 *         description: Trả về danh sách sự cố
 */
exports.getIncidentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT)); 
        }

        const incident = await Incident.findById(id)

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incident)
    } catch (err) {
        next(err);
    }
}