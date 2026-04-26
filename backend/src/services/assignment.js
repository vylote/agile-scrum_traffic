const RescueTeam = require('../models/RescueTeam');
const { getRouteAndETA } = require('./geoService');
const { calculateHaversine } = require('../utils/geoUtils');
const { INCIDENT_TO_CAPABILITY, TEAM_CAPABILITIES, RESCUE_TEAM_STATUS } = require('../utils/constants/rescueConstants');
const socketService = require('../services/socket')

exports.findBestRescueTeam = async (incident) => {
    const [lng, lat] = incident.location.coordinates;
    console.log(`\n[THUẬT TOÁN TÌM KIẾM] sự cố: [${incident.code}]`);

    const requiredCapability = INCIDENT_TO_CAPABILITY[incident.type] || TEAM_CAPABILITIES.GENERAL;
    console.log(`Yêu cầu năng lực: [${requiredCapability}] cho loại sự cố [${incident.type}]`);

    // 2. KIỂM TRA HEARTBEAT (Chỉ lấy các đội cập nhật GPS trong vòng 5 phút qua)
    const HEARTBEAT_THRESHOLD_MINUTES = 5;
    const aliveTimeThreshold = new Date(Date.now() - HEARTBEAT_THRESHOLD_MINUTES * 60 * 1000);

    // 3. SIÊU TRUY VẤN MONGODB (Gộp Lọc Vùng + Năng lực + Rảnh rỗi + Heartbeat + Bán kính)
    const query = {
        status: RESCUE_TEAM_STATUS.AVAILABLE,
        zone: incident.zone,
        capabilities: { $in: [requiredCapability] }, //Bắt buộc phải có năng lực phù hợp
        lastLocationUpdate: { $gte: aliveTimeThreshold }, //Heartbeat: Loại bỏ "bóng ma" mất mạng
        _id: { $nin: incident.rejectedTeams || [] },
        currentLocation: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: 60000 
            }
        }
    };

    const nearbyTeams = await RescueTeam.find(query).limit(5);
    console.log(`Tìm thấy ${nearbyTeams.length} đội ĐẠT CHUẨN`);

    if (nearbyTeams.length === 0) return null;

    const onlineTeams = nearbyTeams.filter(team => socketService.isTeamOnline(team._id.toString()));
    
    // Ưu tiên: Đội đang cắm Socket -> Nếu không thì lấy đội thỏa mãn Heartbeat (chờ nhận Push FCM)
    const finalTeam = onlineTeams.length > 0 ? onlineTeams[0] : nearbyTeams[0];
    console.log(`CHỐT ĐỘI: ${finalTeam.name} | Kết nối: ${onlineTeams.length > 0 ? 'Socket Real-time' : 'Firebase Push'}`);

    let eta = 15; 
    let distance = 0;
    
    const [teamLng, teamLat] = finalTeam.currentLocation.coordinates;
    const routeData = await getRouteAndETA(teamLng, teamLat, lng, lat);
    
    if (routeData) {
        eta = routeData.eta;
        distance = routeData.distance;
        console.log(`[OSRM] Quãng đường thực tế: ${(distance/1000).toFixed(1)}km | ETA: ${eta} phút`);
    } else {
        console.log(`[OSRM Lỗi] Dùng ETA mặc định.`);
    }

    return { 
        team: finalTeam,
        eta: eta,
        distance: distance
    };
};