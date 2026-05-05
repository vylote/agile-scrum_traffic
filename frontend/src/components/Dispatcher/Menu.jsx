import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Map, AlertCircle, Truck, Phone, Settings } from "lucide-react";
import ellipse1 from "../../assets/images/avatar.jpg";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import { INCIDENT_STATUS } from "../../utils/constants/incidentConstants";

const UserProfile = () => {
  const navigate = useNavigate();
  return (
    <footer
      onClick={() => navigate("/dispatcher/settings")}
      className="p-6 border-t border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <img
          src={ellipse1}
          alt="User avatar"
          className="object-cover shrink-0 w-10 h-10 rounded-full"
        />
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-gray-900">Điều phối viên A</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-500 italic">Online</span>
          </div>
        </div>
      </div>
      <button
        aria-label="User menu"
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>
    </footer>
  );
};

const NavigationMenu = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const socket = useSocket();

  const [incidentCount, setIncidentCount] = useState(0);
  
  // 🔥 FIX LỖI ESLINT: Khởi tạo dữ liệu trực tiếp từ LocalStorage ngay lần render đầu tiên
  const [globalUnreadCount, setGlobalUnreadCount] = useState(() => {
    try {
      const storedCounts = JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
      return Object.values(storedCounts).reduce((sum, count) => sum + count, 0);
    } catch (e) {
      return 0;
    }
  });

  const calculateTotalUnread = () => {
    try {
      const storedCounts = JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
      const total = Object.values(storedCounts).reduce((sum, count) => sum + count, 0);
      setGlobalUnreadCount(total);
    } catch (e) {
      console.error(e);
    }
  };

  // Gọi API lấy số lượng sự cố ban đầu
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get("/incidents?status=PENDING,ASSIGNED,IN_PROGRESS");
        setIncidentCount(res.data.result.pagination.total || 0);
      } catch (error) {
        console.error("Lỗi lấy số lượng sự cố:", error);
      }
    };
    fetchCount();

    // Lắng nghe sự kiện CallCenter báo cáo đã đọc tin nhắn
    const handleStorageChange = () => {
      calculateTotalUnread();
    };

    window.addEventListener('chatCountsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('chatCountsUpdated', handleStorageChange);
    };
  }, []);

  // Lắng nghe Socket để cập nhật Badge Sự cố & Badge Tin nhắn
  useEffect(() => {
    if (!socket) return;

    // 1. Lắng nghe Sự cố mới
    const handleNew = () => setIncidentCount(prev => prev + 1);

    const handleUpdate = (data) => {
      if ([INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(data.status)) {
        setIncidentCount(prev => Math.max(0, prev - 1));
      }
    };

    const handleDelete = () => setIncidentCount(prev => Math.max(0, prev - 1));

    // 2. LẮNG NGHE TIN NHẮN MỚI TỪ ĐỘI CỨU HỘ
    const handleNotify = (data) => {
      const { incidentId } = data;
      
      const storedCounts = JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
      const currentUrl = window.location.href;
      
      // Nếu không ở Call Center thì tăng đếm trong LocalStorage
      if (!currentUrl.includes('/dispatcher/call-center')) {
         storedCounts[incidentId] = (storedCounts[incidentId] || 0) + 1;
         localStorage.setItem('unreadChatCounts', JSON.stringify(storedCounts));
         calculateTotalUnread();
      }
    };

    socket.on("incident:new", handleNew);
    socket.on("alert:sos", handleNew);
    socket.on("incident:updated", handleUpdate);
    socket.on("delete_incident", handleDelete);
    
    socket.emit('dispatcher:register');
    socket.on('chat:notify_dispatcher', handleNotify);

    return () => {
      socket.off("incident:new", handleNew);
      socket.off("alert:sos", handleNew);
      socket.off("incident:updated", handleUpdate);
      socket.off("delete_incident", handleDelete);
      socket.off('chat:notify_dispatcher', handleNotify);
    };
  }, [socket]);


  const menuItems = [
    {
      path: "/dispatcher/dashboard",
      icon: <Map className="w-5 h-5" />,
      label: "Bản đồ trực tiếp",
    },
    {
      path: "/dispatcher/incidents",
      icon: <AlertCircle className="w-5 h-5" />,
      label: "Sự cố",
      badge: incidentCount,
    },
    {
      path: "/dispatcher/fleet",
      icon: <Truck className="w-5 h-5" />,
      label: "Quản lý đội xe",
    },
    {
      path: "/dispatcher/call-center",
      icon: <Phone className="w-5 h-5" />,
      label: "Liên lạc tổng đài",
      badge: globalUnreadCount, // 🔥 Gán số lượng tin nhắn chưa đọc vào Menu này
    },
  ];

  return (
    <nav className="flex flex-col gap-2 p-4">
      {menuItems.map((item, index) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={index}
            to={item.path}
            // 🔥 ĐÃ XÓA SỰ KIỆN onClick. Bấm vào Menu không tự ý xóa chấm đỏ nữa!
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-blue-50 text-blue-600 font-bold"
                : "text-gray-500 hover:bg-gray-50 font-medium hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={isActive ? "text-blue-600" : "text-gray-400"}>
                {item.icon}
              </div>
              <span className="text-[15px]">{item.label}</span>
            </div>

            {/* Hiện Badge nếu số lượng > 0 */}
            {item.badge > 0 && (
              <div className="flex flex-col justify-center items-center px-2 font-bold text-white whitespace-nowrap bg-red-500 rounded-full h-[24px] min-w-[24px] text-xs animate-in zoom-in duration-300">
                {item.badge > 99 ? '99+' : item.badge}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export const Menu = () => {
  return (
    <aside className="w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 z-10">
      <div className="flex flex-col">
        <div className="h-[80px] flex items-center px-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Cứu hộ.Web</h1>
        </div>
        <NavigationMenu />
      </div>
      <UserProfile />
    </aside>
  );
};