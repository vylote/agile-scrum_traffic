import React from "react";
import ellipse1 from "../../assets/images/avatar.jpg"; // Import ảnh avatar 1 lần ở đây

export const AdminHeader = ({ 
  title, 
  subtitle, 
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
      
      <div className="flex items-center gap-5">
        <img 
          src={ellipse1} 
          alt="Admin Profile" 
          className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
        />
      </div>
    </header>
  );
};