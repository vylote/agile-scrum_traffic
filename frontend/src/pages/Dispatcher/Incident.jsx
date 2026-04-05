import React, { useState } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import { 
  TriangleAlert, Car, Clock, ChevronRight, Activity, Plus, 
  X, MapPin, Phone, MessageSquare, AlertCircle, UserPlus 
} from "lucide-react";

const incidentList = [
  {
    id: "0001",
    isEmergency: true,
    title: "Tai nạn nghiêm trọng - Ngã tư Cầu Giấy",
    time: "Vừa xong",
    reporter: "Nguyễn Văn A",
    phone: "0912345768",
    statusText: "KHẨN CẤP",
    actionText: "Điều phối xe",
    location: "Ngã tư Cầu Giấy - Xuân Thuỷ, Q. Cầu Giấy, Hà Nội",
    description: "Hai xe máy va chạm mạnh, có người bị thương. Cần cấp cứu và CSGT."
  },
  {
    id: "0002",
    isEmergency: false,
    title: "Hỏng xe - 123 Đường Láng",
    time: "5p trước",
    reporter: "Nguyễn Văn B",
    phone: "0988777666",
    statusText: "Đang tìm đội cứu hộ",
    statusColor: "text-orange-600",
    dotColor: "bg-orange-500",
    location: "123 Đường Láng, Đống Đa, Hà Nội",
    description: "Xe bị chết máy giữa đường, cần xe kéo về gara."
  },
  {
    id: "0003",
    isEmergency: false,
    title: "Hỏng xe - 124 Đường Láng",
    time: "10p trước",
    reporter: "Trần Thị C",
    phone: "0977111222",
    statusText: "Đang xử lý",
    statusColor: "text-blue-600",
    dotColor: "bg-blue-500",
    location: "124 Đường Láng, Đống Đa, Hà Nội",
    description: "Thủng lốp xe, cần hỗ trợ thay lốp dự phòng."
  },
];

