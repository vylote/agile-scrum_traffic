const axios = require('axios');

const normalizeZoneName = (name) => {
    if (!name) return "Unknown";
    let normalized = name
        .replace(/^(Quận|Huyện|Thị xã|Thành phố|Phường|Xã)\s+/i, "")
        .trim();

    const wardToDistrictMap = {
        "Láng": "Đống Đa",
        "Láng Thượng": "Đống Đa",
        "Láng Hạ": "Đống Đa",
        "Ngọc Khánh": "Ba Đình",
        "Mai Dịch": "Cầu Giấy",
        "Dịch Vọng": "Cầu Giấy"
    };

    return wardToDistrictMap[normalized] || normalized;
};

const reverseGeocode = async (lat, lon) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: { lat, lon, format: 'json', addressdetails: 1 },
            headers: { 'User-Agent': 'TrafficIncidentApp/1.0' }
        });

        const addr = response.data.address;

        const rawZone = 
            addr.city_district || 
            addr.county || 
            addr.district || 
            addr.suburb || 
            addr.town || 
            addr.city || 
            'Unknown';

        const finalZone = normalizeZoneName(rawZone);

        return {
            display_name: response.data.display_name,
            zone_detected: finalZone
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return { display_name: 'Địa chỉ không xác định', zone_detected: 'Unknown' };
    }
};

//open source routing machine 
const getRouteAndETA = async (startLng, startLat, endLng, endLat) => {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
        
        const response = await axios.get(url, { timeout: 3000 });
        
        if (response.data.code === 'Ok' && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            return {
                distance: route.distance, // Khoảng cách (mét)
                duration: route.duration, // Thời gian (giây)
                eta: Math.ceil(route.duration / 60) // Quy ra phút
            };
        }
        return null;
    } catch (error) {
        console.error("OSRM Error:", error.message);
        return null;
    }
};

module.exports = { reverseGeocode, normalizeZoneName, getRouteAndETA };