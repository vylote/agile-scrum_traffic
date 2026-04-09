/**
 * Tính khoảng cách đường chim bay giữa 2 điểm tọa độ bằng công thức Haversine.
 * @param {Object} coord1 - Tọa độ điểm 1 { lat: Number, lng: Number }
 * @param {Object} coord2 - Tọa độ điểm 2 { lat: Number, lng: Number }
 * @returns {Number} - Khoảng cách tính bằng mét (m)
 */
exports.getHaversineDistance = (coord1, coord2) => {
    if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) {
        return Infinity;
    }

    const R = 6371e3; // Bán kính Trái Đất (mét)
    const lat1 = coord1.lat * Math.PI / 180;
    const lat2 = coord2.lat * Math.PI / 180;
    const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const deltaLng = (coord2.lng - coord1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
};