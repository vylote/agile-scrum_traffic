import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import { TriangleAlert, Car, Clock, ChevronRight, Activity, Plus } from "lucide-react";

const incidentList = [
  {
    id: "0001",
    isEmergency: true,
    title: "Tai nạn nghiêm trọng - Ngã tư Cầu Giấy",
    time: "Vừa xong",
    reporter: "Nguyễn Văn A",
    statusText: "KHẨN CẤP",
    actionText: "Điều phối xe",
  },
  {
    id: "0002",
    isEmergency: false,
    title: "Hỏng xe - 123 Đường Láng",
    time: "5p trước",
    reporter: "Nguyễn Văn B",
    statusText: "Đang tìm đội cứu hộ",
    statusColor: "text-orange-600",
    dotColor: "bg-orange-500",
  },
  {
    id: "0003",
    isEmergency: false,
    title: "Hỏng xe - 124 Đường Láng",
    time: "10p trước",
    reporter: "Trần Thị C",
    statusText: "Đang xử lý",
    statusColor: "text-blue-600",
    dotColor: "bg-blue-500",
  },
];

export const Incident = () => {
  return (
    // LAYOUT TỔNG: Giữ nguyên cấu trúc để không bị giật trang
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      
      {/* =========================================
          SIDEBAR (Chỉ cần 1 dòng duy nhất!)
      ========================================= */}
      <Menu />

      {/* =========================================
          MAIN CONTENT (NỘI DUNG CHÍNH)
      ========================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
              Quản lý sự cố
            </h2>
            <p className="text-sm text-gray-500">
              Hà Nội, Việt Nam • Cập nhật lúc 07:00
            </p>
          </div>
          <div className="w-[400px]">
            <SearchBar className="w-full" />
          </div>
        </header>

        {/* DANH SÁCH SỰ CỐ */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            
            {/* Thanh công cụ: Tiêu đề & Nút bấm */}
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-xl font-bold text-gray-900">Danh sách sự cố ({incidentList.length})</h3>
              
              <div className="flex gap-3">
                {/* Nút Báo cáo Hotline (Màu xanh nổi bật) */}
                <button className="flex items-center gap-2 bg-[#0088FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:scale-95">
                  <Plus className="w-4 h-4" />
                  Báo cáo Hotline
                </button>
              </div>
            </div>

            {/* Khối hiển thị danh sách (Mapping Data) */}
            <div className="flex flex-col gap-4">
              {incidentList.map((incident) => (
                <div 
                  key={incident.id} 
                  className={`group bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
                    incident.isEmergency ? "border-red-200" : "border-gray-200"
                  }`}
                >
                  
                  {/* Cột Trái: Thông tin sự cố */}
                  <div className="flex items-start gap-4">
                    {/* Icon loại sự cố */}
                    <div className={`p-3 rounded-xl flex items-center justify-center ${
                      incident.isEmergency ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-500"
                    }`}>
                      {incident.isEmergency ? <TriangleAlert className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    </div>

                    {/* Chi tiết */}
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
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{incident.time}</span>
                        </div>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="font-medium text-gray-600">Mã: {incident.id}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>Người báo: {incident.reporter}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cột Phải: Trạng thái & Hành động */}
                  <div className="flex items-center gap-6">
                    {incident.isEmergency ? (
                      /* Nút Điều phối xe cho ca Khẩn cấp */
                      <button className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-colors">
                        <Activity className="w-4 h-4" />
                        {incident.actionText}
                      </button>
                    ) : (
                      /* Trạng thái cho ca Bình thường */
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${incident.dotColor}`}></span>
                        <span className={`text-sm font-medium ${incident.statusColor}`}>
                          {incident.statusText}
                        </span>
                      </div>
                    )}
                    
                    {/* Icon Mũi tên */}
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};