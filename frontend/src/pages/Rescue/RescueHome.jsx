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

export const RescueHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [incidentsQueue, setIncidentsQueue] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [viewingIncident, setViewingIncident] = useState(null);
  const [appState, setAppState] = useState("normal");
  const [isResting, setIsResting] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(160);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mapFocus, setMapFocus] = useState(null);

  const bottomPanelRef = useRef(null);
  const sliderRef = useRef(null);
  const socket = useSocket();

  const appStateRef = useRef(appState);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  // 🔥 XÁC ĐỊNH VAI TRÒ (Cần đảm bảo user.id khớp với mảng members)
  const myInternalRole = useMemo(() => {
    // Lưu ý: user.id hoặc user._id tùy vào cách bạn lưu trong Redux
    const currentUserId = user?.id || user?._id;
    const member = user?.rescueTeam?.members?.find(m => 
      (m.userId?._id || m.userId) === currentUserId
    );
    return member?.role || "MEMBER"; 
  }, [user]);

  const userZone = user?.rescueTeam?.zone;
  const teamId = user?.rescueTeam?._id;

  useEffect(() => {
    if (!userZone || !teamId) return;
    const fetchInitialData = async () => {
      try {
        const [pendingRes, activeRes] = await Promise.all([
          api.get(`/incidents?status=PENDING&zone=${encodeURIComponent(userZone)}`),
          api.get(`/incidents?assignedTeam=${teamId}&status=ASSIGNED,IN_PROGRESS`)
        ]);
        setIncidentsQueue(pendingRes.data.result.data || []);
        const activeData = activeRes.data.result.data || [];

        if (activeData.length > 0) {
          const job = activeData[0];
          setActiveIncident(job);
          setAppState(job.status === INCIDENT_STATUS.ASSIGNED ? "moving" : "processing");
          setMapFocus(job.location.coordinates);
        } else if (pendingRes.data.result.data.length > 0 && appStateRef.current === "normal") {
          setViewingIncident(pendingRes.data.result.data[0]);
          setAppState("viewing");
          setMapFocus(pendingRes.data.result.data[0].location.coordinates);
        }
      } catch (error) { console.error("Lỗi nạp dữ liệu:", error); }
    };
    fetchInitialData();
  }, [userZone, teamId, refreshTrigger]);

  // GPS Tracking & Socket (Giữ nguyên như bản trước của bạn)
  useEffect(() => {
    if (isResting || !teamId) return;
    const reportLocation = (pos) => {
      api.patch(`/rescue-teams/${teamId}/location`, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      }).catch(() => {});
    };
    const watchId = navigator.geolocation.watchPosition(reportLocation, null, { enableHighAccuracy: true, distanceFilter: 10 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isResting, teamId]);

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
    socket.on("incident:new", handleNewIncident);
    socket.on("alert:sos", handleNewIncident);
    return () => { socket.off("incident:new"); socket.off("alert:sos"); };
  }, [socket, userZone]);

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    const sliderItems = [viewingIncident, ...incidentsQueue.filter(i => i._id !== viewingIncident?._id)].filter(Boolean);
    const focusedItem = sliderItems[index];
    if (focusedItem?.location?.coordinates) setMapFocus(focusedItem.location.coordinates);
  };

  const handleAccept = async (incident) => {
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.IN_PROGRESS,
        teamData: user.rescueTeam,
      });
      setActiveIncident(res.data.result);
      setViewingIncident(null);
      setIncidentsQueue([]);
      setAppState("moving");
    } catch (error) { 
      alert("Đội khác đã nhận ca này!");
      setRefreshTrigger(p => p + 1);
    }
  };

  const handleComplete = async () => {
    if (!activeIncident) return;
    try {
      await api.patch(`/incidents/${activeIncident._id}/status`, { status: INCIDENT_STATUS.COMPLETED });
      setAppState("normal");
      setActiveIncident(null);
      setRefreshTrigger(p => p + 1);
    } catch (error) { alert("Lỗi chốt ca!"); }
  };

  useEffect(() => {
    if (bottomPanelRef.current) setBottomHeight(bottomPanelRef.current.getBoundingClientRect().height);
  }, [appState, isResting, viewingIncident, incidentsQueue]);

  return (
    <main className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-100 overflow-hidden shadow-2xl font-sans text-gray-900">
      <div className="absolute inset-0 z-0">
        <Map incidents={activeIncident ? [] : incidentsQueue} activeIncident={activeIncident} onMarkerClick={(inc) => { setViewingIncident(inc); setAppState("viewing"); }} bottomOffset={bottomHeight + 16} onRefresh={() => setRefreshTrigger(p => p + 1)} focusCoords={mapFocus} />
      </div>

      {(appState === "viewing" || isResting) && <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-300" />}

      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none h-full">
        <div className="pointer-events-auto">
          <StatusBar />
          <UserProfile isResting={isResting} onToggleRest={() => setIsResting(!isResting)} />
        </div>

        <div ref={bottomPanelRef} className="mt-auto flex flex-col w-full pointer-events-auto pb-4">
          {isResting ? (
            <div className="px-4"><RestingStatus /></div>
          ) : appState === "normal" ? (
            <div className="px-4">
              {/* Truyền role vào ngay cả trạng thái normal nếu cần hiển thị info */}
              <OverviewCard appState="normal" myRole={myInternalRole} />
            </div>
          ) : appState === "viewing" ? (
            <div ref={sliderRef} onScroll={handleSliderScroll} className="flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar w-full pb-2">
              {[viewingIncident, ...incidentsQueue.filter(i => i._id !== viewingIncident?._id)].filter(Boolean).map((inc) => (
                <div key={inc._id} className="w-full shrink-0 flex justify-center snap-center px-4">
                   <OverviewCard
                      appState="new_incident"
                      incident={inc}
                      myRole={myInternalRole} // 🔥 BẮT BUỘC PHẢI CÓ DÒNG NÀY
                      onAction={(s) => { setAppState(s); setViewingIncident(null); }}
                      onAccept={handleAccept}
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
                onComplete={handleComplete} 
                myRole={myInternalRole} // 🔥 TRUYỀN VÀO ĐỂ HIỂN THỊ ĐÚNG
              />
            </div>
          )}
          <div className="px-4 mt-2"><TabBar /></div>
        </div>
      </div>
    </main>
  );
};