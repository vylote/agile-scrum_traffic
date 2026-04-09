import React, { useMemo, useState, useEffect } from "react";
import { Phone, Car, MapPin, X, ShieldAlert, Zap, AlertTriangle, CornerUpLeft } from 'lucide-react';
import { getHaversineDistance } from "../../utils/geoUtils";

// ─── Component Thanh đếm ngược 30s ──────────────────────────────────────────
const CountdownProgressBar = ({ expiresAt, onZero }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, (expiresAt - Date.now()) / 1000);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        if (onZero) onZero(); 
      }
    }, 100);
    return () => clearInterval(interval);
  }, [expiresAt, onZero]);

  const progress = (timeLeft / 30) * 100;
  const isDanger = timeLeft <= 10;

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-1.5">
        <span className={isDanger ? "text-red-500 animate-pulse" : "text-gray-500"}>
          {isDanger ? "Sắp hết hạn phản hồi!" : "Tự động từ chối sau:"}
        </span>
        <span className={`text-sm ${isDanger ? "text-red-600" : "text-blue-600"}`}>
          {Math.ceil(timeLeft)}s
        </span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-100 ease-linear ${isDanger ? 'bg-red-50' : 'bg-blue-50'} overflow-hidden relative`}
          style={{ width: `${progress}%` }}
        >
            <div className={`absolute inset-0 ${isDanger ? 'bg-red-500' : 'bg-[#0088FF]'}`} />
        </div>
      </div>
    </div>
  );
};

const NormalOverviewCard = () => (
  <div className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mb-2 pointer-events-auto">
    <h2 className="text-center text-[16px] font-bold text-gray-900 mb-3">Hiệu suất trong ca</h2>
    <div className="flex gap-3 mb-2">
      <div className="flex-1 bg-sky-50/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-sky-100">
        <span className="text-lg font-black text-sky-600">4.5h</span>
        <p className="text-[9px] text-sky-400 font-bold uppercase mt-1">Hoạt động</p>
      </div>
      <div className="flex-1 bg-green-50/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-green-100">
        <span className="text-lg font-black text-green-600">03</span>
        <p className="text-[9px] text-green-400 font-bold uppercase mt-1">Hoàn thành</p>
      </div>
    </div>
  </div>
);

const IncidentCard = ({ 
  status, incident, onAction, onAccept, onArrive, onComplete, onReject, 
  myRole, currentPos, expiresAt, etaMinutes 
}) => {
  const isLeader = myRole === 'LEADER';

  const distance = useMemo(() => {
    if (!currentPos || !incident?.location?.coordinates) return null;
    return getHaversineDistance(
      { lat: currentPos.lat, lng: currentPos.lng },
      { lat: incident.location.coordinates[1], lng: incident.location.coordinates[0] }
    );
  }, [currentPos, incident]);

  const canCheckIn = distance !== null && distance <= 500;
  const title = incident?.title || "Sự cố cứu hộ";
  const address = incident?.location?.address || "Đang xác định vị trí...";
  const reporterName = incident?.reportedBy?.name || "Người dân";

  let cardConfig = {};

  switch (status) {
    // 🚩 TRƯỜNG HỢP 1: LỆNH TỪ BULL QUEUE (Có đếm ngược)
    case 'incoming':
      cardConfig = {
        headerTitle: "⚠️ LỆNH ĐIỀU ĐỘNG TỰ ĐỘNG",
        headerColor: "text-[#0088FF]",
        buttons: (
          <div className="w-full flex flex-col">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => onAccept(incident)}
                className="flex-[2] bg-[#0088FF] text-white py-3.5 rounded-xl font-black text-sm transition-transform active:scale-95 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Zap size={16} /> NHẬN CA NÀY
              </button>
              <button
                onClick={onReject}
                className="flex-[1] bg-red-50 text-red-500 border border-red-100 py-3.5 rounded-xl font-bold text-xs active:scale-95 hover:bg-red-100 transition-colors"
              >
                BỎ QUA
              </button>
            </div>
            <CountdownProgressBar expiresAt={expiresAt} onZero={onReject} />
          </div>
        )
      };
      break;

    // 🚩 TRƯỜNG HỢP 2: DUYỆT DANH SÁCH (Sự cố xung quanh)
    case 'new_incident':
      cardConfig = {
        headerTitle: "SỰ CỐ MỚI TRONG KHU VỰC",
        headerColor: "text-red-500",
        buttons: (
          <div className="flex gap-2 w-full">
            {isLeader ? (
              <button
                onClick={() => onAccept(incident)}
                className="flex-[2] bg-[#1e2a5e] text-white py-3.5 rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-lg shadow-blue-900/20"
              >
                CHẤP NHẬN CỨU HỘ
              </button>
            ) : (
              <div className="flex-[2] bg-amber-50 text-amber-600 py-3.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 border border-amber-100">
                <ShieldAlert size={14} /> CHỜ TRƯỞNG ĐỘI NHẬN CA
              </div>
            )}
            <button
              onClick={() => onAction('normal')}
              className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-xl font-bold text-xs"
            >
              ĐÓNG
            </button>
          </div>
        )
      };
      break;

    case 'moving':
      cardConfig = {
        headerTitle: "DI CHUYỂN ĐẾN HIỆN TRƯỜNG",
        headerColor: "text-[#0088FF]",
        buttons: (
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-400">KHOẢNG CÁCH:</span>
              <span className="text-sm font-black text-blue-600">
                {distance !== null ? `${distance.toFixed(0)} mét` : "Đang tính..."}
              </span>
            </div>
            <button
              disabled={!canCheckIn}
              onClick={onArrive}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                canCheckIn
                  ? "bg-green-500 text-white shadow-lg shadow-green-200"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {canCheckIn ? "XÁC NHẬN ĐÃ ĐẾN NƠI" : "HÃY TIẾP CẬN HIỆN TRƯỜNG (<500M)"}
            </button>
          </div>
        )
      };
      break;

    case 'processing':
      cardConfig = {
        headerTitle: "ĐANG XỬ LÝ TẠI CHỖ",
        headerColor: "text-amber-500",
        buttons: (
          <button
            onClick={() => onAction('done')}
            className="w-full bg-[#ffb000] text-white py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-orange-200"
          >
            ĐÃ XỬ LÝ XONG
          </button>
        )
      };
      break;

    case 'done':
      cardConfig = {
        headerTitle: "XÁC NHẬN HOÀN THÀNH",
        headerColor: "text-green-500",
        buttons: (
          <button
            onClick={onComplete}
            className="w-full bg-[#34c759] text-white py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-green-500/20"
          >
            VỀ TRẠNG THÁI SẴN SÀNG
          </button>
        )
      };
      break;

    default:
      return null;
  }

  return (
    <div className={`bg-white rounded-[32px] p-5 shadow-2xl border w-full relative pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 ${status === 'incoming' ? 'border-blue-400 ring-4 ring-blue-500/20' : 'border-gray-100'}`}>
      
      {cardConfig.headerTitle && (
        <h2 className={`text-center text-[10px] font-black mb-4 uppercase tracking-[0.2em] flex justify-center items-center gap-1.5 ${cardConfig.headerColor}`}>
          {status === 'incoming' && <AlertTriangle size={14} />} {cardConfig.headerTitle}
        </h2>
      )}

      <div className="bg-gray-50/80 rounded-[20px] p-4 mb-4 flex items-center justify-between border border-gray-100">
        <div className="flex gap-3.5 items-center">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${status === 'incoming' ? 'bg-blue-100' : 'bg-red-100'}`}>
            {(status === 'new_incident' || status === 'incoming')
              ? <Car className={`w-6 h-6 ${status === 'incoming' ? 'text-[#0088FF]' : 'text-red-500'} animate-pulse`} />
              : <span className="material-icons text-red-500 text-xl font-bold">warning</span>
            }
          </div>
          <div>
            <p className="font-black text-gray-900 text-[15px] leading-tight uppercase line-clamp-1 max-w-[180px]">
              {(status === 'new_incident' || status === 'incoming') ? title : reporterName}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
              {status === 'incoming' ? `Di chuyển: ~${etaMinutes} phút` : "Thông tin liên hệ"}
            </p>
          </div>
        </div>
        {status !== 'new_incident' && status !== 'incoming' && incident?.reportedBy?.phone && (
          <a href={`tel:${incident.reportedBy.phone}`} className="w-10 h-10 rounded-full bg-[#34c759] flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <Phone className="w-5 h-5 text-white" />
          </a>
        )}
      </div>

      <div className="flex items-start gap-2.5 mb-5 px-1">
        <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
        <p className="text-[12px] text-gray-600 leading-relaxed font-semibold line-clamp-2">{address}</p>
      </div>

      {cardConfig.buttons}
    </div>
  );
};

export const OverviewCard = (props) => {
  return props.appState === 'normal'
    ? <NormalOverviewCard />
    : (
      <IncidentCard
        status={props.appState}
        incident={props.incident}
        onAction={props.onAction}
        onAccept={props.onAccept}
        onArrive={props.onArrive}
        onComplete={props.onComplete}
        onReject={props.onReject}
        myRole={props.myRole}
        currentPos={props.currentPos}
        expiresAt={props.expiresAt}
        etaMinutes={props.etaMinutes}
      />
    );
};

export default OverviewCard;