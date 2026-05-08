import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { ShieldOff, X, BellRing } from "lucide-react";
import { useLocation } from "react-router-dom";

import Map from "../../components/Public/Map";
import StatusBar from "../../components/RescueTeam/StatusBar";
import UserProfile from "../../components/RescueTeam/UserProfile";
import OverviewCard from "../../components/RescueTeam/OverviewCard";
import TabBar from "../../components/RescueTeam/TabBar";
import RestingStatus from "../../components/RescueTeam/RestingStatus";
import { useSocket } from "../../hooks/useSocket";
import api from "../../services/api";
import { INCIDENT_STATUS } from "../../utils/constants/incidentConstants";

const IS_SIMULATION_MODE = false;

const CancelledToast = ({ message, onDismiss, type = "error" }) => (
  <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] animate-in fade-in slide-in-from-top-4 duration-400 pointer-events-auto">
    <div className={`${type === "error" ? "bg-gray-900" : "bg-blue-600"} text-white rounded-2xl px-4 py-4 shadow-2xl flex items-start gap-3 border border-white/10`}>
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        {type === "error" ? <ShieldOff size={18} /> : <BellRing size={18} className="animate-bounce" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm text-white mb-0.5">{type === "error" ? "Thông báo hệ thống" : "Thông báo mới"}</p>
        <p className="text-xs text-white/80 leading-snug">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-white/50 hover:text-white mt-0.5"><X size={16} /></button>
    </div>
  </div>
);

