import React, { useState, useEffect } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import {
  AlertCircle,
  Clock,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter] = useState("7 ngày qua");

  // ─── 1. GỌI API BƠM DỮ LIỆU THẬT ──────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/dashboard-stats");
        // Giả sử res.data.result chứa: kpis, dailyStats, hotspots
        setStats(res.data.result);
      } catch (error) {
        console.error("🔥 Lỗi lấy dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ─── 2. LOGIC XỬ LÝ DỮ LIỆU HIỂN THỊ ──────────────────────────────────────

  // Nếu đang load, hiện màn hình chờ "sang chảnh"
  if (loading || !stats) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F6FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
            Hệ thống đang trích xuất dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  // Map dữ liệu từ Backend vào 4 thẻ KPI
  const kpiCards = [
    {
      id: 1,
      title: "Tổng sự cố tháng này",
      value: stats.kpis.totalIncidentsMonth,
      change: "+12.5%", // Sau này Vy có thể tính toán change so với tháng trước ở Backend
      isPositive: true,
      icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
      iconBg: "bg-blue-100",
    },
    {
      id: 2,
      title: "TG phản hồi TB",
      value: `${stats.kpis.avgResponseTime} phút`,
      change: "-0.8 phút",
      isPositive: true,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      iconBg: "bg-orange-100",
    },
    {
      id: 3,
      title: "Đội đang hoạt động",
      value: stats.kpis.activeTeams,
      change: "+3",
      isPositive: true,
      icon: <Users className="w-6 h-6 text-purple-600" />,
      iconBg: "bg-purple-100",
    },
    {
      id: 4,
      title: "Đánh giá hài lòng",
      value: stats.kpis.satisfaction || "4.8/5.0",
      change: "+0.1",
      isPositive: true,
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      iconBg: "bg-yellow-100",
    },
  ];

  // Tìm giá trị lớn nhất trong biểu đồ để tính chiều cao cột (%)
  const maxDayCount = Math.max(...stats.dailyStats.map((d) => d.count), 1);

  // Tìm giá trị lớn nhất trong Hotspots để tính độ dài thanh tiến độ (%)
  const maxHotspotCount = Math.max(...stats.hotspots.map((h) => h.count), 1);

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader
          title="Tổng quan hoạt động"
          subtitle="Real-time Analytics"
          onExport={() => alert("Hệ thống đang kết xuất báo cáo PDF...")}
        />

        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
          {/* HÀNG 1: 4 THẺ THỐNG KÊ KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 mt-2">
            {kpiCards.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${kpi.iconBg}`}
                  >
                    {kpi.icon}
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                      kpi.isPositive
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {kpi.isPositive ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">
                  {kpi.title}
                </span>
                <span className="text-[28px] font-black text-gray-900 tracking-tight">
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          {/* HÀNG 2: BIỂU ĐỒ & ĐIỂM NÓNG */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CỘT TRÁI: Biểu đồ tần suất sự cố */}
            <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                    Tần suất sự cố
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Dữ liệu cập nhật theo thời gian thực
                  </p>
                </div>
                <button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl transition-all">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest">
                    {timeFilter}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 flex items-end justify-between px-2 h-[260px] border-b border-gray-100 pb-2 relative z-10">
                {/* Lưới gióng ngang */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full border-t border-gray-50" />
                  ))}
                </div>

                {/* Các cột dữ liệu từ API */}
                {stats.dailyStats.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-4 z-10 w-12 group cursor-pointer"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-lg absolute mb-[220px] shadow-xl">
                      {item.count} vụ
                    </div>
                    <div className="w-10 bg-blue-50/50 rounded-t-xl relative flex items-end justify-center h-[200px] overflow-hidden">
                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-700 ease-out rounded-t-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        style={{
                          height: `${(item.count / maxDayCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI: Điểm nóng sự cố */}
            <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-8">
                Điểm nóng (Zones)
              </h3>

              <ul className="flex flex-col gap-7 flex-1">
                {stats.hotspots.map((spot, index) => (
                  <li key={index} className="group">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="font-black text-gray-700 text-xs uppercase tracking-wide group-hover:text-blue-500 transition-colors">
                        {spot.name || "Chưa xác định"}
                      </span>
                      <span className="text-gray-400 font-bold text-xs">
                        {spot.count} vụ
                      </span>
                    </div>
                    {/* Thanh Progress Bar tự tính toán % */}
                    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                        style={{
                          width: `${(spot.count / maxHotspotCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/admin/heatmap")} // Liên kết route
                className="mt-10 w-full py-4 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-sm"
              >
                Chi tiết bản đồ nhiệt
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
