import React, { useState } from "react";
import { BottomNav } from "../../components/Citizen/BottomNav";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";

export const CitizenHistory = () => {
  // State quản lý việc chuyển đổi giữa 2 tab
  const [activeTab, setActiveTab] = useState("processing"); // Mặc định mở app lên là tab Đang xử lý

  // Dữ liệu cho tab Đang xử lý
  const processingData = [
    {
      id: "0001",
      type: "SOS Khẩn cấp",
      status: "Đang đến",
      time: "Hôm nay, 09:00",
      address: "3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội",
      color: "text-[#0088FF]",
      bgColor: "bg-blue-50",
    },
  ];

  // Dữ liệu cho tab Đã hoàn thành (Cấu trúc UI khác hoàn toàn)
  const completedData = [
    {
      id: "0002",
      title: "Hoàn thành sự cố",
      description: "Sự cố #0001 đã được xử lý xong. Cảm ơn bạn.",
      time: "Hôm qua",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-24">
      {/* 1. STATUS BAR */}
      <div className="flex justify-between items-center px-8 pt-5 pb-2">
        <span className="text-black font-bold text-[17px]">9:41</span>
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/cxgjl50o_expires_30_days.png"
          className="w-[95px] h-[22px] object-contain"
          alt="status icons"
        />
      </div>

      {/* 2. TIÊU ĐỀ TRANG */}
      <div className="px-7 mt-6 mb-5">
        <h1 className="text-black text-[34px] font-bold">Lịch sử</h1>
      </div>

      {/* 3. SEGMENTED CONTROL (2 TABS) */}
      <div className="px-6 mb-6">
        <div className="flex bg-[#7676801C] p-0.5 rounded-full">
          {/* Nút Tab Đang xử lý */}
          <button
            onClick={() => setActiveTab("processing")}
            className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all ${
              activeTab === "processing"
                ? "bg-white shadow-sm text-black"
                : "text-gray-500"
            }`}
          >
            Đang xử lý
          </button>

          {/* Nút Tab Đã hoàn thành */}
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all ${
              activeTab === "completed"
                ? "bg-white shadow-sm text-black"
                : "text-gray-500"
            }`}
          >
            Đã hoàn thành
          </button>
        </div>
      </div>

      {/* 4. DANH SÁCH LỊCH SỬ (Tự động đổi giao diện theo Tab đang chọn) */}
      <div className="px-6 space-y-4">
        {/* --- NẾU ĐANG CHỌN TAB ĐANG XỬ LÝ --- */}
        {activeTab === "processing" &&
          processingData.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-[27px] shadow-sm active:scale-[0.98] transition-transform flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-50 text-red-500">
                    <AlertCircle size={24} />
                  </div>
                  <span className="text-black text-[18px] font-bold">
                    {item.type}
                  </span>
                </div>
                <div
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${item.bgColor} ${item.color}`}
                >
                  {item.status}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span className="text-[13px]">
                    Mã: #{item.id} • {item.time}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-[13px] leading-tight flex-1">
                    {item.address}
                  </span>
                  <ChevronRight size={18} className="text-gray-300 shrink-0" />
                </div>
              </div>
            </div>
          ))}

        {/* --- NẾU ĐANG CHỌN TAB ĐÃ HOÀN THÀNH --- */}
        {activeTab === "completed" &&
          completedData.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white p-5 gap-4 rounded-[27px] shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <span className="text-black text-[18px] font-bold leading-tight">
                  {item.title}
                </span>
                <span className="text-[#727272] text-[14px] leading-snug">
                  {item.description}
                </span>
                <span className="text-[#AEAEB2] text-[12px] font-medium mt-0.5">
                  {item.time}
                </span>
              </div>
            </div>
          ))}

        {/* --- MÀN HÌNH TRỐNG KHI KHÔNG CÓ DỮ LIỆU --- */}
        {((activeTab === "processing" && processingData.length === 0) ||
          (activeTab === "completed" && completedData.length === 0)) && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Clock size={48} strokeWidth={1} opacity={0.3} />
            <p className="text-sm">Không có dữ liệu lịch sử</p>
          </div>
        )}
      </div>

      {/* 5. NAVIGATION DƯỚI CÙNG */}
      <BottomNav />
    </div>
  );
};
