import { Link, useLocation } from "react-router-dom";
import { Home, History, Bell, User } from "lucide-react"; // Thêm User cho đủ bộ
import React from "react";

export const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/citizen/dashboard", icon: <Home className="w-6 h-6" />, label: "Trang chủ" },
    { path: "/citizen/history", icon: <History className="w-6 h-6" />, label: "Lịch sử" },
    { path: "/citizen/notifications", icon: <Bell className="w-6 h-6" />, label: "Thông báo" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-6 py-2 flex justify-between items-center z-[5000] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const isActive = currentPath.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 min-w-[60px] transition-all active:scale-95"
          >
            <div className={`transition-colors duration-200 ${isActive ? "text-[#0088FF]" : "text-[#BDBDBD]"}`}>
              {/* Giảm kích thước icon một chút nếu cần */}
              {React.cloneElement(item.icon, { className: "w-5 h-5" })}
            </div>
            <span className={`text-[10px] font-bold ${isActive ? "text-[#0088FF]" : "text-[#8E8E93]"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};