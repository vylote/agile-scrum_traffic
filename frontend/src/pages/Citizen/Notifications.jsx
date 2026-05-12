import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // 🔥 Import thêm redux để lấy info User
import { BottomNav } from "../../components/Citizen/BottomNav";
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Info,
  Loader2,
  CheckCheck
} from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket"; // 🔥 Import Socket

// ─── HÀM HỖ TRỢ: HIỂN THỊ THỜI GIAN ──────────────────────────────────────────
const timeAgo = (dateInput) => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 172800) return "Hôm qua";
  
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

// ─── HÀM HỖ TRỢ: RENDER UI THEO NỘI DUNG ─────────────────────────────────────
const getNotificationStyle = (body) => {
  const lowerBody = body.toLowerCase();
  
  if (lowerBody.includes("đang chờ") || lowerBody.includes("đang tìm") || lowerBody.includes("tiếp nhận")) {
    return {
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      bgColor: "bg-amber-50"
    };
  }
  if (lowerBody.includes("trên đường")) {
    return {
      icon: <Truck className="w-6 h-6 text-blue-500" />,
      bgColor: "bg-blue-50"
    };
  }
  if (lowerBody.includes("đến hiện trường") || lowerBody.includes("đang xử lý")) {
    return {
      icon: <MapPin className="w-6 h-6 text-violet-500" />,
      bgColor: "bg-violet-50"
    };
  }
  if (lowerBody.includes("hoàn tất") || lowerBody.includes("xong") || lowerBody.includes("hoàn thành")) {
    return {
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      bgColor: "bg-green-50"
    };
  }
  if (lowerBody.includes("sos") || lowerBody.includes("khẩn cấp")) {
    return {
      icon: <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />,
      bgColor: "bg-red-50"
    };
  }
  
  return { icon: <Info className="w-6 h-6 text-gray-500" />, bgColor: "bg-gray-100" };
};

export const CitizenNotifications = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); // Lấy user hiện tại
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. GỌI API LẤY DANH SÁCH THÔNG BÁO (Hỗ trợ reload ngầm)
  const fetchNotifications = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true); // Chỉ bật Loading nếu không phải silent reload
      const res = await api.get("/notifications"); 
      setNotifications(res.data?.result || []);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gọi lần đầu khi mở trang
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  // 🔥 2. SOCKET REAL-TIME: Tự động chèn thông báo khi Cứu hộ bấm nút
  useEffect(() => {
    if (!socket || !user) return;

    const handleIncidentUpdate = (data) => {
      const reporterId = typeof data.incident.reportedBy === 'object' 
          ? data.incident.reportedBy._id 
          : data.incident.reportedBy;

      // Nếu sự cố vừa cập nhật ĐÚNG LÀ CỦA NGƯỜI DÂN NÀY -> Gọi tải lại data âm thầm
      if (reporterId === (user.id || user._id)) {
        fetchNotifications(true); // true = Tải lại không chớp màn hình loading
      }
    };

    socket.on("incident:updated", handleIncidentUpdate);
    return () => {
      socket.off("incident:updated", handleIncidentUpdate);
    };
  }, [user, fetchNotifications]);

  // 3. XỬ LÝ KHI BẤM VÀO 1 THÔNG BÁO
  const handleNotificationClick = async (noti) => {
    if (!noti.isRead) {
      try {
        await api.patch(`/notifications/${noti._id}/read`);
        setNotifications(prev => prev.map(n => n._id === noti._id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error("Lỗi cập nhật trạng thái đọc:", err);
      }
    }
    
    if (noti.targetUrl) {
      navigate(noti.targetUrl);
    } else {
      navigate('/citizen/dashboard');
    }
  };

  // 4. ĐÁNH DẤU ĐÃ ĐỌC TẤT CẢ
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Lỗi đọc tất cả:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-24">

      {/* TIÊU ĐỀ TRANG */}
      <div className="px-7 mt-6 mb-5 flex items-end justify-between">
        <div className="relative">
          <h1 className="text-black text-[34px] font-bold leading-tight">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white transition-all animate-in zoom-in duration-300">
              {unreadCount}
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-[#0088FF] text-[13px] font-bold flex items-center gap-1 active:opacity-50 transition-opacity mb-1"
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {/* DANH SÁCH THÔNG BÁO */}
      <div className="px-6 flex flex-col gap-3">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <span className="text-xs text-gray-400 font-bold uppercase">Đang tải...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-40">
            <CheckCheck className="w-16 h-16 mb-2" />
            <span className="text-sm font-semibold">Chưa có thông báo nào</span>
          </div>
        ) : (
          notifications.map((noti) => {
            const style = getNotificationStyle(noti.body);
            const isUnread = !noti.isRead;

            return (
              <div
                key={noti._id}
                onClick={() => handleNotificationClick(noti)}
                className={`flex p-4 gap-4 rounded-[24px] cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden border ${
                  isUnread 
                    ? "bg-white shadow-sm border-gray-100" 
                    : "bg-gray-50/50 border-transparent opacity-80"
                }`}
              >
                {/* Chấm xanh báo chưa đọc */}
                {isUnread && (
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 w-1.5 h-1.5 bg-[#0088FF] rounded-full"></div>
                )}

                {/* Icon Thông báo */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.bgColor} ${isUnread ? "ml-2" : ""}`}
                >
                  {style.icon}
                </div>

                {/* Nội dung */}
                <div className="flex flex-col flex-1 justify-center gap-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className={`text-[15px] leading-tight line-clamp-1 ${
                        isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                      }`}
                    >
                      {noti.title}
                    </span>
                    <span
                      className={`text-[11px] whitespace-nowrap mt-0.5 ${
                        isUnread ? "text-[#0088FF] font-bold" : "text-gray-400 font-semibold"
                      }`}
                    >
                      {timeAgo(noti.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`text-[13px] leading-snug line-clamp-2 ${
                      isUnread ? "text-gray-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {noti.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};