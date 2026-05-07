const Joi = require('joi');
const { ALL_RESCUE_TYPES, ALL_RESCUE_STATUS } = require('../../utils/constants/rescueConstants');

exports.createRescueTeamSchema = Joi.object({
    name: Joi.string().required().messages({ 'string.empty': 'Tên đội là bắt buộc.' }),
    code: Joi.string().required().messages({ 'string.empty': 'Mã đội là bắt buộc.' }),
    type: Joi.string().valid(...ALL_RESCUE_TYPES).required().messages({
        'any.only': `Loại đội không hợp lệ. Phải thuộc: ${ALL_RESCUE_TYPES.join(', ')}`
    }),
    zone: Joi.string().required().messages({ 'string.empty': 'Khu vực hoạt động là bắt buộc.' }),

    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    
    capabilities: Joi.array().items(Joi.string()).optional()
});

exports.updateTeamLocationSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    status: Joi.string().valid(...ALL_RESCUE_STATUS).optional()
});