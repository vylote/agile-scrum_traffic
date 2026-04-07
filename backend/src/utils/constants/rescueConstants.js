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
    LEADER: 'LEADER',   // Người cầm lái + cầm quyền quyết định
    MEMBER: 'MEMBER'   
};

module.exports = {
    TEAM_ROLES,
    RESCUE_TEAM_TYPES,
    RESCUE_TEAM_STATUS,
    ALL_RESCUE_TYPES: Object.values(RESCUE_TEAM_TYPES),
    ALL_RESCUE_STATUS: Object.values(RESCUE_TEAM_STATUS)
};