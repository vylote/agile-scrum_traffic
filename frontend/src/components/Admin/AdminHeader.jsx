import React from "react";
import { ExportButton } from "./ExportButton"; // Vẫn giữ ExportButton độc lập
import ellipse1 from "../../assets/images/avatar.jpg"; // Import ảnh avatar 1 lần ở đây

export const AdminHeader = ({ 
  title, 
  subtitle, 
  onExport, 
  showExport = true // Cho phép linh hoạt ẩn/hiện nút export nếu muốn
}) => {
  return (
    <header className="h-[90px] flex items-center justify-between px-8 bg-transparent shrink-0 mt-2">
      {/* Bên trái: Tiêu đề động */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px] font-bold text-gray-900 leading-tight">
          {title}
        </h2>
        <p className="text-base text-gray-500 font-medium">
          {subtitle}
        </p>
      </div>
      
      {/* Bên phải: Cụm Actions (Export + Avatar) */}
      <div className="flex items-center gap-5">
        {showExport && (
          <ExportButton onClick={onExport || (() => alert("Đang xuất dữ liệu..."))} />
        )}
        
        {/* Avatar Admin dùng chung toàn hệ thống */}
        <img 
          src={ellipse1} 
          alt="Admin Profile" 
          className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
        />
      </div>
    </header>
  );
};