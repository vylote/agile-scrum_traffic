import { io } from "socket.io-client";

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Cắt đuôi /api/v1 để lấy root domain cho Socket.io
// Ví dụ: https://backend.railway.app/api/v1 -> https://backend.railway.app
const URL = apiBaseUrl.replace('/api/v1', '');

const socket = io(URL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

export default socket;