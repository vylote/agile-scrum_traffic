import React, { useState } from "react";
import { Menu } from "../../components/Menu";
import { SearchBar } from "../../components/SearchBar";

// Import Icons
import {
  Phone,
  Video,
  Send,
  Search,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";

// ==========================================
// MOCK DATA (DỮ LIỆU GIẢ)
// ==========================================
const chatList = [
  {
    id: 1,
    name: "Tài xế 1 (29H-123.45)",
    lastMessage: "Đã nhận nhiệm vụ. Đang di chuyển...",
    time: "07:00",
    isOnline: true,
    unread: 2,
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Cứu hộ 2 (Đống Đa)",
    lastMessage: "Khu vực này đang tắc đường nặng sếp ơi.",
    time: "06:45",
    isOnline: true,
    unread: 0,
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Người dân - Nguyễn Văn A",
    lastMessage: "Vâng, tôi đang đứng ở ngay gốc cây to.",
    time: "06:30",
    isOnline: false,
    unread: 0,
    avatar: "https://i.pravatar.cc/150?img=68",
  },
];

const mockMessages = [
  {
    id: 1,
    text: "Chào anh, tôi là điều phối viên. Anh đã tiếp cận được hiện trường chưa?",
    time: "06:55",
    isOutgoing: true,
  },
  {
    id: 2,
    text: "Chào sếp, em đang cách đó khoảng 500m nhưng đang tắc đường quá.",
    time: "06:58",
    isOutgoing: false,
  },
  {
    id: 3,
    text: "Đã nhận nhiệm vụ. Đang di chuyển...",
    time: "07:00",
    isOutgoing: false,
  },
];

export const CallCenter = () => {
  const [messageInput, setMessageInput] = useState("");
  const activeChat = chatList[0];

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      {/* =========================================
          SIDEBAR (Chỉ cần 1 dòng duy nhất!)
      ========================================= */}
      <Menu />

      {/* =========================================
          MAIN CONTENT (NỘI DUNG CHÍNH)
      ========================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
              Liên lạc tổng đài
            </h2>
            <p className="text-sm text-gray-500">
              Hà Nội, Việt Nam • Cập nhật lúc 07:00
            </p>
          </div>
          <div className="w-[400px]">
            <SearchBar className="w-full" />
          </div>
        </header>

        {/* GIAO DIỆN CHAT 2 CỘT */}
        <div className="flex-1 px-8 pb-8 overflow-hidden">
          <div className="h-full w-full max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
            {/* CỘT TRÁI: DANH SÁCH CHAT (Width cố định 320px) */}
            <section className="w-[320px] shrink-0 border-r border-gray-200 flex flex-col bg-white">
              {/* Thanh tìm kiếm cục bộ */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tin nhắn..."
                    className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Danh sách người dùng */}
              <div className="flex-1 overflow-y-auto">
                {chatList.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 ${
                      chat.id === activeChat.id
                        ? "bg-blue-50/50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {chat.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate pr-2">
                          {chat.name}
                        </h4>
                        <span className="text-[11px] font-medium text-gray-400 shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${chat.unread > 0 ? "font-bold text-gray-900" : "text-gray-500"}`}
                      >
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full mt-1">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CỘT PHẢI: KHUNG CHAT CHI TIẾT */}
            <section className="flex-1 flex flex-col bg-[#F9FAFB]">
              {/* Header Khung Chat */}
              <div className="h-[72px] px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={activeChat.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {activeChat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-green-600">
                        Trực tuyến
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors ml-2 border border-gray-200">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Khu vực hiển thị tin nhắn (Cuộn) */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {/* Phân cách ngày tháng */}
                <div className="flex justify-center my-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider rounded-full">
                    Hôm nay
                  </span>
                </div>

                {/* Render Tin Nhắn */}
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex max-w-[80%] ${msg.isOutgoing ? "self-end flex-row-reverse" : "self-start"}`}
                  >
                    {!msg.isOutgoing && (
                      <img
                        src={activeChat.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover mr-3 shrink-0"
                      />
                    )}
                    <div
                      className={`flex flex-col ${msg.isOutgoing ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[15px] ${
                          msg.isOutgoing
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: Ô nhập văn bản */}
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                  <button className="p-2 text-gray-400 hover:text-gray-600 shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent max-h-[120px] min-h-[40px] resize-none outline-none py-2 text-[15px] text-gray-800"
                    rows={1}
                  />
                  <button className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl shrink-0 transition-colors shadow-sm">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
