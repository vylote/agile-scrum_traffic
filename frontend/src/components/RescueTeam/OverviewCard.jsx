import React from "react";
import { Phone, Car, MapPin, X } from 'lucide-react';

const NormalOverviewCard = () => (
  <div className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mb-2 pointer-events-auto">
    <h2 className="text-center text-[18px] font-bold text-gray-900 mb-3">Tổng quan hoạt động</h2>
    <div className="flex gap-3 mb-4">
      <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1.5 text-sky-500">
          <span className="material-icons text-base">schedule</span>
          <span className="text-lg font-bold text-gray-900">4.5h</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">Thời gian HĐ</p>
      </div>
      <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1.5 text-green-500">
          <span className="material-icons text-base">check_circle</span>
          <span className="text-lg font-bold text-gray-900">3</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">Đã xử lý</p>
      </div>
    </div>
  </div>
);

const IncidentCard = ({ status, incident, onAction, onAccept, onComplete }) => {
  let config = {};

  const title = incident?.title || "Sự cố cứu hộ";
  const address = incident?.location?.address || "Đang xác định vị trí...";
  const reporterName = incident?.reportedBy?.name || "Người dân";

  switch(status) {
    case 'new_incident':
      config = {
        title: "PHÁT HIỆN SỰ CỐ MỚI",
        buttons: (
          <div className="flex gap-2 w-full">
            <button onClick={onAccept} className="flex-1 bg-[#1e2a5e] text-white py-2.5 rounded-lg font-semibold text-xs transition-transform active:scale-95">
                Nhận ca ngay
            </button>
            <button onClick={() => onAction('normal')} className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-lg font-semibold text-xs">
                Đóng
            </button>
          </div>
        )
      };
      break;
    case 'moving':
      config = { 
        title: "ĐANG ĐẾN HIỆN TRƯỜNG",
        buttons: <button onClick={() => onAction('processing')} className="w-full bg-[#1e2a5e] text-white py-3 rounded-xl font-semibold text-sm">Tôi đã đến nơi</button> 
      };
      break;
    case 'processing':
      config = { 
        title: "ĐANG XỬ LÝ",
        buttons: <button onClick={() => onAction('done')} className="w-full bg-[#ffb000] text-white py-3 rounded-xl font-semibold text-sm">Đã xử lý xong</button> 
      };
      break;
    case 'done':
      config = { 
        title: "HOÀN THÀNH",
        buttons: <button onClick={onComplete} className="w-full bg-[#34c759] text-white py-3 rounded-xl font-semibold text-sm">Về trạng thái sẵn sàng</button> 
      };
      break;
    default: return null;
  }

  return (
    <div className="bg-white rounded-[28px] p-5 shadow-2xl border border-white/20 w-full relative pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {status === 'new_incident' && (
        <button onClick={() => onAction('normal')} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500">
          <X className="w-4 h-4" />
        </button>
      )}

      {config.title && <h2 className="text-center text-red-500 text-[10px] font-black mb-3 uppercase tracking-widest">{config.title}</h2>}

      <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center justify-between">
         <div className="flex gap-2.5 items-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              {status === 'new_incident' ? <Car className="w-5 h-5 text-red-500 animate-pulse" /> : <span className="material-icons text-red-500 text-base">warning</span>}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight uppercase">
                {status === 'new_incident' ? title : reporterName}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                {status === 'new_incident' ? "Ưu tiên xử lý" : "Người báo cáo"}
              </p>
            </div>
         </div>
         {status !== 'new_incident' && (
           <a href={`tel:${incident?.reportedBy?.phone}`} className="w-9 h-9 rounded-full bg-[#34c759] flex items-center justify-center shadow-sm active:scale-90 transition-transform">
             <Phone className="w-4 h-4 text-white" />
           </a>
         )}
      </div>

      <div className="flex items-start gap-2 mb-4 px-1">
         <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
         <p className="text-[11px] text-gray-600 leading-snug font-medium">{address}</p>
      </div>
      {config.buttons}
    </div>
  );
};

export const OverviewCard = ({ appState, setAppState, incident, onAccept, onAction, onComplete }) => {
  return appState === 'normal' 
    ? <NormalOverviewCard />
    : <IncidentCard 
        status={appState} 
        incident={incident} 
        onAction={onAction || setAppState} 
        onAccept={onAccept}
        onComplete={onComplete}
      />;
};

export default OverviewCard;