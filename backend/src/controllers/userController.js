const User = require('../models/User');
const AppError = require('../middleware/AppError');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const { sendSuccess } = require('../utils/response');
const { USER_ROLES } = require('../utils/constants/userConstants');

exports.getAllUsers = async (req, res, next) => {
    try {
        let { page, role, search } = req.query;
        const limit = 10; // Vy nên tăng lên 10 cho khớp với giao diện máy tính
        const currentPage = Math.max(1, parseInt(page) || 1);
        const skip = (currentPage - 1) * limit;

        const filter = {
            role: { $in: [USER_ROLES.RESCUE, USER_ROLES.DISPATCHER] }
        };

        if (role) {
            const requestedRole = role.toUpperCase();
            if (filter.role.$in.includes(requestedRole)) {
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

        // Chạy song song cho nhanh
        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .select('-passwordHash')
                .populate('rescueTeam', 'name code')
                .lean() // Giúp API trả về nhanh hơn rất nhiều
        ]);

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, {
            pagination: { 
                total, 
                totalPages: Math.ceil(total / limit), 
                currentPage, 
                limit 
            },
            data: users
        });
    } catch (err) { next(err); }
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

exports.updateFCMToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        
        // Luôn cập nhật token mới nhất vì FCM Token có thể thay đổi định kỳ
        await User.findByIdAndUpdate(req.user._id, { 
            fcmToken: fcmToken || null, // Nếu gửi null tức là họ Logout/Tắt thông báo
            lastLogin: Date.now() 
        });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, { message: "Đã đồng bộ Token thiết bị." });
    } catch (err) {
        next(err);
    }
};