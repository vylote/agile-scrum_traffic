import React, { useState, useEffect, useRef } from "react";
import { Menu } from "../../components/Dispatcher/Menu";
import { Search, Loader2, Info } from "lucide-react";
import api from "../../services/api";
import { IncidentChat } from "../../components/Public/IncidentChat"; 
import { useSocket } from "../../hooks/useSocket";
import { INCIDENT_STATUS } from "../../utils/constants/incidentConstants";

export const CallCenter = () => {
  const socket = useSocket();
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo state từ LocalStorage
  const [unreadCounts, setUnreadCounts] = useState(() => {
     try {
        return JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
     } catch {
        return {};
     }
  });

  const selectedIncidentRef = useRef(selectedIncident);
  useEffect(() => {
    selectedIncidentRef.current = selectedIncident;
  }, [selectedIncident]);

  // 1. Fetch danh sách sự cố và TỰ ĐỘNG DỌN RÁC
  useEffect(() => {
    const fetchActiveIncidents = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/incidents?status=ASSIGNED,IN_PROGRESS");
        const data = res.data?.result?.data || [];
        setActiveIncidents(data);

        // 🔥 DỌN RÁC LOCAL STORAGE:
        // Quét LocalStorage, nếu có ID nào đang đếm số mà KHÔNG CÒN TRONG DANH SÁCH data nữa -> Xóa đi
        const storedCounts = JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
        let hasChanges = false;

        Object.keys(storedCounts).forEach(id => {
           const stillActive = data.some(inc => inc._id === id);
           if (!stillActive && storedCounts[id] > 0) {
              delete storedCounts[id]; // Xóa luôn cái key đó
              hasChanges = true;
           }
        });

        // Nếu có dọn rác thì cập nhật lại
        if (hasChanges) {
           localStorage.setItem('unreadChatCounts', JSON.stringify(storedCounts));
           setUnreadCounts(storedCounts);
           window.dispatchEvent(new Event('chatCountsUpdated')); // Báo Menu xóa số
        }

      } catch (error) {
        console.error("Lỗi lấy danh sách sự cố Call Center:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveIncidents();
  }, []);

  // 2. LẮNG NGHE THÔNG BÁO PING & LẮNG NGHE SỰ CỐ HOÀN THÀNH
  useEffect(() => {
    if (!socket) return;
    socket.emit('dispatcher:register');

    const handleNotify = (data) => {
      const { incidentId, lastMessage } = data;

      if (selectedIncidentRef.current?._id === incidentId) return;

      const storedCounts = JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
      storedCounts[incidentId] = (storedCounts[incidentId] || 0) + 1; 

      localStorage.setItem('unreadChatCounts', JSON.stringify(storedCounts));
      window.dispatchEvent(new Event('chatCountsUpdated'));
      setUnreadCounts(storedCounts);

      setActiveIncidents((prev) => 
        prev.map(inc => 
          inc._id === incidentId ? { ...inc, lastMessagePreview: lastMessage } : inc
        )
      );
    };

    // 🔥 XỬ LÝ LỖI KHÔNG TỰ ĐÓNG KHUNG CHAT KHI CỨU HỘ ẤN HOÀN THÀNH
    const handleIncidentUpdate = (data) => {
      const updatedIncident = data.incident || data;
      
      if ([INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(updatedIncident.status)) {
         // A. Xóa khỏi danh sách cột trái
         setActiveIncidents(prev => prev.filter(inc => inc._id !== updatedIncident._id));
         
         // B. Nếu đang mở khung chat của vụ này -> Đóng khung chat lại
         if (selectedIncidentRef.current?._id === updatedIncident._id) {
             setSelectedIncident(null);
         }

         // C. Dọn dẹp LocalStorage (Xóa chấm đỏ bị kẹt)
         const storedCounts = JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
         if (storedCounts[updatedIncident._id]) {
            delete storedCounts[updatedIncident._id];
            localStorage.setItem('unreadChatCounts', JSON.stringify(storedCounts));
            setUnreadCounts(storedCounts);
            window.dispatchEvent(new Event('chatCountsUpdated')); // Báo Menu
         }
      }
    };

    socket.on('chat:notify_dispatcher', handleNotify);
    socket.on('incident:updated', handleIncidentUpdate); // 🔥 Nghe thêm sự kiện này

    return () => {
      socket.off('chat:notify_dispatcher', handleNotify);
      socket.off('incident:updated', handleIncidentUpdate);
    };
  }, [socket]);

  // 3. Hàm xử lý khi bấm vào 1 vụ án ở cột trái
  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
    
    const storedCounts = JSON.parse(localStorage.getItem('unreadChatCounts')) || {};
    storedCounts[inc._id] = 0; 
    
    localStorage.setItem('unreadChatCounts', JSON.stringify(storedCounts));
    window.dispatchEvent(new Event('chatCountsUpdated'));
    
    setUnreadCounts(storedCounts);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <Menu />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
              Trung tâm liên lạc
            </h2>
            <p className="text-sm text-gray-500">
              Hỗ trợ khẩn cấp • {activeIncidents.length} sự cố đang kết nối
            </p>
          </div>
        </header>

        <div className="flex-1 px-8 pb-8 overflow-hidden">
          <div className="h-full w-full max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
            
            {/* CỘT TRÁI */}
            <section className="w-[320px] shrink-0 border-r border-gray-200 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm mã vụ việc..."
                    className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : activeIncidents.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-400 font-medium italic">
                    Không có sự cố nào đang xử lý
                  </div>
                ) : (
                  activeIncidents.map((inc) => {
                    const unread = unreadCounts[inc._id] || 0;
                    const isActive = selectedIncident?._id === inc._id;

                    return (
                      <div
                        key={inc._id}
                        onClick={() => handleSelectIncident(inc)} 
                        className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 ${
                          isActive ? "bg-blue-50/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0 uppercase">
                          {inc.assignedTeam?.name?.substring(0, 2) || "TM"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={`text-sm truncate pr-2 ${unread > 0 ? "font-black text-gray-900" : "font-bold text-gray-700"}`}>
                              {inc.assignedTeam?.name || "Đội Cứu Hộ"}
                            </h4>
                          </div>
                          
                          <p className={`text-xs truncate ${unread > 0 ? "font-bold text-blue-600" : "text-gray-500"}`}>
                            {inc.lastMessagePreview ? inc.lastMessagePreview : `Vụ: ${inc.title}`}
                          </p>
                        </div>
                        
                        {unread > 0 && (
                          <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full mt-1 animate-in zoom-in duration-300">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* CỘT PHẢI */}
            <section className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden">
              {selectedIncident ? (
                <>
                  <div className="h-[72px] px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          Đang hỗ trợ: {selectedIncident.assignedTeam?.name || "Chưa rõ"}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-medium text-blue-600">
                            Mã: {selectedIncident.code} • Trạng thái: {selectedIncident.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                      <IncidentChat 
                        key={selectedIncident._id} 
                        incidentId={selectedIncident._id} 
                      />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                  <Info className="w-12 h-12 mb-3 text-gray-300" />
                  <p>Vui lòng chọn một sự cố bên trái để bắt đầu nhắn tin.</p>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};