import React, { useState, useEffect, useCallback } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import {
  AlertCircle,
  Clock,
  Users,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 🔥 IMPORT CỔNG SOCKET (Dùng để hứng event)
import socket from "../../services/socket";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  
  // Trạng thái Loading che toàn màn hình (chỉ dùng lúc mới vào web hoặc đổi Bộ lọc)
  const [loading, setLoading] = useState(true);
  
  // 🔥 Trạng thái Đồng bộ ngầm (chỉ bật đèn nháy nhỏ, không che màn hình)
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false); 

  const [timeRange, setTimeRange] = useState("week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeOptions = [
    { value: "week", label: "7 ngày qua" },
    { value: "month", label: "Tháng này" },
    { value: "year", label: "Năm nay" }
  ];

  // Hàm Fetch Data (Hỗ trợ 2 chế độ: Nổi & Ngầm)
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (isSilent) {
        setIsBackgroundSyncing(true);
      } else {
        setLoading(true);
      }
      
      const res = await api.get(`/admin/dashboard-stats?timeRange=${timeRange}`);
      setStats(res.data.result);
      
    } catch (error) {
      console.error("🔥 Lỗi lấy dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
      setIsBackgroundSyncing(false);
    }
  }, [timeRange]);

  // 1. Gọi dữ liệu khi mới vào web hoặc khi Admin chọn lại Bộ lọc thời gian (Chạy chế độ nổi)
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // 🔥 2. LẮNG NGHE SỰ KIỆN TỪ SOCKET.IO
  useEffect(() => {
    if (!socket) return;

    // Khi có biến biến động ngoài hiện trường -> Kích hoạt chế độ tải ngầm (Silent = true)
    const handleRealtimeUpdate = () => {
        fetchDashboardData(true); 
    };

    socket.on('incident:new', handleRealtimeUpdate);
    socket.on('incident:updated', handleRealtimeUpdate);
    socket.on('delete_incident', handleRealtimeUpdate);
    socket.on('rescue:location', handleRealtimeUpdate);

    return () => {
        socket.off('incident:new', handleRealtimeUpdate);
        socket.off('incident:updated', handleRealtimeUpdate);
        socket.off('delete_incident', handleRealtimeUpdate);
        socket.off('rescue:location', handleRealtimeUpdate);
    };
  }, [fetchDashboardData]);


  if (loading && !stats) {
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

  const kpiCards = [
    {
      id: 1, title: "Tổng sự cố tháng này",
      value: stats?.kpis.totalIncidentsMonth.value,
      change: stats?.kpis.totalIncidentsMonth.change, 
      isPositive: stats?.kpis.totalIncidentsMonth.isPositive,
      icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
      iconBg: "bg-blue-100",
    },
    {
      id: 2, title: "TG phản hồi TB",
      value: `${stats?.kpis.avgResponseTime.value} phút`,
      change: stats?.kpis.avgResponseTime.change,
      isPositive: stats?.kpis.avgResponseTime.isPositive,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      iconBg: "bg-orange-100",
    },
    {
      id: 3, title: "Đội đang hoạt động",
      value: stats?.kpis.activeTeams.value,
      change: stats?.kpis.activeTeams.change,
      isPositive: stats?.kpis.activeTeams.isPositive,
      icon: <Users className="w-6 h-6 text-purple-600" />,
      iconBg: "bg-purple-100",
    },
    {
      id: 4, title: "Tỉ lệ hoàn thành", 
      value: stats?.kpis.resolutionRate.value,
      change: stats?.kpis.resolutionRate.change,
      isPositive: stats?.kpis.resolutionRate.isPositive,
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      iconBg: "bg-emerald-100",
    },
  ];

  const maxHotspotCount = Math.max(...(stats?.hotspots.map((h) => h.count) || [1]), 1);
  const activeLabel = timeOptions.find(o => o.value === timeRange)?.label;

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader
          title="Tổng quan hoạt động"
          // 🔥 CHÈN ĐÈN NHẤP NHÁY VÀO SUBTITLE NẾU ĐANG TẢI NGẦM
          subtitle={
            <div className="flex items-center gap-2">
              Real-time Analytics
              {isBackgroundSyncing && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              )}
            </div>
          }
          onExport={() => alert("Hệ thống đang kết xuất báo cáo PDF...")}
        />

        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 mt-2">
            {kpiCards.map((kpi) => (
              <div key={kpi.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-all group relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${kpi.iconBg}`}>
                    {kpi.icon}
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${kpi.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {kpi.isPositive ? <TrendingDown size={12} className={kpi.id === 4 || kpi.id === 3 ? "rotate-180" : ""} /> : <TrendingUp size={12} className={kpi.id === 4 || kpi.id === 3 ? "rotate-180" : ""} />}
                    {kpi.change}
                  </div>
                </div>
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1 relative z-10">
                  {kpi.title}
                </span>
                <span className="text-[28px] font-black text-gray-900 tracking-tight relative z-10">
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col relative">
              
              {loading && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-[32px]">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                 </div>
              )}

              <div className="flex justify-between items-center mb-8 relative z-30">
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                    Tần suất sự cố
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Dữ liệu cập nhật theo thời gian thực
                  </p>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl transition-all"
                  >
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">
                      {activeLabel}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50">
                      {timeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTimeRange(option.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors ${timeRange === option.value ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.dailyStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value} vụ`, 'Số lượng']}
                      labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#3B82F6" 
                      radius={[6, 6, 0, 0]} 
                      barSize={timeRange === 'year' ? 24 : 40} 
                      activeBar={{ fill: '#2563EB' }} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col relative">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-8">
                Điểm nóng (Zones)
              </h3>

              <ul className="flex flex-col gap-7 flex-1">
                {stats?.hotspots.map((spot, index) => (
                  <li key={index} className="group">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="font-black text-gray-700 text-xs uppercase tracking-wide group-hover:text-blue-500 transition-colors">
                        {spot.name || "Chưa xác định"}
                      </span>
                      <span className="text-gray-400 font-bold text-xs">
                        {spot.count} vụ
                      </span>
                    </div>
                    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                        style={{ width: `${(spot.count / maxHotspotCount) * 100}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/admin/heatmap")}
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