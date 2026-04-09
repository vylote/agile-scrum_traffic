// RescueHome.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Map from "../../components/Public/Map";
import StatusBar from "../../components/RescueTeam/StatusBar";
import UserProfile from "../../components/RescueTeam/UserProfile";
import OverviewCard from "../../components/RescueTeam/OverviewCard";
import TabBar from "../../components/RescueTeam/TabBar";
import RestingStatus from "../../components/RescueTeam/RestingStatus";
import { useSocket } from "../../hooks/useSocket";
import api from "../../services/api";
import { INCIDENT_STATUS } from "../../utils/constants/incidentConstants";
import { ShieldOff, X } from "lucide-react";

// ─── Toast thông báo bị hủy ca ───────────────────────────────────────────────
const CancelledToast = ({ message, onDismiss }) => (
  <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] animate-in fade-in slide-in-from-top-4 duration-400 pointer-events-auto">
    <div className="bg-gray-900 text-white rounded-2xl px-4 py-4 shadow-2xl flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
        <ShieldOff size={18} className="text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm text-white mb-0.5">Ca trực đã bị hủy</p>
        <p className="text-xs text-gray-400 leading-snug">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-gray-500 hover:text-white transition-colors mt-0.5">
        <X size={16} />
      </button>
    </div>
  </div>
);

// 🚦 CÔNG TẮC MÔ PHỎNG GPS
// true : Test tại chỗ — chặn GPS thật, tọa độ bắn qua Postman → socket rescue:location
// false: Cầm điện thoại chạy ngoài đường, lấy GPS thật của máy
const IS_SIMULATION_MODE = true;

