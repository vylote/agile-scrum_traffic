import React, { useState, useEffect } from "react";
import { MapPin, AlertTriangle, Clock, X, Navigation } from "lucide-react";
import { INCIDENT_TYPES } from "../../utils/constants/incidentConstants";

const TYPE_LABELS = {
  [INCIDENT_TYPES.ACCIDENT]: "Tai nạn giao thông",
  [INCIDENT_TYPES.BREAKDOWN]: "Hỏng xe / Chết máy",
  [INCIDENT_TYPES.FLOOD]: "Ngập nước",
  [INCIDENT_TYPES.FIRE]: "Cháy nổ",
  [INCIDENT_TYPES.OTHER]: "Sự cố khác",
};

export const GlobalIncidentModal = ({
  incident,
  distance,
  etaMinutes,
  expiresAt,
  onAccept,
  onReject,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);

  // Đếm ngược 30 giây
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, (expiresAt - Date.now()) / 1000);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onReject(); // Hết giờ tự động từ chối
      }
    }, 100);
    return () => clearInterval(interval);
  }, [expiresAt, onReject]);

  const progress = (timeLeft / 30) * 100;
  const isDanger = timeLeft <= 10;

  const handleAcceptClick = async () => {
    setIsProcessing(true);
    await onAccept(incident);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-[360px] bg-[#F5F6FA] rounded-[28px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
              <AlertTriangle className="text-red-500 w-4 h-4" />
            </div>
            <span className="font-black text-gray-900 text-sm tracking-wide uppercase">
              Lệnh Điều Động
            </span>
          </div>
          <button
            onClick={onReject}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nội dung */}
        <div className="px-5 pt-5 pb-2 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-red-500 text-white text-[11px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
              {TYPE_LABELS[incident.type] || "Khẩn cấp"}
            </span>
            <span className="text-xl font-black text-[#0088FF] tracking-tighter">
              ~{etaMinutes}{" "}
              <span className="text-xs text-gray-500 font-medium">phút</span>
            </span>
          </div>

          <div className="text-xs text-gray-500 font-medium mb-5">
            Mã vụ:{" "}
            <span className="font-bold text-gray-800">{incident.code}</span>
            <br />
            Khoảng cách:{" "}
            <span className="font-bold text-gray-800">
              {distance ? `${(distance / 1000).toFixed(1)} km` : "Đang tính..."}
            </span>
          </div>

          {/* Tuyến đường */}
          <div className="flex flex-col gap-0 pb-4">
            <div className="flex gap-3 items-start">
              <div className="flex flex-col items-center pt-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#0088FF] ring-4 ring-blue-50" />
                <div className="w-0.5 min-h-[36px] bg-gray-200 my-1" />
              </div>
              <div className="flex-1 pb-4">
                <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Vị trí của bạn
                </div>
                <div className="text-sm font-bold text-gray-900 leading-snug">
                  Xe đang lưu thông
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex flex-col items-center pt-1">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-50" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  Điểm đến <Navigation size={10} className="text-red-500" />
                </div>
                <div className="text-[15px] font-black text-gray-900 leading-snug line-clamp-2">
                  {incident.location?.address}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh Progress Đếm ngược */}
        <div className="w-full bg-gray-200 h-1.5">
          <div
            className={`h-full transition-all duration-100 ease-linear ${isDanger ? "bg-red-500" : "bg-[#0088FF]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-white flex gap-3">
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex-[1] h-12 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Bỏ qua
          </button>
          <button
            onClick={handleAcceptClick}
            disabled={isProcessing}
            className="flex-[2] h-12 bg-[#0088FF] text-white font-black rounded-2xl shadow-[0_4px_12px_rgba(0,136,255,0.3)] active:scale-95 transition-all disabled:opacity-50 text-[15px] uppercase tracking-wider"
          >
            {isProcessing ? "Đang nhận..." : "Tiếp nhận ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};
