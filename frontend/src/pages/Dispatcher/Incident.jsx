import React, { useState, useEffect, useCallback, useRef } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import {
  TriangleAlert,
  Car,
  Clock,
  ChevronRight,
  Plus,
  X,
  MapPin,
  Phone,
  ChevronLeft,
  Loader2,
  Users,
  ShieldOff,
  Siren,
  CheckCircle2,
  Radio,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  BellRing,
  Trash2,
} from "lucide-react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import {
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  INCIDENT_TYPES,
} from "../../utils/constants/incidentConstants";

// Import file âm thanh từ tài nguyên máy (Assets)
import sosAlertSound from "../../../public/audio/sos_alert.mp3";

// ─── Helpers ────────────────────────────────────────────────────────────────
const TYPE_LABELS = {
  [INCIDENT_TYPES.ACCIDENT]: "Tai nạn giao thông",
  [INCIDENT_TYPES.BREAKDOWN]: "Hỏng xe / Chết máy",
  [INCIDENT_TYPES.FLOOD]: "Ngập nước",
  [INCIDENT_TYPES.FIRE]: "Cháy nổ",
  [INCIDENT_TYPES.OTHER]: "Sự cố khác",
};

const STATUS_CONFIG = {
  [INCIDENT_STATUS.PENDING]: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  [INCIDENT_STATUS.ASSIGNED]: { label: "Đã phân công", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  [INCIDENT_STATUS.IN_PROGRESS]: { label: "Đang xử lý", color: "bg-violet-100 text-violet-700", dot: "bg-violet-500 animate-pulse" },
  [INCIDENT_STATUS.COMPLETED]: { label: "Hoàn thành", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  [INCIDENT_STATUS.CANCELLED]: { label: "Đã hủy", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG[INCIDENT_STATUS.PENDING];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Component Thông báo nổi (Toast) ─────────────────────────────────────────
const SOSNotification = ({ incident, onDismiss }) => (
  <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] w-[420px] animate-in fade-in slide-in-from-top-10 duration-500">
    <div className="bg-red-600 text-white p-6 rounded-[32px] shadow-[0_25px_60px_rgba(220,38,38,0.4)] border border-red-400/50 flex items-start gap-4 backdrop-blur-md">
      <div className="bg-white/20 p-3.5 rounded-2xl shrink-0 animate-bounce">
        <BellRing size={28} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black uppercase text-[10px] tracking-[0.2em] mb-1 text-red-100">Lệnh can thiệp khẩn cấp</h4>
        <p className="font-black text-base leading-tight mb-1 truncate">{incident.title}</p>
        <p className="text-[11px] text-white/80 font-bold flex items-center gap-1">
            <Clock size={12}/> Vừa xong • Mã: {incident.code}
        </p>
      </div>
      <button onClick={onDismiss} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
        <X size={20} />
      </button>
    </div>
  </div>
);

// ─── Detail Sidebar ──────────────────────────────────────────────────────────
const IncidentSidebar = ({ incident, onClose, onCancelled, onAssigned }) => {
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState(""); 
  const [tab, setTab] = useState("detail");

  const loadAvailableTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      const res = await api.get("/rescue-teams?status=AVAILABLE&limit=50");
      setAvailableTeams(res.data?.result?.data || []);
    } catch (e) { console.error("Lỗi tải đội:", e); }
    finally { setLoadingTeams(false); }
  }, []);

  useEffect(() => {
    if (tab === "assign") loadAvailableTeams();
  }, [tab, loadAvailableTeams]);

  const handleAssign = async () => {
    if (!selectedTeam) return;
    setAssigning(true);
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.ASSIGNED,
        teamData: { _id: selectedTeam._id, ...selectedTeam },
        note: `ĐPV can thiệp gán đội ${selectedTeam.name}`,
      });
      onAssigned(res.data.result);
      alert("Đã can thiệp gán đội thành công!");
    } catch (e) { alert("Lỗi: " + (e.response?.data?.message || e.message)); }
    finally { setAssigning(false); }
  };

  const handleCancelAction = async () => {
    if (!cancelReason.trim()) return alert("Vui lòng nhập lý do hủy báo cáo rác.");
    setCancelling(true);
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.CANCELLED,
        note: `ĐPV HỦY (BÁO CÁO RÁC): ${cancelReason}`,
      });
      onCancelled(res.data.result);
      alert("Đã đóng và hủy sự cố thành công.");
    } catch (e) { alert("Lỗi hủy: " + (e.response?.data?.message || e.message)); }
    finally { setCancelling(false); setShowConfirmCancel(false); }
  };

  const isSOS = incident.severity === INCIDENT_SEVERITY.CRITICAL;
  const canAssign = incident.status === INCIDENT_STATUS.PENDING;
  const canCancel = ![INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(incident.status);
  const assignedTeamName = incident.assignedTeam?.name || "N/A";

  return (
    <div className="fixed inset-0 z-[100] flex shadow-2xl">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] h-full bg-white flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        <div className={`px-6 pt-8 pb-5 border-b border-gray-100 ${isSOS ? "bg-red-50" : "bg-white"}`}>
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-2">
                {isSOS ? <Siren size={20} className="text-red-500 animate-pulse" /> : <Radio size={20} className="text-blue-500" />}
                <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{isSOS ? "Khẩn cấp" : TYPE_LABELS[incident.type]}</span>
             </div>
             <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"><X size={18} /></button>
          </div>
          <h2 className="font-black text-gray-900 text-2xl leading-tight uppercase mb-3">{incident.title}</h2>
          <div className="flex gap-2"><StatusBadge status={incident.status} /></div>
        </div>

        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
          {[
            { key: "detail", label: "Thông tin chi tiết", icon: AlertTriangle },
            { key: "assign", label: "Điều phối & Can thiệp", icon: UserCheck },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 py-4 px-1 mr-8 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${tab === key ? "border-[#0088FF] text-[#0088FF]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
          {tab === "detail" ? (
            <div className="space-y-6">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex gap-3">
                  <MapPin size={18} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Địa điểm</p>
                    <p className="text-sm font-semibold text-gray-700">{incident.location?.address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone size={18} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Liên hệ người báo</p>
                    <p className="text-sm font-bold text-[#0088FF]">{incident.reportedBy?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {canCancel && (
                <div className="mt-10 pt-6 border-t-2 border-dashed border-red-100">
                  <div className="flex items-center gap-2 mb-4 text-red-600">
                    <ShieldOff size={16} />
                    <span className="text-[11px] font-black uppercase tracking-[0.1em]">Khu vực quản trị cấp cao</span>
                  </div>

                  {!showConfirmCancel ? (
                    <button onClick={() => setShowConfirmCancel(true)} className="w-full py-4 rounded-xl border-2 border-red-100 text-red-500 text-xs font-black uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                      <Trash2 size={16} /> Hủy sự cố (Báo cáo rác/Spam)
                    </button>
                  ) : (
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100 animate-in zoom-in-95 duration-200">
                      <p className="text-xs font-bold text-red-700 mb-3 uppercase">Lý do hủy sự cố:</p>
                      <textarea
                        autoFocus
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Ví dụ: Báo cáo sai sự thật, spam lặp lại..."
                        className="w-full p-4 text-sm border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 bg-white mb-4 min-h-[100px]"
                      />
                      <div className="flex gap-3">
                        <button onClick={handleCancelAction} disabled={cancelling} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-red-200 disabled:opacity-50">
                          {cancelling ? "ĐANG XỬ LÝ..." : "XÁC NHẬN HỦY VĨNH VIỄN"}
                        </button>
                        <button onClick={() => { setShowConfirmCancel(false); setCancelReason(""); }} className="px-6 py-3 bg-white text-gray-500 border border-gray-200 rounded-xl text-xs font-bold">
                          QUAY LẠI
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!canAssign ? (
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                  <CheckCircle2 size={24} className="text-blue-500" />
                  <p className="text-sm text-blue-700 font-bold uppercase">Sự cố đã được gán cho: <br/> <span className="text-lg">{assignedTeamName}</span></p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black text-gray-400 uppercase">Đội cứu hộ khả dụng</p>
                    <button onClick={loadAvailableTeams} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <RefreshCw size={14} className={loadingTeams ? "animate-spin text-blue-500" : "text-gray-400"} />
                    </button>
                  </div>
                  <div className="grid gap-3">
                    {availableTeams.length === 0 && !loadingTeams && <p className="text-center py-10 text-gray-400 italic text-sm">Không có đội nào đang rảnh...</p>}
                    {availableTeams.map((team) => (
                      <button key={team._id} onClick={() => setSelectedTeam(team)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedTeam?._id === team._id ? "border-[#0088FF] bg-blue-50/50 shadow-md" : "border-gray-50 bg-gray-50/50 hover:border-gray-200"}`}>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-500"><Car size={20} /></div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-800 uppercase">{team.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{team.zone}</p>
                        </div>
                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-black uppercase">Available</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {tab === "assign" && canAssign && (
          <div className="p-6 border-t border-gray-100 bg-white">
             <button onClick={handleAssign} disabled={!selectedTeam || assigning} className="w-full py-4 rounded-2xl bg-[#0088FF] text-white font-black text-sm disabled:opacity-40 hover:bg-blue-600 transition-all shadow-xl uppercase tracking-widest">
                {assigning ? "ĐANG XỬ LÝ..." : `Gán đơn cho: ${selectedTeam?.name || "Chọn đội"}`}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
export const Incident = () => {
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [page, setPage] = useState(1);
  const [sosToast, setSosToast] = useState(null);
  const socket = useSocket();

  // 🔥 FIX 1: Khai báo audioRef từ Assets local
  const audioRef = useRef(new Audio(sosAlertSound));

  const fetchIncidents = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents?page=${pageNum}`);
      const { data, pagination: pagData } = res.data.result;
      setIncidents(data);
      setPagination(pagData);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIncidents(page); }, [page, fetchIncidents]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('dispatcher:register');

    // 🚀 A. Nhận sự cố mới
    const handleNewIncident = (data) => {
        console.log("🆕 Nhận sự cố mới:", data.incident.code);
        setIncidents((prev) => {
            if (prev.find(inc => inc._id === data.incident._id)) return prev;
            if (page === 1) {
                return [data.incident, ...prev].slice(0, 10);
            }
            return prev;
        });
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
    };

    // 🚨 B. Lệnh can thiệp (SOS) từ BULL QUEUE
    const handleManualNeeded = (data) => {
      console.warn("🚨 CẦN CAN THIỆP:", data.incident.code);

      // 1. PHÁT ÂM THANH
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Âm thanh bị chặn do chưa tương tác"));
      
      // 2. HIỆN TOAST
      setSosToast(data.incident);
      setTimeout(() => setSosToast(null), 10000); // Hiện trong 10s

      // 3. CẬP NHẬT DANH SÁCH (Đẩy lên đầu và tô đỏ)
      setIncidents((prev) => {
        const exists = prev.find(inc => inc._id === data.incident._id);
        if (exists) {
          return prev.map((inc) => 
            inc._id === data.incident._id ? { ...inc, ...data.incident, needsIntervention: true } : inc
          );
        }
        return [{ ...data.incident, needsIntervention: true }, ...prev];
      });
    };

    // 🔄 C. Cập nhật trạng thái
    const handleUpdated = (data) => {
      setIncidents((prev) => prev.map((inc) => 
        inc._id === data.id ? { ...inc, status: data.status, assignedTeam: data.incident?.assignedTeam, needsIntervention: false } : inc
      ));
      setSelectedIncident((prev) => 
        prev?._id === data.id ? { ...prev, status: data.status, assignedTeam: data.incident?.assignedTeam, needsIntervention: false } : prev
      );
    };

    // 🗑️ D. Xóa sự cố Real-time
    const handleDelete = (data) => {
        setIncidents(prev => prev.filter(inc => inc._id !== data.incidentId));
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    };

    socket.on("incident:new", handleNewIncident);
    socket.on("dispatcher:manual_intervention_required", handleManualNeeded);
    socket.on("incident:updated", handleUpdated);
    socket.on("delete_incident", handleDelete);

    return () => {
      socket.off("incident:new");
      socket.off("dispatcher:manual_intervention_required");
      socket.off("incident:updated");
      socket.off("delete_incident");
    };
  }, [socket, page]);

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      {/* 🔔 HIỂN THỊ TOAST KHI CÓ SOS */}
      {sosToast && <SOSNotification incident={sosToast} onDismiss={() => setSosToast(null)} />}

      <Menu />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-[80px] flex items-center justify-between px-10 bg-white/50 backdrop-blur-md border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý sự cố</h2>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Real-time Monitoring & InterventionCenter</p>
          </div>
          <div className="w-[400px]"><SearchBar className="w-full" /></div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-8 no-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-end mb-2">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Tất cả báo cáo ({pagination.total})</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-20"><Loader2 size={40} className="animate-spin text-[#0088FF]" /></div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident._id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`relative bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer flex items-center justify-between group hover:border-[#0088FF] hover:shadow-xl hover:shadow-blue-50 
                      ${incident.needsIntervention ? "border-red-500 ring-4 ring-red-50 bg-red-50/5" : "border-transparent shadow-sm"}`}
                  >
                    {incident.needsIntervention && (
                      <div className="absolute -top-3 right-8 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                        <BellRing size={12} /> CẦN CAN THIỆP GẤP
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${incident.severity === 'CRITICAL' || incident.needsIntervention ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"} group-hover:scale-110 transition-transform`}>
                        {incident.severity === 'CRITICAL' || incident.needsIntervention ? <TriangleAlert size={28} className="animate-pulse" /> : <Car size={28} />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{incident.title}</h4>
                          <StatusBadge status={incident.status} />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                          <Clock size={14} /> <span>{new Date(incident.createdAt).toLocaleString("vi-VN")}</span>
                          <span>•</span> <span className="font-mono text-blue-500">{incident.code}</span>
                          {incident.assignedTeam && <span className="text-violet-600 uppercase tracking-wider font-black ml-2 px-2 py-0.5 bg-violet-50 rounded-md border border-violet-100">• {incident.assignedTeam.name}</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-200 group-hover:text-[#0088FF] group-hover:translate-x-1 transition-all" size={24} />
                  </div>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-8 py-10">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 disabled:opacity-30 active:scale-90 transition-all"><ChevronLeft /></button>
                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Trang {page} / {pagination.totalPages}</span>
                <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 disabled:opacity-30 active:scale-90 transition-all"><ChevronRight /></button>
              </div>
            )}
          </div>
        </div>

        {selectedIncident && (
          <IncidentSidebar
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onAssigned={(updated) => { 
                setIncidents(prev => prev.map(i => i._id === updated._id ? { ...updated, needsIntervention: false } : i)); 
                setSelectedIncident(null); 
            }}
            onCancelled={(updated) => { 
                setIncidents(prev => prev.map(i => i._id === updated._id ? updated : i)); 
                setSelectedIncident(null); 
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Incident