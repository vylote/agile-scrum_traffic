import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockIncidents } from '../utils/mockData';

// --- ĐOẠN CODE BẮT BUỘC ĐỂ FIX LỖI MẤT ICON TRÊN VITE/REACT ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// -------------------------------------------------------------

const Map = () => {
  // Trọng tâm bản đồ đặt tại khu vực Hà Nội (dựa theo mock data)
  const mapCenter = [21.0285, 105.8000]; 

  return (
    // Dùng h-full w-full thay vì px cứng để nó tự co giãn theo container cha
    <div className="h-full w-full absolute inset-0 z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render danh sách sự cố từ Mock Data */}
        {mockIncidents.map((incident) => {
          // MongoDB lưu [Lng, Lat], Leaflet cần [Lat, Lng]
          const [lng, lat] = incident.location.coordinates;
          
          return (
            <Marker key={incident._id} position={[lat, lng]}>
              <Popup>
                <div className="flex flex-col gap-1.5 p-1 min-w-[180px]">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded w-fit uppercase tracking-wide ${
                    incident.severity === 'Nghiêm trọng' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {incident.type} - {incident.severity}
                  </span>
                  <strong className="text-sm mt-1">{incident.title}</strong>
                  <p className="text-xs text-gray-500 m-0">{incident.location.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;