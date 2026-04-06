import React, { useState, useEffect, useMemo } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import Map from "../../components/Public/Map";
import { useSocket } from "../../hooks/useSocket";
import api from "../../services/api";
import { INCIDENT_STATUS, INCIDENT_SEVERITY } from "../../utils/constants/incidentConstants";

export const Home = () => {
  const [allIncidents, setAllIncidents] = useState([]);
  const [fleet, setFleet] = useState({});
  const [mapFocus, setMapFocus] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const socket = useSocket();

  // 1. Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchAllIncidents = async () => {
      try {
        // Sau khi sửa Backend, dòng này sẽ hoạt động đúng
        const res = await api.get("/incidents?status=PENDING,ASSIGNED,IN_PROGRESS");
        const data = res.data?.result?.data || [];
        setAllIncidents(data);
      } catch (error) {
        console.error("Lỗi tải danh sách sự cố tổng thể:", error);
      }
    };
    fetchAllIncidents();
  }, [refreshTrigger]);

  // 2. Xử lý Socket Real-time
  useEffect(() => {
    if (!socket) return;

    // Có sự cố mới
    const handleNewIncident = (data) => {
      setAllIncidents((prev) => {
        // Kiểm tra tránh trùng lặp
        if (prev.find(inc => inc._id === data.incident._id)) return prev;
        return [data.incident, ...prev];
      });
    };

    // Có SOS mới
    const handleSOS = (data) => {
      new Audio("/assets/sounds/sos-alert.mp3").play().catch(() => {});
      setAllIncidents((prev) => {
        if (prev.find(inc => inc._id === data.incident._id)) return prev;
        return [data.incident, ...prev];
      });
    };

    // Cập nhật trạng thái
    const handleStatusUpdate = (data) => {
      setAllIncidents((prev) => {
        // Nếu chuyển sang COMPLETED hoặc CANCELLED -> Xóa khỏi danh sách đang xử lý
        if ([INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(data.status)) {
          return prev.filter(inc => inc._id !== data.id);
        }
        // Nếu vẫn đang xử lý -> Cập nhật status trong mảng
        return prev.map((inc) => (inc._id === data.id ? { ...inc, status: data.status } : inc));
      });
    };

    const handleFleetUpdate = (data) => {
      setFleet((prev) => ({
        ...prev,
        [data.teamId]: { ...data, lastUpdate: new Date() },
      }));
    };

    socket.on("incident:new", handleNewIncident);
    socket.on("alert:sos", handleSOS);
    socket.on("incident:updated", handleStatusUpdate);
    socket.on("rescue:location_update", handleFleetUpdate);

    return () => {
      socket.off("incident:new", handleNewIncident);
      socket.off("alert:sos", handleSOS);
      socket.off("incident:updated", handleStatusUpdate);
      socket.off("rescue:location_update", handleFleetUpdate);
    };
  }, [socket]);

  const fleetStats = useMemo(() => {
    const teams = Object.values(fleet);
    return {
      available: teams.filter((t) => t.status === "AVAILABLE").length,
      busy: teams.filter((t) => t.status !== "AVAILABLE").length,
    };
  }, [fleet]);

  const handleSelectIncident = (inc) => {
    if (inc.location?.coordinates) {
      setMapFocus(inc.location.coordinates);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <Menu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">Trung Tâm Điều Phối Toàn Cục</h2>
            <p className="text-sm text-gray-500">Giám sát Real-time • {allIncidents.length} sự cố đang mở</p>
          </div>
          <div className="w-[400px]"><SearchBar className="w-full" property1="default" /></div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col lg:flex-row gap-6">
          <section className="flex-[2] bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Giám sát Đội xe & Sự cố</h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">● {fleetStats.available} XE TRỐNG</span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">● {fleetStats.busy} XE ĐANG BẬN</span>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative z-0">
              <Map incidents={allIncidents} fleet={fleet} focusCoords={mapFocus} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
            </div>
          </section>

          <section className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 flex flex-col gap-4 overflow-hidden h-full">
              <h3 className="text-lg font-bold text-gray-900">Sự cố cần xử lý</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
                {allIncidents.length === 0 && <p className="text-center py-10 text-gray-400 text-sm italic">Hệ thống đang trống</p>}
                {allIncidents.map((inc) => {
                  const isSOS = inc.severity === INCIDENT_SEVERITY.CRITICAL;
                  return (
                    <div 
                      key={inc._id}
                      onClick={() => handleSelectIncident(inc)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all active:scale-[0.98] ${isSOS ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100 hover:border-blue-300"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isSOS ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                          {isSOS ? "SOS KHẨN CẤP" : inc.type}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(inc.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{inc.title}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{inc.location.address}</p>
                      <button className={`w-full text-white text-[11px] font-bold py-2 rounded-lg ${isSOS ? "bg-red-500" : "bg-[#1e2a5e]"}`}>
                        {inc.status === INCIDENT_STATUS.PENDING ? "ĐIỀU PHỐI NGAY" : "TIẾN ĐỘ: " + inc.status}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};