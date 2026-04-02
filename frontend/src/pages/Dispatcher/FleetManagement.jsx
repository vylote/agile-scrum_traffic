import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import { MessageSquare, MapPin, CheckCircle2, Clock, XCircle } from "lucide-react";

// MOCK DATA: Dữ liệu giả lập các đội xe
const mockFleets = [
  {
    id: "0001",
    base: "Cầu Giấy",
    teamName: "Đội phản ứng nhanh",
    status: "Sẵn sàng",
    plate: "29H-123.45",
    type: "Xe sàn trượt",
    distance: "2.0km",
    members: ["Nguyễn Văn A (Thợ máy)", "Nguyễn Văn B (Lái xe)"]
  },
  {
    id: "0002",
    base: "Đống Đa",
    teamName: "Đội cứu hộ hạng nặng",
    status: "Đang bận",
    plate: "29C-987.65",
    type: "Xe cẩu kéo",
    distance: "5.5km",
    members: ["Trần Thị C (Trưởng xe)", "Lê Văn D (Thợ máy)"]
  },
  {
    id: "0003",
    base: "Thanh Xuân",
    teamName: "Đội phản ứng nhanh",
    status: "Sẵn sàng",
    plate: "29H-456.78",
    type: "Xe sàn trượt",
    distance: "3.2km",
    members: ["Phạm Văn E (Lái xe)", "Hoàng Thị F (Y tế)"]
  }
];

// MOCK DATA: Dữ liệu các Tab trạng thái
const tabs = [
  { label: "Tất cả", count: 25, active: true, color: "bg-indigo-950 text-white" },
  { label: "Sẵn sàng", count: 12, active: false, icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
  { label: "Đang bận", count: 8, active: false, icon: <Clock className="w-4 h-4 text-orange-500" /> },
  { label: "Ngoại tuyến", count: 5, active: false, icon: <XCircle className="w-4 h-4 text-gray-400" /> },
];

export const FleetManagement = () => {
  return (
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
              Quản lý đội xe
            </h2>
            <p className="text-sm text-gray-500">
              Hà Nội, Việt Nam • Cập nhật lúc 07:00
            </p>
          </div>
          <div className="w-[400px]">
            <SearchBar className="w-full" />
          </div>
        </header>

        {/* KHU VỰC CUỘN NỘI DUNG */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          
          {/* Tabs Trạng Thái */}
          <div className="flex flex-wrap gap-4 mt-2 mb-8">
            {tabs.map((tab, idx) => (
              <button 
                key={idx}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  tab.active 
                    ? tab.color 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.icon && tab.icon}
                <span>{tab.label} ({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Lưới Danh Sách Xe */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockFleets.map((fleet) => (
              <div key={fleet.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Header Thẻ */}
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-50 text-green-600 text-xs font-bold border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {fleet.status}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{fleet.teamName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Mã NV: {fleet.id} • {fleet.base}</p>
                  </div>
                </div>

                {/* Body Thẻ: Thông số */}
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Biển số:</span>
                    <span className="text-sm font-bold text-gray-900">{fleet.plate}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs text-gray-400">Khoảng cách:</span>
                    <span className="text-sm font-bold text-blue-500">{fleet.distance}</span>
                  </div>
                </div>
                
                <div className="px-5 pb-4">
                  <span className="text-xs text-gray-400 block mb-1">Loại xe:</span>
                  <span className="text-sm font-medium text-gray-800">{fleet.type}</span>
                </div>

                {/* Danh sách nhân sự */}
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Nhân sự trực ca ({fleet.members.length})</p>
                  <ul className="flex flex-col gap-1.5">
                    {fleet.members.map((member, i) => (
                      <li key={i} className="text-sm font-medium text-gray-800 before:content-['•'] before:mr-2 before:text-gray-300">
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Thẻ: Hành động */}
                <div className="mt-auto border-t border-gray-100 flex items-center">
                  <button className="flex-1 flex justify-center items-center gap-2 py-3.5 text-blue-500 hover:bg-blue-50 transition-colors font-medium text-sm border-r border-gray-100">
                    <MessageSquare className="w-4 h-4" /> Nhắn tin
                  </button>
                  <button className="flex-1 flex justify-center items-center gap-2 py-3.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
                    <MapPin className="w-4 h-4" /> Vị trí
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};