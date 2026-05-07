import React from "react";

const StatusBar = ({ time = "9:41" }) => (
  <header className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4 w-full z-20 pointer-events-none">
    
    {/* Đã xóa nền trắng bo góc, chỉ để lại chữ nổi bật */}
    <div className="flex items-center pointer-events-auto">
       <time className="text-[17px] tracking-tight font-bold text-black drop-shadow-md">
         {time}
       </time>
    </div>
  </header>
);

export default StatusBar;