export const RESCUE_TEAM_TYPES = {
    AMBULANCE: 'AMBULANCE',
    TOW_TRUCK: 'TOW_TRUCK',
    FIRE: 'FIRE',
    POLICE: 'POLICE',
    MULTI: 'MULTI'
};

export const RESCUE_TEAM_STATUS = {
    AVAILABLE: 'AVAILABLE',
    BUSY: 'BUSY',
    OFFLINE: 'OFFLINE'
};


export const ALL_RESCUE_TYPES = Object.values(RESCUE_TEAM_TYPES)
export const ALL_RESCUE_STATUS = Object.values(RESCUE_TEAM_STATUS)
