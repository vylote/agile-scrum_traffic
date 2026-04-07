import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
// Import các icon đồng bộ từ thư viện Lucide
import { Home, History, MessageSquare } from 'lucide-react';

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: 'home',
      path: '/rescue/dashboard',
      icon: Home, // Truyền trực tiếp Component icon
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
    <div className="pt-1 pb-0 shrink-0 w-full">
      <nav className="flex items-center justify-around bg-white/90 backdrop-blur-md rounded-[100px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 h-[65px] px-2 max-w-[343px] mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.includes(tab.path);
          const IconComponent = tab.icon; // Khai báo Component để render
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)} 
              className="flex flex-col items-center justify-center flex-1 h-full rounded-[100px] transition-all relative group"
            >
              {isActive && (
                <div className="absolute inset-1 bg-sky-50 rounded-[100px] -z-10" />
              )}
              
              {/* Render Icon Lucide thay vì thẻ img */}
              <div className={`transition-all ${isActive ? 'scale-110' : 'opacity-40 grayscale group-hover:opacity-70'}`}>
                <IconComponent 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-sky-500' : 'text-gray-500'} 
                />
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