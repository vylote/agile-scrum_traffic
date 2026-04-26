const mongoose = require('mongoose');
const RescueTeam = require('../models/RescueTeam')
const AppError = require('../middleware/AppError')
const ErrorCodes = require('../utils/constants/errorCodes')
const SuccessCodes = require('../utils/constants/successCodes')
const { sendSuccess } = require('../utils/response')
const User = require('../models/User');
const { USER_ROLES } = require('../utils/constants/userConstants');

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

        const existingTeam = await RescueTeam.findOne({ code });
        if (existingTeam) {
            return next(new AppError(ErrorCodes.RESCUE_TEAM_CODE_EXISTS));
        }

        let validMembers = [];
        if (members && Array.isArray(members) && members.length > 0) {
            for (const member of members) {
                const user = await User.findById(member.userId);
                if (!user) return next(new AppError(ErrorCodes.USER_NOT_FOUND));
                if (user.role !== USER_ROLES.RESCUE) return next(new AppError(ErrorCodes.AUTH_FORBIDDEN));
                if (user.rescueTeam) return next(new AppError(ErrorCodes.USER_ALREADY_IN_TEAM));

                validMembers.push({ userId: user._id, role: member.role });
            }
        }

        let newRescueTeam = await RescueTeam.create({
            name,
            code: code.toUpperCase(), // Đảm bảo mã luôn viết hoa trong DB
            type,
            currentLocation: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            zone,
            capabilities: capabilities || [],
            members: validMembers,
        });

        newRescueTeam = await newRescueTeam.populate('members.userId', 'name phone email');

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

exports.getAllRescueTeam = async (req, res, next) => {
    try {
        const { page, type, status, limit: queryLimit, activeOnly } = req.query;

        const limit = parseInt(queryLimit) || 10; 
        const currentPage = Math.max(1, parseInt(page) || 1);
        const skip = (currentPage - 1) * limit;

        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;

        // 🔥 CHỖ QUAN TRỌNG: Chỉ lọc nếu Frontend truyền lên "activeOnly=true"
        // Nếu không truyền (như mặc định của Dispatcher), nó sẽ lấy cả đội "rỗng"
        if (activeOnly === 'true') {
            filter.members = { $exists: true, $not: { $size: 0 } }; 
            // Có thể kết hợp thêm: filter.status = { $ne: 'OFFLINE' };
        }

        const [total, rescueTeams] = await Promise.all([
            RescueTeam.countDocuments(filter),
            RescueTeam.find(filter)
                .sort('-lastLocationUpdate') 
                .skip(skip)
                .limit(limit)
                .populate('members.userId', 'name phone')
                .lean() 
        ]);

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, {
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage,
                limit
            },
            data: rescueTeams
        });
    } catch (err) {
        next(err);
    }
};

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
        const updatedTeam = await RescueTeam.findByIdAndUpdate(
            id,
            { $push: { members: { $each: validMembers } } },
            { new: true, runValidators: true }
        ).populate('members.userId', 'name phone email'); // Nối bảng User ngay lập tức

        if (!updatedTeam) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));

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

exports.getRescueTeamMembers = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        // Tìm đội và lôi thông tin User gắn với thành viên đó
        const team = await RescueTeam.findById(id)
            .populate({
                path: 'members.userId',
                select: 'name phone email avatar role status' // Chỉ lấy các trường cần thiết
            });

        if (!team) {
            return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, team.members);
    } catch (err) {
        next(err);
    }
};

exports.getRescueTeamById = async (req, res, next) => {
    try {
        const team = await RescueTeam.findById(req.params.id);
        if (!team) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, team);
    } catch (err) { next(err); }
};