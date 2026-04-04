import React from "react";
import { Phone, Car, MapPin, X } from 'lucide-react';

const NormalOverviewCard = ({ onSimulate }) => (
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
    <button 
      onClick={() => onSimulate('new_incident')}
      className="w-full bg-[#1e2a5e] text-white font-semibold py-3 rounded-xl text-xs shadow-sm hover:bg-[#151f47] transition-all active:scale-[0.98]"
    >
      Simulate: Có người gửi SOS
    </button>
  </div>
);

const IncidentCard = ({ status, onAction }) => {
  let config = {};
  switch(status) {
    case 'new_incident':
      config = {
        title: "Phát hiện sự cố",
        buttons: (
          <div className="flex gap-2 w-full">
            <button onClick={() => onAction('moving')} className="flex-1 bg-[#1e2a5e] text-white py-2.5 rounded-lg font-semibold text-xs">Nhận</button>
            <button onClick={() => onAction('normal')} className="flex-1 bg-[#ff4040] text-white py-2.5 rounded-lg font-semibold text-xs">Từ chối</button>
          </div>
        )
      };
      break;
    case 'moving':
      config = { buttons: <button onClick={() => onAction('processing')} className="w-full bg-[#1e2a5e] text-white py-3 rounded-xl font-semibold text-sm">Đã đến hiện trường</button> };
      break;
    case 'processing':
      config = { buttons: <button onClick={() => onAction('done')} className="w-full bg-[#ffb000] text-white py-3 rounded-xl font-semibold text-sm">Đang xử lý</button> };
      break;
    case 'done':
      config = { buttons: <button onClick={() => onAction('normal')} className="w-full bg-[#34c759] text-white py-3 rounded-xl font-semibold text-sm">Hoàn thành</button> };
      break;
    default: return null;
  }

  return (
    <div className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 mb-2 pointer-events-auto relative">
      {status === 'new_incident' && (
        <button onClick={() => onAction('normal')} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500">
          <X className="w-4 h-4" />
        </button>
      )}

      {config.title && <h2 className="text-center text-red-500 text-sm font-bold mb-3 uppercase tracking-wider">{config.title}</h2>}

      <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center justify-between">
         <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              {status === 'new_incident' ? <Car className="w-4 h-4 text-red-500" /> : <span className="material-icons text-red-500 text-base">warning</span>}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {status === 'new_incident' ? "Tai nạn" : "Nguyễn Văn A"}
              </p>
              <p className="text-[10px] text-gray-400">
                {status === 'new_incident' ? "Cách bạn 2.5km" : "Người báo cáo"}
              </p>
            </div>
         </div>
         {status !== 'new_incident' && (
           <button className="w-8 h-8 rounded-full bg-[#34c759] flex items-center justify-center shadow-sm">
             <Phone className="w-4 h-4 text-white" />
           </button>
         )}
      </div>

      <div className="flex items-start gap-2 mb-4 px-1">
         <MapPin className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
         <p className="text-[11px] text-gray-500 leading-snug">3 Cầu Giấy, Ngọc Khánh, Ba Đình, Hà Nội</p>
      </div>
      {config.buttons}
    </div>
  );
};

export const OverviewCard = ({ appState, setAppState }) => {
  return appState === 'normal' 
    ? <NormalOverviewCard onSimulate={setAppState} />
    : <IncidentCard status={appState} onAction={setAppState} />;
};

export default OverviewCard;