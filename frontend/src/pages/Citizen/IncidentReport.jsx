import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Car,
  Wrench,
  Waves,
  Flame,
  PlusCircle,
  Camera,
  Check,
} from "lucide-react";

export const IncidentReport = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("Tai nạn giao thông");

  const incidentTypes = [
    { id: 1, label: "Tai nạn giao thông", icon: <Car className="w-5 h-5" /> },
    {
      id: 2,
      label: "Hỏng xe / Chết máy",
      icon: <Wrench className="w-5 h-5" />,
    },
    { id: 3, label: "Ngập nước", icon: <Waves className="w-5 h-5" /> },
    { id: 4, label: "Cháy nổ", icon: <Flame className="w-5 h-5" /> },
    { id: 5, label: "Sự cố khác", icon: <PlusCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-10">
      {/* 1. STATUS BAR & HEADER */}
      <div className="bg-[#F2F2F7] sticky top-0 z-20">
        <div className="flex justify-between items-center px-8 pt-5 pb-2">
          <span className="text-black font-bold text-[17px]">9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-5 h-3 border border-black rounded-sm relative after:content-[''] after:absolute after:right-[-3px] after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-black after:rounded-full"></div>
          </div>
        </div>

        <header className="flex items-center px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-2 py-2 text-[#0088FF] font-medium active:opacity-50 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7" />
            <span className="text-[17px]">Trở về</span>
          </button>
          <h1 className="flex-1 text-center pr-12 font-bold text-[17px] text-black">
            Báo cáo
          </h1>
        </header>
      </div>

      {/* 2. NỘI DUNG FORM */}
      <div className="px-6 mt-6 space-y-8">
        {/* VỊ TRÍ HIỆN TẠI */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Vị trí hiện tại
          </h3>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            {/* Mock Map Preview */}
            <div className="h-[100px] bg-[#E5E7EB] relative bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/105.8000,21.0285,15/400x100?access_token=mock')] bg-cover">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="text-blue-600 w-6 h-6" />
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-black font-bold text-[15px]">
                  3 Cầu Giấy
                </span>
                <span className="text-[#8E8E93] text-[12px]">
                  Ngọc Khánh, Đống Đa, Hà Nội
                </span>
              </div>
              <button className="bg-[#F2F2F7] text-[#0088FF] px-4 py-1.5 rounded-full text-[13px] font-bold active:bg-blue-50">
                Sửa
              </button>
            </div>
          </div>
        </section>

        {/* LOẠI SỰ CỐ (Dạng danh sách lựa chọn) */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Loại sự cố
          </h3>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
            {incidentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.label)}
                className="w-full flex items-center px-5 py-4 active:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                    selectedType === type.label
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {type.icon}
                </div>
                <span
                  className={`flex-1 text-left text-[17px] font-medium ${
                    selectedType === type.label ? "text-black" : "text-gray-600"
                  }`}
                >
                  {type.label}
                </span>
                {selectedType === type.label && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* CHI TIẾT BỔ SUNG (Upload ảnh) */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Chi tiết bổ sung
          </h3>
          <div className="bg-white p-3 rounded-[24px] shadow-sm border border-gray-100">
            <button className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-[20px] bg-gray-50 active:bg-gray-100 transition-colors gap-2">
              <div className="p-3 bg-white rounded-full shadow-sm text-gray-400">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-[#727272] text-[13px] font-medium">
                Thêm ảnh hiện trường (Tuỳ chọn)
              </span>
            </button>
          </div>
        </section>

        {/* NÚT GỬI BÁO CÁO */}
        <div className="pt-4">
          <button
            onClick={() => alert("Đang gửi báo cáo...")}
            className="w-full bg-[#0088FF] hover:bg-blue-600 text-white font-bold py-4 rounded-[20px] text-[18px] shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
          >
            Gửi báo cáo ngay
          </button>
          <p className="text-center text-[12px] text-gray-400 mt-4 px-10 leading-relaxed">
            Bằng việc gửi báo cáo, vị trí của bạn sẽ được chia sẻ với đội cứu hộ
            gần nhất.
          </p>
        </div>
      </div>
    </div>
  );
};
