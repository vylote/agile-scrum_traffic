import { io } from "socket.io-client";

const URL = "http://localhost:5000"

const socket = io(URL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

export default socket;