/**
 * Tính khoảng cách giữa 2 điểm (m)
 * @param {Object} pos1 {lat, lng}
 * @param {Object} pos2 {lat, lng}
 */
export const getHaversineDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 999999;
    
    const R = 6371000; // Bán kính Trái Đất (mét)
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};