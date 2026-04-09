// Incident.jsx (Dành cho Điều phối viên) - Bản cập nhật Can thiệp thủ công
import React, { useState, useEffect, useCallback } from "react";
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
  [INCIDENT_TYPES.ACCIDENT]: "Tai nạn giao thông",
  [INCIDENT_TYPES.BREAKDOWN]: "Hỏng xe / Chết máy",
  [INCIDENT_TYPES.FLOOD]: "Ngập nước",
  [INCIDENT_TYPES.FIRE]: "Cháy nổ",
  [INCIDENT_TYPES.OTHER]: "Sự cố khác",
};

const STATUS_CONFIG = {
  [INCIDENT_STATUS.PENDING]: {
    label: "Chờ xử lý",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  [INCIDENT_STATUS.ASSIGNED]: {
    label: "Đã phân công",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  [INCIDENT_STATUS.IN_PROGRESS]: {
    label: "Đang xử lý",
    color: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500 animate-pulse",
  },
  [INCIDENT_STATUS.COMPLETED]: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  [INCIDENT_STATUS.CANCELLED]: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG[INCIDENT_STATUS.PENDING];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Detail Sidebar ──────────────────────────────────────────────────────────
const IncidentSidebar = ({ incident, onClose, onCancelled, onAssigned }) => {
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [tab, setTab] = useState("detail");

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
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: INCIDENT_STATUS.ASSIGNED,
        teamData: { _id: selectedTeam._id, ...selectedTeam },
        note: `Điều phối viên chủ động can thiệp gán đội ${selectedTeam.name}`,
      });
      onAssigned(res.data.result);
      alert("Đã can thiệp gán đội thành công!");
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

  const isSOS = incident.severity === INCIDENT_SEVERITY.CRITICAL;
  const canAssign = incident.status === INCIDENT_STATUS.PENDING;
  const canCancel = ![
    INCIDENT_STATUS.COMPLETED,
    INCIDENT_STATUS.CANCELLED,
  ].includes(incident.status);
  const assignedTeamName =
    incident.assignedTeam?.name || incident.assignedTeam?.code;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex">
        <div
          className="flex-1 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div
            className={`px-6 pt-6 pb-4 border-b border-gray-100 ${isSOS ? "bg-red-50" : "bg-white"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {isSOS ? (
                  <Siren size={18} className="text-red-500 animate-pulse" />
                ) : (
                  <Radio size={18} className="text-blue-500" />
                )}
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {isSOS
                    ? "SOS Khẩn cấp"
                    : TYPE_LABELS[incident.type] || "Sự cố"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <h2 className="font-black text-gray-900 text-xl leading-tight mb-2 uppercase">
              {incident.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={incident.status} />
              {incident.needsIntervention && (
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded animate-pulse">
                  CẦN CAN THIỆP GẤP
                </span>
              )}
            </div>
          </div>

          <div className="flex border-b border-gray-100 px-6">
            {[
              { key: "detail", label: "Chi tiết", icon: AlertTriangle },
              { key: "assign", label: "Điều phối", icon: UserCheck },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 py-3.5 px-1 mr-6 text-sm font-bold border-b-2 transition-colors ${tab === key ? "border-[#0088FF] text-[#0088FF]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
            {tab === "detail" ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <MapPin size={16} className="text-sky-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                      Địa điểm
                    </p>
                    <p className="text-sm text-gray-700 font-semibold">
                      {incident.location?.address}
                    </p>
                  </div>
                </div>
                {/* ... (Các thông tin chi tiết khác giữ nguyên) */}
              </div>
            ) : (
              <div className="space-y-4">
                {!canAssign ? (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-500" />
                    <p className="text-sm text-blue-700 font-semibold">
                      Đã gán cho <strong>{assignedTeamName}</strong>
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-700">
                        Chọn đội cứu hộ thủ công
                      </p>
                      <button onClick={loadAvailableTeams}>
                        <RefreshCw
                          size={14}
                          className={loadingTeams ? "animate-spin" : ""}
                        />
                      </button>
                    </div>
                    {availableTeams.map((team) => (
                      <button
                        key={team._id}
                        onClick={() => setSelectedTeam(team)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${selectedTeam?._id === team._id ? "border-[#0088FF] bg-blue-50" : "border-gray-100 bg-gray-50"}`}
                      >
                        <Car size={16} />
                        <div className="flex-1">
                          <p className="text-sm font-bold">{team.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {team.zone}
                          </p>
                        </div>
                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          RẢNH
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-white">
            {tab === "assign" && canAssign && (
              <button
                onClick={handleAssign}
                disabled={!selectedTeam || assigning}
                className="w-full py-3 rounded-2xl bg-[#0088FF] text-white font-black text-sm disabled:opacity-40 hover:bg-blue-600 transition-all shadow-lg"
              >
                {assigning
                  ? "ĐANG GÁN..."
                  : `GÁN ĐỘI: ${selectedTeam?.name || "..."}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const Incident = () => {
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [page, setPage] = useState(1);

  const socket = useSocket();

  const fetchIncidents = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents?page=${pageNum}`);
      const { data, pagination: pagData } = res.data.result;
      setIncidents(data);
      setPagination(pagData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents(page);
  }, [page, fetchIncidents]);

  // 🔥 REAL-TIME & MANUAL INTERVENTION LOGIC
  useEffect(() => {
    if (!socket) return;

    // 🚀 BÁO ĐỘNG: Cần can thiệp thủ công từ Bull Queue
    const handleManualNeeded = (data) => {
      console.warn(
        "🚨 [SYSTEM] Sự cố cần can thiệp tay ngay lập tức:",
        data.incident._id,
      );

      // 1. Phát âm thanh cảnh báo (Dispatcher alert)
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3",
      );
      audio.play().catch(() => console.log("Chặn âm thanh tự phát"));

      // 2. Cập nhật flag needsIntervention vào đơn hàng trong list
      setIncidents((prev) =>
        prev.map((inc) =>
          inc._id === data.incident._id
            ? { ...inc, needsIntervention: true }
            : inc,
        ),
      );
    };

    const handleNew = (data) => {
      if (page === 1) {
        setIncidents((prev) => {
          if (prev.find((i) => i._id === data.incident._id)) return prev;
          return [data.incident, ...prev.slice(0, 9)];
        });
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      }
    };

    const handleUpdated = (data) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          inc._id === data.id
            ? {
                ...inc,
                status: data.status,
                assignedTeam: data.incident?.assignedTeam,
                needsIntervention: false,
              }
            : inc,
        ),
      );
      setSelectedIncident((prev) =>
        prev?._id === data.id
          ? {
              ...prev,
              status: data.status,
              assignedTeam: data.incident?.assignedTeam,
              needsIntervention: false,
            }
          : prev,
      );
    };

    socket.on("dispatcher:manual_intervention_required", handleManualNeeded);
    socket.on("incident:new", handleNew);
    socket.on("alert:sos", handleNew);
    socket.on("incident:updated", handleUpdated);

    return () => {
      socket.off("dispatcher:manual_intervention_required", handleManualNeeded);
      socket.off("incident:new", handleNew);
      socket.off("alert:sos", handleNew);
      socket.off("incident:updated", handleUpdated);
    };
  }, [socket, page]);

  const handleAssigned = (updated) => {
    setIncidents((prev) =>
      prev.map((i) => (i._id === updated._id ? updated : i)),
    );
    setSelectedIncident(updated);
  };

  const handleCancelled = (updated) => {
    setIncidents((prev) =>
      prev.map((i) => (i._id === updated._id ? updated : i)),
    );
    setSelectedIncident(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <Menu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
              Quản lý sự cố
            </h2>
            <p className="text-sm text-gray-500">
              Giám sát & Điều phối can thiệp • Real-time
            </p>
          </div>
          <div className="w-[400px]">
            <SearchBar className="w-full" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Danh sách sự cố ({pagination.total})
            </h3>

            {loading ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Loader2 size={40} className="animate-spin text-[#0088FF]" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {incidents.map((incident) => {
                  const isSOS =
                    incident.severity === INCIDENT_SEVERITY.CRITICAL;
                  const needsHelp = incident.needsIntervention;

                  return (
                    <div
                      key={incident._id}
                      onClick={() => setSelectedIncident(incident)}
                      className={`relative group bg-white rounded-2xl p-5 border transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md ${
                        needsHelp
                          ? "border-red-500 ring-2 ring-red-100 bg-red-50/10"
                          : "border-gray-100"
                      } ${selectedIncident?._id === incident._id ? "border-[#0088FF] ring-2 ring-blue-100" : ""}`}
                    >
                      {needsHelp && (
                        <div className="absolute -top-2.5 right-6 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                          <BellRing size={12} /> LỖI TỰ ĐỘNG - CẦN GÁN TAY
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${isSOS || needsHelp ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}
                        >
                          {isSOS ? (
                            <TriangleAlert
                              size={24}
                              className="animate-pulse"
                            />
                          ) : (
                            <Car size={24} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-bold text-gray-900">
                              {incident.title}
                            </h4>
                            <StatusBadge status={incident.status} />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <Clock size={14} />
                            <span>
                              {new Date(incident.createdAt).toLocaleTimeString(
                                "vi-VN",
                              )}
                            </span>
                            <span>•</span>
                            <span className="font-mono uppercase">
                              {incident.code}
                            </span>
                            {incident.assignedTeam && (
                              <span className="text-blue-500 font-semibold">
                                • {incident.assignedTeam.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-300" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Phân trang (Giữ nguyên logic cũ của bạn) */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 border rounded"
                >
                  <ChevronLeft />
                </button>
                <span className="text-sm">
                  Trang {page}/{pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 border rounded"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>

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
