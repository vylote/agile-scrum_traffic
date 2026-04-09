// src/services/assignment.js
const axios = require('axios');
const RescueTeam = require('../models/RescueTeam');
const { getHaversineDistance } = require('../utils/geoUtils');
const { RESCUE_TEAM_STATUS } = require('../utils/constants/rescueConstants');

// Helper function to call OSRM
const getOSRMRouteETA = async (startLng, startLat, endLng, endLat) => {
    try {
        const osrmUrl = process.env.OSRM_URL || 'http://router.project-osrm.org';
        const url = `${osrmUrl}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
        
        const response = await axios.get(url, { timeout: 2000 }); // Set timeout to fail fast
        
        if (response.data && response.data.code === 'Ok' && response.data.routes.length > 0) {
            return response.data.routes[0].duration; // Duration in seconds
        }
        return Infinity;
    } catch (error) {
        console.error(`[OSRM Error] Không thể lấy ETA:`, error.message);
        return Infinity;
    }
};

/**
 * Tìm đội cứu hộ tối ưu nhất cho sự cố.
 * @param {Object} incident - Object sự cố
 * @param {Number} maxRadius - Bán kính tìm kiếm tối đa (mét)
 * @param {Number} shortlistLimit - Số lượng đội lọt vào vòng xét duyệt OSRM
 */
exports.findBestRescueTeam = async (incident, maxRadius = 15000, shortlistLimit = 5) => {
    const incidentLng = incident.location.coordinates[0];
    const incidentLat = incident.location.coordinates[1];
    const requiredType = incident.type;

    // BƯỚC 1: Lọc thô bằng MongoDB $near (Haversine tích hợp sẵn)
    // Cách này nhanh và hiệu quả hơn việc kéo hết DB về rỗi tự tính bằng file utils
    const availableTeams = await RescueTeam.find({
        status: RESCUE_TEAM_STATUS.AVAILABLE,
        // Giả sử bảng RescueTeam có field capabilities chứa mảng các loại sự cố có thể xử lý
        // Nếu không có, bạn có thể bỏ dòng này hoặc sửa logic match Type
        // capabilities: { $in: [requiredType] },
        currentLocation: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [incidentLng, incidentLat]
                },
                $maxDistance: maxRadius
            }
        }
    }).limit(shortlistLimit);

    if (availableTeams.length === 0) {
        return null; // Không có đội nào rảnh gần đây
    }

    // BƯỚC 2: Chọn lọc chính xác bằng OSRM (Định tuyến đường bộ)
    let bestTeam = null;
    let shortestETA = Infinity;

    // Gọi OSRM song song cho tất cả các đội trong danh sách rút gọn
    const etaPromises = availableTeams.map(async (team) => {
        const teamLng = team.currentLocation.coordinates[0];
        const teamLat = team.currentLocation.coordinates[1];
        
        const etaSeconds = await getOSRMRouteETA(teamLng, teamLat, incidentLng, incidentLat);
        
        return { team, eta: etaSeconds };
    });

    const results = await Promise.all(etaPromises);

    // Tìm đội có ETA nhỏ nhất
    for (const result of results) {
        if (result.eta < shortestETA) {
            shortestETA = result.eta;
            bestTeam = result.team;
        }
    }

    // Trả về null nếu không tìm được đường bộ thực tế (ví dụ: bị ngăn cách bởi sông không cầu)
    if (!bestTeam || shortestETA === Infinity) {
        return null;
    }

    return {
        team: bestTeam,
        etaMinutes: Math.round(shortestETA / 60)
    };
};