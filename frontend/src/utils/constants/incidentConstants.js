export const INCIDENT_TYPES = {
    ACCIDENT: 'ACCIDENT',
    BREAKDOWN: 'BREAKDOWN',
    FLOOD: 'FLOOD',
    FIRE: 'FIRE',
    OTHER: 'OTHER'
};

export const INCIDENT_STATUS = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

export const INCIDENT_SEVERITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

export const ALL_TYPES = Object.values(INCIDENT_TYPES);
export const ALL_STATUS = Object.values(INCIDENT_STATUS);
export const ALL_SEVERITIES = Object.values(INCIDENT_SEVERITY);