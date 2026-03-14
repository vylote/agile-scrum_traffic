const Incident = require('../models/Incident');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../config/errorCodes');
const SuccessCodes = require('../config/successCodes');
const { sendSuccess } = require('../utils/response');
const geoService = require('../services/geoService');

/**
 * @swagger
 * /api/v1/incidents:
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
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Thành công
 */
exports.createIncident = async (req, res, next) => {
    try {
        const { title, description, latitude, longitude, address } = req.body;

        if (!latitude || !longitude) {
            return next(new AppError({
                code: 2002,
                message: "Thiếu tọa độ sự cố!",
                statusCode: 400
            }));
        }

        let finalAddress = address;
        if (!finalAddress) {
            finalAddress = await geoService.reverseGeocode(latitude, longitude);
        }

        const images = req.file ? [req.file.filename] : [];

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
            .populate('reporterId', 'fullName phoneNumber')
            .sort('-createdAt');

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, incidents);
    } catch (err) {
        next(err);
    }
};