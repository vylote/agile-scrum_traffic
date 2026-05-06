const Joi = require('joi');
const { ALL_TYPES, ALL_STATUS, ALL_SEVERITIES } = require('../../utils/constants/incidentConstants');

exports.createIncidentSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Tiêu đề sự cố không được để trống.',
        'string.empty': 'Tiêu đề sự cố không được để trống.'
    }),
    type: Joi.string().valid(...ALL_TYPES).required().messages({
        'any.only': `Loại sự cố không hợp lệ. Phải thuộc: ${ALL_TYPES.join(', ')}`,
        'string.empty': 'Vui lòng chọn loại sự cố.',
        'any.required': 'Loại sự cố là thông tin bắt buộc.'
    }),
    severity: Joi.string().valid(...ALL_SEVERITIES).optional(),
    description: Joi.string().allow('', null).optional(),
    latitude: Joi.number().min(-90).max(90).required().messages({
        'number.base': 'Định vị GPS không hợp lệ (Vĩ độ phải là số).',
        'number.min': 'Vĩ độ không hợp lệ.',
        'number.max': 'Vĩ độ không hợp lệ.',
        'any.required': 'Hệ thống chưa lấy được định vị GPS. Vui lòng bật định vị.'
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
        'number.base': 'Định vị GPS không hợp lệ (Kinh độ phải là số).',
        'number.min': 'Kinh độ không hợp lệ.',
        'number.max': 'Kinh độ không hợp lệ.',
        'any.required': 'Hệ thống chưa lấy được định vị GPS. Vui lòng bật định vị.'
    })
});

exports.updateIncidentStatusSchema = Joi.object({
    status: Joi.string().valid(...ALL_STATUS).required().messages({
        'any.only': `Trạng thái không hợp lệ. Phải thuộc: ${ALL_STATUS.join(', ')}`,
        'any.required': 'Trạng thái là bắt buộc.'
    }),
    teamData: Joi.object().optional(),
    note: Joi.string().allow('', null).optional()
});

exports.sosIncidentSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required().messages({
        'number.base': 'Vĩ độ phải là số.',
        'any.required': 'Không thể gửi SOS khi chưa có định vị GPS.'
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
        'number.base': 'Kinh độ phải là số.',
        'any.required': 'Không thể gửi SOS khi chưa có định vị GPS.'
    })
});