import { BottomNav } from "../../components/BottomNav";
import { AlertCircle, FileText, ChevronRight, MapPin, Plus, Minus } from "lucide-react";
import ellipse1 from "../../assets/images/avatar.jpg"; 

export const CitizenDashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-24">
      {/* 1. STATUS BAR MOCK (Dành cho bản Mobile) */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <span className="text-black font-bold text-[17px]">9:41</span>
        <div className="flex gap-1.5 items-center">
          <div className="w-5 h-3 border border-black rounded-sm relative after:content-[''] after:absolute after:right-[-3px] after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-black after:rounded-full"></div>
        </div>
      </div>

      {/* 2. HEADER Tên App & Profile */}
      <div className="flex justify-between items-center px-6 mt-6 mb-8">
        <h1 className="text-[32px] font-bold text-black leading-tight">
          Cứu hộ<br />giao thông
        </h1>
        <img src={ellipse1} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" alt="User" />
      </div>

      {/* 3. NÚT CHỨC NĂNG CHÍNH */}
      <div className="px-6 flex flex-col gap-3">
        {/* Nút SOS - Ưu tiên màu đỏ khẩn cấp */}
        <button className="flex items-center bg-white p-4 rounded-[24px] shadow-sm active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mr-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-red-600 font-bold text-lg">SOS Khẩn cấp</span>
            <span className="text-gray-400 text-xs">Gửi vị trí ngay lập tức</span>
          </div>
          <ChevronRight className="text-gray-300 w-5 h-5" />
        </button>

        {/* Nút Báo cáo chi tiết */}
        <button className="flex items-center bg-white p-4 rounded-[24px] shadow-sm active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mr-4">
            <FileText className="w-7 h-7" />
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-black font-bold text-lg">Báo cáo chi tiết</span>
            <span className="text-gray-400 text-xs">Mô tả sự cố để nhận hỗ trợ tốt nhất</span>
          </div>
          <ChevronRight className="text-gray-300 w-5 h-5" />
        </button>
      </div>

      {/* 4. BẢN ĐỒ KHU VỰC (MOCK) */}
      <div className="px-6 mt-8">
        <h2 className="text-xl font-bold text-black mb-4">Bản đồ khu vực</h2>
        <div className="relative w-full h-[240px] rounded-[28px] overflow-hidden bg-gray-300 shadow-inner">
          {/* Ảnh nền bản đồ giả */}
          <div className="absolute inset-0 bg-[url('https://www.google.com/maps/d/thumbnail?mid=1_K_BIdf8W-UqNqW_5A_V5C0jX1E&hl=en')] bg-cover bg-center opacity-80"></div>
          
          {/* Chip thông báo trên bản đồ */}
          <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-black">Có 1 đội cứu hộ gần bạn</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute right-4 bottom-4 flex flex-col bg-white rounded-xl shadow-md overflow-hidden">
             <button className="p-2 border-b border-gray-100 hover:bg-gray-50"><Plus className="w-5 h-5" /></button>
             <button className="p-2 hover:bg-gray-50"><Minus className="w-5 h-5" /></button>
          </div>

          {/* Marker vị trí giả */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <MapPin className="w-8 h-8 text-blue-600 fill-blue-100" />
          </div>
        </div>
      </div>

      {/* 5. ĐIỀU HƯỚNG DƯỚI CÙNG */}
      <BottomNav />
    </div>
  );
};