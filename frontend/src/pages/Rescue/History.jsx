import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import TabBar from "../../components/RescueTeam/TabBar";
import HistoryCard from "../../components/RescueTeam/HistoryCard";
import api from "../../services/api";

export function History() {
  const { user } = useSelector((state) => state.auth);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Định nghĩa luôn ở trong này
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const teamId = user?.rescueTeam?._id;
      if (!teamId) return;

      const res = await api.get(`/incidents?status=COMPLETED&assignedTeam=${teamId}`);
      setHistoryItems(res.data.result.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, [user]); // ✅ Bây giờ chỉ cần 'user' là đủ, không còn lỗi linting nữa

  // Hàm helper để format thời gian cho đẹp
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-50 overflow-hidden flex flex-col shadow-2xl">
      
      <main className="flex-1 flex flex-col px-4 mt-8 overflow-y-auto no-scrollbar pb-24">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6 px-1">
          Lịch sử cứu hộ
        </h1>

        <section className="flex flex-col gap-4">
          {loading ? (
            // 🌀 Hiệu ứng Loading đơn giản
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-2"></div>
               <p>Đang tải dữ liệu...</p>
            </div>
          ) : historyItems.length === 0 ? (
            // 📭 Trạng thái trống
            <div className="text-center py-20">
              <p className="text-gray-400">Đội của bạn chưa hoàn thành ca cứu hộ nào.</p>
            </div>
          ) : (
            // ✅ Hiển thị danh sách thật
            historyItems.map((item) => (
              <HistoryCard
                key={item._id}
                serviceType={item.title}
                status="Hoàn thành"
                code={item.code || `#${item._id.slice(-4)}`} // Nếu ko có code thì lấy 4 số cuối ID
                time={formatTime(item.updatedAt)}
                location={item.location.address}
              />
            ))
          )}
        </section>
      </main>

      <TabBar />
    </div>
  );
}

export default History;