export const Incident = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <Menu />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER */}
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">Quản lý sự cố</h2>
            <p className="text-sm text-gray-500">Hà Nội, Việt Nam • Cập nhật lúc 07:00</p>
          </div>
          <div className="w-[400px]">
            <SearchBar className="w-full" />
          </div>
        </header>

        {/* DANH SÁCH SỰ CỐ */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-xl font-bold text-gray-900">Danh sách sự cố ({incidentList.length})</h3>
              <button className="flex items-center gap-2 bg-[#0088FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> Báo cáo Hotline
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {incidentList.map((incident) => (
                <div 
                  key={incident.id} 
                  onClick={() => setSelectedIncident(incident)}
                  className={`group bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
                    incident.isEmergency ? "border-red-200" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex items-center justify-center ${
                      incident.isEmergency ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-500"
                    }`}>
                      {incident.isEmergency ? <TriangleAlert size={24} /> : <Car size={24} />}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h4 className="text-base font-bold text-gray-900">{incident.title}</h4>
                        {incident.isEmergency && (
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {incident.statusText}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5"><Clock size={14} /><span>{incident.time}</span></div>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="font-medium text-gray-600">Mã: {incident.id}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>Người báo: {incident.reporter}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {!incident.isEmergency && (
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${incident.dotColor}`}></span>
                        <span className={`text-sm font-medium ${incident.statusColor}`}>{incident.statusText}</span>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================
            SIDEBAR CHI TIẾT SỰ CỐ (SLIDE-OVER)
        ========================================= */}
        <div className={`fixed inset-0 z-[100] transition-visibility duration-300 ${selectedIncident ? "visible" : "invisible"}`}>
          {/* Overlay làm mờ phía sau */}
          <div 
            className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${selectedIncident ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSelectedIncident(null)}
          />
          
          {/* Panel nội dung trượt từ phải sang */}
          <aside className={`absolute top-0 right-0 h-full w-full max-w-[420px] bg-[#F2F2F7] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${selectedIncident ? "translate-x-0" : "translate-x-full"}`}>
            
            {/* Header Sidebar */}
            <div className="bg-[#F2F2F7] pt-6 pb-4 px-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-[#FF383C]/20 text-[#FF383C] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedIncident?.statusText || "YÊU CẦU CỨU HỘ"}
                </span>
                <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-black mb-1">{selectedIncident?.title}</h2>
              <p className="text-sm text-gray-500 font-medium tracking-tight uppercase">Mã: {selectedIncident?.id}</p>
            </div>

            {/* Nội dung chi tiết (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Mục Hiện trường */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black font-bold">
                  <MapPin size={18} className="text-gray-400" />
                  <span className="text-[13px]">Hiện trường</span>
                </div>
                <img 
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/nftx52yd_expires_30_days.png" 
                  className="w-full h-24 object-cover rounded-xl border border-gray-200" 
                  alt="map" 
                />
                <p className="text-[11px] text-black leading-relaxed">{selectedIncident?.location}</p>
              </div>

              {/* Thông tin người báo cáo */}
              <div className="flex items-center bg-white p-4 rounded-xl border border-[#C6C6C8] shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <UserPlus size={20} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Người báo cáo</p>
                  <p className="text-sm font-bold text-black leading-tight">{selectedIncident?.reporter}</p>
                  <p className="text-xs text-gray-500 font-mono">{selectedIncident?.phone}</p>
                </div>
                <button className="p-2 text-blue-500 bg-blue-50 rounded-full"><Phone size={18} /></button>
              </div>

              {/* Tình trạng & Ảnh */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black font-bold">
                  <MessageSquare size={18} className="text-gray-400" />
                  <span className="text-[13px]">Chi tiết & Tình trạng</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#C6C6C8]">
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    "{selectedIncident?.description}"
                  </p>
                </div>
                <div className="flex gap-2">
                   <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/u0qxk7p2_expires_30_days.png" className="flex-1 h-20 object-cover rounded-lg border border-gray-200" alt="scene 1" />
                   <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/hxtzy1cq_expires_30_days.png" className="flex-1 h-20 object-cover rounded-lg border border-gray-200" alt="scene 2" />
                </div>
              </div>

              {/* Tiến trình xử lý */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-black font-bold">
                  <Activity size={18} className="text-gray-400" />
                  <span className="text-[13px]">Tiến trình xử lý</span>
                </div>
                <div className="space-y-3 ml-1 border-l-2 border-dashed border-gray-300 pl-4">
                  <div className="relative">
                    <p className="text-xs font-bold text-black">Người dân gửi báo cáo qua App.</p>
                    <p className="text-[10px] text-gray-400">06:45</p>
                  </div>
                  <div className="relative">
                    <p className="text-xs font-bold text-red-500">Hệ thống Auto-assign thất bại.</p>
                    <p className="text-[10px] text-gray-400">06:46</p>
                  </div>
                  <div className="relative">
                    <p className="text-xs font-bold text-black">Chuyển cho điều phối viên xử lý.</p>
                    <p className="text-[10px] text-gray-400">06:46</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Sidebar */}
            <div className="p-6 bg-white border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-2.5 p-3 bg-orange-50 rounded-xl border border-orange-200">
                <AlertCircle size={16} className="text-orange-500 shrink-0" />
                <p className="text-[10px] text-red-600 font-medium leading-tight">
                  Hệ thống không tìm thấy xe phù hợp hoặc tài xế từ chối. Vui lòng điều phối thủ công.
                </p>
              </div>
              <button 
                onClick={() => alert("Điều phối thủ công cho: " + selectedIncident.id)}
                className="w-full py-4 bg-[#FF383C] hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]"
              >
                Chỉ định đội cứu hộ (Force Assign)
              </button>
            </div>

          </aside>
        </div>

      </main>
    </div>
  );
};