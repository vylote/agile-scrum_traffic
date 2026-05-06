import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, Info, Eye } from "lucide-react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import { useSelector } from "react-redux";

export const IncidentChat = ({ incidentId }) => {
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const myRole = user?.role === "DISPATCHER" ? "DISPATCHER" : "RESCUE";
  const userId = user?._id || user?.id;
  const userName = user?.name;

  const teamMembers = user?.rescueTeam?.members || [];
  const myTeamInfo = teamMembers.find(m => m.userId === userId);
  const teamRole = myTeamInfo?.role || "MEMBER";

  const canChat = myRole === "DISPATCHER" || teamRole === "LEADER";

  // 1. Fetch Lịch sử khi mở Chat
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/incidents/${incidentId}/messages`);
        setMessages(res.data?.result || []);
      } catch (error) {
        console.error("Loi lay lich su chat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (incidentId) fetchHistory();
  }, [incidentId]);

  // 2. Setup Socket: Join Room & Lắng nghe tin nhắn
  useEffect(() => {
    // Dùng userId (String) thay vì user (Object)
    if (!socket || !incidentId || !userId) return;

    socket.emit("chat:join", {
      incidentId,
      userId: userId,
      role: myRole,
    });

    const handleNewMessage = (newMessage) => {
      // Chặn lỗi lặp tin nhắn (để chắc ăn 100%)
      setMessages((prev) => {
        if (prev.find((msg) => msg._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    };

    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.emit("chat:leave", {
        incidentId,
        userId: userId,
      });
      socket.off("chat:message", handleNewMessage);
    };
  }, [socket, incidentId, userId, myRole]); 

  // 3. Tự động cuộn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Hàm Gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !canChat) return;

    const payload = {
      incidentId,
      text: inputText.trim(),
      sender: {
        userId: userId,
        name: userName,
        role: myRole,
      },
    };

    socket.emit("chat:message", payload);
    setInputText("");
  };

  const renderMessage = (msg) => {
    if (msg.messageType === "SYSTEM") {
      return (
        <div key={msg._id} className="flex justify-center my-3">
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Info size={12} /> {msg.content}
          </span>
        </div>
      );
    }

    const isMine = msg.sender.userId.toString() === userId.toString();

    return (
      <div
        key={msg._id}
        className={`flex w-full my-2 ${isMine ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}
        >
          {!isMine && (
            <span className="text-[10px] text-gray-500 font-bold mb-1 ml-1">
              {msg.sender.role === "DISPATCHER"
                ? "Điều phối viên"
                : `Đội trưởng - ${msg.sender.name}`}
            </span>
          )}
          <div
            className={`px-4 py-2.5 rounded-2xl text-[14px] ${
              isMine
                ? "bg-[#0088FF] text-white rounded-tr-sm"
                : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200"
            }`}
          >
            {msg.content}
          </div>

          <span className="text-[9px] text-gray-400 font-medium mt-1 mx-1">
            {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30 no-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full opacity-40">
            <p className="text-sm font-semibold">Chưa có tin nhắn nào</p>
            <p className="text-xs">Bắt đầu trò chuyện để hỗ trợ sự cố</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {canChat ? (
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-gray-100 flex items-end gap-2"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none resize-none max-h-[100px]"
            rows="1"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 shrink-0 bg-[#0088FF] text-white rounded-xl flex items-center justify-center disabled:bg-gray-200 disabled:text-gray-400 transition-colors active:scale-95 mb-0.5"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      ) : (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium italic gap-2">
          <Eye size={16} className="text-gray-400" />
          Chỉ Đội trưởng mới được quyền phản hồi tin nhắn.
        </div>
      )}
    </div>
  );
};