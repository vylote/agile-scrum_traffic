import React from "react";
import { BottomNav } from "../../components/BottomNav";
import { Truck, CheckCircle2 } from "lucide-react";

export const CitizenNotifications = () => {
  // Dữ liệu mẫu (Mock Data) cho danh sách thông báo
  const notifications = [
    {
      id: 1,
      type: "Đội cứu hộ đang đến",
      message: "Xe cứu hộ #0001 dự kiến sẽ đến trong 5 phút nữa.",
      time: "Vừa xong",
      icon: <Truck className="w-6 h-6 text-blue-500" />,
      bgColor: "bg-blue-50",
      isUnread: true, // Trạng thái chưa đọc
    },
    {
      id: 2,
      type: "Hoàn thành sự cố",
      message: "Sự cố #0001 đã được xử lý xong. Cảm ơn bạn.",
      time: "Hôm qua",
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      bgColor: "bg-green-50",
      isUnread: false,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-24">
      
      {/* 1. STATUS BAR */}
      <div className="flex justify-between items-center px-8 pt-5 pb-2">
        <span className="text-black font-bold text-[17px]">9:41</span>
        <img 
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/hncc5whw_expires_30_days.png" 
          className="w-[95px] h-[22px] object-contain" 
          alt="status icons"
        />
      </div>

      {/* 2. TIÊU ĐỀ TRANG */}
      <div className="px-7 mt-6 mb-5 flex items-center justify-between">
        <h1 className="text-black text-[34px] font-bold">Thông báo</h1>
        {/* Nút đánh dấu đã đọc tất cả (Option thêm cho chuyên nghiệp) */}
        <button className="text-[#0088FF] text-[15px] font-medium active:opacity-50 transition-opacity">
          Đọc tất cả
        </button>
      </div>

      {/* 3. DANH SÁCH THÔNG BÁO */}
      <div className="px-6 flex flex-col gap-4">
        {notifications.map((noti) => (
          <div 
            key={noti.id}
            className={`flex p-5 gap-4 rounded-[24px] shadow-sm transition-transform active:scale-[0.98] relative overflow-hidden ${
              noti.isUnread ? "bg-white" : "bg-white/60"
            }`}
          >
            {/* Chấm xanh báo chưa đọc */}
            {noti.isUnread && (
              <div className="absolute top-1/2 left-2.5 -translate-y-1/2 w-2 h-2 bg-[#0088FF] rounded-full"></div>
            )}

            {/* Icon Thông báo */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${noti.bgColor} ${noti.isUnread ? "ml-2" : ""}`}>
              {noti.icon}
            </div>

            {/* Nội dung */}
            <div className="flex flex-col flex-1 justify-center gap-1">
              <div className="flex justify-between items-start">
                <span className={`text-[17px] leading-tight ${noti.isUnread ? "font-bold text-black" : "font-semibold text-gray-800"}`}>
                  {noti.type}
                </span>
                <span className={`text-[12px] whitespace-nowrap ml-2 mt-0.5 ${noti.isUnread ? "text-[#0088FF] font-medium" : "text-[#AEAEB2]"}`}>
                  {noti.time}
                </span>
              </div>
              <p className={`text-[14px] leading-snug mt-0.5 ${noti.isUnread ? "text-[#727272]" : "text-[#8E8E93]"}`}>
                {noti.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. NAVIGATION DƯỚI CÙNG (Dùng chung) */}
      <BottomNav />
      
    </div>
  );
};