export const RescueHome = () => {
  const { user } = useSelector((state) => state.auth);
  const teamId = user?.rescueTeam?._id;
  const userZone = user?.rescueTeam?.zone;
  const socket = useSocket();

  const lastRegisteredIdRef = useRef(null);

  const myInternalRole = useMemo(() => {
    const currentUserId = user?.id || user?._id;
    const member = user?.rescueTeam?.members?.find((m) => (m.userId?._id || m.userId) === currentUserId);
    return member?.role || "MEMBER";
  }, [user]);

  const isLeader = myInternalRole === "LEADER";

  // Lấy dữ liệu được truyền từ RescueLayout (nếu có)
  const location = useLocation();
  const incomingGlobalIncident = location.state?.activeIncidentFromGlobal;

  const initialStatus = user?.rescueTeam?.status || "AVAILABLE";
  
  // GÁN TRỰC TIẾP STATE MẶC ĐỊNH TỪ LOCATION NẾU CÓ
  const [incidentsQueue, setIncidentsQueue] = useState([]);
  const [activeIncident, setActiveIncident] = useState(incomingGlobalIncident || null);
  const [viewingIncident, setViewingIncident] = useState(null);
  
  const [appState, setAppState] = useState(incomingGlobalIncident ? "moving" : "normal");
  const [teamStatus, setTeamStatus] = useState(incomingGlobalIncident ? "BUSY" : initialStatus);
  const [isResting, setIsResting] = useState(initialStatus === "RESTING" && !incomingGlobalIncident);
  
  const [mapFocus, setMapFocus] = useState(incomingGlobalIncident?.location?.coordinates || null);
  
  const [notification, setNotification] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPos, setCurrentPos] = useState(null);
  const [bottomHeight, setBottomHeight] = useState(160);

  const bottomPanelRef = useRef(null);
  const sliderRef = useRef(null);
  
  const appStateRef = useRef(appState);
  const isRestingRef = useRef(isResting);

  useEffect(() => {
    appStateRef.current = appState;
    isRestingRef.current = isResting;
  }, [appState, isResting]);

  // Xóa rác trong History ngay sau khi render lần đầu
  useEffect(() => {
    if (incomingGlobalIncident) {
      window.history.replaceState({}, document.title);
    }
  }, [incomingGlobalIncident]);

  const visibleIncidents = useMemo(() => {
    return incidentsQueue.filter((inc) => {
      const assignedId = inc.assignedTeam?._id || inc.assignedTeam;
      return !assignedId || assignedId === teamId;
    });
  }, [incidentsQueue, teamId]);

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

  useEffect(() => {
    if (!bottomPanelRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) setBottomHeight(entry.target.offsetHeight);
    });
    observer.observe(bottomPanelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!userZone || !teamId) return;

    const fetchInitialData = async () => {
      try {
        const teamRes = await api.get(`/rescue-teams/${teamId}`);
        const myTeamData = teamRes.data?.result;

        if (myTeamData?.status && !incomingGlobalIncident) {
          setTeamStatus(myTeamData.status);
          setIsResting(myTeamData.status === "RESTING");
        }

        if (myTeamData?.currentLocation?.coordinates) {
          setCurrentPos({
            lat: myTeamData.currentLocation.coordinates[1],
            lng: myTeamData.currentLocation.coordinates[0],
          });
        }

        const [pendingRes, activeRes] = await Promise.all([
          api.get(`/incidents?status=PENDING&zone=${encodeURIComponent(userZone)}`),
          api.get(`/incidents?assignedTeam=${teamId}&status=ASSIGNED,IN_PROGRESS`),
        ]);

        const pendingData = pendingRes.data.result.data || [];
        const activeData = activeRes.data.result.data || [];

        setIncidentsQueue(pendingData);

        if (!incomingGlobalIncident) {
            if (activeData.length > 0) {
            const job = activeData[0];
            setActiveIncident(job);
            setAppState(job.status === INCIDENT_STATUS.ASSIGNED ? "moving" : "processing");
            setMapFocus(job.location.coordinates);
            } else if (pendingData.length > 0 && appStateRef.current === "normal" && myTeamData?.status !== "RESTING") {
            const firstFree = pendingData.find((inc) => !inc.assignedTeam);
            if (firstFree) {
                setViewingIncident(firstFree);
                setAppState("viewing");
                setMapFocus(firstFree.location.coordinates);
            }
            }
        }
      } catch (error) {
        console.error("LỖI FETCH INITIAL DATA:", error);
      }
    };
    fetchInitialData();
  }, [userZone, teamId, refreshTrigger, incomingGlobalIncident]);

  // useEffect(() => {
  //   if (!socket || !teamId || !userZone) return;

  //   const registerTeam = () => {
  //     if (!socket.id || lastRegisteredIdRef.current === socket.id) return;
  //     socket.emit("rescue:register", { teamId, role: myInternalRole, zone: userZone });
  //     lastRegisteredIdRef.current = socket.id;
  //   };

  //   if (socket.connected) registerTeam();
  //   socket.on("connect", registerTeam);
  //   return () => socket.off("connect", registerTeam);
  // }, [socket, teamId, myInternalRole, userZone]);

  useEffect(() => {
    if (!socket || !teamId) return;

    const handleLocationUpdate = (data) => {
      if (data.teamId === teamId) {
        if (data.lat !== undefined && data.lng !== undefined) {
          setCurrentPos({ lat: parseFloat(data.lat), lng: parseFloat(data.lng), _ts: Date.now() });
        }
        if (data.status) {
          setTeamStatus(data.status);
          setIsResting(data.status === "RESTING");
        }
      }
    };

    const handleDeleteIncident = (data) => {
      const deletedId = data.incidentId;
      setIncidentsQueue((prev) => prev.filter((i) => i._id !== deletedId));

      if (activeIncident?._id === deletedId || viewingIncident?._id === deletedId) {
        setActiveIncident(null);
        setViewingIncident(null);
        setAppState("normal");
        setTeamStatus("AVAILABLE");
        setNotification({ message: "Sự cố đã bị xóa khỏi hệ thống bởi Điều phối viên.", type: "error" });
        setTimeout(() => setNotification(null), 5000);
      }
    };

    const handleUpdated = (data) => {
      const updatedIncId = data.id;
      const newStatus = data.status;
      const assignedId = data.incident?.assignedTeam?._id || data.incident?.assignedTeam;

      if ([INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(newStatus)) {
        if (activeIncident?._id === updatedIncId || viewingIncident?._id === updatedIncId) {
          setActiveIncident(null);
          setViewingIncident(null);
          setAppState("normal");
          setTeamStatus("AVAILABLE");
          setRefreshTrigger((p) => p + 1);

          if (newStatus === INCIDENT_STATUS.CANCELLED) {
            setNotification({ message: "Sự cố này vừa bị Điều phối viên HỦY.", type: "error" });
            setTimeout(() => setNotification(null), 5000);
          }
        }
        setIncidentsQueue((prev) => prev.filter((i) => i._id !== updatedIncId));
        return;
      }

      if (assignedId && assignedId !== teamId) {
        setIncidentsQueue((prev) => prev.filter((i) => i._id !== updatedIncId));
        if (viewingIncident?._id === updatedIncId) {
          setViewingIncident(null);
          if (appStateRef.current === "viewing") setAppState("normal");
        }
        return;
      }

      if (assignedId === teamId) {
        setActiveIncident(data.incident);
        setViewingIncident(null);
        if (newStatus === INCIDENT_STATUS.ASSIGNED) {
          setAppState("moving");
          setTeamStatus("BUSY");
        } else if (newStatus === INCIDENT_STATUS.IN_PROGRESS) {
          setAppState("processing");
          setTeamStatus("BUSY");
        }
      }
    };

    const handleMapUpdateOnly = (data) => {
      const newInc = data.incident;
      setIncidentsQueue((prev) => {
        if (prev.find((i) => i._id === newInc._id)) return prev;
        return [...prev, newInc];
      });
      if (data.priority === 'HIGH' && navigator.vibrate) try { navigator.vibrate(200); } catch (e) {}
    };

    const handleForcePopupBroadcast = (data) => {
      const newInc = data.incident;
      setIncidentsQueue((prev) => {
        if (prev.find((i) => i._id === newInc._id)) return prev;
        return [...prev, newInc];
      });
      if (appStateRef.current === "normal" && !isRestingRef.current) {
        setViewingIncident(newInc);
        setAppState("viewing");
        setMapFocus(newInc.location?.coordinates);
        if (navigator.vibrate) try { navigator.vibrate([300, 100, 300]); } catch (e) {}
      }
    };

    socket.on("rescue:location_update", handleLocationUpdate);
    socket.on("rescue:location", handleLocationUpdate);
    socket.on("incident:updated", handleUpdated);
    socket.on("incident:delete", handleDeleteIncident);
    socket.on("incident:new", handleMapUpdateOnly);
    socket.on("alert:sos", handleMapUpdateOnly);
    socket.on("incident:broadcast", handleForcePopupBroadcast);
    
    return () => {
      socket.off("rescue:location_update", handleLocationUpdate);
      socket.off("rescue:location", handleLocationUpdate);
      socket.off("incident:updated", handleUpdated);
      socket.off("incident:delete", handleDeleteIncident);
      socket.off("incident:new", handleMapUpdateOnly);
      socket.off("alert:sos", handleMapUpdateOnly);
      socket.off("incident:broadcast", handleForcePopupBroadcast);
    };
  }, [socket, teamId, isLeader, activeIncident, viewingIncident]);

  const currentPosRef = useRef(currentPos);
  useEffect(() => { currentPosRef.current = currentPos; }, [currentPos]);

  useEffect(() => {
    if (!teamId || !socket || IS_SIMULATION_MODE) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        api.patch(`/rescue-teams/${teamId}/location`, { latitude, longitude }).catch(() => {});
        socket.emit("rescue:updateLocation", { teamId, lat: latitude, lng: longitude, status: teamStatus, teamName: user?.rescueTeam?.name });
      },
      (err) => console.warn("GPS:", err.message),
      { enableHighAccuracy: true, distanceFilter: 10, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [teamId, socket, teamStatus, user?.rescueTeam?.name]);

  useEffect(() => {
    if (!teamId || IS_SIMULATION_MODE) return;
    const heartbeatInterval = setInterval(() => {
      const pos = currentPosRef.current;
      if (pos && typeof pos.lat === 'number' && typeof pos.lng === 'number') {
        api.patch(`/rescue-teams/${teamId}/location`, { latitude: pos.lat, longitude: pos.lng }).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(heartbeatInterval);
  }, [teamId]);

  const handleAccept = async (incident) => {
    if (!isLeader) return alert("Chỉ Đội trưởng mới được quyền nhận!");
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, { status: INCIDENT_STATUS.ASSIGNED, teamData: user.rescueTeam });
      setActiveIncident(res.data.result);
      setViewingIncident(null);
      setAppState("moving");
      setTeamStatus("BUSY");
      setMapFocus(incident.location.coordinates);
    } catch (error) {
      alert("Sự cố đã có đội khác nhận!");
      setRefreshTrigger((p) => p + 1);
    }
  };

  const handleArrive = async () => {
    if (!isLeader) return;
    try {
      const res = await api.patch(`/incidents/${activeIncident._id}/status`, { status: INCIDENT_STATUS.IN_PROGRESS, teamData: user.rescueTeam });
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
    } catch (error) { alert("Lỗi chốt ca!", error); }
  };

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    const focusedItem = visibleIncidents[index];
    if (focusedItem?.location?.coordinates) setMapFocus(focusedItem.location.coordinates);
  };

  const handleToggleRest = async () => {
    if (!isLeader) return alert("Chỉ Đội trưởng mới được đổi trạng thái ca trực!");
    const newRestingState = !isResting;
    const newStatus = newRestingState ? "RESTING" : "AVAILABLE";
    try {
      await api.patch(`/rescue-teams/${teamId}/status`, { status: newStatus });
      setIsResting(newRestingState);
      setTeamStatus(newStatus);
      if (socket && currentPos) {
        socket.emit("rescue:updateLocation", { teamId, lat: currentPos.lat, lng: currentPos.lng, status: newStatus, teamName: user?.rescueTeam?.name });
      }
    } catch (error) {
      alert("Chưa thể đổi trạng thái lúc này, vui lòng thử lại!");
    }
  };

  return (
    <main className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-100 overflow-hidden shadow-2xl font-sans text-gray-900">
      <div className="absolute inset-0 z-0">
        <Map
          incidents={activeIncident ? [] : visibleIncidents}
          activeIncident={activeIncident}
          onMarkerClick={(inc) => {
            setViewingIncident(inc);
            setAppState("viewing");
          }}
          onRefresh={() => setRefreshTrigger((p) => p + 1)}
          focusCoords={mapFocus}
          fleet={fleetData}
          bottomOffset={bottomHeight + 16}
        />
      </div>

      {notification && (
        <CancelledToast message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />
      )}

      {(appState === "viewing" || isResting) && (
        <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px]" />
      )}

      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none h-full">
        <div className="pointer-events-auto">
          <StatusBar />
          <UserProfile isResting={isResting} onToggleRest={handleToggleRest} />
        </div>

        <div ref={bottomPanelRef} className="mt-auto flex flex-col w-full pointer-events-auto pb-4">
          {isResting ? (
            <div className="px-4"><RestingStatus /></div>
          ) : appState === "normal" ? (
            <div className="px-4"><OverviewCard appState="normal" myRole={myInternalRole} /></div>
          ) : appState === "viewing" ? (
            <div ref={sliderRef} onScroll={handleSliderScroll} className="flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar w-full pb-2">
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

          <div className="px-4 mt-2">
            <TabBar />
          </div>
        </div>
      </div>
    </main>
  );
};

export default RescueHome;