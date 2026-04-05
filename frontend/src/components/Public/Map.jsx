import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { LocateFixed, RefreshCw } from 'lucide-react'; // Thêm icon RefreshCw
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../../services/socket'; 
import { USER_ROLES } from '../../utils/constants/userConstants';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const rescueIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png',
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

const incidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/5977/5977626.png', 
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const CitizenSelectionLayer = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// 1. TỰ ĐỘNG BAY VỀ KHI VỪA MỞ APP
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

// 🔥 2. BỘ ĐỘNG CƠ BAY (Khi vuốt Slider, tọa độ chạy vào đây để map bay theo)
const FocusUpdater = ({ focusCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (focusCoords && focusCoords.length === 2) {
      // GeoJSON của MongoDB lưu [Kinh độ, Vĩ độ], nhưng Leaflet cần [Vĩ độ, Kinh độ]
      map.flyTo([focusCoords[1], focusCoords[0]], 16, { duration: 0.6 });
    }
  }, [focusCoords, map]);
  return null;
};

// 3. NÚT ĐỊNH VỊ GPS
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
      className="absolute z-[1000] w-[44px] h-[44px] bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#0088FF] active:bg-blue-50 transition-all border border-gray-100"
    >
      <LocateFixed className="w-[22px] h-[22px]" />
    </button>
  );
};

// 🔥 4. NÚT REFRESH (Nằm trên nút GPS)
const RefreshButton = ({ onRefresh, offset, rightOffset }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = () => {
    setIsRotating(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRotating(false), 700); // Hiệu ứng xoay
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      // Nằm cách nút GPS 56px (44px chiều cao + 12px khoảng cách)
      style={{ bottom: `${offset + 56}px`, right: `${rightOffset ?? offset}px` }}
      className="absolute z-[1000] w-[44px] h-[44px] bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-orange-500 active:bg-orange-50 transition-all border border-gray-100"
    >
      <RefreshCw className={`w-[20px] h-[20px] ${isRotating ? 'animate-spin' : ''}`} />
    </button>
  );
};


const Map = ({ 
  mode = 'view',            
  incidents = [],           
  onLocationSelect,         
  activeIncident = null,    
  onMarkerClick,            
  bottomOffset = 16,
  rightOffset = 16,
  onRefresh,       // <-- Thêm prop
  focusCoords      // <-- Thêm prop
}) => {
  const { user } = useSelector((state) => state.auth);
  const [position, setPosition] = useState([21.0285, 105.8000]); 
  const [rescuePos, setRescuePos] = useState(null); 

  useEffect(() => {
    if (user?.role === USER_ROLES.RESCUE && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      }, null, { maximumAge: 60000, timeout: 5000 });

      const id = navigator.geolocation.watchPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Lỗi GPS:", err),
        { enableHighAccuracy: true, distanceFilter: 10 } 
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, [user]);

  useEffect(() => {
    if (mode === 'tracking' && activeIncident) {
      socket.on('rescue:location_client', (data) => setRescuePos([data.lat, data.lng]));
      return () => socket.off('rescue:location_client');
    }
  }, [mode, activeIncident]);

  return (
    <div className="h-full w-full relative z-0"> 
      <MapContainer center={position} zoom={14} className="h-full w-full" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <FirstLoadCentering position={position} /> 
        <FocusUpdater focusCoords={focusCoords} /> {/* Gắn động cơ bay vào đây */}

        {/* TRACKING MODE */}
        {mode === 'tracking' && activeIncident && (
          <>
            <Marker position={[activeIncident.location.coordinates[1], activeIncident.location.coordinates[0]]} icon={incidentIcon}>
              <Popup>Vị trí sự cố của bạn</Popup>
            </Marker>
            {rescuePos && (
              <Marker position={rescuePos} icon={rescueIcon}>
                <Popup>Xe cứu hộ đang đến!</Popup>
              </Marker>
            )}
          </>
        )}

        {/* RESCUE & DISPATCHER MODE */}
        {(user?.role === USER_ROLES.RESCUE || user?.role === USER_ROLES.DISPATCHER) && (
          <>
            {user?.role === USER_ROLES.RESCUE && (
               <Marker position={position} icon={rescueIcon} zIndexOffset={10}>
                 <Popup>Vị trí của bạn(XE CỨU HỘ)</Popup>
               </Marker>
            )}

            {incidents.map(inc => {
              const coords = inc.location?.coordinates;
              return coords ? (
                <Marker 
                  key={inc._id} 
                  position={[coords[1], coords[0]]}
                  icon={incidentIcon}
                  zIndexOffset={1000} // 🔥 Sự cố luôn trồi lên trên
                  eventHandlers={{ click: () => { if (onMarkerClick) onMarkerClick(inc); } }}
                />
              ) : null;
            })}

            {activeIncident && (
               <Marker 
                position={[activeIncident.location.coordinates[1], activeIncident.location.coordinates[0]]}
                icon={incidentIcon}
                zIndexOffset={1000}
               >
                 <Popup>Hiện trường cần đến</Popup>
               </Marker>
            )}
          </>
        )}

        {mode === 'report' && onLocationSelect && (
          <CitizenSelectionLayer onLocationSelect={(pos) => {
            setPosition(pos);
            onLocationSelect(pos);
          }} />
        )}

        <LocateButton userRole={user?.role} currentPosition={position} setPosition={setPosition} offset={bottomOffset} rightOffset={rightOffset} />
        
        {/* Render nút Refresh nếu được truyền onRefresh */}
        {onRefresh && (
          <RefreshButton onRefresh={onRefresh} offset={bottomOffset} rightOffset={rightOffset} />
        )}

      </MapContainer>
    </div>
  );
};

export default Map;