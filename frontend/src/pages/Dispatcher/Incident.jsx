import React, { useState, useEffect } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import { 
  TriangleAlert, Car, Clock, ChevronRight, Activity, Plus, 
  X, MapPin, Phone, MessageSquare, AlertCircle, UserPlus, Loader2,
  ChevronLeft // Thêm icon cho phân trang
} from "lucide-react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import { INCIDENT_SEVERITY, INCIDENT_STATUS, INCIDENT_TYPES } from "../../utils/constants/incidentConstants";

// ... Các Sub-components (EmergencyBadge, ReporterCard, TimelineStep) giữ nguyên ...

export const Incident = () => {
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [page, setPage] = useState(1);

  const socket = useSocket();
  const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

  const fetchIncidents = async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents?page=${pageNum}`); // Backend đã tự lo limit
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
    socket.on("incident:new", (data) => {
      // Nếu đang ở trang 1 thì mới thêm vào đầu list cho real-time
      if (page === 1) setIncidents(prev => [data.incident, ...prev.slice(0, 9)]);
    });
    // ... logic socket SOS giữ nguyên ...
  }, [socket, page]);

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

        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-xl font-bold text-gray-900">Danh sách thực tế ({pagination.total || 0})</h3>
              <button className="flex items-center gap-2 bg-[#0088FF] text-white px-4 py-2 rounded-lg font-medium active:scale-95 transition-all shadow-sm">
                <Plus size={16} /> Báo cáo Hotline
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#0088FF] gap-3">
                <Loader2 size={40} className="animate-spin" />
                <p className="text-gray-400 font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
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
                            <span className="font-mono uppercase">Mã: {incident.code}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
                    </div>
                  ))}
                </div>

                {/* --- BỘ PHÂN TRANG (PAGINATION) --- */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 mb-4 pt-6 border-t border-gray-200">
                    <span className="text-sm text-gray-400 font-medium">
                      Trang <strong className="text-gray-900">{page}</strong> trên {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>

                      {/* Render các số trang (Logic rút gọn nếu quá nhiều trang) */}
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const pNum = i + 1;
                        if (pNum === 1 || pNum === pagination.totalPages || (pNum >= page - 1 && pNum <= page + 1)) {
                          return (
                            <button
                              key={pNum}
                              onClick={() => setPage(pNum)}
                              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                page === pNum 
                                ? "bg-[#0088FF] text-white shadow-lg shadow-blue-200" 
                                : "bg-white border border-gray-100 text-gray-400 hover:border-blue-300"
                              }`}
                            >
                              {pNum}
                            </button>
                          );
                        }
                        if (pNum === page - 2 || pNum === page + 2) return <span key={pNum} className="text-gray-300 self-center">...</span>;
                        return null;
                      })}

                      <button 
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all"
                      >
                        <ChevronRight size={20} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar chi tiết giữ nguyên ... */}
      </main>
    </div>
  );
};