import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { LocateFixed } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- FIX LỖI ICON MẶC ĐỊNH TRÊN MÔI TRƯỜNG VITE ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- LAYER CHỌN VỊ TRÍ (CHỈ CHO CITIZEN KHI BÁO CÁO) ---
const CitizenSelectionLayer = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// --- NÚT ĐỊNH VỊ GPS VỚI LỀ BOTTOM = RIGHT ---
const LocateButton = ({ setPosition, offset, rightOffset }) => {
  const map = useMap();
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          map.flyTo(newPos, 16, { duration: 1.5 });
        },
        (err) => console.error("Lỗi GPS:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleLocateMe}
      // Áp dụng style inline để lề dưới và lề phải luôn bằng nhau
      style={{ 
        bottom: `${offset}px`, 
        right: `${rightOffset ?? offset}px` 
      }}
      className="absolute z-[1000] w-12 h-12 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#0088FF] active:scale-90 transition-all border border-gray-100"
    >
      <LocateFixed className="w-6 h-6" />
    </button>
  );
};

// --- COMPONENT CHÍNH ---
const Map = ({ 
  mode = 'view',            // 'view' hoặc 'report'
  incidents = [],           // Danh sách sự cố (cho Dispatcher)
  onLocationSelect,         // Hàm nhận tọa độ từ Map (cho Citizen Report)
  bottomOffset = 16,
  rightOffset = 16       // Khoảng cách lề (mặc định 16px)
}) => {
  const { user } = useSelector((state) => state.auth);
  // Tọa độ mặc định: Hà Nội
  const [position, setPosition] = useState([21.0285, 105.8000]);

  // Đồng bộ vị trí ban đầu nếu được cấp quyền GPS
  useEffect(() => {
    if ("geolocation" in navigator && mode === 'view') {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, [mode]);

  return (
    <div className="h-full w-full relative z-0"> 
      <MapContainer 
        center={position} 
        zoom={14} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* --- LOGIC DÀNH CHO NGƯỜI DÂN (CITIZEN) --- */}
        {user?.role === 'CITIZEN' && (
          <>
            <Marker position={position}>
              <Popup>Vị trí bạn chọn</Popup>
            </Marker>
            
            {/* Kích hoạt khả năng click chọn vị trí nếu đang ở mode report */}
            {mode === 'report' && onLocationSelect && (
              <CitizenSelectionLayer onLocationSelect={(pos) => {
                setPosition(pos); // Cập nhật Marker cục bộ trên Map
                onLocationSelect(pos); // Trả tọa độ về Form component cha
              }} />
            )}
          </>
        )}
        
        {/* --- LOGIC DÀNH CHO ĐIỀU PHỐI VIÊN (DISPATCHER) --- */}
        {user?.role === 'DISPATCHER' && incidents.map(inc => {
          // Lưu ý: MongoDB lưu [lng, lat], Leaflet cần [lat, lng]
          const coords = inc.location?.coordinates;
          if (!coords) return null;
          
          return (
            <Marker key={inc._id} position={[coords[1], coords[0]]}>
               <Popup>
                  <div className="p-1">
                    <p className="font-bold text-sm mb-1">{inc.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{inc.severity}</p>
                  </div>
               </Popup>
            </Marker>
          );
        })}
        <LocateButton setPosition={setPosition} offset={bottomOffset} rightOffset={rightOffset} />
      </MapContainer>
    </div>
  );
};

export default Map;