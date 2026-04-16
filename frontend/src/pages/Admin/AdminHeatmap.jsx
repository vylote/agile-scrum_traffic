import React, { useState, useEffect } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import Map from "../../components/Public/Map"; 
import api from "../../services/api";
import { Loader2 } from "lucide-react";

export const AdminHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        // Gọi API lấy tọa độ (Ví dụ: lấy 30 ngày gần nhất)
        const res = await api.get("/reports/heatmap?days=30");
        setHeatmapData(res.data.result);
      } catch (error) {
        console.error("Lỗi tải bản đồ nhiệt:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Bản đồ nhiệt (Heatmap)" 
          subtitle="Phân tích mật độ sự cố" 
          showExport={false} 
        />
        
        <div className="flex-1 p-6">
          <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative">
            {loading ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Đang nạp tọa độ...</p>
               </div>
            ) : (
               <Map heatmapData={heatmapData} />
            )}
            
            {/* Chú thích màu sắc */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Mức độ nghiêm trọng</p>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-500 flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Thấp</span>
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Vừa</span>
                    <span className="text-xs font-bold text-yellow-500 flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Cao</span>
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-600"></div> Khẩn cấp</span>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};