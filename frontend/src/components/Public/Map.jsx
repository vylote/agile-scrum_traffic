import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, RefreshCw } from "lucide-react";

/** --- CẤU HÌNH ICONS --- **/
const rescueBusyIcon = new L.Icon({ 
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png", 
  iconSize: [32, 32], 
  iconAnchor: [16, 32] 
});
const rescueAvailableIcon = new L.Icon({ 
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png", 
  iconSize: [32, 32], 
  iconAnchor: [16, 32] 
});
const incidentIcon = new L.Icon({ 
  iconUrl: "https://cdn-icons-png.flaticon.com/512/5977/5977626.png", 
  iconSize: [30, 30], 
  iconAnchor: [15, 30] 
});

/** --- 1. COMPONENT VẼ ĐƯỜNG ĐI (OSRM) --- **/
const RoutingOverlay = ({ start, end }) => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!start?.lat || !start?.lng || !end) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end[0]},${end[1]}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setPoints(coordinates);
        }
      } catch (e) {
        console.error("Lỗi lấy đường đi OSRM:", e);
      }
    };

    fetchRoute();
  }, [start.lat, start.lng, end]); 

  return points.length > 0 ? (
    <Polyline 
      positions={points} 
      color="#ef4444" 
      weight={6} 
      opacity={0.7} 
      dashArray="10, 15" 
    />
  ) : null;
};

/** --- 2. NÚT ĐIỀU KHIỂN BẢN ĐỒ --- **/
const MapControls = ({ onRefresh, bottomOffset }) => {
  const map = useMap();
  
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { animate: true });
      });
    }
  };

  return (
    <div 
      className="absolute flex flex-col gap-3 z-[9999] pointer-events-none" 
      style={{ bottom: `${bottomOffset}px`, right: "16px", transition: 'all 0.3s ease' }}
    >
      {onRefresh && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRefresh(); }} 
          className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-orange-500 hover:bg-orange-50 border border-gray-100 active:scale-90 pointer-events-auto"
        >
          <RefreshCw size={22} />
        </button>
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); handleLocateMe(); }} 
        className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 border border-gray-100 active:scale-90 pointer-events-auto"
      >
        <LocateFixed size={22} />
      </button>
    </div>
  );
};

/** --- 3. ĐIỀU CHỈNH CAMERA --- **/
const FocusUpdater = ({ focusCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (focusCoords && focusCoords.length === 2) {
      map.flyTo([focusCoords[1], focusCoords[0]], 16, { animate: true });
    }
  }, [focusCoords, map]);
  return null;
};

/** --- 4. COMPONENT CHÍNH --- **/
const Map = ({ 
  incidents = [], 
  fleet = {}, 
  activeIncident = null, 
  onMarkerClick, 
  focusCoords, 
  onRefresh, 
  bottomOffset = 20 
}) => {
  const [centerPos] = useState([21.0285, 105.8542]);

  // 🔥 Tìm vị trí của chính đội mình từ Object fleet để vẽ Routing
  const myTeamId = Object.keys(fleet)[0];
  const myCurrentPos = fleet[myTeamId] ? { lat: fleet[myTeamId].lat, lng: fleet[myTeamId].lng } : null;

  return (
    <div className="h-full w-full relative overflow-hidden">
      <MapContainer center={centerPos} zoom={14} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <FocusUpdater focusCoords={focusCoords} />
        <MapControls onRefresh={onRefresh} bottomOffset={bottomOffset} />

        {/* 🛣️ Vẽ đường dẫn tới hiện trường nếu đang làm vụ việc */}
        {activeIncident && myCurrentPos && (
          <RoutingOverlay 
            start={myCurrentPos} 
            end={activeIncident.location.coordinates} 
          />
        )}

        {/* 🚩 Hiển thị các sự cố đang chờ */}
        {incidents.map(inc => (
          <Marker 
            key={inc._id} 
            position={[inc.location.coordinates[1], inc.location.coordinates[0]]} 
            icon={incidentIcon} 
            zIndexOffset={500} 
            eventHandlers={{ click: () => onMarkerClick?.(inc) }} 
          />
        ))}

        {/* 🚑 Hiển thị các đội xe cứu hộ (Xe chạy real-time) */}
        {Object.values(fleet).map(team => {
            const lat = parseFloat(team.lat);
            const lng = parseFloat(team.lng);
            if (!lat || !lng) return null;

            return (
              <Marker 
                key={team.teamId || team._id} 
                position={[lat, lng]} 
                icon={team.status === 'AVAILABLE' ? rescueAvailableIcon : rescueBusyIcon} 
                zIndexOffset={2000}
              >
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-black text-xs uppercase mb-0.5 text-gray-800">{team.name || team.teamName}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${team.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {team.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })
        }
      </MapContainer>
    </div>
  );
};

export default Map;