import React, { useState, useEffect, useMemo } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import Map from "../../components/Public/Map";
import { useSocket } from "../../hooks/useSocket";
import api from "../../services/api";
import {
  INCIDENT_STATUS,
  INCIDENT_SEVERITY,
} from "../../utils/constants/incidentConstants";

export const Home = () => {
  const [allIncidents, setAllIncidents] = useState([]);
  const [fleet, setFleet] = useState({}); // Dạng Object: { [teamId]: { data } }
  const [mapFocus, setMapFocus] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const socket = useSocket();

  // 1. FETCH DỮ LIỆU BAN ĐẦU (REST API)
  // Thực hiện lấy cả Sự cố và Đội cứu hộ để "bật đèn" toàn bộ hệ thống
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [incRes, teamRes] = await Promise.all([
          api.get("/incidents?status=PENDING,ASSIGNED,IN_PROGRESS"),
          // Lấy limit 100 để đảm bảo hiện đủ các đội xe rải rác trên bản đồ
          api.get("/rescue-teams?limit=100"),
        ]);

        // Xử lý danh sách sự cố
        setAllIncidents(incRes.data?.result?.data || []);

        // Xử lý danh sách đội cứu hộ: Chuyển mảng thành Object để truy xuất cực nhanh (O(1))
        const teamsData = teamRes.data?.result?.data || [];
        console.log("SỐ XE THỰC TẾ TỪ API:", teamsData.length); // In trực tiếp độ dài mảng
        console.log(
          "DỮ LIỆU XE SÓC SƠN:",
          teamsData.find((t) => t.name.includes("Sóc Sơn")),
        );
        const initialFleet = {};

        teamsData.forEach((team) => {
          initialFleet[team._id] = {
            teamId: team._id,
            teamName: team.name,
            code: team.code,
            status: team.status,
            // Lưu ý: MongoDB lưu [Lng, Lat] nên ta phải gán ngược lại cho chuẩn Map
            lat: team.currentLocation.coordinates[1],
            lng: team.currentLocation.coordinates[0],
            lastUpdate: team.lastLocationUpdate,
          };
        });

        setFleet(initialFleet);
      } catch (error) {
        console.error("Lỗi khởi tạo Dashboard Dispatcher:", error);
      }
    };
    fetchInitialData();
  }, [refreshTrigger]);

  // 2. XỬ LÝ SOCKET REAL-TIME (Cập nhật sự thay đổi)
  useEffect(() => {
    if (!socket) return;

    // Có sự cố mới
    const handleNewIncident = (data) => {
      setAllIncidents((prev) => {
        if (prev.find((inc) => inc._id === data.incident._id)) return prev;
        return [data.incident, ...prev];
      });
    };

    // Có SOS khẩn cấp (Phát âm thanh cảnh báo)
    const handleSOS = (data) => {
      new Audio("/assets/sounds/sos-alert.mp3").play().catch(() => {});
      setAllIncidents((prev) => {
        if (prev.find((inc) => inc._id === data.incident._id)) return prev;
        return [data.incident, ...prev];
      });
    };

    // Cập nhật trạng thái sự cố (Nếu hoàn thành/hủy thì xóa khỏi Dashboard)
    const handleStatusUpdate = (data) => {
      setAllIncidents((prev) => {
        if (
          [INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(
            data.status,
          )
        ) {
          return prev.filter((inc) => inc._id !== data.id);
        }
        return prev.map((inc) =>
          inc._id === data.id ? { ...inc, status: data.status } : inc,
        );
      });

      // ✅ FIX: Cập nhật status của đội xe trong fleet ngay khi incident thay đổi
      // Không cần chờ GPS mới đổi màu icon
      const incident = data.incident;
      if (!incident?.assignedTeam) return;

      const assignedTeamId =
        typeof incident.assignedTeam === "object"
          ? incident.assignedTeam._id
          : incident.assignedTeam;

      if (!assignedTeamId) return;

      setFleet((prev) => {
        if (!prev[assignedTeamId]) return prev;

        const newStatus = [
          INCIDENT_STATUS.COMPLETED,
          INCIDENT_STATUS.CANCELLED,
        ].includes(data.status)
          ? "AVAILABLE"
          : "BUSY";

        return {
          ...prev,
          [assignedTeamId]: {
            ...prev[assignedTeamId],
            status: newStatus,
          },
        };
      });
    };

    // 🔥 QUAN TRỌNG: Cập nhật vị trí đội xe khi họ di chuyển
    const handleFleetUpdate = (data) => {
      setFleet((prev) => {
        const updatedFleet = { ...prev }; // Tạo clone mảng/object mới hoàn toàn
        updatedFleet[data.teamId] = {
          ...prev[data.teamId],
          lat: data.lat,
          lng: data.lng,
          status: data.status,
          lastUpdate: new Date(),
        };
        return updatedFleet; // Trả về object mới để React re-render
      });
    };

    socket.on("incident:new", handleNewIncident);
    socket.on("alert:sos", handleSOS);
    socket.on("incident:updated", handleStatusUpdate);
    socket.on("rescue:location", handleFleetUpdate); // Lắng nghe tọa độ GPS

    return () => {
      socket.off("incident:new", handleNewIncident);
      socket.off("alert:sos", handleSOS);
      socket.off("incident:updated", handleStatusUpdate);
      socket.off("rescue:location", handleFleetUpdate);
    };
  }, [socket]);

  // Thống kê nhanh tình trạng xe
  const fleetStats = useMemo(() => {
    const teams = Object.values(fleet);
    return {
      available: teams.filter((t) => t.status === "AVAILABLE").length,
      busy: teams.filter((t) => t.status !== "AVAILABLE").length,
    };
  }, [fleet]);

  const handleSelectIncident = (inc) => {
    if (inc.location?.coordinates) {
      // Bay bản đồ tới vị trí sự cố [Lat, Lng]
      setMapFocus(inc.location.coordinates);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <Menu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
              Điều Phối Toàn Cục
            </h2>
            <p className="text-sm text-gray-500">
              Giám sát hệ thống • {allIncidents.length} sự cố đang mở
            </p>
          </div>
          <div className="w-[400px]">
            <SearchBar className="w-full" property1="default" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col lg:flex-row gap-6 no-scrollbar">
          {/* KHU VỰC BẢN ĐỒ */}
          <section className="flex-[2] bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                Bản đồ Giám sát
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  ● {fleetStats.available} XE RẢNH
                </span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                  ● {fleetStats.busy} XE ĐANG BẬN
                </span>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 relative z-0 shadow-inner">
              <Map
                incidents={allIncidents}
                fleet={fleet}
                focusCoords={mapFocus}
                onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
          </section>

          {/* DANH SÁCH SỰ CỐ CẦN XỬ LÝ */}
          <section className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 flex flex-col gap-4 overflow-hidden h-full">
              <h3 className="text-lg font-bold text-gray-900">Sự cố đang mở</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
                {allIncidents.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <span className="material-icons text-5xl">task_alt</span>
                    <p className="text-sm italic font-medium">
                      Hiện tại không có sự cố
                    </p>
                  </div>
                )}
                {allIncidents.map((inc) => {
                  const isSOS = inc.severity === INCIDENT_SEVERITY.CRITICAL;
                  return (
                    <div
                      key={inc._id}
                      onClick={() => handleSelectIncident(inc)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all active:scale-[0.98] hover:shadow-md ${isSOS ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100 hover:border-blue-300"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[9px] font-black px-2.5 py-1 rounded-full ${isSOS ? "bg-red-500 text-white" : "bg-blue-100 text-blue-600"}`}
                        >
                          {isSOS ? "SOS KHẨN CẤP" : inc.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {new Date(inc.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 uppercase">
                        {inc.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-tight">
                        {inc.location.address}
                      </p>
                      <button
                        className={`w-full text-white text-[11px] font-black py-2 rounded-lg transition-colors ${isSOS ? "bg-red-500 hover:bg-red-600" : "bg-[#1e2a5e] hover:bg-blue-900"}`}
                      >
                        {inc.status === INCIDENT_STATUS.PENDING
                          ? "ĐIỀU PHỐI NGAY"
                          : "XEM TIẾN ĐỘ: " + inc.status}
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
