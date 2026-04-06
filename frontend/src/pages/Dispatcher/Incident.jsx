import React, { useState, useEffect } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import { 
  TriangleAlert, Car, Clock, ChevronRight, Activity, Plus, 
  X, MapPin, Phone, MessageSquare, AlertCircle, UserPlus, Loader2 
} from "lucide-react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import { INCIDENT_SEVERITY, INCIDENT_STATUS, INCIDENT_TYPES } from "../../utils/constants/incidentConstants";

// --- CÁC SUB-COMPONENTS UI (TÍCH HỢP TỪ BẢN MẪU CỦA VY) ---

const EmergencyBadge = ({ text }) => (
  <div className="self-start px-3 py-1 rounded-full bg-red-500/20 border border-red-500/10 mb-4">
    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{text}</span>
  </div>
);

const ReporterCard = ({ name, phone }) => (
  <article className="flex gap-3 py-3 px-4 w-full bg-white rounded-2xl border border-gray-200 shadow-sm">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
      <UserPlus size={20} />
    </div>
    <div className="flex-1">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase">Người báo cáo</h3>
      <p className="text-sm font-bold text-black">{name || "Ẩn danh"}</p>
      <p className="text-xs font-medium text-gray-500">{phone || "Không có số"}</p>
    </div>
    <a href={`tel:${phone}`} className="self-center p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100">
      <Phone size={18} />
    </a>
  </article>
);

const TimelineStep = ({ step, isLast }) => (
  <li className="flex gap-4 relative">
    {!isLast && <div className="absolute left-[9px] top-6 w-[2px] h-full bg-gray-200" />}
    <div className={`z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1 ${
      step.status === 'PENDING' ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'
    }`}>
      <div className="w-2 h-2 rounded-full bg-current" />
    </div>
    <div className="flex flex-col pb-6">
      <p className="text-xs font-bold text-black leading-tight">{step.note || `Trạng thái: ${step.status}`}</p>
      <time className="text-[10px] text-gray-400 mt-1">
        {new Date(step.timestamp).toLocaleString('vi-VN')}
      </time>
    </div>
  </li>
);

// --- MAIN COMPONENT ---

