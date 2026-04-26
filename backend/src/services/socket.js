let ioInstance;
const onlineTeams = new Set(); // Chứa teamId dạng String

module.exports = {
    init: (io) => { ioInstance = io; },
    
    addOnlineTeam: (teamId) => {
        onlineTeams.add(teamId.toString());
        console.log(`Đội [${teamId}] đã ONLINE`);
    },
    
    removeOnlineTeam: (teamId) => {
        onlineTeams.delete(teamId.toString());
        console.log(`Đội [${teamId}] đã OFFLINE`);
    },

    isTeamOnline: (teamId) => onlineTeams.has(teamId.toString()),
    
    sendRequestToTeam: (teamId, payload) => {
        if (ioInstance) {
            console.log(`[SOCKET] Đang phát lệnh điều động tới`);
            ioInstance.to(`team:${teamId}`).emit('rescue:incoming_request', payload);
        }
    },
    
    getIO: () => ioInstance
};