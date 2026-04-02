import React from "react";

export function MessageBubble({ message, time, isOutgoing = false, avatarSrc }) {
  return (
    <div className={`flex gap-2 w-full mb-4 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      
      {/* Avatar người gửi (Chỉ hiện nếu là tin nhắn đến) */}
      {!isOutgoing && (
        <img
          src={avatarSrc || "https://api.builder.io/api/v1/image/assets/TEMP/0652c9b603670ade7b0ce94bb139afeed3874bbd"}
          className="object-cover shrink-0 w-8 h-8 rounded-full mt-auto"
          alt="Sender"
        />
      )}

      {/* Khối tin nhắn */}
      <div className={`flex flex-col max-w-[75%] px-4 py-2.5 shadow-sm ${
        isOutgoing 
          ? 'bg-sky-500 text-white rounded-2xl rounded-br-sm' 
          : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
      }`}>
        <p className="text-[15px] leading-relaxed break-words">
          {message}
        </p>
        <time className={`mt-1 text-[10px] ${isOutgoing ? 'text-sky-100 self-end' : 'text-gray-400 self-start'}`}>
          {time}
        </time>
      </div>

    </div>
  );
}

export default MessageBubble;