const { INCIDENT_TYPES } = require('./incidentConstants'); 

const RESCUE_TEAM_TYPES = {
    AMBULANCE: 'AMBULANCE',
    TOW_TRUCK: 'TOW_TRUCK',
    FIRE: 'FIRE',
    POLICE: 'POLICE',
    MULTI: 'MULTI'
};

const RESCUE_TEAM_STATUS = {
    AVAILABLE: 'AVAILABLE',
    BUSY: 'BUSY',
    OFFLINE: 'OFFLINE'
};

const TEAM_ROLES = {
    LEADER: 'LEADER',
    MEMBER: 'MEMBER'   
};

const TEAM_CAPABILITIES = {
    FIRST_AID: 'FIRST_AID',         // Sơ cứu/Cấp cứu
    TOWING: 'TOWING',               // Cẩu kéo xe
    FIRE_FIGHTING: 'FIRE_FIGHTING', // Chữa cháy
    WATER_RESCUE: 'WATER_RESCUE',   // Cứu hộ đường thủy
    GENERAL: 'GENERAL'              // Đa dụng
};

// Lưu ý: Đặt biến trong ngoặc vuông [] để JS hiểu đó là giá trị của Hằng số
const INCIDENT_TO_CAPABILITY = {
    [INCIDENT_TYPES.ACCIDENT]: TEAM_CAPABILITIES.FIRST_AID,
    [INCIDENT_TYPES.BREAKDOWN]: TEAM_CAPABILITIES.TOWING,
    [INCIDENT_TYPES.FIRE]: TEAM_CAPABILITIES.FIRE_FIGHTING,
    [INCIDENT_TYPES.FLOOD]: TEAM_CAPABILITIES.WATER_RESCUE,
    [INCIDENT_TYPES.OTHER]: TEAM_CAPABILITIES.GENERAL
};

module.exports = {
    TEAM_ROLES,
    RESCUE_TEAM_TYPES,
    RESCUE_TEAM_STATUS,
    TEAM_CAPABILITIES,
    INCIDENT_TO_CAPABILITY, // Xuất bảng ánh xạ ra để thuật toán dùng
    ALL_RESCUE_TYPES: Object.values(RESCUE_TEAM_TYPES),
    ALL_RESCUE_STATUS: Object.values(RESCUE_TEAM_STATUS),
    ALL_CAPABILITIES: Object.values(TEAM_CAPABILITIES)
};