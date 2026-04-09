// Incident.jsx (Dành cho Điều phối viên)
import React, { useState, useEffect, useCallback } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import {
  TriangleAlert, Car, Clock, ChevronRight, Plus,
  X, MapPin, Phone, ChevronLeft, Loader2, Users,
  ShieldOff, Siren, CheckCircle2, Radio, UserCheck,
  AlertTriangle, RefreshCw
} from "lucide-react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import {
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  INCIDENT_TYPES,
} from "../../utils/constants/incidentConstants";

// ─── Helpers ────────────────────────────────────────────────────────────────
const TYPE_LABELS = {
  [INCIDENT_TYPES.ACCIDENT]:  "Tai nạn giao thông",
  [INCIDENT_TYPES.BREAKDOWN]: "Hỏng xe / Chết máy",
  [INCIDENT_TYPES.FLOOD]:     "Ngập nước",
  [INCIDENT_TYPES.FIRE]:      "Cháy nổ",
  [INCIDENT_TYPES.OTHER]:     "Sự cố khác",
};

const STATUS_CONFIG = {
  [INCIDENT_STATUS.PENDING]:     { label: "Chờ xử lý",   color: "bg-amber-100 text-amber-700",  dot: "bg-amber-400" },
  [INCIDENT_STATUS.ASSIGNED]:    { label: "Đã phân công", color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  [INCIDENT_STATUS.IN_PROGRESS]: { label: "Đang xử lý",  color: "bg-violet-100 text-violet-700", dot: "bg-violet-500 animate-pulse" },
  [INCIDENT_STATUS.COMPLETED]:   { label: "Hoàn thành",  color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  [INCIDENT_STATUS.CANCELLED]:   { label: "Đã hủy",      color: "bg-gray-100 text-gray-500",    dot: "bg-gray-400" },
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

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, title, description, confirmLabel, confirmClass, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[340px] animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-500" size={24} />
        </div>
        <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
            Quay lại
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Sidebar ──────────────────────────────────────────────────────────
const IncidentSidebar = ({ incident, onClose, onCancelled, onAssigned }) => {
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loadingTeams, setLoadingTeams]     = useState(false);
  const [selectedTeam, setSelectedTeam]     = useState(null);
  const [assigning, setAssigning]           = useState(false);
  const [cancelling, setCancelling]         = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [tab, setTab]                       = useState("detail");

  const loadAvailableTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      const res = await api.get("/rescue-teams?status=AVAILABLE&limit=50");
      setAvailableTeams(res.data?.result?.data || []);
    } catch (e) {
      console.error("Lỗi tải đội:", e);
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "assign") loadAvailableTeams();
  }, [tab, loadAvailableTeams]);

  const handleAssign = async () => {
    if (!selectedTeam) return;
    setAssigning(true);
    try {
      console.log(`[DISPATCH] Gọi API điều phối đội ${selectedTeam.name} vào đơn ${incident._id}`);
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.ASSIGNED,
        teamData: { _id: selectedTeam._id, ...selectedTeam },
        note: `Điều phối viên chủ động phân công đội ${selectedTeam.name}`,
      });
      onAssigned(res.data.result);
      alert("Gán đội cứu hộ thành công!");
    } catch (e) {
      alert("Lỗi điều phối: " + (e.response?.data?.message || e.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = async () => {
    setShowConfirmCancel(false);
    setCancelling(true);
    try {
      console.log(`[DISPATCH] Gọi API HỦY đơn ${incident._id}`);
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.CANCELLED,
        note: "Điều phối viên hủy sự cố.",
      });
      onCancelled(res.data.result);
    } catch (e) {
      alert("Lỗi hủy: " + (e.response?.data?.message || e.message));
    } finally {
      setCancelling(false);
    }
  };

  const isSOS      = incident.severity === INCIDENT_SEVERITY.CRITICAL;
  const canAssign  = incident.status === INCIDENT_STATUS.PENDING;
  const canCancel  = ![INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(incident.status);
  const assignedTeamName = incident.assignedTeam?.name || incident.assignedTeam?.code;

  return (
    <>
      <ConfirmDialog
        open={showConfirmCancel}
        title="Xác nhận hủy sự cố?"
        description={`Hành động này sẽ gửi thông báo đến đội cứu hộ đang nhận ca${assignedTeamName ? ` (${assignedTeamName})` : ""}. Đội xe sẽ được trả về trạng thái sẵn sàng.`}
        confirmLabel="Hủy sự cố"
        confirmClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleCancel}
        onCancel={() => setShowConfirmCancel(false)}
      />
      <div className="fixed inset-0 z-[100] flex">
        <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className={`px-6 pt-6 pb-4 border-b border-gray-100 ${isSOS ? "bg-red-50" : "bg-white"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {isSOS ? <Siren size={18} className="text-red-500 animate-pulse" /> : <Radio size={18} className="text-blue-500" />}
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{isSOS ? "SOS Khẩn cấp" : TYPE_LABELS[incident.type] || "Sự cố"}</span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <h2 className="font-black text-gray-900 text-xl leading-tight mb-2 uppercase">{incident.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={incident.status} />
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{incident.code}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6">
            {[ { key: "detail", label: "Chi tiết", icon: AlertTriangle }, { key: "assign", label: "Điều phối", icon: UserCheck } ].map(({ key, label, icon: Icon }) => (
              <button
                key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 py-3.5 px-1 mr-6 text-sm font-bold border-b-2 transition-colors ${tab === key ? "border-[#0088FF] text-[#0088FF]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Tab: Chi tiết */}
          {tab === "detail" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <MapPin size={16} className="text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Địa điểm</p>
                  <p className="text-sm text-gray-700 font-semibold leading-snug">{incident.location?.address || "Không rõ"}</p>
                </div>
              </div>
              {/* Other details... */}
              {incident.reportedBy && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center"><Phone size={14} className="text-blue-500" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Người báo cáo</p>
                      <p className="text-sm font-bold text-gray-900">{incident.reportedBy.name}</p>
                    </div>
                  </div>
                  {incident.reportedBy.phone && (<a href={`tel:${incident.reportedBy.phone}`} className="text-xs font-bold text-[#0088FF] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">{incident.reportedBy.phone}</a>)}
                </div>
              )}
              {assignedTeamName && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center"><Users size={14} className="text-blue-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Đội cứu hộ</p>
                    <p className="text-sm font-bold text-blue-800">{assignedTeamName}</p>
                  </div>
                </div>
              )}
              {incident.description && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Mô tả</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{incident.description}</p>
                </div>
              )}
              {incident.timeline?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Lịch sử</p>
                  <div className="space-y-3">
                    {[...incident.timeline].reverse().map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-700">{step.note}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(step.timestamp || step.timeStamp).toLocaleString("vi-VN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Điều phối */}
          {tab === "assign" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
              {!canAssign && incident.status !== INCIDENT_STATUS.CANCELLED && (
                <div className="mb-5 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700 font-semibold">Sự cố này đã được phân công cho <strong>{assignedTeamName || "đội cứu hộ"}</strong>. Không thể điều phối lại.</p>
                </div>
              )}

              {canAssign && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-700">Chọn đội cứu hộ</p>
                    <button onClick={loadAvailableTeams} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <RefreshCw size={14} className={`text-gray-400 ${loadingTeams ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                  {loadingTeams ? (
                    <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-[#0088FF]" /></div>
                  ) : availableTeams.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Users size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Không có đội nào đang rảnh</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-6">
                      {availableTeams.map((team) => (
                        <button
                          key={team._id} onClick={() => setSelectedTeam(team)}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${selectedTeam?._id === team._id ? "border-[#0088FF] bg-blue-50 shadow-sm shadow-blue-100" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selectedTeam?._id === team._id ? "bg-[#0088FF]" : "bg-gray-200"}`}>
                            <Car size={16} className={selectedTeam?._id === team._id ? "text-white" : "text-gray-500"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${selectedTeam?._id === team._id ? "text-[#0088FF]" : "text-gray-900"}`}>{team.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{team.code} • {team.zone}</p>
                          </div>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">SẴN SÀNG</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white space-y-2">
            {tab === "assign" && canAssign && (
              <button
                onClick={handleAssign}
                disabled={!selectedTeam || assigning}
                className="w-full py-3 rounded-2xl bg-[#0088FF] text-white font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {assigning ? <><Loader2 size={16} className="animate-spin" /> Đang điều phối...</> : <><UserCheck size={16} /> Điều phối{selectedTeam ? `: ${selectedTeam.name}` : ""}</>}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowConfirmCancel(true)}
                disabled={cancelling}
                className="w-full py-3 rounded-2xl bg-white border-2 border-red-200 text-red-500 font-black text-sm hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? <><Loader2 size={16} className="animate-spin" /> Đang hủy...</> : <><ShieldOff size={16} /> Hủy sự cố này</>}
              </button>
            )}
            {!canCancel && (
              <div className="flex items-center justify-center gap-2 py-2 text-gray-400 text-sm">
                <CheckCircle2 size={16} />
                <span className="font-medium">Sự cố đã được đóng</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const Incident = () => {
  const [incidents, setIncidents]           = useState([]);
  const [pagination, setPagination]         = useState({ totalPages: 0, total: 0 });
  const [loading, setLoading]               = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [page, setPage]                     = useState(1);

  const socket = useSocket();

  const fetchIncidents = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents?page=${pageNum}`);
      const { data, pagination: pagData } = res.data.result;
      setIncidents(data);
      setPagination(pagData);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncidents(page); }, [page, fetchIncidents]);

  // Real-time socket (Fix lỗi phải F5)
  useEffect(() => {
    if (!socket) return;

    const handleNew = (data) => {
      console.log("🚨 [SOCKET_DISPATCHER] Nhận báo cáo sự cố MỚI:", data.incident.title);
      // Nếu đang xem trang 1, tự động ghim sự cố mới lên đầu list
      if (page === 1) {
        setIncidents((prev) => {
            // Tránh duplicate id
            if (prev.find(i => i._id === data.incident._id)) return prev;
            return [data.incident, ...prev.slice(0, 9)];
        });
        // Tăng đếm tổng số
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      } else {
        console.log("⚠️ Sự cố mới tới, nhưng bạn đang ở trang > 1 nên không chèn lên đầu.");
      }
    };

    const handleUpdated = (data) => {
      console.log(`📝 [SOCKET_DISPATCHER] Nhận cập nhật trạng thái đơn ${data.id} -> ${data.status}`);
      // Cập nhật inline trong danh sách
      setIncidents((prev) =>
        prev.map((inc) =>
          inc._id === data.id ? { ...inc, status: data.status, assignedTeam: data.incident?.assignedTeam } : inc
        )
      );
      // Đồng bộ vào sidebar (nếu đang mở đơn đó)
      setSelectedIncident((prev) =>
        prev?._id === data.id ? { ...prev, status: data.status, assignedTeam: data.incident?.assignedTeam } : prev
      );
    };

    socket.on("incident:new", handleNew);
    socket.on("alert:sos", handleNew);
    socket.on("incident:updated", handleUpdated);

    return () => {
      socket.off("incident:new", handleNew);
      socket.off("alert:sos", handleNew);
      socket.off("incident:updated", handleUpdated);
    };
  }, [socket, page]);

  // Callback Sidebar
  const handleAssigned = (updatedIncident) => {
    setIncidents((prev) => prev.map((inc) => (inc._id === updatedIncident._id ? updatedIncident : inc)));
    setSelectedIncident(updatedIncident);
  };

  const handleCancelled = (updatedIncident) => {
    setIncidents((prev) => prev.map((inc) => (inc._id === updatedIncident._id ? updatedIncident : inc)));
    setSelectedIncident(null);
  };

  const getTypeLabel = (type) => TYPE_LABELS[type] || "Sự cố";

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
              <h3 className="text-xl font-bold text-gray-900">
                Danh sách thực tế ({pagination.total || 0})
              </h3>
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
                  {incidents.map((incident) => {
                    const isSOS = incident.severity === INCIDENT_SEVERITY.CRITICAL;
                    const isSelected = selectedIncident?._id === incident._id;
                    return (
                      <div
                        key={incident._id}
                        onClick={() => setSelectedIncident(incident)}
                        className={`group bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#0088FF] ring-2 ring-blue-100"
                            : isSOS
                            ? "border-red-200 bg-red-50/20"
                            : "border-gray-100 hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                            isSOS ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"
                          }`}>
                            {isSOS
                              ? <TriangleAlert size={24} className="animate-pulse" />
                              : <Car size={24} />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h4 className="text-base font-bold text-gray-900">{incident.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                isSOS ? "bg-red-600 text-white" : "bg-blue-100 text-blue-600"
                              }`}>
                                {isSOS ? "SOS" : getTypeLabel(incident.type)}
                              </span>
                              <StatusBadge status={incident.status} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <Clock size={14} />
                              <span>{new Date(incident.createdAt).toLocaleTimeString("vi-VN")}</span>
                              <span>•</span>
                              <span className="font-mono uppercase">{incident.code}</span>
                              {incident.assignedTeam && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-500 font-semibold">
                                    {incident.assignedTeam.name || incident.assignedTeam.code}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-colors ${
                          isSelected ? "text-[#0088FF]" : "text-gray-300 group-hover:text-gray-900"
                        }`} />
                      </div>
                    );
                  })}
                </div>

                {/* Phân trang */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 mb-4 pt-6 border-t border-gray-200">
                    <span className="text-sm text-gray-400 font-medium">
                      Trang <strong className="text-gray-900">{page}</strong> trên {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>
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
                        if (pNum === page - 2 || pNum === page + 2)
                          return <span key={pNum} className="text-gray-300 self-center">...</span>;
                        return null;
                      })}
                      <button
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
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

        {/* Sidebar chi tiết */}
        {selectedIncident && (
          <IncidentSidebar
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onAssigned={handleAssigned}
            onCancelled={handleCancelled}
          />
        )}
      </main>
    </div>
  );
};