const Joi = require('joi');
const { USER_ROLES } = require('../../utils/constants/userConstants');

exports.createUserSchema = Joi.object({
    name: Joi.string().required().messages({ 'string.empty': 'Họ và tên không được để trống.' }),
    username: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'Tên đăng nhập không được để trống.',
        'string.min': 'Tên đăng nhập tối thiểu 3 ký tự.'
    }),
    email: Joi.string().email().required().messages({ 
        'string.empty': 'Email không được để trống.',
        'string.email': 'Email không hợp lệ.' 
    }),
    phone: Joi.string().pattern(/(84|0[3|5|7|8|9])+([0-9]{8})\b/).required().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ (+84).',
        'string.empty': 'Số điện thoại không được để trống.'
    }),
    password: Joi.string().min(6).required().messages({ 'string.min': 'Mật khẩu tối thiểu 6 ký tự.' }),
    // Bắt buộc phải là 1 trong 3 quyền của Admin/Vận hành
    role: Joi.string().valid(USER_ROLES.DISPATCHER, USER_ROLES.RESCUE, USER_ROLES.ADMIN).required().messages({
        'any.only': 'Vai trò không hợp lệ.'
    })
});