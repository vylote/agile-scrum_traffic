import React, { useState, useEffect, useRef } from "react";

import TabBar from "../../components/RescueTeam/TabBar";
import ChatHeader from "../../components/RescueTeam/ChatHeader";
import MessageBubble from "../../components/RescueTeam/MessageBubble";
import MessageInput from "../../components/RescueTeam/MessageInput";

export function Chat() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Chào bạn, hiện tại có một ca tai nạn ở Cầu Giấy, bạn đang ở gần đó có tiện nhận ca này không?",
      time: "09:00",
      isOutgoing: false
    },
    {
      id: "2",
      text: "Vâng, tôi đang di chuyển tới đó rồi sếp ạ.",
      time: "09:02",
      isOutgoing: true
    }
  ]);

  // Ref dùng để tự động cuộn xuống cuối cùng
  const messagesEndRef = useRef(null);

  // Hàm tự động cuộn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mỗi khi mảng 'messages' thay đổi (có tin nhắn mới), tự động chạy hàm cuộn
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (messageText) => {
    const newMessage = {
      id: Date.now().toString(),
      text: messageText,
      time: new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOutgoing: true
    };
    
    // Thêm tin nhắn mới vào mảng
    setMessages(prev => [...prev, newMessage]);

    // CHỖ NÀY SAU NÀY DÙNG ĐỂ BẮN SOCKET:
    // socket.emit('sendMessage', newMessage);
  };

  return (
    // Dùng h-screen để khóa chặt khung hình di động
    <div className="relative mx-auto w-full h-screen max-w-[480px] bg-[#F5F6FA] overflow-hidden flex flex-col shadow-2xl">
      <ChatHeader />

      {/* Khu vực cuộn tin nhắn - Tự động giãn ra chiếm khoảng trống (flex-1) */}
      <main className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar flex flex-col">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.text}
            time={message.time}
            isOutgoing={message.isOutgoing}
          />
        ))}
        {/* Một thẻ div vô hình nằm ở cuối cùng để làm điểm neo cuộn xuống */}
        <div ref={messagesEndRef} />
      </main>

      {/* Khung nhập tin nhắn và Thanh Menu cố định ở đáy */}
      <MessageInput onSend={handleSendMessage} />
      
      {/* Tái chế TabBar từ bước trước (Nó sẽ tự sáng màu ở Tab Tin nhắn dựa vào URL) */}
      <TabBar /> 
      
    </div>
  );
}

export default Chat;