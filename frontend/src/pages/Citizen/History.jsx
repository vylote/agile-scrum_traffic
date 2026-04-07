import React, { useState, useEffect } from "react";
import { BottomNav } from "../../components/Citizen/BottomNav";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronRight,
  Loader2,
  X,
  ShieldCheck,
  ArrowLeft, // Icon quay lại
  Navigation, // Icon cho bản đồ
} from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket";
import {
  INCIDENT_TYPES,
  INCIDENT_STATUS,
} from "../../utils/constants/incidentConstants";

export const CitizenHistory = () => {
  const [activeTab, setActiveTab] = useState("processing");
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 State mới để quản lý việc xem chi tiết
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/incidents");
        const fetchedData = response.data?.result?.data || [];
        setIncidents(fetchedData);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleStatusUpdate = (payload) => {
      const idToUpdate = payload.id || payload.incident?._id;
      const newStatus = payload.status || payload.incident?.status;
      const updatedIncidentData = payload.incident || payload;

      setIncidents((prevIncidents) => {
        const index = prevIncidents.findIndex((item) => item._id === idToUpdate);
        if (index !== -1) {
          const newIncidents = [...prevIncidents];
          newIncidents[index] = { 
            ...newIncidents[index], 
            ...updatedIncidentData, 
            status: newStatus 
          };
          
          // 🔥 Nếu đang xem chi tiết vụ này, cập nhật nó luôn để timeline nhảy real-time
          if (selectedIncident?._id === idToUpdate) {
            setSelectedIncident(newIncidents[index]);
          }
          
          return newIncidents;
        }
        return prevIncidents;
      });
    };

    socket.on("incident:updated", handleStatusUpdate);
    return () => socket.off("incident:updated", handleStatusUpdate);
  }, [selectedIncident]);

  const getTypeLabel = (type) => {
    const types = {
      [INCIDENT_TYPES.ACCIDENT]: "Tai nạn giao thông",
      [INCIDENT_TYPES.BREAKDOWN]: "Hỏng xe / Chết máy",
      [INCIDENT_TYPES.FLOOD]: "Ngập nước",
      [INCIDENT_TYPES.FIRE]: "Cháy nổ",
      [INCIDENT_TYPES.OTHER]: "Sự cố khác",
      SOS: "SOS Khẩn cấp",
    };
    return types[type] || "Sự cố";
  };

  const getStatusConfig = (status) => {
    const configs = {
      [INCIDENT_STATUS.PENDING]: { label: "Đang chờ", color: "text-orange-600", bgColor: "bg-orange-50" },
      [INCIDENT_STATUS.ASSIGNED]: { label: "Đã phân đội", color: "text-purple-600", bgColor: "bg-purple-50" },
      [INCIDENT_STATUS.IN_PROGRESS]: { label: "Đang cứu hộ", color: "text-[#0088FF]", bgColor: "bg-blue-50" },
      [INCIDENT_STATUS.COMPLETED]: { label: "Hoàn thành", color: "text-green-600", bgColor: "bg-green-50" },
      [INCIDENT_STATUS.CANCELLED]: { label: "Đã hủy", color: "text-red-600", bgColor: "bg-red-50" },
    };
    return configs[status] || { label: status, color: "text-gray-600", bgColor: "bg-gray-50" };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " - " + date.toLocaleDateString("vi-VN");
  };

  // --- MÀN HÌNH CHI TIẾT (TIMELINE VIEW) ---
  if (selectedIncident) {
    return (
      <div className="flex flex-col min-h-screen bg-white font-sans">
        {/* Header Chi tiết */}
        <div className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSelectedIncident(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Theo dõi sự cố</h1>
        </div>

        <div className="mt-[72px] pb-10">
          {/* Bản đồ giả lập */}
          <div className="w-full h-64 bg-gray-200 relative overflow-hidden">
            <img 
              src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/105.8342,21.0285,14,0/600x400?access_token=pk.eyJ1IjoibGV0aGFuaHZ5IiwiYSI6ImNsbGZ6..." 
              alt="Map Placeholder"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="bg-white/90 p-3 rounded-2xl shadow-xl flex items-center gap-2">
                <Navigation size={18} className="text-[#0088FF] animate-pulse" />
                <span className="text-xs font-bold">Đội cứu hộ đang di chuyển...</span>
              </div>
            </div>
          </div>

          {/* Nội dung Timeline */}
          <div className="px-8 mt-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">{getTypeLabel(selectedIncident.type)}</h2>
                <p className="text-sm text-gray-400 font-medium">{selectedIncident.code}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase ${getStatusConfig(selectedIncident.status).bgColor} ${getStatusConfig(selectedIncident.status).color}`}>
                {getStatusConfig(selectedIncident.status).label}
              </span>
            </div>

            {/* Render Timeline từ DB */}
            <div className="space-y-0 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {selectedIncident.timeline?.slice().reverse().map((step, index) => (
                <div key={index} className="relative pl-10 pb-8 last:pb-0">
                  {/* Node Timeline */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 
                    ${index === 0 ? 'bg-[#0088FF] scale-125' : 'bg-gray-300'}`}>
                    {index === 0 && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
                  </div>
                  
                  <div>
                    <p className={`text-[15px] font-bold ${index === 0 ? 'text-black' : 'text-gray-400'}`}>
                      {step.note}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {formatTime(step.timestamp || step.timeStamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH DANH SÁCH (HISTORY LIST) ---
  const processingData = incidents.filter((item) =>
    [INCIDENT_STATUS.PENDING, INCIDENT_STATUS.ASSIGNED, INCIDENT_STATUS.IN_PROGRESS].includes(item.status)
  );
  const completedData = incidents.filter((item) =>
    [INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(item.status)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-24">
      <div className="sticky top-0 z-40 bg-[#F2F2F7] pb-4 backdrop-blur-md bg-opacity-95 shadow-sm">
        <div className="flex justify-between items-center px-8 pt-12 pb-2">
           <h1 className="text-black text-[34px] font-bold">Lịch sử</h1>
        </div>
        <div className="px-6 mt-2">
          <div className="flex bg-[#7676801C] p-0.5 rounded-xl">
            <button onClick={() => setActiveTab("processing")} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "processing" ? "bg-white shadow-sm text-black" : "text-gray-500"}`}>
              Đang xử lý ({processingData.length})
            </button>
            <button onClick={() => setActiveTab("completed")} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "completed" ? "bg-white shadow-sm text-black" : "text-gray-500"}`}>
              Lịch sử ({completedData.length})
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4 mt-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#0088FF]">
            <Loader2 size={40} className="animate-spin" />
          </div>
        ) : (
          (activeTab === "processing" ? processingData : completedData).map((item) => {
            const statusCfg = getStatusConfig(item.status);
            const isCompleted = item.status === INCIDENT_STATUS.COMPLETED;
            const isCancelled = item.status === INCIDENT_STATUS.CANCELLED;

            return (
              <div key={item._id} className="bg-white p-5 rounded-[27px] shadow-sm active:scale-[0.98] transition-transform flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isCancelled ? 'bg-red-50 text-red-500' : isCompleted ? 'bg-green-50 text-green-500' : item.type === 'SOS' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      {isCancelled ? <X size={24} /> : isCompleted ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                      <h3 className="text-black text-[17px] font-bold leading-tight">{getTypeLabel(item.type)}</h3>
                      <p className="text-[11px] text-gray-400 font-medium">{item.code || "Mã sự cố"}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusCfg.bgColor} ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                <div className="space-y-2 border-t border-gray-50 pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-300 mt-0.5 shrink-0" />
                    <span className="text-gray-600 text-[13px] line-clamp-1">{item.location?.address}</span>
                  </div>
                  
                  {item.assignedTeam && (
                    <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-xl">
                      <ShieldCheck size={14} className="text-[#0088FF]" />
                      <span className="text-[12px] font-bold text-[#0088FF]">
                        Đội: {item.assignedTeam.name} ({item.assignedTeam.code})
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={12} />
                      <span className="text-[11px] font-medium">{formatTime(item.createdAt)}</span>
                    </div>
                    {/* 🔥 SỰ KIỆN CLICK XEM CHI TIẾT */}
                    <button 
                      onClick={() => setSelectedIncident(item)}
                      className="flex items-center text-[#0088FF] text-[13px] font-bold"
                    >
                      Chi tiết <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
};