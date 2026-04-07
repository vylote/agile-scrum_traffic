// Map.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { USER_ROLES } from "../../utils/constants/userConstants";
import { LocateFixed, RefreshCw } from "lucide-react";

/** --- HÀM TÍNH KHOẢNG CÁCH --- **/
const getDistance = (c1, c2) => {
  if (!c1 || !c2) return 999;
  const R = 6371; 
  const dLat = (c2[0] - c1[0]) * Math.PI / 180;
  const dLon = (c2[1] - c1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(c1[0]*Math.PI/180)*Math.cos(c2[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

/** --- ICONS CONFIG --- **/
const rescueAvailableIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png", iconSize: [30, 30] });
const rescueBusyIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png", iconSize: [30, 30] });
const incidentIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/5977/5977626.png", iconSize: [30, 30] });
const userIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/10614/10614480.png", iconSize: [30, 30] });

/** --- NÚT ĐIỀU KHIỂN GPS & REFRESH --- **/
const MapControls = ({ setMyPos, onRefresh, bottomOffset = 20 }) => {
  const map = useMap();

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setMyPos(newPos); // Cập nhật vị trí marker
        map.flyTo(newPos, 16, { duration: 1 }); // Bay camera về vị trí
      }, (err) => alert("Không thể lấy vị trí. Vui lòng bật định vị!"));
    }
  };

  return (
    <div 
      className="absolute flex flex-col gap-3 z-[1000]" 
      style={{ bottom: `${bottomOffset}px`, right: "16px" }}
    >
      {/* Nút Refresh */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-500 hover:bg-orange-50 active:scale-90 transition-all border border-gray-100"
        >
          <RefreshCw size={22} />
        </button>
      )}

      {/* Nút GPS */}
      <button
        onClick={handleLocateMe}
        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 active:scale-90 transition-all border border-gray-100"
      >
        <LocateFixed size={22} />
      </button>
    </div>
  );
};

const FocusUpdater = ({ focusCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (focusCoords && focusCoords.length === 2) {
      // MongoDB trật tự là [Lng, Lat] -> Leaflet cần [Lat, Lng]
      map.flyTo([focusCoords[1], focusCoords[0]], 16);
    }
  }, [focusCoords, map]);
  return null;
};

/** --- MAIN COMPONENT --- **/
const Map = ({ 
  incidents = [], 
  fleet = {}, 
  onMarkerClick, 
  focusCoords,
  onRefresh,
  bottomOffset = 20
}) => {
  const { user } = useSelector((state) => state.auth);
  const [myPos, setMyPos] = useState([21.0285, 105.8048]); // Vị trí mặc định Hà Nội

  // Tự động lấy vị trí khi lần đầu vào
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setMyPos([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  // Logic phân quyền hiển thị sự cố
  const filteredIncidents = useMemo(() => {
    if (user?.role === USER_ROLES.CITIZEN) {
      return incidents.filter(inc => 
        getDistance(myPos, [inc.location.coordinates[1], inc.location.coordinates[0]]) <= 5
      );
    }
    return incidents; 
  }, [incidents, myPos, user?.role]);

  return (
    <div className="h-full w-full relative overflow-hidden">
      <MapContainer 
        center={myPos} 
        zoom={14} 
        className="h-full w-full" 
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Bộ điều khiển tự viết */}
        <FocusUpdater focusCoords={focusCoords} />
        <MapControls setMyPos={setMyPos} onRefresh={onRefresh} bottomOffset={bottomOffset} />

        {/* 1. Marker của tôi */}
        <Marker position={myPos} icon={userIcon}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>

        {/* 2. Hiển thị Đội xe (Cho Dispatcher/Admin) */}
        {(user?.role === USER_ROLES.DISPATCHER || user?.role === USER_ROLES.ADMIN) && 
          Object.values(fleet).map(team => (
            <Marker 
              key={team.teamId} 
              position={[team.lat, team.lng]} 
              icon={team.status === 'AVAILABLE' ? rescueAvailableIcon : rescueBusyIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="font-sans">
                  <p className="font-bold text-sm">{team.teamName}</p>
                  <p className="text-[10px] text-gray-500">Mã: {team.code}</p>
                  <p className={`text-[10px] font-bold ${team.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-500'}`}>
                    ● {team.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Đang bận'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))
        }

        {/* 3. Hiển thị Sự cố */}
        {filteredIncidents.map(inc => (
          <Marker 
            key={inc._id} 
            position={[inc.location.coordinates[1], inc.location.coordinates[0]]} 
            icon={incidentIcon}
            eventHandlers={{ click: () => onMarkerClick?.(inc) }}
          >
            <Popup>
               <p className="font-bold text-xs">{inc.title}</p>
               <p className="text-[10px]">{inc.location.address}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;