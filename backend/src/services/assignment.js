const RescueTeam = require('../models/RescueTeam');
const socketService = require('./socket');

exports.findBestRescueTeam = async (incident) => {
    const [lng, lat] = incident.location.coordinates;
    console.log(`\n--- 🔍 [LOG TÌM ĐỘI] BẮT ĐẦU ---`);

    // 1. Log thử xem trong DB có tổng cộng bao nhiêu đội rảnh (không phân biệt khoảng cách)
    const allAvailable = await RescueTeam.find({ status: 'AVAILABLE' });
    console.log(`📊 Tổng số đội đang có status AVAILABLE trong DB: ${allAvailable.length}`);
    allAvailable.forEach(t => console.log(`   - Đội: ${t.name} | ID: ${t._id} | Tọa độ: ${t.currentLocation.coordinates}`));

    // 2. Thực hiện tìm kiếm theo vị trí (Tăng bán kính lên 100km để test)
    const query = {
        status: 'AVAILABLE',
        _id: { $nin: incident.rejectedTeams || [] },
        currentLocation: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: 100000 // Tạm thời tăng lên 100km để chắc chắn tìm thấy
            }
        }
    };

    const nearbyTeams = await RescueTeam.find(query).limit(10);
    console.log(`🔎 [DB Search] Tìm thấy ${nearbyTeams.length} đội trong bán kính 100km.`);

    // 3. Lọc Online
    const onlineTeams = nearbyTeams.filter(team => {
        const isOnline = socketService.isTeamOnline(team._id.toString());
        console.log(`   -> Đội: ${team.name} | Online: ${isOnline ? '✅ YES' : '❌ NO'}`);
        return isOnline;
    });

    if (onlineTeams.length === 0) return null;

    console.log(`✅ CHỐT ĐỘI: ${onlineTeams[0].name}`);
    return { team: onlineTeams[0] };
};