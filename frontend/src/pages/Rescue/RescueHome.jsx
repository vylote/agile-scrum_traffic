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
import { ShieldOff, X, BellRing } from "lucide-react";

// ─── 1. Toast thông báo hệ thống ─────────────────────────────────────────────
const CancelledToast = ({ message, onDismiss, type = "error" }) => (
  <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] animate-in fade-in slide-in-from-top-4 duration-400 pointer-events-auto">
    <div className={`${type === "error" ? "bg-gray-900" : "bg-blue-600"} text-white rounded-2xl px-4 py-4 shadow-2xl flex items-start gap-3 border border-white/10`}>
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        {type === "error" ? <ShieldOff size={18} /> : <BellRing size={18} className="animate-bounce" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm text-white mb-0.5">
          {type === "error" ? "Thông báo hệ thống" : "Thông báo mới"}
        </p>
        <p className="text-xs text-white/80 leading-snug">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-white/50 hover:text-white mt-0.5">
        <X size={16} />
      </button>
    </div>
  </div>
);

const IS_SIMULATION_MODE = true;

export const RescueHome = () => {
  const { user } = useSelector((state) => state.auth);

  const [incidentsQueue, setIncidentsQueue] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [viewingIncident, setViewingIncident] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);

  const [appState, setAppState] = useState("normal");
  const [isResting, setIsResting] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(160);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mapFocus, setMapFocus] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);

  const [teamStatus, setTeamStatus] = useState(user?.rescueTeam?.status || "AVAILABLE");
  const [notification, setNotification] = useState(null);

  const bottomPanelRef = useRef(null);
  const sliderRef = useRef(null);
  const socket = useSocket();

  const appStateRef = useRef(appState);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  const teamId = user?.rescueTeam?._id;
  const userZone = user?.rescueTeam?.zone;

  const myInternalRole = useMemo(() => {
    const currentUserId = user?.id || user?._id;
    const member = user?.rescueTeam?.members?.find(
      (m) => (m.userId?._id || m.userId) === currentUserId
    );
    return member?.role || "MEMBER";
  }, [user]);

  const isLeader = myInternalRole === "LEADER";

  // 🛡️ CHỐT CHẶN BỘ LỌC
  const visibleIncidents = useMemo(() => {
    return incidentsQueue.filter((inc) => {
      const assignedId = inc.assignedTeam?._id || inc.assignedTeam;
      return !assignedId || assignedId === teamId; 
    });
  }, [incidentsQueue, teamId]);

  // ─── 2. FETCH DỮ LIỆU ĐẦU CA ─────────────────────────────────────────────
  useEffect(() => {
    if (!userZone || !teamId) return;

    const fetchInitialData = async () => {
      try {
        const [pendingRes, activeRes, teamRes] = await Promise.all([
          api.get(`/incidents?status=PENDING&zone=${encodeURIComponent(userZone)}`),
          api.get(`/incidents?assignedTeam=${teamId}&status=ASSIGNED,IN_PROGRESS`),
          api.get(`/rescue-teams/${teamId}`),
        ]);

        const pendingData = pendingRes.data.result.data || [];
        const activeData = activeRes.data.result.data || [];
        const myTeamData = teamRes.data?.result;

        if (myTeamData?.status) setTeamStatus(myTeamData.status);
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
          setMapFocus(job.location.coordinates);
        } else if (pendingData.length > 0 && appStateRef.current === "normal") {
          const firstFree = pendingData.find((inc) => !inc.assignedTeam);
          if (firstFree) {
            setViewingIncident(firstFree);
            setAppState("viewing");
            setMapFocus(firstFree.location.coordinates);
          }
        }
      } catch (error) { console.error("Initial Fetch Error:", error); }
    };
    fetchInitialData();
  }, [userZone, teamId, refreshTrigger]);

  // ─── 3. SOCKET LOGIC (Đã vá đủ 6 điểm lỗi kỹ thuật & hành vi) ───────────
  useEffect(() => {
    if (!socket || !teamId) return;

    if (isLeader) socket.emit("rescue:register", { teamId, role: "LEADER" });

    // A. Xử lý tọa độ
    const handleLocationUpdate = (data) => {
      if (data.teamId === teamId) {
        setCurrentPos({ lat: parseFloat(data.lat), lng: parseFloat(data.lng), _ts: Date.now() });
      }
    };

    // B. Xử lý nhận lệnh (Đã vá revoke_request & Log màu)
    const handleIncomingRequest = (data) => {
      const receivedAt = new Date().toLocaleTimeString();
      console.log(`%c[${receivedAt}] 📥 NHẬN LỆNH ĐIỀU ĐỘNG:`, "color: #0088FF; font-weight: bold", data);

      // 🔥 VÁ 1: Xử lý revoke lồng trong request (Doc 1)
      if (data.action === "revoke_request") {
        setIncomingRequest(null);
        if (appStateRef.current === "incoming") setAppState("normal");
        return;
      }

      if (!isLeader) return; 

      setIncomingRequest({ incident: data.incident, expiresAt: Date.now() + 30000 });
      setAppState("incoming");
      setMapFocus(data.incident.location?.coordinates);
      if (navigator.vibrate) try { navigator.vibrate([300, 100, 300]); } catch (e) {}
    };

    // C. Xử lý thu hồi lệnh
    const handleRevoke = () => {
      setIncomingRequest(null);
      if (appStateRef.current === "incoming") setAppState("normal");
    };

    // D. Xử lý xóa sự cố
    const handleDeleteIncident = (data) => {
        const deletedId = data.incidentId;
        setIncidentsQueue(prev => prev.filter(i => i._id !== deletedId));
        if (activeIncident?._id === deletedId || viewingIncident?._id === deletedId) {
            setActiveIncident(null); setViewingIncident(null); setAppState("normal");
            setTeamStatus("AVAILABLE");
            setNotification({ message: "Sự cố đã bị xóa khỏi hệ thống.", type: "error" });
            setTimeout(() => setNotification(null), 5000);
        }
    };

    // E. Xử lý cập nhật trạng thái (Đã vá BUSY sync)
    const handleUpdated = (data) => {
      const assignedId = data.incident?.assignedTeam?._id || data.incident?.assignedTeam;

      if (assignedId && assignedId !== teamId) {
        setIncidentsQueue((prev) => prev.filter((i) => i._id !== data.id));
        if (viewingIncident?._id === data.id) {
          setViewingIncident(null);
          if (appStateRef.current === "viewing") setAppState("normal");
        }
        return;
      }

      if (assignedId === teamId) {
        setActiveIncident(data.incident);
        setIncomingRequest(null);
        setViewingIncident(null);
        
        if (data.status === INCIDENT_STATUS.ASSIGNED) {
            setAppState("moving");
            setTeamStatus("BUSY"); // 🔥 Đã khôi phục sync Busy
        } else if (data.status === INCIDENT_STATUS.IN_PROGRESS) {
            setAppState("processing");
            setTeamStatus("BUSY");
        } else if ([INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(data.status)) {
            setActiveIncident(null);
            setAppState("normal");
            setTeamStatus("AVAILABLE");
            setRefreshTrigger((p) => p + 1);
        }
      }
    };

    // F. Xử lý đơn mới (Đã vá MapFocus)
    const handleNewIncident = (data) => {
      const newInc = data.incident;
      if (!newInc.assignedTeam) {
        setIncidentsQueue((prev) => {
          if (prev.find((i) => i._id === newInc._id)) return prev;
          return [...prev, newInc];
        });
        if (appStateRef.current === "normal") {
            setViewingIncident(newInc);
            setAppState("viewing");
            setMapFocus(newInc.location?.coordinates); // 🔥 Đã khôi phục MapFocus
        }
      }
    };

    socket.on("rescue:location_update", handleLocationUpdate);
    socket.on("rescue:location", handleLocationUpdate);
    socket.on(`rescue:incoming_request:${teamId}`, handleIncomingRequest);
    socket.on("rescue:revoke_request", handleRevoke);
    socket.on("incident:updated", handleUpdated);
    socket.on("incident:new", handleNewIncident);
    socket.on("alert:sos", handleNewIncident);
    socket.on("delete_incident", handleDeleteIncident);

    return () => {
      socket.off("rescue:location_update", handleLocationUpdate);
      socket.off("rescue:location", handleLocationUpdate);
      socket.off(`rescue:incoming_request:${teamId}`, handleIncomingRequest);
      socket.off("rescue:revoke_request", handleRevoke); 
      socket.off("incident:updated", handleUpdated);
      socket.off("incident:new", handleNewIncident);
      socket.off("alert:sos", handleNewIncident);
      socket.off("delete_incident", handleDeleteIncident);
    };
  }, [socket, teamId, isLeader, activeIncident, viewingIncident]);

  // ─── 4. GPS NATIVE (Demo thực tế) ────────────────────────────────────────
  useEffect(() => {
    if (!teamId || isResting || !socket || IS_SIMULATION_MODE) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        api.patch(`/rescue-teams/${teamId}/location`, { latitude, longitude }).catch(() => {});
        socket.emit("rescue:updateLocation", { teamId, lat: latitude, lng: longitude, status: teamStatus, teamName: user.rescueTeam.name });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isResting, teamId, socket, teamStatus]);

  // ─── 5. HÀNH ĐỘNG (Đã vá MapFocus cho handleAccept) ──────────────────────

  const handleAccept = async (incident) => {
    if (!isLeader) return alert("⚠️ Chỉ Đội trưởng mới được quyền nhận!");
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.ASSIGNED,
        teamData: user.rescueTeam,
      });
      setActiveIncident(res.data.result);
      setIncomingRequest(null);
      setViewingIncident(null);
      setAppState("moving");
      setTeamStatus("BUSY");
      setMapFocus(incident.location.coordinates); // 🔥 Đã khôi phục MapFocus
    } catch (error) {
      alert("⚠️ Sự cố đã có đội khác nhận!");
      setRefreshTrigger((p) => p + 1);
    }
  };

  const handleArrive = async () => {
    if (!isLeader) return;
    try {
      const res = await api.patch(`/incidents/${activeIncident._id}/status`, {
        status: INCIDENT_STATUS.IN_PROGRESS,
        teamData: user.rescueTeam,
      });
      setActiveIncident(res.data.result);
      setAppState("processing");
    } catch (error) { console.error(error); }
  };

  const handleComplete = async () => {
    if (!isLeader) return;
    try {
      await api.patch(`/incidents/${activeIncident._id}/status`, { status: INCIDENT_STATUS.COMPLETED });
      setActiveIncident(null);
      setAppState("normal");
      setTeamStatus("AVAILABLE");
      setRefreshTrigger((p) => p + 1);
    } catch (error) { alert("Lỗi chốt ca!"); }
  };

  const handleReject = async () => {
    if (!isLeader) return;
    if (!incomingRequest) return;
    try {
        await api.patch(`/incidents/${incomingRequest.incident._id}/reject`);
    } catch (e) { console.error(e); } 
    finally {
        setIncomingRequest(null);
        setAppState("normal");
    }
  };

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    const focusedItem = visibleIncidents[index];
    if (focusedItem?.location?.coordinates) setMapFocus(focusedItem.location.coordinates);
  };

  const fleetData = useMemo(() => {
    if (!currentPos || !teamId) return {};
    return { [teamId]: { ...user.rescueTeam, lat: currentPos.lat, lng: currentPos.lng, status: teamStatus } };
  }, [currentPos, teamId, teamStatus, user.rescueTeam]);

  // ─── 6. RENDER ──────────────────────────────────────────────────────────

  return (
    <main className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-100 overflow-hidden shadow-2xl font-sans text-gray-900">
      <div className="absolute inset-0 z-0">
        <Map
          incidents={activeIncident ? [] : visibleIncidents}
          activeIncident={activeIncident}
          onMarkerClick={(inc) => { setViewingIncident(inc); setAppState("viewing"); }}
          onRefresh={() => setRefreshTrigger((p) => p + 1)}
          focusCoords={mapFocus}
          fleet={fleetData}
          bottomOffset={bottomHeight + 16}
        />
      </div>

      {notification && (
        <CancelledToast 
            message={notification.message} 
            type={notification.type} 
            onDismiss={() => setNotification(null)} 
        />
      )}

      {(appState === "viewing" || appState === "incoming" || isResting) && (
        <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px]" />
      )}

      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none h-full">
        <div className="pointer-events-auto">
          <StatusBar />
          <UserProfile isResting={isResting} onToggleRest={() => setIsResting(!isResting)} />
        </div>

        <div ref={bottomPanelRef} className="mt-auto flex flex-col w-full pointer-events-auto pb-4">
          {isResting ? (
            <div className="px-4"><RestingStatus /></div>
          ) : appState === "incoming" && incomingRequest ? (
            <div className="px-4 animate-in slide-in-from-bottom-10 duration-500">
              <OverviewCard
                appState="incoming"
                incident={incomingRequest.incident}
                expiresAt={incomingRequest.expiresAt}
                onAccept={() => handleAccept(incomingRequest.incident)}
                onReject={handleReject}
                myRole={myInternalRole}
              />
            </div>
          ) : appState === "normal" ? (
            <div className="px-4"><OverviewCard appState="normal" myRole={myInternalRole} /></div>
          ) : appState === "viewing" ? (
            <div 
              ref={sliderRef} 
              onScroll={handleSliderScroll}
              className="flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar w-full pb-2"
            >
              {visibleIncidents.map((inc) => (
                <div key={inc._id} className="w-full shrink-0 flex justify-center snap-center px-4">
                  <OverviewCard
                    appState="new_incident"
                    incident={inc}
                    myRole={myInternalRole}
                    onAccept={() => handleAccept(inc)}
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