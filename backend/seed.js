const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../backend/src/models/User'); 
const RescueTeam = require('../backend/src/models/RescueTeam');
const Incident = require('../backend/src/models/Incident'); // Thêm để dọn sạch sự cố cũ
const { USER_ROLES } = require('../backend/src/utils/constants/userConstants');
const { RESCUE_TEAM_STATUS } = require('../backend/src/utils/constants/rescueConstants');

const MONGO_URI = 'mongodb://localhost:27017/incident_db';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🚀 Đã kết nối MongoDB. Đang dọn dẹp "chiến trường"...');

        // 1. DỌN SẠCH DỮ LIỆU ĐỂ TRÁNH TRÙNG LẶP
        await Promise.all([
            User.deleteMany({}),
            RescueTeam.deleteMany({}),
            Incident.deleteMany({})
        ]);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('1', salt);

        // 2. TẠO 01 CITIZEN (Người dân)
        await User.create({
            username: 'citizen_vy',
            name: 'Lê Thanh Vy (Citizen)',
            email: 'vy.citizen@gmail.com',
            phone: '0912345678',
            passwordHash,
            role: USER_ROLES.CITIZEN
        });
        console.log('✅ Đã tạo Citizen: citizen_vy');

        // 3. TẠO 01 DISPATCHER (Điều phối viên)
        await User.create({
            username: 'dispatcher_01',
            name: 'Tổng Đài Điều Phối',
            email: 'dispatcher01@sos.vn',
            phone: '0988888888',
            passwordHash,
            role: USER_ROLES.DISPATCHER
        });
        console.log('✅ Đã tạo Dispatcher: dispatcher_01');

        // 4. DANH SÁCH KHU VỰC (Gọt sạch tiền tố Quận/Huyện)
        const districts = [
            { name: 'Cầu Giấy', code: 'CG', coords: [105.8048, 21.0285] },
            { name: 'Ba Đình', code: 'BD', coords: [105.8130, 21.0360] },
            { name: 'Hoàn Kiếm', code: 'HK', coords: [105.8523, 21.0287] },
            { name: 'Sóc Sơn', code: 'SS', coords: [105.8242, 21.3215] }
        ];

        for (let i = 0; i < districts.length; i++) {
            const district = districts[i];
            const teamMembersData = [];

            console.log(`🚛 Đang khởi tạo đội xe tại ${district.name}...`);

            // Tạo 5 User cho mỗi đội (1 Leader + 4 Member)
            for (let j = 1; j <= 5; j++) {
                const roleInTeam = j === 1 ? 'LEADER' : 'MEMBER';
                
                const u = await User.create({
                    username: `res_${district.code.toLowerCase()}_0${j}`,
                    name: `NV ${district.name} - ${roleInTeam === 'LEADER' ? 'Đội trưởng' : 'Thành viên ' + j}`,
                    email: `rescue.${district.code.toLowerCase()}${j}@sos.vn`,
                    phone: `09${i}${j}778899`,
                    passwordHash,
                    role: USER_ROLES.RESCUE
                });

                teamMembersData.push({
                    userId: u._id,
                    role: roleInTeam
                });
            }

            // Tạo RescueTeam (Lưu zone là tên thuần khiết)
            const newTeam = await RescueTeam.create({
                name: `Đội Cứu Hộ ${district.name}`,
                code: `TEAM-${district.code}-${Date.now().toString().slice(-4)}`,
                type: 'MULTI',
                status: RESCUE_TEAM_STATUS.AVAILABLE,
                currentLocation: {
                    type: 'Point',
                    coordinates: district.coords // [lng, lat]
                },
                zone: district.name, // 🔥 CHỐT: Chỉ lưu "Sóc Sơn", không lưu "Quận Sóc Sơn"
                members: teamMembersData,
                capabilities: ['Sơ cứu', 'Cẩu xe', 'Tiếp xăng']
            });

            // Gán Team ID ngược lại cho 5 User
            const userIds = teamMembersData.map(m => m.userId);
            await User.updateMany(
                { _id: { $in: userIds } },
                { rescueTeam: newTeam._id }
            );

            console.log(`   └─ Xong Đội ${district.name} với 5 nhân sự.`);
        }

        console.log('\n✨ HỆ THỐNG ĐÃ SẴN SÀNG! ✨');
        console.log('-------------------------------');
        console.log('Mật khẩu đăng nhập tất cả: 1');
        console.log('Citizen: citizen_vy');
        console.log('Dispatcher: dispatcher_01');
        console.log('Sóc Sơn Leader: res_ss_01');
        
        process.exit();
    } catch (err) {
        console.error('❌ Lỗi Seeding:', err);
        process.exit(1);
    }
};

seedData();