import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import Map from "../../components/Public/Map";
import StatusBar from "../../components/RescueTeam/StatusBar";
import UserProfile from "../../components/RescueTeam/UserProfile";
import OverviewCard from "../../components/RescueTeam/OverviewCard";
import TabBar from "../../components/RescueTeam/TabBar";
import RestingStatus from "../../components/RescueTeam/RestingStatus";
import { useSocket } from "../../hooks/useSocket";
import api from "../../services/api";

export const RescueHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [incidentsQueue, setIncidentsQueue] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [viewingIncident, setViewingIncident] = useState(null);
  const [appState, setAppState] = useState("normal");
  const appStateRef = useRef(appState);
  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);
  const [isResting, setIsResting] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(160);

  const bottomPanelRef = useRef(null);
  const sliderRef = useRef(null); // Ref để quét tọa độ thanh cuộn

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mapFocus, setMapFocus] = useState(null); // Tọa độ để Map bay tới

  const socket = useSocket(activeIncident?._id);

  useEffect(() => {
    const userZone = user?.rescueTeam?.zone;
    if (!userZone) return;

    const fetchPendingIncidents = async () => {
      try {
        const res = await api.get(
          `/incidents?status=PENDING&zone=${encodeURIComponent(userZone)}`,
        );
        const fetchedData = res.data.result.data || [];
        setIncidentsQueue(fetchedData);

        // 🔥 NÂNG CẤP TẠI ĐÂY:
        // Nếu load được data (khi F5 hoặc khi bấm nút Refresh) mà đang ở trạng thái rảnh rỗi (normal)
        // thì tự động bật Slider lên cho xem sự cố đầu tiên luôn!
        if (fetchedData.length > 0 && appStateRef.current === "normal") {
          setViewingIncident(fetchedData[0]);
          setAppState("viewing");
          if (fetchedData[0]?.location?.coordinates) {
            setMapFocus(fetchedData[0].location.coordinates);
          }
        }
      } catch (error) {
        console.error("Lỗi tải sự cố:", error);
      }
    };
    fetchPendingIncidents();
  }, [user, refreshTrigger]);

  useEffect(() => {
    if (!socket) return;
    const handleNewIncident = (data) => {
      setIncidentsQueue((prev) => {
        if (prev.find((i) => i._id === data.incident._id)) return prev;
        return [...prev, data.incident];
      });
    };
    socket.on("incident:new", handleNewIncident);
    return () => socket.off("incident:new", handleNewIncident);
  }, [socket]);

  // Khi click Marker, mở Slider và bay camera về sự cố đó
  const handleMarkerClick = (incident) => {
    if (appState === "normal" || appState === "viewing") {
      setViewingIncident(incident);
      setAppState("viewing");
      setMapFocus(incident.location.coordinates);

      // Kéo thanh cuộn về vị trí đầu tiên
      if (sliderRef.current) {
        sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

  // 🔥 LOGIC: Tự động tính toán xem thẻ nào đang ở giữa màn hình khi vuốt
  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;

    // Tìm điểm giữa của container
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;

    let minDistance = Infinity;
    let closestIndex = 0;

    // Duyệt qua các thẻ con bên trong slider để tìm thẻ gần tâm nhất
    Array.from(container.children).forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(childCenter - scrollCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Xác định sự cố tương ứng với thẻ đang nằm ở giữa
    const sliderItems = [
      viewingIncident,
      ...incidentsQueue.filter((i) => i._id !== viewingIncident._id),
    ];
    const focusedItem = sliderItems[closestIndex];

    if (focusedItem?.location?.coordinates) {
      setMapFocus(focusedItem.location.coordinates); // Gửi tọa độ mới sang Map
    }
  };

  const handleAccept = async (incident) => {
    try {
      await api.patch(`/incidents/${incident._id}/status`, {
        status: "IN_PROGRESS",
        teamData: user.rescueTeam,
      });
      setActiveIncident(incident);
      setViewingIncident(null);
      setMapFocus(null);
      setIncidentsQueue([]);
      setAppState("moving");
    } catch (error) {
      alert("Lỗi nhận ca!", error);
    }
  };

  const handleComplete = async () => {
    if (activeIncident) {
      try {
        await api.patch(`/incidents/${activeIncident._id}/status`, {
          status: "COMPLETED",
        });
      } catch (error) {
        alert("Lỗi khi chốt ca, vui lòng thử lại!", error);
        return;
      }
    }
    setAppState("normal");
    setActiveIncident(null);
    setMapFocus(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Nút X đóng Slider
  const handleCloseSlider = () => {
    setAppState("normal");
    setMapFocus(null);
  };

  useEffect(() => {
    if (bottomPanelRef.current) {
      setBottomHeight(bottomPanelRef.current.getBoundingClientRect().height);
    }
  }, [appState, isResting]);

  return (
    <main className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-100 overflow-hidden shadow-2xl font-sans">
      <div className="absolute inset-0 z-0">
        <Map
          incidents={activeIncident ? [] : incidentsQueue}
          activeIncident={activeIncident}
          onMarkerClick={handleMarkerClick}
          bottomOffset={bottomHeight + 16}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)} // Truyền bóp cò Refresh
          focusCoords={mapFocus} // Truyền tọa độ bay
        />
      </div>

      {(appState === "viewing" || isResting) && (
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity" />
      )}

      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none h-full">
        <div className="pointer-events-auto">
          <StatusBar />
          <UserProfile
            isResting={isResting}
            onToggleRest={() => setIsResting(!isResting)}
          />
        </div>

        <div
          ref={bottomPanelRef}
          className="mt-auto flex flex-col w-full pointer-events-auto pb-4"
        >
          {isResting ? (
            <div className="px-4">
              <RestingStatus />
            </div>
          ) : appState === "normal" ? (
            <div className="px-4">
              <OverviewCard appState="normal" />
            </div>
          ) : appState === "viewing" ? (
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll} // Bắt sự kiện cuộn tay
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 no-scrollbar pb-2"
            >
              {[
                viewingIncident,
                ...incidentsQueue.filter((i) => i._id !== viewingIncident._id),
              ].map((inc) => (
                <div key={inc._id} className="min-w-[92%] snap-center shrink-0">
                  <OverviewCard
                    appState="new_incident"
                    incident={inc}
                    onAction={handleCloseSlider}
                    onAccept={() => handleAccept(inc)}
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
