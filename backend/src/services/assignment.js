const axios = require('axios');
const RescueTeam = require('../models/RescueTeam');
const { RESCUE_TEAM_STATUS } = require('../utils/constants/rescueConstants');

// Helper: Gọi OSRM lấy ETA (Thời gian di chuyển thực tế)
const getOSRMRouteETA = async (startLng, startLat, endLng, endLat) => {
    try {
        const osrmUrl = process.env.OSRM_URL || 'http://router.project-osrm.org';
        const url = `${osrmUrl}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
        
        const response = await axios.get(url, { timeout: 2000 }); // Ép timeout 2s để không làm treo queue
        if (response.data && response.data.code === 'Ok' && response.data.routes.length > 0) {
            return response.data.routes[0].duration; // Trả về số giây
        }
        return Infinity;
    } catch (error) {
        console.error(`[OSRM Error] Không thể lấy ETA:`, error.message);
        return Infinity;
    }
};

/**
 * Tìm đội cứu hộ tối ưu nhất (Kết hợp Haversine của MongoDB & OSRM)
 * @param {Object} incident - Object sự cố
 * @param {Array} rejectedTeamIds - Mảng ID các đội đã từ chối ca này
 */
exports.findBestRescueTeam = async (incident, rejectedTeamIds = []) => {
    const incidentLng = incident.location.coordinates[0];
    const incidentLat = incident.location.coordinates[1];
    const requiredType = incident.type;

    // BƯỚC 1: SÀNG LỌC BẰNG MONGODB $near (HAVERSINE)
    const query = {
        status: RESCUE_TEAM_STATUS.AVAILABLE,
        _id: { $nin: rejectedTeamIds }, // 🚀 Bỏ qua các đội đã từ chối
        currentLocation: {
            $near: {
                $geometry: { type: "Point", coordinates: [incidentLng, incidentLat] },
                $maxDistance: 15000 // Bán kính 15km
            }
        }
    };

    // Lấy top 5 đội rảnh và gần nhất theo đường chim bay
    const availableTeams = await RescueTeam.find(query).limit(5);

    if (availableTeams.length === 0) return null;

    // BƯỚC 2: CHỌN LỌC CHÍNH XÁC BẰNG OSRM
    let bestTeam = null;
    let shortestETA = Infinity;

    // Chạy song song OSRM cho cả 5 đội để đảm bảo tốc độ < 300ms
    const etaPromises = availableTeams.map(async (team) => {
        const teamLng = team.currentLocation.coordinates[0];
        const teamLat = team.currentLocation.coordinates[1];
        const etaSeconds = await getOSRMRouteETA(teamLng, teamLat, incidentLng, incidentLat);
        return { team, eta: etaSeconds };
    });

    const results = await Promise.all(etaPromises);

    // Lấy đội có ETA (thời gian đến) nhỏ nhất
    for (const result of results) {
        if (result.eta < shortestETA) {
            shortestETA = result.eta;
            bestTeam = result.team;
        }
    }

    if (!bestTeam || shortestETA === Infinity) return null;

    return {
        team: bestTeam,
        etaMinutes: Math.round(shortestETA / 60)
    };
};