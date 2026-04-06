import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useSelector } from "react-redux";
import { LocateFixed, RefreshCw } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import socket from "../../services/socket";
import { USER_ROLES } from "../../utils/constants/userConstants";

// Fix icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/** --- KHAI BÁO CÁC LOẠI ICON --- **/
const rescueSelfIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png",
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

const rescueAvailableIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png", // Xe xanh/trống
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const rescueBusyIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png", // Xe đỏ/bận
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const incidentIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/5977/5977626.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

/** --- CÁC SUB-COMPONENT HỖ TRỢ --- **/

const CitizenSelectionLayer = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const FirstLoadCentering = ({ position }) => {
  const map = useMap();
  const hasCentered = useRef(false);
  useEffect(() => {
    if (!hasCentered.current && position[0] !== 21.0285) {
      map.setView(position, 15);
      hasCentered.current = true;
    }
  }, [position, map]);
  return null;
};

const FocusUpdater = ({ focusCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (focusCoords && focusCoords.length === 2) {
      // MongoDB [Lng, Lat] -> Leaflet [Lat, Lng]
      map.flyTo([focusCoords[1], focusCoords[0]], 16, { duration: 0.6 });
    }
  }, [focusCoords, map]);
  return null;
};

const LocateButton = ({ userRole, currentPosition, setPosition, offset, rightOffset }) => {
  const map = useMap();
  const handleLocateMe = () => {
    if (userRole === USER_ROLES.RESCUE) {
      map.flyTo(currentPosition, 16, { duration: 0.8 });
    } else {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          map.flyTo(newPos, 16, { duration: 1.0 });
        }, null, { enableHighAccuracy: true });
      }
    }
  };
  return (
    <button
      type="button"
      onClick={handleLocateMe}
      style={{ bottom: `${offset}px`, right: `${rightOffset ?? offset}px` }}
      className="absolute z-[1000] w-[44px] h-[44px] bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#0088FF] border border-gray-100"
    >
      <LocateFixed className="w-[22px] h-[22px]" />
    </button>
  );
};

const RefreshButton = ({ onRefresh, offset, rightOffset }) => {
  const [isRotating, setIsRotating] = useState(false);
  const handleClick = () => {
    setIsRotating(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRotating(false), 700);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ bottom: `${offset + 56}px`, right: `${rightOffset ?? offset}px` }}
      className="absolute z-[1000] w-[44px] h-[44px] bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-orange-500 border border-gray-100"
    >
      <RefreshCw className={`w-[20px] h-[20px] ${isRotating ? "animate-spin" : ""}`} />
    </button>
  );
};

/** --- MAIN COMPONENT --- **/

const Map = ({
  mode = "view",
  incidents = [],
  onLocationSelect,
  activeIncident = null,
  onMarkerClick,
  fleet = {}, // Nhận data từ useSocket của Dispatcher {teamId: {lat, lng, status, teamName}}
  bottomOffset = 16,
  rightOffset = 16,
  onRefresh,
  focusCoords,
}) => {
  const { user } = useSelector((state) => state.auth);
  const [position, setPosition] = useState([21.0285, 105.8]);
  const [rescuePos, setRescuePos] = useState(null);

  // GPS Tracking cho chính xe Rescue đang đăng nhập
  useEffect(() => {
    if (user?.role === USER_ROLES.RESCUE && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        null,
        { maximumAge: 60000, timeout: 5000 }
      );
      const id = navigator.geolocation.watchPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Lỗi GPS:", err),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, [user]);

  // Lắng nghe vị trí xe cứu hộ cho Người dân (Mode Tracking)
  useEffect(() => {
    if (mode === "tracking" && activeIncident) {
      socket.on("rescue:location_client", (data) => setRescuePos([data.lat, data.lng]));
      return () => socket.off("rescue:location_client");
    }
  }, [mode, activeIncident]);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={position} zoom={14} className="h-full w-full" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FirstLoadCentering position={position} />
        <FocusUpdater focusCoords={focusCoords} />

        {/* 1. TRACKING MODE (Dành cho Người dân xem xe đang đến) */}
        {mode === "tracking" && activeIncident && (
          <>
            <Marker position={[activeIncident.location.coordinates[1], activeIncident.location.coordinates[0]]} icon={incidentIcon}>
              <Popup>Vị trí sự cố của bạn</Popup>
            </Marker>
            {rescuePos && (
              <Marker position={rescuePos} icon={rescueSelfIcon}>
                <Popup>Xe cứu hộ đang đến!</Popup>
              </Marker>
            )}
          </>
        )}

        {/* 2. RESCUE & DISPATCHER MODE */}
        {(user?.role === USER_ROLES.RESCUE || user?.role === USER_ROLES.DISPATCHER || user?.role === USER_ROLES.ADMIN) && (
          <>
            {/* Hiển thị chính mình (Nếu là Rescue) */}
            {user?.role === USER_ROLES.RESCUE && (
              <Marker position={position} icon={rescueSelfIcon} zIndexOffset={10}>
                <Popup>Vị trí của bạn (Đội cứu hộ)</Popup>
              </Marker>
            )}

            {/* 🔥 HIỂN THỊ FLEET (Toàn bộ đội xe) - Chỉ cho Dispatcher/Admin */}
            {(user?.role === USER_ROLES.DISPATCHER || user?.role === USER_ROLES.ADMIN) && 
              Object.values(fleet).map((team) => (
                <Marker 
                  key={team.teamId} 
                  position={[team.lat, team.lng]} 
                  icon={team.status === 'AVAILABLE' ? rescueAvailableIcon : rescueBusyIcon}
                  zIndexOffset={50}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{team.teamName}</p>
                      <p className="text-xs">Trạng thái: {team.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Đang bận'}</p>
                    </div>
                  </Popup>
                </Marker>
              ))
            }

            {/* 🔥 HIỂN THỊ CÁC SỰ CỐ (Markers) */}
            {incidents.map((inc) => (
              <Marker
                key={inc._id}
                position={[inc.location.coordinates[1], inc.location.coordinates[0]]}
                icon={incidentIcon}
                // Ưu tiên SOS (Critical) nổi trên cùng
                zIndexOffset={inc.severity === "CRITICAL" ? 2000 : 1000}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(inc)
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className={`font-bold ${inc.severity === 'CRITICAL' ? 'text-red-600' : 'text-blue-600'}`}>
                      {inc.severity === 'CRITICAL' ? '⚠️ SOS KHẨN CẤP' : inc.title}
                    </p>
                    <p className="text-xs text-gray-600">{inc.location.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Sự cố đang thực hiện (Dành cho Rescue) */}
            {activeIncident && (
              <Marker
                position={[activeIncident.location.coordinates[1], activeIncident.location.coordinates[0]]}
                icon={incidentIcon}
                zIndexOffset={1500}
              >
                <Popup>Hiện trường cần đến</Popup>
              </Marker>
            )}
          </>
        )}

        {/* 3. REPORT MODE (Dành cho người dân chấm điểm báo cáo) */}
        {mode === "report" && onLocationSelect && (
          <CitizenSelectionLayer onLocationSelect={(pos) => {
            setPosition(pos);
            onLocationSelect(pos);
          }} />
        )}

        {/* --- CÁC NÚT ĐIỀU KHIỂN --- */}
        <LocateButton userRole={user?.role} currentPosition={position} setPosition={setPosition} offset={bottomOffset} rightOffset={rightOffset} />
        
        {onRefresh && (
          <RefreshButton onRefresh={onRefresh} offset={bottomOffset} rightOffset={rightOffset} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;