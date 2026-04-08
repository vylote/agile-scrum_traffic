import React, { useState, useEffect } from "react";
import { BottomNav } from "../../components/Citizen/BottomNav";
import { ArrowLeft, Navigation, ChevronRight, MapPin, Clock, Loader2, X, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket";
import { INCIDENT_TYPES, INCIDENT_STATUS } from "../../utils/constants/incidentConstants";
import Map from "../../components/Public/Map";

export const CitizenHistory = () => {
  const [activeTab, setActiveTab] = useState("processing");
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [rescuePos, setRescuePos] = useState(null); // Luôn sẵn sàng state cho xe

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/incidents");
        setIncidents(response.data?.result?.data || []);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchHistory();
  }, []);

  // Lắng nghe tọa độ xe từ Socket
  useEffect(() => {
    if (!socket || !selectedIncident) return;
    const handleRescueLoc = (data) => {
      if (selectedIncident.assignedTeam?._id === data.teamId || selectedIncident.assignedTeam === data.teamId) {
        setRescuePos({ teamId: data.teamId, lat: data.lat, lng: data.lng, status: 'BUSY' });
      }
    };
    socket.on("rescue:location", handleRescueLoc);
    return () => socket.off("rescue:location", handleRescueLoc);
  }, [selectedIncident]);

  const getStatusConfig = (s) => {
    const cfgs = {
      [INCIDENT_STATUS.PENDING]: { label: "Đang chờ", color: "text-orange-600", bgColor: "bg-orange-50" },
      [INCIDENT_STATUS.IN_PROGRESS]: { label: "Đang cứu hộ", color: "text-blue-600", bgColor: "bg-blue-50" },
      [INCIDENT_STATUS.COMPLETED]: { label: "Hoàn thành", color: "text-green-600", bgColor: "bg-green-50" },
    };
    return cfgs[s] || { label: s, color: "text-gray-600", bgColor: "bg-gray-50" };
  };

  if (selectedIncident) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b p-4 flex items-center gap-4">
          <button onClick={() => { setSelectedIncident(null); setRescuePos(null); }}><ArrowLeft size={24} /></button>
          <h1 className="font-bold">Theo dõi cứu hộ</h1>
        </div>

        <div className="mt-[64px] h-72 relative z-0">
          <Map 
            incidents={[selectedIncident]} 
            fleet={rescuePos ? { [rescuePos.teamId]: rescuePos } : {}}
            focusCoords={selectedIncident.location.coordinates}
          />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Navigation size={14} className="text-blue-500 animate-pulse" />
            <span className="text-xs font-bold">{rescuePos ? "Xe đang di chuyển" : "Đang chờ GPS..."}</span>
          </div>
        </div>

        <div className="p-8">
           <h2 className="text-xl font-black">{selectedIncident.title}</h2>
           <div className="mt-4 space-y-4">
              {selectedIncident.timeline?.slice().reverse().map((t, i) => (
                <div key={i} className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                   <div><p className="font-bold">{t.note}</p><p className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString()}</p></div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-8 pt-12"><h1 className="text-3xl font-bold">Lịch sử</h1></div>
      <div className="px-6 space-y-4">
        {incidents.map(item => (
          <div key={item._id} onClick={() => setSelectedIncident(item)} className="bg-white p-5 rounded-3xl shadow-sm border">
            <div className="flex justify-between items-start">
              <h3 className="font-bold">{item.title}</h3>
              <span className={`text-[10px] px-2 py-1 rounded-full ${getStatusConfig(item.status).bgColor} ${getStatusConfig(item.status).color}`}>{getStatusConfig(item.status).label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{item.location?.address}</p>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};