export const Incident = () => {
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [page, setPage] = useState(1);

  const socket = useSocket();
  const IMAGE_BASE_URL = "http://localhost:5000/uploads/"; // Chỉnh lại theo cổng backend của bạn

  const fetchIncidents = async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents?page=${pageNum}&limit=10`);
      const { data, pagination: pagData } = res.data.result;
      setIncidents(data);
      setPagination(pagData);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(page); }, [page]);

  useEffect(() => {
    if (!socket) return;
    socket.on("incident:new", (data) => setIncidents(prev => [data.incident, ...prev]));
    socket.on("alert:sos", (data) => {
        setIncidents(prev => [data.incident, ...prev]);
        new Audio("/assets/sounds/sos.mp3").play().catch(() => {});
    });
    return () => { socket.off("incident:new"); socket.off("alert:sos"); };
  }, [socket]);

  const getTypeLabel = (type) => {
    const types = {
      [INCIDENT_TYPES.ACCIDENT]: "Tai nạn giao thông",
      [INCIDENT_TYPES.BREAKDOWN]: "Hỏng xe / Chết máy",
      [INCIDENT_TYPES.FLOOD]: "Ngập nước",
      [INCIDENT_TYPES.FIRE]: "Cháy nổ",
      [INCIDENT_TYPES.OTHER]: "Sự cố khác",
    };
    return types[type] || "Sự cố";
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <Menu />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">Quản lý sự cố</h2>
            <p className="text-sm text-gray-500">Hệ thống điều phối trung tâm • Toàn hệ thống</p>
          </div>
          <div className="w-[400px]"><SearchBar className="w-full" /></div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-xl font-bold text-gray-900">Danh sách thực tế ({pagination.total || 0})</h3>
              <button className="flex items-center gap-2 bg-[#0088FF] text-white px-4 py-2 rounded-lg font-medium active:scale-95 transition-all">
                <Plus size={16} /> Báo cáo Hotline
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {incidents.map((incident) => (
                <div 
                  key={incident._id} 
                  onClick={() => setSelectedIncident(incident)}
                  className={`group bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
                    incident.severity === 'CRITICAL' ? "border-red-200 bg-red-50/20" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${incident.severity === 'CRITICAL' ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>
                      {incident.severity === 'CRITICAL' ? <TriangleAlert size={24} className="animate-pulse" /> : <Car size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-bold text-gray-900">{incident.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          incident.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-600'
                        }`}>{incident.severity === 'CRITICAL' ? 'SOS' : getTypeLabel(incident.type)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <Clock size={14} /><span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span className="font-mono">Mã: {incident.code}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================
            SIDEBAR CHI TIẾT (FULL OPTION - DATA THỰC)
        ========================================= */}
        {selectedIncident && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedIncident(null)} />
            
            <aside className="relative w-full max-w-[420px] bg-[#F2F2F7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Header của Sidebar */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  {selectedIncident.severity === 'CRITICAL' && <EmergencyBadge text="SOS KHẨN CẤP" />}
                  <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-gray-100 rounded-full ml-auto">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <h2 className="text-lg font-bold text-black leading-tight">{selectedIncident.title}</h2>
                <p className="text-xs text-gray-400 font-mono mt-1">MÃ: {selectedIncident.code}</p>
              </div>

              {/* Nội dung chi tiết Sidebar (Cuộn được) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">

                {/* 2. Người báo cáo */}
                <ReporterCard 
                  name={selectedIncident.reportedBy?.name} 
                  phone={selectedIncident.reportedBy?.phone} 
                />

                {/* 3. Chi tiết & Ảnh sự cố */}
                <section>
                  <header className="flex items-center gap-2 mb-3 text-sm font-bold text-black">
                    <MessageSquare size={18} className="text-gray-400" /> <span>Chi tiết & Tình trạng</span>
                  </header>
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-3">
                    <p className="text-xs text-gray-600 italic">"{selectedIncident.description || "Không có mô tả chi tiết."}"</p>
                  </div>
                  {selectedIncident.photos?.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedIncident.photos.map((img, idx) => (
                        <img key={idx} src={`${IMAGE_BASE_URL}${img}`} className="w-32 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0" alt="scene" />
                      ))}
                    </div>
                  )}
                </section>

                {/* 4. Tiến trình xử lý (Timeline thực tế từ DB) */}
                <section>
                  <header className="flex items-center gap-2 mb-4 text-sm font-bold text-black">
                    <Activity size={18} className="text-gray-400" /> <span>Tiến trình xử lý</span>
                  </header>
                  <ul className="pl-2">
                    {selectedIncident.timeline?.map((step, idx) => (
                      <TimelineStep 
                        key={idx} 
                        step={step} 
                        isLast={idx === selectedIncident.timeline.length - 1} 
                      />
                    ))}
                  </ul>
                </section>

                {/* 5. Warning nếu cần điều phối thủ công */}
                {selectedIncident.status === 'PENDING' && (
                  <div className="flex gap-3 px-4 py-3 bg-orange-400/10 border border-orange-400/20 rounded-2xl">
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-[10px] text-red-500 font-medium leading-tight">
                      Hệ thống đang chờ lệnh điều phối. Vui lòng chỉ định đội cứu hộ gần nhất để xử lý.
                    </p>
                  </div>
                )}
              </div>

              {/* Nút Action ở chân Sidebar */}
              <div className="p-6 bg-white border-t border-gray-200">
                <button 
                  className="w-full py-4 bg-[#FF383C] hover:bg-red-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                  onClick={() => alert("Chức năng Force Assign đang được phát triển!")}
                >
                  Chỉ định đội cứu hộ (Force Assign)
                </button>
              </div>

            </aside>
          </div>
        )}
      </main>
    </div>
  );
};