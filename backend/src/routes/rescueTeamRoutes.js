const express = require('express');
const router = express.Router();
const rescueTeamController = require('../controllers/rescueTeamController');
const { protect, restrictTo } = require("../middleware/auth");
const { USER_ROLES} = require("../utils/constants/userConstants")

router.use(protect);
/**
   * @swagger
   * /api/v1/rescue-teams:
   *   post:
   *     summary: Thêm đội cứu hộ mới
   *     description: Dành riêng cho quyền **Admin** để khởi tạo một đội cứu hộ mới vào hệ thống và phân bổ nhân sự (members).
   *     tags: [Rescue Teams]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, code, type, latitude, longitude, zone]
   *             properties:
   *               name:
   *                 type: string
   *                 description: Tên hiển thị của đội cứu hộ
   *                 example: "Đội Cứu Hộ Phản Ứng Nhanh Cầu Giấy"
   *               code:
   *                 type: string
   *                 description: Mã định danh duy nhất của đội
   *                 example: "TEAM-CG-01"
   *               type:
   *                 type: string
   *                 enum: [AMBULANCE, TOW_TRUCK, FIRE, POLICE, MULTI]
   *                 description: Phân loại đội cứu hộ
   *                 example: "TOW_TRUCK"
   *               latitude:
   *                 type: number
   *                 description: Vĩ độ hiện tại
   *                 example: 21.028511
   *               longitude:
   *                 type: number
   *                 description: Kinh độ hiện tại
   *                 example: 105.804817
   *               zone:
   *                 type: string
   *                 description: Khu vực hoạt động quản lý
   *                 example: "Quận Cầu Giấy, Hà Nội"
   *               capabilities:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Danh sách các kỹ năng/trang bị đặc thù
   *                 example: ["Cẩu xe trọng tải 5 tấn", "Sơ cứu y tế cơ bản"]
   *               members:
   *                 type: array
   *                 description: Danh sách thành viên (nhân viên cứu hộ) được gán vào đội ngay lúc tạo
   *                 items:
   *                   type: object
   *                   required: [userId]
   *                   properties:
   *                     userId:
   *                       type: string
   *                       description: Mã ObjectId của User (phải có role là RESCUE và đang rảnh)
   *                       example: "660c1d2e3f4a5b6c7d8e9f00"
   *                     role:
   *                       type: string
   *                       description: Vai trò cụ thể trong đội
   *                       example: "Tài xế xe cẩu"
   *     responses:
   *       200:
   *         description: Tạo đội cứu hộ thành công
   *       400:
   *         description: Dữ liệu đầu vào không hợp lệ (Trùng mã code, nhân viên đã có đội...)
   *       401:
   *         description: Thiếu token xác thực hoặc token hết hạn
   *       403:
   *         description: Không có quyền truy cập (Người gọi API không phải ADMIN hoặc nhân viên được gán không phải RESCUE)
   *       404:
   *         description: Không tìm thấy nhân viên được chỉ định (userId sai)
   */
router.post('/', restrictTo(USER_ROLES.ADMIN), rescueTeamController.createRescueTeam);
/**
 * @swagger
 * /api/v1/rescue-teams:
 *   get:
 *     summary: Lấy danh sách đội cứu hộ (Có phân trang và bộ lọc)
 *     description: Dành cho **Dispatcher** và **Admin** để xem danh sách và trạng thái các đội cứu hộ.
 *     tags: [Rescue Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang hiện tại
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [AMBULANCE, TOW_TRUCK, FIRE, POLICE, MULTI]
 *         description: Lọc theo loại đội cứu hộ
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, BUSY, OFFLINE]
 *         description: Lọc theo trạng thái hoạt động
 *     responses:
 *       200:
 *         description: Trả về danh sách đội cứu hộ kèm thông tin phân trang
 *       401:
 *         description: Không có Token hoặc Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập (Yêu cầu vai trò Dispatcher hoặc Admin)
 */
router.get('/', rescueTeamController.getAllRescueTeam);
router.get('/:id', rescueTeamController.getRescueTeamById);
/**
   * @swagger
   * /api/v1/rescue-teams/{id}/location:
   *   patch:
   *     summary: Cập nhật tọa độ GPS thực tế của đội cứu hộ
   *     description: Dành cho App Cứu hộ gọi định kỳ (ví dụ 10s/lần) để báo cáo vị trí về trung tâm.
   *     tags: [Rescue Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *         description: ID của đội cứu hộ
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [latitude, longitude]
   *             properties:
   *               latitude: { type: number, example: 21.0285 }
   *               longitude: { type: number, example: 105.8542 }
   *     responses:
   *       200:
   *         description: Cập nhật vị trí thành công, socket event `rescue:location` sẽ được phát đi.
   */
router.patch('/:id/location', restrictTo(USER_ROLES.RESCUE), rescueTeamController.updateLocation);
/**
   * @swagger
   * /api/v1/rescue-teams/{id}/members/add:
   *   patch:
   *     summary: Thêm thành viên mới vào đội cứu hộ
   *     tags: [Rescue Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [newMembers]
   *             properties:
   *               newMembers:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     userId: { type: string, example: "660c1d2e3f4a5b6c7d8e9f00" }
   *                     role: { type: string, example: "Tài xế xe cẩu" }
   *     responses:
   *       200:
   *         description: Thêm thành viên thành công
   */
router.patch('/:id/members/add', restrictTo(USER_ROLES.ADMIN), rescueTeamController.addMembers);
router.get('/:id/members',restrictTo(USER_ROLES.DISPATCHER, USER_ROLES.ADMIN, USER_ROLES.RESCUE), rescueTeamController.getRescueTeamMembers)

module.exports = router;