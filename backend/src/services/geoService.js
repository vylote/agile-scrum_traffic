const axios = require('axios');

// Hàm chuẩn hóa: "Huyện Sóc Sơn" -> "Sóc Sơn", "Quận Cầu Giấy" -> "Cầu Giấy"
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

module.exports = { reverseGeocode, normalizeZoneName };