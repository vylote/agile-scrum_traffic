import { useEffect } from "react";
import { useSelector } from "react-redux";
import { USER_ROLES } from "../utils/constants/userConstants";
import socket from "../services/socket"

export const useSocket = () => {
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || !socket) return;

        if (!socket.connected) socket.connect();

        if (user.role === USER_ROLES.DISPATCHER || user.role === USER_ROLES.ADMIN) {
            socket.emit("join_zone", "room:dispatchers");
            socket.emit("dispatcher:register");
        }

    }, [user]);

    return socket;
};