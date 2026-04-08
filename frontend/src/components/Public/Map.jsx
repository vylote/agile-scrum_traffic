// [Map.jsx] - Bản hoàn thiện cho 4 Role
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, RefreshCw } from "lucide-react";

/** --- ICONS CONFIG --- **/
const rescueBusyIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048315.png", iconSize: [32, 32], iconAnchor: [16, 32] });
const rescueAvailableIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png", iconSize: [32, 32], iconAnchor: [16, 32] });
const incidentIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/5977/5977626.png", iconSize: [30, 30], iconAnchor: [15, 30] });

/** --- NÚT ĐIỀU KHIỂN --- **/
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
    <div className="absolute flex flex-col gap-3 z-[1000]" style={{ bottom: `${bottomOffset}px`, right: "16px" }}>
      {onRefresh && (
        <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-orange-500 hover:bg-orange-50 border border-gray-100 active:scale-90 pointer-events-auto">
          <RefreshCw size={22} />
        </button>
      )}
      <button onClick={(e) => { e.stopPropagation(); handleLocateMe(); }} className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 border border-gray-100 active:scale-90 pointer-events-auto">
        <LocateFixed size={22} />
      </button>
    </div>
  );
};

const FocusUpdater = ({ focusCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (focusCoords && focusCoords.length === 2) {
      map.flyTo([focusCoords[1], focusCoords[0]], 16, { animate: true });
    }
  }, [focusCoords, map]);
  return null;
};

const Map = ({ incidents = [], fleet = {}, onMarkerClick, focusCoords, onRefresh, bottomOffset = 20 }) => {
  // Tọa độ mặc định tại Hà Nội
  const [centerPos] = useState([21.0285, 105.8542]);

  return (
    <div className="h-full w-full relative overflow-hidden">
      <MapContainer center={centerPos} zoom={14} className="h-full w-full" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FocusUpdater focusCoords={focusCoords} />
        <MapControls onRefresh={onRefresh} bottomOffset={bottomOffset} />

        {/* 1. Marker Sự cố (Vẽ trước - nằm dưới) */}
        {incidents.map(inc => (
          <Marker 
            key={inc._id} 
            position={[inc.location.coordinates[1], inc.location.coordinates[0]]} 
            icon={incidentIcon}
            zIndexOffset={500}
            eventHandlers={{ click: () => onMarkerClick?.(inc) }}
          />
        ))}

        {/* 2. Marker Đội xe (Vẽ sau - đè lên trên) */}
        {Object.values(fleet).map(team => {
            const lat = parseFloat(team.lat || team.currentLocation?.coordinates?.[1]);
            const lng = parseFloat(team.lng || team.currentLocation?.coordinates?.[0]);
            if (!lat || !lng) return null;

            return (
              <Marker 
                key={`${team.teamId || team._id}-${lat}-${lng}`} 
                position={[lat, lng]} 
                icon={team.status === 'AVAILABLE' ? rescueAvailableIcon : rescueBusyIcon}
                zIndexOffset={2000}
              >
                <Popup><p className="font-bold text-xs">{team.teamName || team.code}</p></Popup>
              </Marker>
            );
          })
        }
      </MapContainer>
    </div>
  );
};

export default Map;