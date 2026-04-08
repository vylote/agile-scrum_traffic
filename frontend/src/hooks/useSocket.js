import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { USER_ROLES } from "../utils/constants/userConstants";
import socket from "../services/socket"

export const useSocket = (activeIncidentId = null) => {
    const { user } = useSelector((state) => state.auth);
    const watchId = useRef(null);

    useEffect(() => {
        if (!user || !socket) return;

        if (!socket.connected) socket.connect();

        if (user.role === USER_ROLES.RESCUE && user.rescueTeam) {
            socket.emit("join_zone", user.rescueTeam.zone);
        } else if (user.role === USER_ROLES.DISPATCHER || user.role === USER_ROLES.ADMIN) {
            socket.emit("join_zone", "room:dispatchers");
        }

        // 🔥 CÔNG TẮC MÔ PHỎNG (SIMULATION FLAG)
        // Set 'true' khi test bằng Postman để tắt GPS thật của trình duyệt/điện thoại
        // Set 'false' khi mang đi Demo thật tế
        const isSimulationMode = true; 

        // 2. Logic GPS Tracking (Chỉ chạy cho RESCUE và khi KHÔNG BẬT chế độ mô phỏng)
        if (user.role === USER_ROLES.RESCUE && user.rescueTeam && !isSimulationMode) {
            watchId.current = navigator.geolocation.watchPosition(
                (pos) => {
                    socket.emit("rescue:updateLocation", {
                        teamId: user.rescueTeam._id,
                        teamName: user.rescueTeam.name,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        incidentId: activeIncidentId,
                        status: user.rescueTeam.status
                    });
                },
                (err) => console.error("GPS Watch Error:", err),
                { enableHighAccuracy: true, distanceFilter: 10 }
            );
        }

        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        };
    }, [user, activeIncidentId]);

    return socket;
};