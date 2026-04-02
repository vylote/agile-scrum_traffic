import React from "react";
import { useNavigate } from "react-router-dom"; // 👈 Thêm "hoa tiêu" điều hướng
import { BottomNav } from "../../components/Citizen/BottomNav";
import Map from "../../components/Public/Map";
import { ChevronRight } from "lucide-react";

export const CitizenDashboard = () => {
  const navigate = useNavigate(); // 👈 Khởi tạo hàm điều hướng

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-24">
      {/* 1. STATUS BAR (Giữ đúng chất Mobile) */}
      <div className="flex justify-between items-center px-8 pt-5 pb-2">
        <span className="text-black font-bold text-[17px]">9:41</span>
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/hncc5whw_expires_30_days.png"
          className="w-[95px] h-[22px] object-contain"
          alt="status icons"
        />
      </div>

      {/* 2. HEADER APP */}
      <div className="flex items-center justify-between px-7 mt-6 mb-7">
        <h1 className="text-black text-[34px] font-bold leading-tight">
          Cứu hộ giao thông
        </h1>
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/sa2f7yce_expires_30_days.png"
          className="w-10 h-10 rounded-full shadow-sm object-cover border-2 border-white"
          alt="avatar"
          onClick={() => navigate("/citizen/account")}
        />
      </div>

      {/* 3. CÁC NÚT CHỨC NĂNG CHÍNH */}
      <div className="px-6 space-y-3">
        {/* Nút SOS Khẩn cấp */}
        <button
          className="w-full flex items-center bg-white p-5 rounded-[27px] active:scale-[0.97] transition-transform shadow-sm"
          onClick={() => navigate("/citizen/sos")}
        >
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/vpmo159b_expires_30_days.png"
            className="w-8 h-8 mr-4"
            alt="sos icon"
          />
          <div className="flex flex-col items-start flex-1">
            <span className="text-[#FF3B30] text-[20px] font-bold tracking-tight">
              SOS Khẩn cấp
            </span>
            <span className="text-[#8E8E93] text-[14px]">
              Tự động gửi vị trí ngay lập tức
            </span>
          </div>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/bo31ab9n_expires_30_days.png"
            className="w-5 h-5 opacity-40"
            alt="arrow"
          />
        </button>

        {/* 🎯 NÚT BÁO CÁO CHI TIẾT - ĐÃ THÊM NAVIGATE */}
        <button
          className="w-full flex items-center bg-white p-5 rounded-[27px] active:scale-[0.97] transition-transform shadow-sm text-left"
          onClick={() => navigate("/citizen/report")} // 👈 Dẫn người dùng sang trang Báo cáo
        >
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/fv4wij5o_expires_30_days.png"
            className="w-8 h-8 mr-4"
            alt="report icon"
          />
          <div className="flex flex-col items-start flex-1">
            <span className="text-black text-[20px] font-bold tracking-tight">
              Báo cáo chi tiết
            </span>
            <span className="text-[#8E8E93] text-[14px]">
              Mô tả sự cố để nhận hỗ trợ
            </span>
          </div>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/jk8wo4pb_expires_30_days.png"
            className="w-5 h-5 opacity-40"
            alt="arrow"
          />
        </button>
      </div>

      {/* 4. KHU VỰC BẢN ĐỒ */}
      <div className="px-6 mt-8 flex flex-col gap-3">
        <h2 className="text-black text-[22px] font-bold ml-1">
          Bản đồ khu vực
        </h2>

        <div className="w-full h-[280px] rounded-[30px] relative overflow-hidden bg-white shadow-md border border-gray-100">
          {/* Component Bản đồ Leaflet của bạn */}
          <Map />

          {/* Chip thông báo nổi trên bản đồ */}
          <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md py-2.5 px-5 rounded-full flex items-center gap-2 shadow-sm border border-white/50 z-10 pointer-events-none">
            <div className="w-2 h-2 bg-[#34C759] rounded-full animate-pulse shadow-[0_0_8px_rgba(52,199,89,0.6)]"></div>
            <span className="text-black text-[14px] font-bold">
              1 đội cứu hộ gần bạn
            </span>
          </div>
        </div>
      </div>

      {/* 5. NAVIGATION DƯỚI CÙNG */}
      <BottomNav />
    </div>
  );
};
