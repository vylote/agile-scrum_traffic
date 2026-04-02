import React from 'react';
import { User, Bell, ShieldCheck, Map } from "lucide-react";

export const SettingsPanel = ({ activeItem, setActiveItem }) => {
  const menuItems = [
    { id: "personal", icon: User, text: "Thông tin cá nhân" },
    { id: "notifications", icon: Bell, text: "Thông báo" },
    { id: "security", icon: ShieldCheck, text: "Bảo mật & Phân quyền" },
    { id: "map_config", icon: Map, text: "Cấu hình bản đồ" }
  ];

  return (
    <section className="p-6 bg-white rounded-xl border border-gray-200 w-full md:w-[320px] shrink-0 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Cài đặt
      </h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <div 
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`flex gap-3 items-center px-4 py-3.5 rounded-lg cursor-pointer transition-colors ${
                isActive 
                  ? "text-blue-600 bg-blue-50 font-bold" 
                  : "text-gray-600 hover:bg-gray-50 font-medium"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[15px]">{item.text}</span>
            </div>
          );
        })}
      </nav>
    </section>
  );
};