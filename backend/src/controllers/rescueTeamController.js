const mongoose = require('mongoose');
const RescueTeam = require('../models/RescueTeam')
const AppError = require('../middleware/AppError')
const ErrorCodes = require('../utils/constants/errorCodes')
const SuccessCodes = require('../utils/constants/successCodes')
const { sendSuccess } = require('../utils/response')
const User = require('../models/User');
const { USER_ROLES } = require('../utils/constants/userConstants');

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
exports.createRescueTeam = async (req, res, next) => {
    try {
        const {
            name,
            code,
            type,
            latitude,
            longitude,
            zone,
            members,
            capabilities
        } = req.body

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES, 'Vui lòng cung cấp tọa độ đội cứu hộ'));
        }

        let validMembers = []
        if (members && Array.isArray(members) && members.length > 0) {
            for (let i = 0; i < members.length; ++i) {
                const member = members[i]
                const user = await User.findById(member.userId)
                if (!user)
                    return next(new AppError(ErrorCodes.USER_NOT_FOUND))

                if (user.role != USER_ROLES.RESCUE)
                    return next(new AppError(ErrorCodes.AUTH_FORBIDDEN))

                if (user.rescueTeam)
                    return next(new AppError(ErrorCodes.USER_ALREADY_IN_TEAM))

                validMembers.push({ userId: user._id, role: member.role })
            }
        }

        const newRescueTeam = await RescueTeam.create({
            name,
            code,
            type,
            currentLocation: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            zone,
            capabilities: capabilities || [],
            members: validMembers,
        })

        if (validMembers.length > 0) {
            const userIds = validMembers.map(m => m.userId)

            await User.updateMany(
                { _id: { $in: userIds } },
                { rescueTeam: newRescueTeam._id }
            )
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, newRescueTeam)

    } catch (err) {
        if (err.code === 11000) {
            return next(new AppError(ErrorCodes.INVALID_INPUT));
        }
        next(err)
    }
}

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
exports.getAllRescueTeam = async (req, res, next) => {
    try {
        const { page, type, status } = req.query

        const limit = 5
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit

        const filter = {}
        if (type) filter.type = type
        if (status) filter.status = status

        const total = await RescueTeam.countDocuments(filter)
        const totalPages = Math.ceil(total / limit)

        const rescueTeams = await RescueTeam.find(filter)
            .sort('-createdAt')
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('members.userId', 'name phone');

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, {
            pagination: {
                total,
                totalPages,
                currentPage,
                limit
            },
            data: rescueTeams
        })
    } catch (err) {
        next(err)
    }
}

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
exports.updateLocation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        if (!latitude || !longitude) {
            return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        }

        const updatedTeam = await RescueTeam.findByIdAndUpdate(
            id,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                },
                lastLocationUpdate: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('rescue:location', {
                teamId: updatedTeam._id,
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
                code: updatedTeam.code,
                status: updatedTeam.status
            });
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, {
            _id: updatedTeam._id,
            currentLocation: updatedTeam.currentLocation,
            lastLocationUpdate: updatedTeam.lastLocationUpdate
        });

    } catch (err) {
        next(err);
    }
}

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
exports.addMembers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newMembers } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }
        const team = await RescueTeam.findById(id);
        if (!team) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));
        let validMembers = [];
        if (newMembers && Array.isArray(newMembers) && newMembers.length > 0) {
            for (let i = 0; i < newMembers.length; ++i) {
                const member = newMembers[i];
                const user = await User.findById(member.userId);

                if (!user) return next(new AppError(ErrorCodes.USER_NOT_FOUND));
                if (user.role != USER_ROLES.RESCUE) return next(new AppError(ErrorCodes.AUTH_FORBIDDEN));
                if (user.rescueTeam) return next(new AppError(ErrorCodes.USER_ALREADY_IN_TEAM));
                validMembers.push({ userId: user._id, role: member.role });
            }
        }
        if (validMembers.length === 0) {
            return next(new AppError(ErrorCodes.INVALID_INPUT));
        }
        // Dùng $push kèm $each để nhét nhiều thành viên mới vào đuôi mảng hiện tại
        const updatedTeam = await RescueTeam.findByIdAndUpdate(
            id,
            { $push: { members: { $each: validMembers } } },
            { new: true, runValidators: true }
        );
        // Cập nhật rescueTeam cho các user vừa được thêm
        const userIds = validMembers.map(m => m.userId);
        await User.updateMany(
            { _id: { $in: userIds } },
            { rescueTeam: updatedTeam._id }
        );
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, updatedTeam);
    } catch (err) {
        next(err);
    }
};

/**
   * @swagger
   * /api/v1/rescue-teams/{id}/members/remove:
   *   patch:
   *     summary: Xóa (Giải phóng) thành viên khỏi đội cứu hộ
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
   *             required: [userIdsToRemove]
   *             properties:
   *               userIdsToRemove:
   *                 type: array
   *                 description: Mảng chứa các ID của thành viên cần xóa khỏi đội
   *                 items:
   *                   type: string
   *                   example: ["660c1d2e3f4a5b6c7d8e9f00", "660c1d2e3f4a5b6c7d8e9f01"]
   *     responses:
   *       200:
   *         description: Xóa thành viên thành công
   */
exports.removeMembers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userIdsToRemove } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }
        const team = await RescueTeam.findById(id);
        if (!team) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));
        if (!userIdsToRemove || !Array.isArray(userIdsToRemove) || userIdsToRemove.length === 0) {
            return next(new AppError(ErrorCodes.INVALID_INPUT, "Vui lòng cung cấp danh sách ID cần xóa."));
        }
        // Dùng $pull để rút các object có userId nằm trong mảng userIdsToRemove ra khỏi mảng members
        const updatedTeam = await RescueTeam.findByIdAndUpdate(
            id,
            { $pull: { members: { userId: { $in: userIdsToRemove } } } },
            { new: true, runValidators: true }
        );
        
        await User.updateMany(
            { _id: { $in: userIdsToRemove }, rescueTeam: id },
            { rescueTeam: null }
        );
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, updatedTeam);
    } catch (err) {
        next(err);
    }
};