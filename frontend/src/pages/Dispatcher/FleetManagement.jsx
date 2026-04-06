import React, { useState, useEffect, useCallback } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import { 
  MessageSquare, MapPin, CheckCircle2, Clock, XCircle, 
  Truck, Loader2, Users, Shield, Phone, X, Award, ChevronRight
} from "lucide-react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import { RESCUE_TEAM_STATUS } from "../../utils/constants/rescueConstants";

// --- SUB-COMPONENTS CHO SIDEBAR (THEO MẪU CỦA VY) ---

const PerformanceCard = ({ label, value }) => (
  <article className="flex-1 flex flex-col items-start p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
    <p className="mt-2 text-sm font-bold text-black">{value}</p>
  </article>
);

const StaffMember = ({ member }) => (
  <article className="flex gap-3 py-3 px-4 w-full bg-white rounded-2xl border border-gray-200 shadow-sm mb-2">
    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs">
      {member.userId?.name?.charAt(0) || "U"}
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-black">{member.userId?.name || "N/A"}</h4>
      <p className="text-[10px] font-medium text-gray-400 uppercase">{member.role}</p>
      <p className="text-xs text-gray-500 font-mono">{member.userId?.phone || "---"}</p>
    </div>
    <a href={`tel:${member.userId?.phone}`} className="self-center p-2 text-green-600 bg-green-50 rounded-full">
      <Phone size={16} />
    </a>
  </article>
);

// --- MAIN COMPONENT ---

