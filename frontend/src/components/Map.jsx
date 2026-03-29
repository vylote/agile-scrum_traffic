import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mockIncidents } from '../utils/mockData';

const Map = () => {
  // Trọng tâm bản đồ đặt tại khu vực Từ Sơn
  const mapCenter = [21.1132, 105.9548]; 

  return (
    // Bắt buộc phải có height (h-[500px]) nếu không bản đồ sẽ tàng hình
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render danh sách sự cố từ Mock Data */}
        {mockIncidents.map((incident) => {
          // Lưu ý: MongoDB lưu [Lng, Lat], nhưng Leaflet cần [Lat, Lng]
          const [lng, lat] = incident.location.coordinates;
          
          return (
            <Marker key={incident._id} position={[lat, lng]}>
              <Popup>
                <div className="flex flex-col gap-1 p-1">
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded w-fit">
                    {incident.type} - {incident.severity}
                  </span>
                  <strong className="text-sm mt-1">{incident.title}</strong>
                  <p className="text-xs text-gray-600 m-0">{incident.location.address}</p>
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