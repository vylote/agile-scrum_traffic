const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const upload = require("../middleware/upload");
const { protect, restrictTo } = require("../middleware/auth");
const { USER_ROLES} = require("../utils/constants/userConstants")

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
router.get('/track/:code', incidentController.getIncidentByCode);

router.use(protect);

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
router.post('/',restrictTo(USER_ROLES.CITIZEN),upload.array("photos", 3),incidentController.createIncident);
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
router.post('/sos',restrictTo(USER_ROLES.CITIZEN),incidentController.createSOS);
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
router.get("/:id", incidentController.getIncidentById);
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
router.patch('/:id/status',restrictTo(USER_ROLES.ADMIN, USER_ROLES.DISPATCHER, USER_ROLES.RESCUE), incidentController.updateIncidentStatus)
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
router.patch("/:id/info",upload.array("photos", 3),incidentController.updateIncidentInfo);
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
router.get('/',incidentController.getAllIncidents);
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
router.delete("/delete/:id",restrictTo(USER_ROLES.CITIZEN),incidentController.deleteIncident);
router.patch('/:id/reject', restrictTo(USER_ROLES.RESCUE), incidentController.rejectIncident);

module.exports = router;
