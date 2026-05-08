import React, { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../hooks/useSocket";
import api from "../../services/api";
import { INCIDENT_STATUS } from "../../utils/constants/incidentConstants";
import { GlobalIncidentModal } from "../../components/RescueTeam/GlobalIncidentModal";

export const RescueLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();

  const teamId = user?.rescueTeam?._id;
  const userZone = user?.rescueTeam?.zone;
  const lastRegisteredIdRef = useRef(null);

  const [incomingRequest, setIncomingRequest] = useState(null);

  // 🔥 1. XÁC ĐỊNH ROLE CHUẨN XÁC (Tránh lỗi object lồng nhau)
  const myInternalRole = useMemo(() => {
    const currentUserId = user?.id || user?._id;
    const member = user?.rescueTeam?.members?.find(
      (m) => (m.userId?._id || m.userId) === currentUserId
    );
    return member?.role || "MEMBER";
  }, [user]);

  const isLeader = myInternalRole === "LEADER";

  // 🔥 2. ĐĂNG KÝ SOCKET TOÀN CỤC MỌI NÚC MỌI NƠI
  useEffect(() => {
    if (!socket || !teamId || !userZone) return;

    const registerTeam = () => {
      if (!socket.id || lastRegisteredIdRef.current === socket.id) return;
      socket.emit("rescue:register", { teamId, role: myInternalRole, zone: userZone });
      lastRegisteredIdRef.current = socket.id;
      console.log(`[Layout] Đã báo danh với Socket ID: ${socket.id}`);
    };

    if (socket.connected) registerTeam();
    socket.on("connect", registerTeam);
    return () => socket.off("connect", registerTeam);
  }, [socket, teamId, myInternalRole, userZone]);

  // 🔥 3. LẮNG NGHE LỆNH ĐIỀU ĐỘNG 
  useEffect(() => {
    if (!socket || !teamId) return;

    const handleIncoming = (data) => {
      console.log("🔥 [Layout] Bắt được sự kiện incoming_request:", data);
      
      if (data.action === "revoke_request") {
        setIncomingRequest(null);
        return;
      }
      
      if (!isLeader) {
         console.log("❌ [Layout] Bỏ qua vì không phải Đội trưởng.");
         return;
      }

      setIncomingRequest({
        incident: data.incident,
        distance: data.distance,
        etaMinutes: data.etaMinutes,
        expiresAt: Date.now() + 30000,
      });
    };

    const handleRevoke = () => {
       console.log("⚠️ [Layout] Bắt được lệnh thu hồi revoke_request");
       setIncomingRequest(null);
    };

    socket.on("rescue:incoming_request", handleIncoming);
    socket.on("rescue:revoke_request", handleRevoke);

    return () => {
      socket.off("rescue:incoming_request", handleIncoming);
      socket.off("rescue:revoke_request", handleRevoke);
    };
  }, [socket, teamId, isLeader]);

  // Kích hoạt Rung điện thoại khi có đơn
  useEffect(() => {
    if (incomingRequest && navigator.vibrate) {
      try { navigator.vibrate([300, 100, 300, 100, 500]); } catch (e) {}
    }
  }, [incomingRequest]);

  const handleAccept = async (incident) => {
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.ASSIGNED,
        teamData: user.rescueTeam,
      });
      setIncomingRequest(null);
      navigate("/rescue/dashboard", {
        state: { activeIncidentFromGlobal: res.data.result },
      });
    } catch (error) {
      alert("Sự cố đã có đội khác nhận hoặc đã hết hạn!");
      setIncomingRequest(null);
    }
  };

  const handleReject = async () => {
    if (!incomingRequest) return;
    try {
      await api.patch(`/incidents/${incomingRequest.incident._id}/reject`);
    } catch (e) {
      console.error(e);
    } finally {
      setIncomingRequest(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <Outlet />
      {incomingRequest && (
        <GlobalIncidentModal
          incident={incomingRequest.incident}
          distance={incomingRequest.distance}
          etaMinutes={incomingRequest.etaMinutes}
          expiresAt={incomingRequest.expiresAt}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
};