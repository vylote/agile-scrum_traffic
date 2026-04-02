import React from "react";
import { Phone, Car, MapPin, X } from 'lucide-react';

const NormalOverviewCard = ({ onSimulate }) => (
  <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-gray-100 mx-4 mt-auto mb-2 pointer-events-auto">
    <h2 className="text-center text-[22px] font-bold text-gray-900 mb-6">Tổng quan hoạt động</h2>
    <div className="flex gap-4 mb-6">
      <div className="flex-1 bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-sky-500">
          <span className="material-icons text-xl">schedule</span>
          <span className="text-2xl font-bold text-gray-900">4.5h</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Thời gian HĐ</p>
      </div>
      <div className="flex-1 bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-green-500">
          <span className="material-icons text-xl">check_circle</span>
          <span className="text-2xl font-bold text-gray-900">3</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Đã xử lý</p>
      </div>
    </div>
    <button 
      onClick={() => onSimulate('new_incident')}
      className="w-full bg-[#1e2a5e] text-white font-semibold py-4 rounded-xl text-sm shadow-md hover:bg-[#151f47] transition-colors"
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
          <div className="flex gap-3 w-full">
            <button onClick={() => onAction('moving')} className="flex-1 bg-[#1e2a5e] text-white py-3 rounded-xl font-semibold text-sm">Nhận nhiệm vụ</button>
            <button onClick={() => onAction('normal')} className="flex-1 bg-[#ff4040] text-white py-3 rounded-xl font-semibold text-sm">Từ chối</button>
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
    <div className="bg-white rounded-[32px] p-5 shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-gray-100 mx-4 mt-auto mb-2 pointer-events-auto relative">
      {status === 'new_incident' && (
        <button onClick={() => onAction('normal')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      )}

      {config.title && <h2 className="text-center text-red-500 font-bold mb-4">{config.title}</h2>}

      <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
         <div className="flex gap-3 items-center">
            {status === 'new_incident' ? (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Car className="w-5 h-5 text-red-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-icons text-red-500 font-bold text-lg">warning_amber</span>
              </div>
            )}
            <div>
              {status === 'new_incident' ? (
                 <><p className="font-bold text-gray-900 text-lg leading-tight">Tai nạn</p><p className="text-xs text-gray-500">Cách bạn 2.5km</p></>
              ) : (
                 <><p className="text-[10px] text-gray-500 leading-tight">Người báo cáo</p><p className="font-bold text-gray-900 text-base">Nguyễn Văn A</p></>
              )}
            </div>
         </div>
         {status !== 'new_incident' && (
           <button className="w-10 h-10 rounded-full bg-[#34c759] flex items-center justify-center shadow-sm">
             <Phone className="w-5 h-5 text-white" />
           </button>
         )}
      </div>

      <div className="flex items-start gap-2 mb-5 px-1">
         <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
         <p className="text-xs text-gray-600 leading-tight">3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội</p>
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