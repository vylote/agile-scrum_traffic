const RescueTeam = require('../models/RescueTeam');
const socketService = require('./socket');

exports.findBestRescueTeam = async (incident) => {
    const [lng, lat] = incident.location.coordinates;
    console.log(`\n--- 🔍 [LOG TÌM ĐỘI] BẮT ĐẦU ---`);

    // 1. Log thử xem trong DB có tổng cộng bao nhiêu đội rảnh (không phân biệt khoảng cách)
    const allAvailable = await RescueTeam.find({ status: 'AVAILABLE' });
    console.log(`📊 Tổng số đội đang có status AVAILABLE trong DB: ${allAvailable.length}`);
    allAvailable.forEach(t => console.log(`   - Đội: ${t.name} | ID: ${t._id} | Tọa độ: ${t.currentLocation.coordinates}`));

    const teams = await RescueTeam.find({ status: 'AVAILABLE', zone: incident.zone });
    console.log(`🔎 Tìm thấy ${teams.length} đội AVAILABLE trong vùng ${incident.zone}`);

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

    // 3. Lọc Online (CẢI TIẾN)
    const onlineTeams = nearbyTeams.filter(team => {
        const isOnline = socketService.isTeamOnline(team._id.toString());
        console.log(`   -> Đội: ${team.name} | Online: ${isOnline ? '✅ YES' : '❌ NO'}`);
        return isOnline;
    });

    // 🔥 CHIẾN THUẬT CHO BUỔI BẢO VỆ:
    // Nếu có đội Online thì lấy đội Online gần nhất.
    // Nếu KHÔNG có ai Online nhưng có đội AVAILABLE trong DB, vẫn lấy đội đó (vì đã có FCM lo)
    const finalTeam = onlineTeams.length > 0 ? onlineTeams[0] : nearbyTeams[0];

    if (!finalTeam) return null;

    console.log(`✅ CHỐT ĐỘI: ${finalTeam.name} (${onlineTeams.length > 0 ? 'Socket' : 'FCM Only'})`);
    return { team: finalTeam };
};