import React, { useState } from "react";
import { AdminMenu } from "../../components/AdminMenu";
import { ExportButton } from "../../components/ExportButton"; // 👈 Đã import ExportButton chuẩn
// Import Avatar & Icons
import ellipse1 from "../../assets/images/avatar.jpg";
import { AlertCircle, Clock, Users, Star, TrendingUp, TrendingDown, Calendar, ChevronDown } from "lucide-react";

// MOCK DATA: 4 Thẻ KPI trên cùng
const kpiData = [
  { 
    id: 1, title: "Tổng sự cố tháng này", value: "1,284", change: "+12.5%", 
    isPositive: true, icon: <AlertCircle className="w-6 h-6 text-blue-600" />, iconBg: "bg-blue-100" 
  },
  { 
    id: 2, title: "TG phản hồi TB", value: "4.2 phút", change: "-0.8 phút", 
    isPositive: true, icon: <Clock className="w-6 h-6 text-orange-600" />, iconBg: "bg-orange-100" 
  },
  { 
    id: 3, title: "Tài xế đang hoạt động", value: "40/60", change: "+3", 
    isPositive: true, icon: <Users className="w-6 h-6 text-purple-600" />, iconBg: "bg-purple-100" 
  },
  { 
    id: 4, title: "Đánh giá hài lòng", value: "4.7/5.0", change: "+0.1", 
    isPositive: true, icon: <Star className="w-6 h-6 text-yellow-600" />, iconBg: "bg-yellow-100" 
  },
];

// MOCK DATA: Điểm nóng sự cố
const hotspotData = [
  { name: 'Cầu Giấy', count: 50, pct: '100%' }, 
  { name: 'Đống Đa', count: 38, pct: '76%' },
  { name: 'Thanh Xuân', count: 33, pct: '66%' },
  { name: 'Hà Đông', count: 21, pct: '42%' },
  { name: 'Hoàn Kiếm', count: 9, pct: '18%' },
];

export const Dashboard = () => {
  const [timeFilter] = useState("Tuần này");

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      
      {/* =========================================
          SIDEBAR ADMIN
      ========================================= */}
      <AdminMenu />

      {/* =========================================
          NỘI DUNG CHÍNH CỦA QUẢN TRỊ VIÊN
      ========================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[90px] flex items-center justify-between px-8 bg-transparent shrink-0 mt-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-[26px] font-bold text-gray-900 leading-tight">
              Tổng quan hoạt động
            </h2>
            <p className="text-base text-gray-500 font-medium">
              Báo cáo hệ thống
            </p>
          </div>
          
          <div className="flex items-center gap-5">
            {/* 👈 Gọi nút Export Button dùng chung */}
            <ExportButton onClick={() => alert("Đang tải báo cáo Dashboard...")} />
            
            {/* Avatar Admin */}
            <img src={ellipse1} alt="Admin Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
          </div>
        </header>

        {/* KHU VỰC NỘI DUNG CHÍNH (Có thể cuộn) */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          
          {/* HÀNG 1: 4 THẺ THỐNG KÊ (KPI Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 mt-2">
            {kpiData.map((kpi) => (
              <div key={kpi.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${kpi.iconBg}`}>
                    {kpi.icon}
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    kpi.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}>
                    {kpi.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {kpi.change}
                  </div>
                </div>
                <span className="text-gray-500 font-medium text-[15px] mb-1">{kpi.title}</span>
                <span className="text-[30px] font-bold text-gray-900">{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* HÀNG 2: BIỂU ĐỒ & ĐIỂM NÓNG */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CỘT TRÁI (Chiếm 2/3): Tần suất sự cố */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-7 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[17px] font-bold text-gray-900">Tần suất sự cố theo ngày</h3>
                  <p className="text-[15px] text-gray-500">7 ngày gần nhất</p>
                </div>
                
                {/* Bộ lọc thời gian */}
                <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-bold text-gray-800">{timeFilter}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* BIỂU ĐỒ CỘT GIẢ LẬP */}
              <div className="flex-1 flex items-end justify-between mt-4 px-4 h-[240px] border-b border-gray-200 pb-2 relative">
                {/* Các đường gióng ngang */}
                <div className="absolute top-0 left-0 w-full border-t border-dashed border-gray-200"></div>
                <div className="absolute top-1/3 left-0 w-full border-t border-dashed border-gray-200"></div>
                <div className="absolute top-2/3 left-0 w-full border-t border-dashed border-gray-200"></div>
                
                {/* Các cột dữ liệu */}
                {[
                  { day: 'T2', height: '40%', count: 45 },
                  { day: 'T3', height: '60%', count: 68 },
                  { day: 'T4', height: '85%', count: 95 },
                  { day: 'T5', height: '50%', count: 55 },
                  { day: 'T6', height: '90%', count: 102 },
                  { day: 'T7', height: '100%', count: 120 },
                  { day: 'CN', height: '70%', count: 80 },
                ].map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-3 z-10 w-12 group cursor-pointer">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded absolute -mt-8">
                      {item.count} vụ
                    </div>
                    <div className="w-8 bg-blue-50 rounded-t-lg relative flex items-end justify-center w-full h-[200px]">
                      <div className="w-full bg-[#0088FF] hover:bg-blue-600 transition-colors rounded-t-lg" style={{ height: item.height }}></div>
                    </div>
                    <span className="text-[13px] font-bold text-gray-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI (Chiếm 1/3): Điểm nóng sự cố */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 flex flex-col">
              <h3 className="text-[17px] font-bold text-gray-900 mb-6">Điểm nóng sự cố</h3>

              {/* Danh sách các Quận/Huyện */}
              <ul className="flex flex-col gap-5 flex-1 justify-start mt-2">
                {hotspotData.map((spot) => (
                  <li key={spot.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800 text-[15px]">{spot.name}</span>
                      <span className="text-gray-500 font-medium text-[15px]">{spot.count} vụ</span>
                    </div>
                    {/* Thanh Progress Bar */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0088FF] h-full rounded-full" style={{ width: spot.pct }}></div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <button className="mt-8 w-full py-3 bg-gray-100 hover:bg-gray-200 text-blue-600 text-[15px] font-bold rounded-lg transition-colors">
                Xem bản đồ nhiệt
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};