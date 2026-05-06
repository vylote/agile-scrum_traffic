const Joi = require('joi');

exports.registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'Tên đăng nhập không được để trống.',
        'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự.',
        'any.required': 'Tên đăng nhập là bắt buộc.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Mật khẩu không được để trống.',
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.'
    }),
    name: Joi.string().required().messages({
        'string.empty': 'Họ và tên không được để trống.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email không đúng định dạng hợp lệ.',
        'string.empty': 'Email không được để trống.'
    }),
    phone: Joi.string().pattern(/(84|0[3|5|7|8|9])+([0-9]{8})\b/).required().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ (+84).',
        'string.empty': 'Số điện thoại không được để trống.'
    })
});

exports.loginSchema = Joi.object({
    username: Joi.string().required().messages({
        'string.empty': 'Tên đăng nhập không được để trống.'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Mật khẩu không được để trống.'
    })
});