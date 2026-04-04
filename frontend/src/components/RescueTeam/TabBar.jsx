import React from "react";
// Import hook chuyển trang của React Router
import { useNavigate, useLocation } from "react-router-dom"; 

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn URL hiện tại (VD: "/rescue/history")

  // Thêm thuộc tính "path" vào các tab tương ứng với đường dẫn trong App.jsx của bạn
  const tabs = [
    {
      id: 'home',
      path: '/rescue/dashboard', // Sửa đường dẫn này cho khớp với Route của bạn
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/fc231b2124e2b759a4a970c8088d92f9aa8788cc",
      label: "Trang chủ"
    },
    {
      id: 'history',
      path: '/rescue/history', // Sửa đường dẫn này cho khớp với Route của bạn
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/dda6b04939c904dc62c6fbf41f5f1d4df02d3712",
      label: "Lịch sử"
    },
    {
      id: 'messages',
      path: '/rescue/messages', // Trang tin nhắn nếu có
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/277e3b9de418ac0ac55480d888be477a440baee8",
      label: "Tin nhắn"
    }
  ];

  return (
    <div className="pt-1 pb-0 shrink-0 w-full">
      <nav className="flex items-center justify-around bg-white/90 backdrop-blur-md rounded-[100px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 h-[65px] px-2 max-w-[343px] mx-auto">
        {tabs.map((tab) => {
          
          // 🔥 ĐỘT PHÁ Ở ĐÂY: Tự động so sánh URL hiện tại với path của tab
          // Nếu URL có chứa chữ "/rescue/history" thì thẻ Lịch sử tự sáng lên!
          const isActive = location.pathname.includes(tab.path);
          
          return (
            <button
              key={tab.id}
              // 🔥 Gắn sự kiện chuyển trang thực sự
              onClick={() => navigate(tab.path)} 
              className="flex flex-col items-center justify-center flex-1 h-full rounded-[100px] transition-all relative group"
            >
              {/* Hiệu ứng nền xanh mờ chạy ra phía sau khi được Active */}
              {isActive && (
                <div className="absolute inset-1 bg-sky-50 rounded-[100px] -z-10" />
              )}
              
              <img
                src={tab.icon}
                className={`w-6 h-6 mb-0.5 transition-all ${isActive ? 'filter-none scale-110' : 'opacity-40 grayscale group-hover:opacity-70'}`}
                alt={tab.label}
              />
              
              <span className={`text-[10px] font-bold transition-all ${isActive ? 'text-sky-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
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