export const RescueHome = () => {
  const { user } = useSelector((state) => state.auth);

  const [incidentsQueue, setIncidentsQueue]   = useState([]);
  const [activeIncident, setActiveIncident]   = useState(null);
  const [viewingIncident, setViewingIncident] = useState(null);
  const [appState, setAppState]               = useState("normal");
  const [isResting, setIsResting]             = useState(false);
  const [bottomHeight, setBottomHeight]       = useState(160);
  const [refreshTrigger, setRefreshTrigger]   = useState(0);
  const [mapFocus, setMapFocus]               = useState(null);
  const [currentPos, setCurrentPos]           = useState(null);

  // ✅ teamStatus lưu status THỰC của đội — tách khỏi Redux vì Redux không tự cập nhật
  // khi backend thay đổi mà không dispatch action mới
  const [teamStatus, setTeamStatus] = useState(
    user?.rescueTeam?.status || "AVAILABLE"
  );

  // Toast thông báo khi bị hủy ca từ dispatcher/admin
  const [cancelledNotification, setCancelledNotification] = useState(null);

  const bottomPanelRef = useRef(null);
  const sliderRef      = useRef(null);
  const socket         = useSocket();

  const appStateRef = useRef(appState);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  const teamId   = user?.rescueTeam?._id;
  const userZone = user?.rescueTeam?.zone;

  const myInternalRole = useMemo(() => {
    const currentUserId = user?.id || user?._id;
    const member = user?.rescueTeam?.members?.find(
      (m) => (m.userId?._id || m.userId) === currentUserId
    );
    return member?.role || "MEMBER";
  }, [user]);

  // ─── 1. NẠP DỮ LIỆU BAN ĐẦU ─────────────────────────────────────────────
  useEffect(() => {
    if (!userZone || !teamId) return;

    const fetchInitialData = async () => {
      try {
        const [pendingRes, activeRes, teamRes] = await Promise.all([
          api.get(`/incidents?status=PENDING&zone=${encodeURIComponent(userZone)}`),
          api.get(`/incidents?assignedTeam=${teamId}&status=ASSIGNED,IN_PROGRESS`),
          api.get(`/rescue-teams/${teamId}`)
        ]);

        const pendingData = pendingRes.data.result.data || [];
        const activeData  = activeRes.data.result.data  || [];
        const myTeamData  = teamRes.data?.result;

        // ✅ Đồng bộ teamStatus từ server
        if (myTeamData?.status) setTeamStatus(myTeamData.status);

        // Đồng bộ tọa độ hiện tại
        if (myTeamData?.currentLocation?.coordinates) {
          setCurrentPos({
            lat: myTeamData.currentLocation.coordinates[1],
            lng: myTeamData.currentLocation.coordinates[0],
          });
        }

        setIncidentsQueue(pendingData);

        if (activeData.length > 0) {
          const job = activeData[0];
          setActiveIncident(job);
          setAppState(job.status === INCIDENT_STATUS.ASSIGNED ? "moving" : "processing");
          if (refreshTrigger === 0) setMapFocus(job.location.coordinates);
        } else {
          setActiveIncident(null);
          const currentState = appStateRef.current;
          if (pendingData.length > 0 && currentState === "normal" && refreshTrigger === 0) {
            setViewingIncident(pendingData[0]);
            setAppState("viewing");
            setMapFocus(pendingData[0].location.coordinates);
          } else if (currentState === "moving" || currentState === "processing") {
            // Ca bị hủy từ server trong khi app đang mở
            setAppState("normal");
          }
        }
      } catch (error) {
        console.error("[RescueHome] Lỗi fetch:", error);
      }
    };

    fetchInitialData();
  }, [userZone, teamId, refreshTrigger]);

  // ─── 2. GPS TRACKING THẬT ────────────────────────────────────────────────
  useEffect(() => {
    // ✅ Guard rõ ràng — IS_SIMULATION_MODE = true thì KHÔNG bật GPS thật
    if (IS_SIMULATION_MODE) {
      console.log("[GPS] 🧪 Chế độ mô phỏng — GPS thật đã tắt. Dùng Postman để bắn tọa độ.");
      return;
    }
    if (isResting || !teamId) return;

    console.log("[GPS] 📡 Bật tracking thực tế.");
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        api.patch(`/rescue-teams/${teamId}/location`, { latitude, longitude }).catch(() => {});
      },
      (err) => console.error("[GPS] Lỗi:", err),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isResting, teamId]);

  // ─── 3. SOCKET ────────────────────────────────────────────────────────────

  // 3a. Nhận tọa độ từ Postman (chế độ mô phỏng)
  useEffect(() => {
    if (!socket || !teamId) return;
    const handleMyLoc = (data) => {
      // Chỉ nhận tọa độ của đội mình
      if (data.teamId === teamId) {
        setCurrentPos({ lat: data.lat, lng: data.lng });
      }
    };
    socket.on("rescue:location", handleMyLoc);
    return () => socket.off("rescue:location", handleMyLoc);
  }, [socket, teamId]);

  // 3b. Sự cố mới + cập nhật sự cố
  useEffect(() => {
    if (!socket || !userZone) return;

    const handleNewIncident = (data) => {
      const newInc = data.incident;
      if (newInc.zone !== userZone) return;
      setIncidentsQueue((prev) => {
        if (prev.find((i) => i._id === newInc._id)) return prev;
        if (appStateRef.current === "normal") {
          setViewingIncident(newInc);
          setAppState("viewing");
          setMapFocus(newInc.location.coordinates);
        }
        return [...prev, newInc];
      });
    };

    const handleUpdated = (data) => {
      if (data.status !== INCIDENT_STATUS.PENDING) {
        setIncidentsQueue((prev) => prev.filter((i) => i._id !== data.id));
        setViewingIncident((prev) => {
          if (prev?._id === data.id) {
            if (appStateRef.current === "viewing") setAppState("normal");
            return null;
          }
          return prev;
        });
      }
    };

    socket.on("incident:new",     handleNewIncident);
    socket.on("alert:sos",        handleNewIncident);
    socket.on("incident:updated", handleUpdated);

    return () => {
      socket.off("incident:new",     handleNewIncident);
      socket.off("alert:sos",        handleNewIncident);
      socket.off("incident:updated", handleUpdated);
    };
  }, [socket, userZone]);

  // 3c. Bị hủy ca từ Admin/Dispatcher
  useEffect(() => {
    if (!socket || !teamId) return;

    const handleCancelled = (data) => {
      // Reset toàn bộ trạng thái đang làm việc
      setActiveIncident(null);
      setAppState("normal");
      setTeamStatus("AVAILABLE");
      // Hiện toast thông báo
      setCancelledNotification(data.message || "Ca trực đã bị hủy bởi điều phối viên.");
      // Tự ẩn sau 6 giây
      setTimeout(() => setCancelledNotification(null), 6000);
    };

    socket.on(`rescue:incident_cancelled:${teamId}`, handleCancelled);
    return () => socket.off(`rescue:incident_cancelled:${teamId}`, handleCancelled);
  }, [socket, teamId]);

  // ─── 4. XỬ LÝ NÚT BẤM ───────────────────────────────────────────────────

  // Bước 1: Nhận ca → PENDING → ASSIGNED
  const handleAccept = async (incident) => {
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.ASSIGNED,
        teamData: user.rescueTeam,
      });
      setActiveIncident(res.data.result);
      setViewingIncident(null);
      setIncidentsQueue([]);
      setAppState("moving");
      setTeamStatus("BUSY"); // ✅ Icon xe đỏ ngay lập tức
      setMapFocus(incident.location.coordinates);
    } catch (error) {
      alert("⚠️ Đội khác đã nhận ca này rồi!");
      setRefreshTrigger((p) => p + 1);
    }
  };

  // Bước 2: Đến nơi → ASSIGNED → IN_PROGRESS
  const handleArrive = async () => {
    if (!activeIncident) return;
    try {
      const res = await api.patch(`/incidents/${activeIncident._id}/status`, {
        status: INCIDENT_STATUS.IN_PROGRESS,
        teamData: user.rescueTeam,
      });
      setActiveIncident(res.data.result);
      setAppState("processing");
    } catch (error) {
      console.error("[RescueHome] Lỗi xác nhận đến nơi:", error);
      alert("Lỗi xác nhận đến nơi. Vui lòng thử lại.");
    }
  };

  // Bước 3: Hoàn thành → COMPLETED → về AVAILABLE
  const handleComplete = async () => {
    if (!activeIncident) return;
    try {
      await api.patch(`/incidents/${activeIncident._id}/status`, {
        status: INCIDENT_STATUS.COMPLETED,
      });
      setActiveIncident(null);
      setAppState("normal");
      setTeamStatus("AVAILABLE"); // ✅ Icon xe xanh ngay lập tức
      setTimeout(() => setRefreshTrigger((p) => p + 1), 300);
    } catch (error) {
      alert("Lỗi chốt ca!");
    }
  };

  // ─── Đo chiều cao panel dưới ─────────────────────────────────────────────
  useEffect(() => {
    if (bottomPanelRef.current) {
      setBottomHeight(bottomPanelRef.current.getBoundingClientRect().height);
    }
  }, [appState, isResting, viewingIncident, incidentsQueue]);

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    const sliderItems = [
      viewingIncident,
      ...incidentsQueue.filter((i) => i._id !== viewingIncident?._id),
    ].filter(Boolean);
    const focusedItem = sliderItems[index];
    if (focusedItem?.location?.coordinates) setMapFocus(focusedItem.location.coordinates);
  };

  // ✅ fleet dùng teamStatus (local) thay vì user.rescueTeam.status (Redux — không tự cập nhật)
  const fleetData = useMemo(() => {
    if (!currentPos || !teamId) return {};
    return {
      [teamId]: {
        ...user.rescueTeam,
        lat: currentPos.lat,
        lng: currentPos.lng,
        status: teamStatus,
      },
    };
  }, [currentPos, teamId, teamStatus, user.rescueTeam]);

  return (
    <main className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-100 overflow-hidden shadow-2xl font-sans text-gray-900">
      {/* 🗺️ MAP */}
      <div className="absolute inset-0 z-0">
        <Map
          incidents={activeIncident ? [] : incidentsQueue}
          activeIncident={activeIncident}
          onMarkerClick={(inc) => { setViewingIncident(inc); setAppState("viewing"); }}
          bottomOffset={bottomHeight + 16}
          onRefresh={() => setRefreshTrigger((p) => p + 1)}
          focusCoords={mapFocus}
          fleet={fleetData}
        />
      </div>

      {/* Toast thông báo hủy ca */}
      {cancelledNotification && (
        <CancelledToast
          message={cancelledNotification}
          onDismiss={() => setCancelledNotification(null)}
        />
      )}

      {(appState === "viewing" || isResting) && (
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-300" />
      )}

      {/* 📱 UI LAYERS */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none h-full">
        <div className="pointer-events-auto">
          <StatusBar />
          <UserProfile isResting={isResting} onToggleRest={() => setIsResting(!isResting)} />
        </div>

        <div ref={bottomPanelRef} className="mt-auto flex flex-col w-full pointer-events-auto pb-4">
          {isResting ? (
            <div className="px-4"><RestingStatus /></div>
          ) : appState === "normal" ? (
            <div className="px-4"><OverviewCard appState="normal" myRole={myInternalRole} /></div>
          ) : appState === "viewing" ? (
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll}
              className="flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar w-full pb-2"
            >
              {[viewingIncident, ...incidentsQueue.filter((i) => i._id !== viewingIncident?._id)]
                .filter(Boolean)
                .map((inc) => (
                  <div key={inc._id} className="w-full shrink-0 flex justify-center snap-center px-4">
                    <OverviewCard
                      appState="new_incident"
                      incident={inc}
                      myRole={myInternalRole}
                      onAccept={handleAccept}
                      onAction={(s) => { setAppState(s); setViewingIncident(null); }}
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="px-4">
              <OverviewCard
                appState={appState}
                incident={activeIncident}
                onAction={setAppState}
                onArrive={handleArrive}
                onComplete={handleComplete}
                myRole={myInternalRole}
                currentPos={currentPos}
              />
            </div>
          )}
          <div className="px-4 mt-2"><TabBar /></div>
        </div>
      </div>
    </main>
  );
};

export default RescueHome;