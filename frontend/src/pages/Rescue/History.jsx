import React, { useState } from "react";


import TabBar from "../../components/RescueTeam/TabBar";
import HistoryCard from "../../components/RescueTeam/HistoryCard";

export function History() {
  // Set tab mặc định đang active là 'history'
  const [activeTab, setActiveTab] = useState('history');

  // Dữ liệu giả (Mock data)
  const historyItems = [
    {
      serviceType: "Hỏng xe / Chết máy",
      status: "Hoàn thành",
      code: "#0001",
      time: "Hôm nay, 09:00",
      location: "3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội"
    },
    {
      serviceType: "Tai nạn giao thông",
      status: "Hoàn thành",
      code: "#0002",
      time: "Hôm qua, 14:30",
      location: "Ngã tư Phạm Hùng, Nam Từ Liêm, Hà Nội"
    },
    {
      serviceType: "Thay lốp dọc đường",
      status: "Hoàn thành",
      code: "#0003",
      time: "12/10/2023, 21:15",
      location: "Cao tốc Pháp Vân - Cầu Giẽ, Km192"
    }
  ];

  return (
    // Dùng h-screen và flex-col để khóa chiều cao bằng đúng màn hình điện thoại
    <div className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-50 overflow-hidden flex flex-col shadow-2xl">
      

      {/* 2. Khu vực cuộn danh sách (Tự động chiếm phần diện tích còn lại) */}
      <main className="flex-1 flex flex-col px-4 mt-2 overflow-y-auto hide-scrollbar pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6 px-1">
          Lịch sử cứu hộ
        </h1>

        <section className="flex flex-col gap-4">
          {historyItems.map((item, index) => (
            <HistoryCard
              key={index}
              serviceType={item.serviceType}
              status={item.status}
              code={item.code}
              time={item.time}
              location={item.location}
            />
          ))}
        </section>
      </main>

      {/* 3. TabBar (Nằm cố định ở dưới đáy, tái sử dụng thẻ TabBar chuẩn) */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  );
}

export default History;