let ioInstance;
const onlineTeams = new Set(); // Chứa teamId dạng String

module.exports = {
    init: (io) => { ioInstance = io; },
    
    // Gọi hàm này khi Leader kết nối (register)
    addOnlineMember: (teamId) => {
        onlineTeams.add(teamId.toString());
        console.log(`🟢 SocketService: Đội ${teamId} đã ONLINE`);
    },
    
    // Gọi hàm này khi ngắt kết nối
    removeOnlineMember: (teamId) => {
        onlineTeams.delete(teamId.toString());
        console.log(`🔴 SocketService: Đội ${teamId} đã OFFLINE`);
    },

    isTeamOnline: (teamId) => onlineTeams.has(teamId.toString()),
    
    sendRequestToTeam: (teamId, payload) => {
        if (ioInstance) {
            // 🔥 SỬA TẠI ĐÂY: Thêm teamId vào tên sự kiện để khớp với FE
            const eventName = `rescue:incoming_request:${teamId}`;
            
            console.log(`📡 [SOCKET] Đang phát lệnh điều động tới: ${eventName}`);
            
            // Vy có thể gửi trực tiếp qua ioInstance hoặc vào room. 
            // Để chắc chắn nhất cho logic hiện tại của Vy, ta phát global kèm ID sự kiện:
            ioInstance.emit(eventName, payload);
        }
    },
    
    getIO: () => ioInstance
};