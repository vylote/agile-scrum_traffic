import React, { useState } from "react";
import { Send } from "lucide-react";

export function MessageInput({ placeholder = "Nhập tin nhắn...", onSend }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage(""); // Xóa input sau khi gửi
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0 z-10">
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-[100px]">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 h-8"
        />
        <button
          onClick={handleSend}
          className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            message.trim() ? 'bg-sky-500 text-white shadow-md' : 'bg-gray-300 text-gray-100 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4 -ml-0.5" />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;