import React, { useState, useEffect } from "react";
import { BottomNav } from "../../components/Citizen/BottomNav";
import { ArrowLeft, Navigation, MapPin } from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket";
import { INCIDENT_STATUS } from "../../utils/constants/incidentConstants";
import Map from "../../components/Public/Map";

export const CitizenHistory = () => {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [rescuePos, setRescuePos] = useState(null);

  // 1. Lấy dữ liệu ban đầu
  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/incidents");
      setIncidents(response.data?.result?.data || []);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. 🔥 QUAN TRỌNG: Lắng nghe sự kiện cập nhật trạng thái đơn hàng
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data) => {
      console.log("⚡ Nhận cập nhật sự cố từ Socket:", data);
      
      // Cập nhật lại danh sách chính (re-render list)
      setIncidents((prev) =>
        prev.map((inc) =>
          inc._id === data.id ? { ...inc, status: data.status, timeline: data.incident?.timeline || inc.timeline } : inc
        )
      );

      // Nếu người dân đang mở xem chi tiết cái đơn bị đổi trạng thái đó -> Cập nhật luôn màn hình chi tiết
      if (selectedIncident && selectedIncident._id === data.id) {
        setSelectedIncident((prev) => ({ 
            ...prev, 
            status: data.status, 
            timeline: data.incident?.timeline || prev.timeline,
            assignedTeam: data.incident?.assignedTeam || prev.assignedTeam
        }));
      }
    };

    socket.on("incident:updated", handleUpdate);
    return () => socket.off("incident:updated", handleUpdate);
  }, [selectedIncident]);

  // 3. Lắng nghe tọa độ xe (Giữ nguyên)
  useEffect(() => {
    if (!socket || !selectedIncident) return;
    const handleRescueLoc = (data) => {
      // So khớp teamId của xe đang chạy với teamId được gán cho sự cố này
      const assignedTeamId = selectedIncident.assignedTeam?._id || selectedIncident.assignedTeam;
      if (assignedTeamId === data.teamId) {
        setRescuePos({ teamId: data.teamId, lat: data.lat, lng: data.lng, status: 'BUSY' });
      }
    };
    socket.on("rescue:location", handleRescueLoc);
    return () => socket.off("rescue:location", handleRescueLoc);
  }, [selectedIncident]);

  const getStatusConfig = (s) => {
    const cfgs = {
      [INCIDENT_STATUS.PENDING]: { label: "Đang chờ", color: "text-orange-600", bgColor: "bg-orange-50" },
      [INCIDENT_STATUS.IN_PROGRESS]: { label: "Đang cứu hộ", color: "text-blue-600", bgColor: "bg-blue-50" },
      [INCIDENT_STATUS.COMPLETED]: { label: "Hoàn thành", color: "text-green-600", bgColor: "bg-green-50" },
    };
    return cfgs[s] || { label: s, color: "text-gray-600", bgColor: "bg-gray-50" };
  };

  // Màn hình chi tiết
  if (selectedIncident) {
    return (
      <div className="flex flex-col min-h-screen bg-white animate-in slide-in-from-right duration-300">
        <div className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b p-4 flex items-center gap-4">
          <button onClick={() => { setSelectedIncident(null); setRescuePos(null); }}><ArrowLeft size={24} /></button>
          <h1 className="font-bold">Theo dõi cứu hộ</h1>
        </div>

        <div className="mt-[64px] h-72 relative z-0">
          <Map 
            incidents={[selectedIncident]} 
            fleet={rescuePos ? { [rescuePos.teamId]: rescuePos } : {}}
            focusCoords={selectedIncident.location.coordinates}
          />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-xs font-bold">{rescuePos ? "Xe đang tiến đến" : "Chờ xe cứu hộ..."}</span>
          </div>
        </div>

        <div className="p-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black">{selectedIncident.title}</h2>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${getStatusConfig(selectedIncident.status).bgColor} ${getStatusConfig(selectedIncident.status).color}`}>
                    {getStatusConfig(selectedIncident.status).label}
                </span>
            </div>
            <div className="mt-4 space-y-4">
              {selectedIncident.timeline?.slice().reverse().map((t, i) => (
                <div key={i} className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                   <div><p className="font-bold text-sm">{t.note}</p><p className="text-[10px] text-gray-400">{new Date(t.timestamp).toLocaleString()}</p></div>
                </div>
              ))}
            </div>
        </div>
      </div>
    );
  }

  // Màn hình danh sách
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-8 pt-12 flex justify-between items-end">
        <h1 className="text-3xl font-bold">Lịch sử</h1>
        <button onClick={fetchHistory} className="text-xs text-blue-500 font-bold">Làm mới</button>
      </div>
      <div className="px-6 space-y-4">
        {incidents.length === 0 ? (
           <p className="text-center text-gray-400 mt-20">Chưa có sự cố nào được ghi nhận.</p>
        ) : (
          incidents.map(item => (
            <div key={item._id} onClick={() => setSelectedIncident(item)} className="bg-white p-5 rounded-3xl shadow-sm border active:scale-95 transition-transform">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getStatusConfig(item.status).bgColor} ${getStatusConfig(item.status).color}`}>{getStatusConfig(item.status).label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 line-clamp-1 flex items-center gap-1"><MapPin size={12}/> {item.location?.address}</p>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
};