import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Trang chủ",
    path: "/home",
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? "text-blue-500" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    label: "Lịch sử",
    path: "/history",
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Thông báo",
    path: "/notifications",
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-50">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${isActive ? "bg-blue-50" : ""}`}
          >
            {item.icon(isActive)}
            {isActive && (
              <span className="text-xs text-blue-500 font-semibold">{item.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}