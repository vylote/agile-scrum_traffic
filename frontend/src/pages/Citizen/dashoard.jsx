import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BottomNav } from "../../components/Citizen/BottomNav";
import Map from "../../components/Public/Map";
import { ChevronRight, Loader2 } from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket";

export const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [incidents, setIncidents] = useState([]);
  const [fleet, setFleet] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. TÌM SỰ CỐ CỦA MÌNH (Đang được xử lý)
  const myActiveIncident = useMemo(() => {
    return incidents.find(inc => 
      (inc.reportedBy?._id === user?.id || inc.reportedBy === user?.id) && 
      ["ASSIGNED", "IN_PROGRESS"].includes(inc.status)
    );
  }, [incidents, user?.id]);

  // 2. FETCH DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Lấy sự cố (có thể lọc theo Zone của người dùng nếu cần)
        const [incRes, teamRes] = await Promise.all([
          api.get("/incidents?status=PENDING,ASSIGNED,IN_PROGRESS"),
          api.get("/rescue-teams?activeOnly=true&limit=100")
        ]);

        setIncidents(incRes.data?.result?.data || []);

        const teamsData = teamRes.data?.result?.data || [];
        const initialFleet = {};
        teamsData.forEach(t => {
          initialFleet[t._id] = {
            teamId: t._id,
            teamName: t.name,
            status: t.status,
            lat: t.currentLocation.coordinates[1],
            lng: t.currentLocation.coordinates[0]
          };
        });
        setFleet(initialFleet);
      } catch (error) {
        console.error("Lỗi nạp dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 3. SOCKET REAL-TIME
  useEffect(() => {
    const handleNewIncident = (data) => {
      setIncidents(prev => {
        if (prev.find(i => i._id === data.incident._id)) return prev;
        return [data.incident, ...prev];
      });
    };

    const handleFleetUpdate = (data) => {
      const assignedTeamId = myActiveIncident?.assignedTeam?._id || myActiveIncident?.assignedTeam;
      // Chỉ cập nhật nếu là xe đang cứu mình
      if (assignedTeamId === data.teamId) {
        setFleet(prev => ({
          ...prev,
          [data.teamId]: { ...prev[data.teamId], ...data }
        }));
      }
    };

    socket.on("incident:new", handleNewIncident);
    socket.on("rescue:location", handleFleetUpdate);

    return () => {
      socket.off("incident:new", handleNewIncident);
      socket.off("rescue:location", handleFleetUpdate);
    };
  }, [myActiveIncident]);

  // 4. LỌC XE HIỂN THỊ TRÊN MAP
  const mapFleet = useMemo(() => {
    if (myActiveIncident?.assignedTeam) {
      const id = myActiveIncident.assignedTeam._id || myActiveIncident.assignedTeam;
      return fleet[id] ? { [id]: fleet[id] } : {};
    }
    return {};
  }, [myActiveIncident, fleet]);

  const availableCount = useMemo(() => {
    return Object.values(fleet).filter(t => t.status === 'AVAILABLE').length;
  }, [fleet]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-32">
      {/* 1. STATUS BAR GIẢ LẬP */}
      <div className="flex justify-between items-center px-8 pt-5 pb-2">
        <span className="text-black font-bold text-[17px]">9:41</span>
        <div className="flex gap-1 items-center">
          <div className="w-5 h-2.5 border border-black rounded-sm relative after:content-[''] after:absolute after:right-[-3px] after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-black after:rounded-full"></div>
        </div>
      </div>

      {/* 2. HEADER */}
      <div className="flex items-center justify-between px-7 mt-6 mb-7">
        <h1 className="text-black text-[34px] font-bold leading-tight">Cứu hộ</h1>
        <div 
          className="w-10 h-10 rounded-full shadow-md overflow-hidden border-2 border-white cursor-pointer active:scale-90 transition-transform" 
          onClick={() => navigate("/citizen/account")}
        >
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Vy'}`} className="w-full h-full object-cover" alt="avatar" />
        </div>
      </div>

      {/* 3. NÚT CHỨC NĂNG */}
      <div className="px-6 space-y-3">
        <button className="w-full flex items-center bg-white p-5 rounded-[27px] active:scale-[0.98] transition-all shadow-sm group" onClick={() => navigate("/citizen/sos")}>
          <div className="p-3 bg-red-50 rounded-2xl mr-4 group-active:bg-red-100 transition-colors">
            <img src="https://cdn-icons-png.flaticon.com/512/752/752755.png" className="w-6 h-6" alt="sos"/>
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-[#FF3B30] text-[19px] font-black tracking-tight">SOS Khẩn cấp</span>
            <span className="text-[#8E8E93] text-[13px] font-medium">Gửi vị trí ngay lập tức</span>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <button className="w-full flex items-center bg-white p-5 rounded-[27px] active:scale-[0.98] transition-all shadow-sm text-left group" onClick={() => navigate("/citizen/report")}>
          <div className="p-3 bg-blue-50 rounded-2xl mr-4 group-active:bg-blue-100 transition-colors">
            <img src="https://cdn-icons-png.flaticon.com/512/4201/4201971.png" className="w-6 h-6" alt="report"/>
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-black text-[19px] font-black tracking-tight">Báo cáo chi tiết</span>
            <span className="text-[#8E8E93] text-[13px] font-medium">Mô tả sự cố cụ thể</span>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>

      {/* 4. KHU VỰC BẢN ĐỒ */}
      <div className="px-6 mt-8 flex flex-col gap-3">
        <h2 className="text-black text-[22px] font-bold ml-1">Bản đồ khu vực</h2>
        <div className="w-full h-[320px] rounded-[35px] relative overflow-hidden bg-white shadow-xl border-4 border-white">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-[2000]">
               <Loader2 className="animate-spin text-blue-500 mb-2" />
               <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Đang tải...</span>
            </div>
          ) : (
            <>
              {/* Badge Trạng thái: 🔥 Sửa lỗi 'che mất' bằng z-[1000] */}
              <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md py-3.5 px-5 rounded-[22px] flex items-center gap-3 shadow-xl z-[1000] pointer-events-none border border-white/50 ring-1 ring-black/5">
                {myActiveIncident ? (
                  <>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
                    <span className="text-blue-600 text-[12px] font-black uppercase tracking-tight">Đội cứu hộ đang đến với bạn</span>
                  </>
                ) : (
                  <>
                    <div className={`w-2 h-2 rounded-full ${availableCount > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-black text-[12px] font-black uppercase tracking-tight">
                      {availableCount > 0 ? `${availableCount} đội xe sẵn sàng hỗ trợ` : "Tất cả đội xe đang bận"}
                    </span>
                  </>
                )}
              </div>

              <Map 
                incidents={incidents} 
                fleet={mapFleet} 
                focusCoords={myActiveIncident?.location?.coordinates} 
                bottomOffset={10} 
              />
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};