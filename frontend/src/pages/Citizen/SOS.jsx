import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";

export const CitizenSOS = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  // Logic đếm ngược tự động
  useEffect(() => {
    // Nếu đếm về 0 thì tự động chuyển hướng hoặc gọi API gửi báo cáo
    if (countdown === 0) {
      alert("Đã gửi tín hiệu SOS khẩn cấp tới trung tâm!");
      navigate("/citizen/history"); // Chuyển sang lịch sử để theo dõi
      return;
    }

    // Đặt bộ đếm mỗi giây giảm 1
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Dọn dẹp timer khi component unmount
    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FF3B30] font-sans text-white overflow-hidden">
      {/* 1. STATUS BAR (Màu trắng trên nền đỏ) */}
      <div className="flex justify-between items-center px-8 pt-5 pb-2">
        <span className="text-white font-bold text-[17px]">9:41</span>
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/hncc5whw_expires_30_days.png"
          className="w-[95px] h-[22px] object-contain brightness-0 invert"
          alt="status icons"
        />
      </div>

      {/* 2. NỘI DUNG CHÍNH (Được căn giữa màn hình) */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 -mt-10">
        {/* Icon Báo động với hiệu ứng sóng tỏa ra */}
        <div className="relative flex items-center justify-center w-40 h-40 mb-2">
          {/* Vòng tròn tỏa sóng ngoài cùng */}
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          {/* Vòng tròn nhấp nháy bên trong */}
          <div className="absolute inset-4 bg-white/30 rounded-full animate-pulse"></div>
          {/* Vòng tròn icon lõi */}
          <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-[#FF3B30] animate-bounce" />
          </div>
        </div>

        {/* Tiêu đề & Mô tả */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-[32px] font-bold leading-tight">
            Đang gửi tín hiệu SOS
          </h1>
          <p className="text-white/80 text-[18px] leading-relaxed max-w-[280px]">
            Hệ thống sẽ tự động phát tín hiệu khẩn cấp trong:
          </p>
        </div>

        {/* Số đếm ngược khổng lồ */}
        <div className="text-[140px] font-bold leading-none tracking-tighter tabular-nums drop-shadow-xl my-4">
          {countdown}
        </div>
      </div>

      {/* 3. NÚT HỦY BỎ (Dưới cùng) */}
      <div className="px-8 pb-12 pt-4">
        <button
          onClick={() => navigate(-1)} // Quay lại trang trước đó
          className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md text-white font-bold py-5 rounded-full text-[22px] transition-colors"
        >
          <X className="w-7 h-7" />
          Huỷ khẩn cấp
        </button>
      </div>
    </div>
  );
};
