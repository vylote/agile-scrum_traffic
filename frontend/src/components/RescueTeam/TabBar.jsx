import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { Home, History, MessageSquare } from 'lucide-react';
import { useSelector } from "react-redux";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import { INCIDENT_STATUS } from "../../utils/constants/incidentConstants";

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const teamId = user?.rescueTeam?._id;

  // Khởi tạo state đọc từ LocalStorage
  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('rescueUnreadChat')) || 0;
    } catch {
      return 0;
    }
  });

  // Lắng nghe sự kiện để đồng bộ State khi Chat.jsx xóa số
  useEffect(() => {
    const handleStorageChange = () => {
      const count = parseInt(localStorage.getItem('rescueUnreadChat')) || 0;
      setUnreadCount(count);
    };
    window.addEventListener('rescueChatRead', handleStorageChange);
    return () => window.removeEventListener('rescueChatRead', handleStorageChange);
  }, []);

  // TRẠM GÁC: Tìm sự cố đang làm và nghe lén tin nhắn
  useEffect(() => {
    if (!socket || !teamId || !user) return;

    let activeIncidentId = null;

    const setupListener = async () => {
      try {
        // Tìm xem đội có đang làm vụ nào không
        const res = await api.get(`/incidents?assignedTeam=${teamId}&status=ASSIGNED,IN_PROGRESS`);
        const activeData = res.data?.result?.data || [];
        
        if (activeData.length > 0) {
          activeIncidentId = activeData[0]._id;
          
          // Ghi danh vào phòng chat để nghe lén tin nhắn (Ngay cả khi đang ở trang Chủ)
          socket.emit("chat:join", {
            incidentId: activeIncidentId,
            userId: user._id || user.id,
            role: "RESCUE",
          });
        }
      } catch (err) {
        console.error("Lỗi TabBar check sự cố:", err);
      }
    };

    setupListener();

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (msg) => {
      const currentUrl = window.location.pathname;
      
      // Nếu là Dispatcher gửi VÀ tài xế đang KHÔNG ở trang Tin nhắn -> Tăng số
      if (msg.sender.role === 'DISPATCHER' && !currentUrl.includes('/rescue/messages')) {
        const currentCount = parseInt(localStorage.getItem('rescueUnreadChat')) || 0;
        const newCount = currentCount + 1;
        
        localStorage.setItem('rescueUnreadChat', newCount);
        setUnreadCount(newCount);
      }
    };

    // Lắng nghe khi sự cố hoàn thành -> Dọn dẹp chấm đỏ
    const handleIncidentUpdate = (data) => {
      const updatedIncident = data.incident || data;
      if (updatedIncident._id === activeIncidentId && 
          [INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(updatedIncident.status)) {
         
         localStorage.removeItem('rescueUnreadChat');
         setUnreadCount(0);
      }
    };

    socket.on("chat:message", handleNewMessage);
    socket.on("incident:updated", handleIncidentUpdate);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("incident:updated", handleIncidentUpdate);
      // Mẹo nhỏ: Ta không emit chat:leave ở đây để đảm bảo TabBar luôn được kết nối
    };
  }, [socket, teamId, user, location.pathname]); 
  // Dùng location.pathname làm dependency để lỡ IncidentChat (ở màn chat) gọi leave room khi unmount, 
  // TabBar sẽ tự động re-join room khi quay về màn Home.

  const tabs = [
    {
      id: 'home',
      path: '/rescue/dashboard',
      icon: Home,
      label: "Trang chủ"
    },
    {
      id: 'history',
      path: '/rescue/history',
      icon: History,
      label: "Lịch sử"
    },
    {
      id: 'messages',
      path: '/rescue/messages',
      icon: MessageSquare,
      label: "Tin nhắn"
    }
  ];

  return (
    <div className="pt-1 pb-0 shrink-0 w-full z-50">
      <nav className="flex items-center justify-around bg-white/90 backdrop-blur-md rounded-[100px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 h-[65px] px-2 max-w-[343px] mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.includes(tab.path);
          const IconComponent = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)} 
              className="flex flex-col items-center justify-center flex-1 h-full rounded-[100px] transition-all relative group"
            >
              {isActive && (
                <div className="absolute inset-1 bg-sky-50 rounded-[100px] -z-10" />
              )}
              
              {/* 🔥 ĐÃ SỬA: Tạo một thẻ bọc chung KHÔNG có grayscale */}
              <div className="relative flex items-center justify-center">
                
                {/* 1. Phần Icon: Vẫn giữ grayscale khi không active */}
                <div className={`transition-all ${isActive ? 'scale-110' : 'opacity-40 grayscale group-hover:opacity-70'}`}>
                  <IconComponent 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-sky-500' : 'text-gray-500'} 
                  />
                </div>
                
                {/* 2. Phần Chấm Đỏ: Đứng bên ngoài thẻ grayscale, màu đỏ sẽ giữ nguyên 100% */}
                {tab.id === 'messages' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10 animate-in zoom-in">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] mt-1 font-bold transition-all ${isActive ? 'text-sky-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default TabBar;