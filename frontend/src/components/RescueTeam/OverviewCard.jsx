import React from "react";
import { Phone, Car, MapPin, X, ShieldAlert } from 'lucide-react';

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

const IncidentCard = ({ status, incident, onAction, onAccept, onComplete, myRole }) => {
  let config = {};
  const isLeader = myRole === 'LEADER';

  const title = incident?.title || "Sự cố cứu hộ";
  const address = incident?.location?.address || "Đang xác định vị trí...";
  const reporterName = incident?.reportedBy?.name || "Người dân";

  switch(status) {
    case 'new_incident':
      config = {
        title: "SỰ CỐ MỚI TRONG KHU VỰC",
        buttons: (
          <div className="flex gap-2 w-full">
            {isLeader ? (
              <button 
                onClick={() => onAccept(incident)} 
                className="flex-1 bg-[#1e2a5e] text-white py-3 rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-lg shadow-blue-900/20"
              >
                CHẤP NHẬN CỨU HỘ
              </button>
            ) : (
              <div className="flex-1 bg-amber-50 text-amber-600 py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 border border-amber-100">
                <ShieldAlert size={14} /> CHỜ TRƯỞNG ĐỘI NHẬN CA
              </div>
            )}
            <button 
              onClick={() => onAction('normal')} 
              className="px-6 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold text-xs"
            >
              ĐÓNG
            </button>
          </div>
        )
      };
      break;
    case 'moving':
      config = { 
        title: "DI CHUYỂN ĐẾN HIỆN TRƯỜNG",
        buttons: (
            <button 
                onClick={() => onAction('processing')} 
                className="w-full bg-[#1e2a5e] text-white py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
                TÔI ĐÃ ĐẾN NƠI
            </button> 
        )
      };
      break;
    case 'processing':
      config = { 
        title: "ĐANG XỬ LÝ TẠI CHỖ",
        buttons: (
            <button 
                onClick={() => onAction('done')} 
                className="w-full bg-[#ffb000] text-white py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
                ĐÃ XỬ LÝ XONG
            </button> 
        )
      };
      break;
    case 'done':
      config = { 
        title: "XÁC NHẬN HOÀN THÀNH",
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
    default: return null;
  }

  return (
    <div className="bg-white rounded-[32px] p-5 shadow-2xl border border-gray-100 w-full relative pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
      {status === 'new_incident' && (
        <button onClick={() => onAction('normal')} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
          <X size={20} />
        </button>
      )}

      {config.title && <h2 className="text-center text-red-500 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">{config.title}</h2>}

      <div className="bg-gray-50/80 rounded-[20px] p-4 mb-4 flex items-center justify-between border border-gray-100">
          <div className="flex gap-3.5 items-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shadow-inner">
              {status === 'new_incident' ? <Car className="w-6 h-6 text-red-500 animate-pulse" /> : <span className="material-icons text-red-500 text-xl font-bold">warning</span>}
            </div>
            <div>
              <p className="font-black text-gray-900 text-[15px] leading-tight uppercase line-clamp-1 max-w-[180px]">
                {status === 'new_incident' ? title : reporterName}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                {status === 'new_incident' ? "Mức độ: Ưu tiên" : "Thông tin liên hệ"}
              </p>
            </div>
          </div>
          {status !== 'new_incident' && incident?.reportedBy?.phone && (
            <a href={`tel:${incident.reportedBy.phone}`} className="w-10 h-10 rounded-full bg-[#34c759] flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <Phone className="w-5 h-5 text-white" />
            </a>
          )}
      </div>

      <div className="flex items-start gap-2.5 mb-5 px-1">
          <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-gray-600 leading-relaxed font-semibold line-clamp-2">{address}</p>
      </div>
      {config.buttons}
    </div>
  );
};

export const OverviewCard = ({ appState, incident, onAccept, onAction, onComplete, myRole }) => {
  return appState === 'normal' 
    ? <NormalOverviewCard />
    : <IncidentCard 
        status={appState} 
        incident={incident} 
        onAction={onAction} 
        onAccept={onAccept}
        onComplete={onComplete}
        myRole={myRole}
      />;
};

export default OverviewCard;