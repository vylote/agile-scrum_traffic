import { Link, useLocation } from "react-router-dom";
import { Home, History, Bell } from "lucide-react";

export const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/citizen/dashboard", icon: <Home className="w-6 h-6" />, label: "Trang chủ" },
    { path: "/citizen/history", icon: <History className="w-6 h-6" />, label: "Lịch sử" },
    { path: "/citizen/notifications", icon: <Bell className="w-6 h-6" />, label: "Thông báo" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 min-w-[70px]"
          >
            <div className={`transition-colors ${isActive ? "text-[#0088FF]" : "text-gray-400"}`}>
              {item.icon}
            </div>
            <span className={`text-[11px] font-medium ${isActive ? "text-[#0088FF]" : "text-gray-500"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};