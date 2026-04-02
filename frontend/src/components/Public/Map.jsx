import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react'; // Icon định vị
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- ĐOẠN CODE BẮT BUỘC ĐỂ FIX LỖI MẤT ICON TRÊN VITE/REACT ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// -------------------------------------------------------------

// Hằng số tọa độ mặc định (đặt ngoài component để tránh lỗi lặp)
const defaultCenter = [21.0285, 105.8000];

// Component quản lý Marker hiển thị vị trí
const LocationMarker = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.5 });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-center">
          <p className="font-bold text-sm">Vị trí hiện tại của bạn</p>
        </div>
      </Popup>
    </Marker>
  );
};

// NÚT ĐỊNH VỊ NHANH 
const LocateButton = ({ setPosition }) => {
  const map = useMap();

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos); // Cập nhật state
          map.flyTo(newPos, 16, { duration: 1.5 }); // Bản đồ lướt về vị trí mới
        },
        (err) => {
          alert("Không thể định vị. Vui lòng kiểm tra quyền truy cập GPS trên thiết bị!", err);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <button
      onClick={handleLocateMe}
      // Đã đổi vị trí xuống sát góc dưới cùng bên phải (bottom-8 right-4)
      className="absolute bottom-8 right-4 z-[1000] w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center text-blue-600 hover:bg-gray-50 active:scale-90 transition-all border border-gray-100"
      title="Vị trí của tôi"
    >
      <LocateFixed className="w-6 h-6" />
    </button>
  );
};

// COMPONENT CHÍNH
const Map = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    // Xin quyền GPS khi vừa mở app
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Lỗi lấy GPS:", err.message);
          setPosition(defaultCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setTimeout(() => setPosition(defaultCenter), 0);
    }
  }, []);

  return (
    <div className="h-full w-full absolute inset-0 z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false} // Tắt nút zoom mặc định cho màn hình gọn gàng
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker position={position} />

        {/* Nút định vị nằm gọn gàng ở góc */}
        <LocateButton setPosition={setPosition} />

      </MapContainer>
    </div>
  );
};

export default Map;