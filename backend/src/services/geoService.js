const axios = require('axios');

// Hàm chuẩn hóa: "Huyện Sóc Sơn" -> "Sóc Sơn", "Quận Cầu Giấy" -> "Cầu Giấy"
const normalizeZoneName = (name) => {
    if (!name) return "Unknown";
    return name
        .replace(/^(Quận|Huyện|Thị xã|Thành phố|Phường|Xã)\s+/i, "")
        .trim();
};

const reverseGeocode = async (lat, lon) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: { lat, lon, format: 'json', addressdetails: 1 },
            headers: { 'User-Agent': 'TrafficIncidentApp/1.0' }
        });

        const addr = response.data.address;
        // OSM trả về Sóc Sơn thường nằm ở 'town' hoặc 'county'
        const rawZone = addr.suburb || addr.district || addr.town || addr.county || addr.city_district || 'Unknown';
        
        return {
            display_name: response.data.display_name,
            zone_detected: normalizeZoneName(rawZone) // Trả về tên đã chuẩn hóa
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return { display_name: 'Địa chỉ không xác định', zone_detected: 'Unknown' };
    }
};

module.exports = { reverseGeocode, normalizeZoneName };