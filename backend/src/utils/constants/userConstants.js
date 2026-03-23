const USER_ROLES = {
    ADMIN: 'ADMIN',           
    DISPATCHER: 'DISPATCHER', 
    RESCUE: 'RESCUE',         
    CITIZEN: 'CITIZEN'        
};

module.exports = {
    USER_ROLES,
    ALL_ROLES: Object.values(USER_ROLES)
};