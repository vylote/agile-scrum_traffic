const User = require('../models/User');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');
const { USER_ROLES } = require('../utils/constants/userConstants');

exports.getAllUsers = async (req, res, next) => {
    try {
        let { page, role, search } = req.query;
        const limit = 5; 
        const currentPage = Math.max(1, parseInt(page) || 1);
        const skip = (currentPage - 1) * limit;

        // 1. 🔥 Đổi bộ lọc: Chỉ lấy RESCUE và DISPATCHER
        const filter = {
            role: { $in: [USER_ROLES.RESCUE, USER_ROLES.DISPATCHER] }
        };

        if (role) {
            const requestedRole = role.toUpperCase();
            if ([USER_ROLES.RESCUE, USER_ROLES.DISPATCHER].includes(requestedRole)) {
                filter.role = requestedRole;
            }
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { username: searchRegex }
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .select('-passwordHash')
            .populate('rescueTeam', 'name code'); // 🔥 Populate thêm thông tin đội nếu là Rescue

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, {
            pagination: { total, totalPages: Math.ceil(total / limit), currentPage, limit },
            data: users
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @summary Lấy chi tiết 1 người dùng
 */
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) return next(new AppError(ErrorCodes.USER_NOT_FOUND));
        
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, user);
    } catch (err) {
        next(err);
    }
};

exports.getUserByPhone = async (req, res, next) => {
    try {
        const { phone } = req.params;

        const user = await User.findOne({ 
            phone, 
            role: USER_ROLES.RESCUE 
        }).select('name phone rescueTeam');

        if (!user) {
            return next(new AppError(ErrorCodes.USER_NOT_FOUND));
        }

        if (user.rescueTeam) {
            return next(new AppError(ErrorCodes.USER_ALREADY_IN_TEAM));
        }

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, user);
    } catch (err) {
        next(err);
    }
};