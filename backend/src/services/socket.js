// src/services/socket.js
let ioInstance;

module.exports = {
    init: (io) => {
        ioInstance = io;
    },
    getIO: () => {
        if (!ioInstance) {
            console.error("Socket.io chưa được khởi tạo!");
        }
        return ioInstance;
    },
    // Hàm tiện ích gửi thông báo mời nhận ca cho 1 đội cụ thể
    sendRequestToTeam: (teamId, payload) => {
        if (ioInstance) {
            ioInstance.emit(`rescue:incoming_request:${teamId}`, payload);
        }
    }
};