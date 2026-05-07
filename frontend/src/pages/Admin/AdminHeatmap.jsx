import React, { useState, useEffect } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import Map from "../../components/Public/Map"; 
import api from "../../services/api";
import { Loader2, Calendar, ChevronDown } from "lucide-react";

export const AdminHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 STATE QUẢN LÝ BỘ LỌC THỜI GIAN
  const [daysFilter, setDaysFilter] = useState("30");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const timeOptions = [
    { value: "7", label: "7 ngày qua" },
    { value: "30", label: "30 ngày qua" },
    { value: "365", label: "1 năm qua" },
    { value: "", label: "Toàn thời gian" } // Không truyền days -> Lấy tất cả
  ];

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        // 🔥 Gọi API với số ngày ĐỘNG
        const url = daysFilter ? `/reports/heatmap?days=${daysFilter}` : `/reports/heatmap`;
        const res = await api.get(url);
        setHeatmapData(res.data.result);
      } catch (error) {
        console.error("Lỗi tải bản đồ nhiệt:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, [daysFilter]); // Chạy lại mỗi khi chọn mốc thời gian khác

  const activeLabel = timeOptions.find(o => o.value === daysFilter)?.label;

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Bản đồ nhiệt (Heatmap)" 
          subtitle="Phân tích mật độ sự cố" 
          showExport={false} 
        />
        
        <div className="flex-1 p-6 flex flex-col">
          {/* 🔥 THANH CÔNG CỤ (TOOLBAR) */}
          <div className="flex justify-between items-center mb-4 px-2">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Dữ liệu hiển thị: <span className="text-blue-600">{heatmapData.length} điểm sự cố</span>
            </p>

            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-black text-gray-700 uppercase tracking-widest">
                  {activeLabel}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[9999]">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDaysFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors ${daysFilter === option.value ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex-1 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative">
            {loading ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Đang nạp tọa độ...</p>
               </div>
            ) : (
               <Map heatmapData={heatmapData} />
            )}
            
            {/* Chú thích màu sắc */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-white p-4 rounded-xl shadow-lg border border-gray-100 pointer-events-none">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Mức độ nghiêm trọng</p>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div> Thấp</span>
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-lime-500 shadow-sm"></div> Vừa</span>
                    <span className="text-xs font-bold text-yellow-500 flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div> Cao</span>
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-600 shadow-sm"></div> Khẩn cấp</span>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};