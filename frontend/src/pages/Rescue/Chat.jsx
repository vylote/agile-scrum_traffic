import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Loader2, ShieldCheck } from "lucide-react";
import api from "../../services/api";

import TabBar from "../../components/RescueTeam/TabBar";
import ChatHeader from "../../components/RescueTeam/ChatHeader";
import { IncidentChat } from "../../components/Public/IncidentChat"; 

export function Chat() {
  const { user } = useSelector((state) => state.auth);
  const teamId = user?.rescueTeam?._id;
  
  const [activeIncidentId, setActiveIncidentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. TÌM XEM ĐỘI NÀY ĐANG LÀM VỤ NÀO
  useEffect(() => {
    const fetchActiveJob = async () => {
      if (!teamId) return;
      try {
        setIsLoading(true);
        const res = await api.get(`/incidents?assignedTeam=${teamId}&status=ASSIGNED,IN_PROGRESS`);
        const activeData = res.data?.result?.data || [];
        
        if (activeData.length > 0) {
          setActiveIncidentId(activeData[0]._id);
          
          // 🔥 TRỌNG TÂM: ĐÃ VÀO TRANG CHAT LÀ ĐÃ ĐỌC -> XÓA CHẤM ĐỎ NGAY
          localStorage.setItem('rescueUnreadChat', '0');
          window.dispatchEvent(new Event('rescueChatRead')); // Hét lên cho TabBar biết

        } else {
          setActiveIncidentId(null);
          // Không có vụ nào thì cũng xóa rác đi
          localStorage.removeItem('rescueUnreadChat');
          window.dispatchEvent(new Event('rescueChatRead'));
        }
      } catch (error) {
        console.error("Lỗi kiểm tra sự cố đang làm:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActiveJob();
  }, [teamId]);

  return (
    <div className="relative mx-auto w-full h-screen max-w-[480px] bg-[#F5F6FA] overflow-hidden flex flex-col shadow-2xl">
      <ChatHeader />

      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {isLoading ? (
           <div className="flex-1 flex justify-center items-center">
              <Loader2 className="animate-spin text-[#0088FF] w-8 h-8" />
           </div>
        ) : activeIncidentId ? (
           <IncidentChat incidentId={activeIncidentId} />
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
              <ShieldCheck className="w-20 h-20 mb-4 text-gray-400" />
              <p className="text-xl font-bold text-gray-600 mb-2">Chưa có nhiệm vụ</p>
              <p className="text-sm text-gray-500">
                Kênh liên lạc trực tiếp với Điều phối viên sẽ tự động mở khi bạn tiếp nhận một sự cố mới.
              </p>
           </div>
        )}
      </main>

      <TabBar /> 
    </div>
  );
}

export default Chat;