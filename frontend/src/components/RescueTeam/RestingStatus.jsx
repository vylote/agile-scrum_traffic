import React from "react";

export const RestingStatus = () => {
  return (
    <section className="flex flex-col items-center justify-center p-8 bg-white/95 backdrop-blur-md rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-gray-100 mx-4 mt-auto mb-4 pointer-events-auto">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/481bc508ba63780d0d88d1209b07e3a5ef4ce698"
        className="object-contain w-[84px] h-[84px] mb-4 drop-shadow-sm"
        alt="Resting status icon"
      />
      <h1 className="text-[22px] font-bold tracking-tight leading-none text-center text-gray-900 mb-2">
        Đang nghỉ ngơi
      </h1>
      <p className="text-[15px] font-medium text-gray-500 text-center">
        Bật sẵn sàng ở góc phải trên<br/>để tiếp tục nhận nhiệm vụ
      </p>
    </section>
  );
};

export default RestingStatus;