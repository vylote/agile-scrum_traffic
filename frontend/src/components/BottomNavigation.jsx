import { useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, Bell, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Trang chủ", icon: Home, path: "/citizen/home" },
  { label: "Lịch sử", icon: Clock, path: "/citizen/history" },
  { label: "Thông báo", icon: Bell, path: "/citizen/notifications" },
  { label: "Tài khoản", icon: User, path: "/citizen/account" },
];

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-50">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Icon
              className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-gray-400"}`}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span className={`text-[10px] ${isActive ? "text-blue-500 font-semibold" : "text-gray-400"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}