import React from "react";

export function ChatHeader({ 
  title = "Trung tâm điều phối", 
  avatarSrc = "https://api.builder.io/api/v1/image/assets/TEMP/0652c9b603670ade7b0ce94bb139afeed3874bbd" 
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shrink-0 shadow-sm z-10">
      <div className="relative">
        <img
          src={avatarSrc}
          className="object-cover w-10 h-10 rounded-full shadow-sm"
          alt="Chat avatar"
        />
        {/* Chấm xanh lá báo Online */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      </div>
      <div>
        <h1 className="text-base font-bold text-gray-900 leading-tight">{title}</h1>
        <p className="text-xs text-green-500 font-medium">Đang trực tuyến</p>
      </div>
    </div>
  );
}

export default ChatHeader;