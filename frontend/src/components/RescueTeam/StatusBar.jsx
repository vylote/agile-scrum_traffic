import React from "react";

const StatusBar = ({ time = "9:41" }) => (
  <header className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4 w-full z-20 pointer-events-none">
    
    {/* Đã xóa nền trắng bo góc, chỉ để lại chữ nổi bật */}
    <div className="flex items-center pointer-events-auto">
       <time className="text-[17px] tracking-tight font-bold text-black drop-shadow-md">
         {time}
       </time>
    </div>

    {/* Phải: Cột sóng, Wifi, Pin */}
    <div className="flex items-center gap-1.5 drop-shadow-md pointer-events-auto">
      <img src="https://api.builder.io/api/v1/image/assets/TEMP/504fc8a8091145dd97ed68dbbfb274ee330bd659" className="w-[18px] h-auto" alt="Signal" />
      <img src="https://api.builder.io/api/v1/image/assets/TEMP/3bef92dac319c014a0e2cf7b87336d1813c53dc3" className="w-[16px] h-auto" alt="WiFi" />
      <img src="https://api.builder.io/api/v1/image/assets/TEMP/3ec12b105148e09b3602fe62fa1da2398cfbae86" className="w-[24px] h-auto" alt="Battery" />
    </div>

  </header>
);

export default StatusBar;