export const FleetManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [pagination, setPagination] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [selectedTeam, setSelectedTeam] = useState(null); // 🔥 State quản lý đội xe đang chọn
  
  const socket = useSocket();

  const fetchRescueTeams = useCallback(async (page = 1, status = "ALL") => {
    try {
      setLoading(true);
      let url = `/rescue-teams?page=${page}`;
      if (status !== "ALL") url += `&status=${status}`;
      const res = await api.get(url);
      const { data, pagination: pagData } = res.data.result;
      setTeams(data);
      setPagination(pagData);
    } catch (error) {
      console.error("Lỗi lấy danh sách đội cứu hộ:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRescueTeams(1, activeTab); }, [activeTab, fetchRescueTeams]);

  useEffect(() => {
    if (!socket) return;
    const handleLocationUpdate = (data) => {
      setTeams((prev) => prev.map((t) => t._id === data.teamId ? { ...t, status: data.status } : t));
    };
    socket.on("rescue:location", handleLocationUpdate);
    return () => socket.off("rescue:location");
  }, [socket]);

  const getStatusUI = (status) => {
    switch (status) {
      case RESCUE_TEAM_STATUS.AVAILABLE:
        return { label: "Sẵn sàng", color: "bg-green-50 text-green-600 border-green-100", dot: "bg-green-500", icon: <CheckCircle2 className="w-4 h-4" /> };
      case RESCUE_TEAM_STATUS.BUSY:
        return { label: "Đang làm nhiệm vụ", color: "bg-orange-50 text-orange-600 border-orange-100", dot: "bg-orange-500", icon: <Clock className="w-4 h-4" /> };
      default:
        return { label: "Ngoại tuyến", color: "bg-gray-50 text-gray-500 border-gray-100", dot: "bg-gray-400", icon: <XCircle className="w-4 h-4" /> };
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <Menu />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">Quản lý đội xe</h2>
            <p className="text-sm text-gray-500">Hệ thống giám sát {pagination.total} đội cứu hộ</p>
          </div>
          <div className="w-[400px]"><SearchBar className="w-full" /></div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* TABS */}
          <div className="flex flex-wrap gap-4 mt-2 mb-8">
            {["ALL", "AVAILABLE", "BUSY", "OFFLINE"].map((tabId) => (
              <button key={tabId} onClick={() => setActiveTab(tabId)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tabId ? "bg-indigo-950 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"}`}>
                {tabId === "ALL" ? "Tất cả" : getStatusUI(tabId).label}
              </button>
            ))}
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-950" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teams.map((team) => {
                const ui = getStatusUI(team.status);
                return (
                  <div key={team._id} onClick={() => setSelectedTeam(team)} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-xl transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase ${ui.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`}></span> {ui.label}
                      </div>
                      <Shield className="w-4 h-4 text-indigo-900 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{team.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mb-4 uppercase">MÃ: {team.code}</p>
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <MapPin size={14} className="text-blue-500" />
                      <span className="text-xs font-bold">{team.zone || "Toàn quốc"}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-indigo-600 font-bold text-[11px] uppercase tracking-wider">
                       <span>{team.members?.length || 0} Thành viên</span>
                       <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =========================================
            SIDEBAR CHI TIẾT ĐỘI XE (FLEET DETAIL)
        ========================================= */}
        {selectedTeam && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedTeam(null)} />
            
            <aside className="relative w-full max-w-[420px] bg-[#F2F2F7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusUI(selectedTeam.status).color}`}>
                    {getStatusUI(selectedTeam.status).label}
                  </div>
                  <button onClick={() => setSelectedTeam(null)} className="p-2 hover:bg-gray-100 rounded-full ml-auto">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <h2 className="text-lg font-bold text-black leading-tight">{selectedTeam.name}</h2>
                <p className="text-xs text-gray-400 font-mono mt-1 uppercase">Mã: {selectedTeam.code} • Phụ trách: {selectedTeam.zone}</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                
                {/* 1. Vị trí hiện tại */}
                <section>
                  <header className="flex items-center gap-2 mb-3 text-[13px] font-bold text-black uppercase">
                    <MapPin size={18} className="text-blue-500" /> <span>Vị trí hiện tại</span>
                  </header>
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                     <p className="text-xs text-gray-700 font-medium">Tọa độ GPS:</p>
                     <p className="text-sm font-bold text-indigo-600 mt-1">
                        {selectedTeam.currentLocation.coordinates[1]}, {selectedTeam.currentLocation.coordinates[0]}
                     </p>
                  </div>
                </section>

                {/* 2. Hiệu suất (Dữ liệu mẫu - Có thể tích hợp API sau) */}
                <section>
                  <header className="flex items-center gap-2 mb-3 text-[13px] font-bold text-black uppercase">
                    <Award size={18} className="text-orange-500" /> <span>Hiệu suất hoạt động</span>
                  </header>
                  <div className="flex gap-3">
                    <PerformanceCard label="Đã hoàn thành" value="145 ca" />
                    <PerformanceCard label="Phản hồi TB" value="12.5 phút" />
                  </div>
                </section>

                {/* 3. Năng lực xử lý */}
                <section>
                  <header className="flex items-center gap-2 mb-3 text-[13px] font-bold text-black uppercase">
                    <Shield size={18} className="text-indigo-500" /> <span>Năng lực xử lý</span>
                  </header>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-indigo-900 text-white rounded-xl text-xs font-bold uppercase">
                      Loại: {selectedTeam.type}
                    </span>
                    {selectedTeam.capabilities?.map((cap, i) => (
                      <span key={i} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold">
                        {cap}
                      </span>
                    ))}
                  </div>
                </section>

                {/* 4. Nhân sự trực ca (Dữ liệu thực từ populate) */}
                <section>
                  <header className="flex items-center gap-2 mb-4 text-[13px] font-bold text-black uppercase">
                    <Users size={18} className="text-gray-400" /> <span>Nhân sự trực ca</span>
                  </header>
                  <div>
                    {selectedTeam.members?.length > 0 ? (
                      selectedTeam.members.map((m, i) => <StaffMember key={i} member={m} />)
                    ) : (
                      <p className="text-xs text-gray-400 italic">Chưa phân bổ nhân sự</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Footer Action */}
              <div className="p-6 bg-white border-t border-gray-200">
                <button className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={18} />
                  Nhắn tin cho đội xe này
                </button>
              </div>

            </aside>
          </div>
        )}
      </main>
    </div>
  );
};