const mongoose = require('mongoose');
const RescueTeam = require('../models/RescueTeam')
const AppError = require('../middleware/AppError')
const ErrorCodes = require('../utils/constants/errorCodes')
const SuccessCodes = require('../utils/constants/successCodes')
const { sendSuccess } = require('../utils/response')
const User = require('../models/User');
const { USER_ROLES } = require('../utils/constants/userConstants');
const { ALL_RESCUE_STATUS } = require('../utils/constants/rescueConstants');

exports.createRescueTeam = async (req, res, next) => {
    //khởi tạo phiên sao dịch (session transaction)
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        let {
            name, code, type, latitude, longitude, zone, members, capabilities
        } = req.body;

        // if (!latitude || !longitude) {
        //     return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES, 'Vui lòng cung cấp tọa độ đội cứu hộ'));
        // }

        code = code?.toUpperCase()

        // nhúng session vào query đọc/ghi
        const existingTeam = await RescueTeam.findOne({ code }).session(session);
        if (existingTeam) {
            return next(new AppError(ErrorCodes.RESCUE_TEAM_CODE_EXISTS));
        }

        let validMembers = [];
        if (members && Array.isArray(members) && members.length > 0) {
            for (const member of members) {
                const user = await User.findById(member.userId).session(session);
                if (!user) return next(new AppError(ErrorCodes.USER_NOT_FOUND));
                if (user.role !== USER_ROLES.RESCUE) return next(new AppError(ErrorCodes.AUTH_FORBIDDEN));
                if (user.rescueTeam) return next(new AppError(ErrorCodes.USER_ALREADY_IN_TEAM));

                validMembers.push({ userId: user._id, role: member.role });
            }
        }

        //Lệnh .create() dùng chung với Session bắt buộc phải bọc data trong mảng []
        let createdTeams = await RescueTeam.create([{
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
        }], { session });

        let newRescueTeam = createdTeams[0];

        if (validMembers.length > 0) {
            const userIds = validMembers.map(m => m.userId)
            await User.updateMany(
                { _id: { $in: userIds } },
                { rescueTeam: newRescueTeam._id },
                { session } // nhúng session
            )
        }
        //nếu thanh công -> commit 
        await session.commitTransaction();
        session.endSession();

        newRescueTeam = await RescueTeam.findById(newRescueTeam._id).populate('members.userId', 'name phone email');

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, newRescueTeam)

    } catch (err) {
        //roll back
        await session.abortTransaction();
        session.endSession();

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

        // Chỉ lọc nếu Frontend truyền lên "activeOnly=true"
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

        // if (!latitude || !longitude) {
        //     return next(new AppError(ErrorCodes.INCIDENT_MISSING_COORDINATES));
        // }

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { newMembers } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        const team = await RescueTeam.findById(id).session(session);
        if (!team) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));

        let businessErrors = [];

        // Đếm số lượng Đội trưởng hiện có và số lượng chuẩn bị thêm
        const currentLeadersCount = team.members.filter(m => m.role === 'LEADER').length;
        const newLeadersCount = newMembers.filter(m => m.role === 'LEADER').length;

        if (currentLeadersCount + newLeadersCount > 1) {
            businessErrors.push("Đội cứu hộ này đã có Đội trưởng. Chỉ được phép có tối đa 1 Đội trưởng (LEADER).");
        }

        // Nếu phát hiện vi phạm luật -> Ném lỗi ra cho Frontend (dùng dấu | để sau này dễ thêm luật)
        if (businessErrors.length > 0) {
            return next(new AppError(ErrorCodes.INVALID_INPUT, businessErrors.join(' | ')));
        }

        let validMembers = [];
        if (newMembers && Array.isArray(newMembers) && newMembers.length > 0) {
            for (let i = 0; i < newMembers.length; ++i) {
                const member = newMembers[i];
                const user = await User.findById(member.userId).session(session);

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
            { new: true, runValidators: true, session } // nhúng session
        ).populate('members.userId', 'name phone email'); // Nối bảng User ngay lập tức

        if (!updatedTeam) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));

        // Cập nhật rescueTeam cho các user vừa được thêm
        const userIds = validMembers.map(m => m.userId);
        await User.updateMany(
            { _id: { $in: userIds } },
            { rescueTeam: updatedTeam._id },
            { session } // nhúng session
        );

        await session.commitTransaction();
        session.endSession();

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, updatedTeam);
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { userIdsToRemove } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        const team = await RescueTeam.findById(id).session(session);
        if (!team) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));

        if (!userIdsToRemove || !Array.isArray(userIdsToRemove) || userIdsToRemove.length === 0) {
            return next(new AppError(ErrorCodes.INVALID_INPUT, "Vui lòng cung cấp danh sách ID cần xóa."));
        }
        // Dùng $pull để rút các object có userId nằm trong mảng userIdsToRemove ra khỏi mảng members
        const updatedTeam = await RescueTeam.findByIdAndUpdate(
            id,
            { $pull: { members: { userId: { $in: userIdsToRemove } } } },
            { new: true, runValidators: true, session }
        );
        
        await User.updateMany(
            { _id: { $in: userIdsToRemove }, rescueTeam: id },
            { rescueTeam: null },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, updatedTeam);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
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

exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        if (!status || !ALL_RESCUE_STATUS.includes(status)) {
            return next(new AppError(ErrorCodes.INVALID_INPUT, "Trạng thái không hợp lệ"));
        }

        const updatedTeam = await RescueTeam.findByIdAndUpdate(
            id,
            { status: status },
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));
        }

        // 🔥 Bọc thép: Server cũng tự động phát loa luôn cho chắc cốp, 
        // lỡ điện thoại tài xế gọi API xong sập nguồn chưa kịp chạy dòng socket.emit
        const io = req.app.get('io');
        if (io) {
            io.emit('rescue:location', {
                teamId: updatedTeam._id,
                status: updatedTeam.status,
                // Gửi kèm tọa độ cuối cùng để xe không bị biến mất khỏi bản đồ Dispatcher
                lat: updatedTeam.currentLocation.coordinates[1],
                lng: updatedTeam.currentLocation.coordinates[0]
            });
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, {
            _id: updatedTeam._id,
            status: updatedTeam.status
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteRescueTeam = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(ErrorCodes.INVALID_ID_FORMAT));
        }

        const team = await RescueTeam.findById(id).session(session);
        if (!team) return next(new AppError(ErrorCodes.RESCUE_TEAM_NOT_FOUND));

        // 1. Giải phóng tất cả thành viên trong đội này (set rescueTeam = null)
        if (team.members && team.members.length > 0) {
            const userIds = team.members.map(m => m.userId);
            await User.updateMany(
                { _id: { $in: userIds } },
                { rescueTeam: null },
                { session }
            );
        }

        // 2. Xóa đội cứu hộ
        await RescueTeam.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        session.endSession();

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, null, "Đã xóa đội cứu hộ thành công.");
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};