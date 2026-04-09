const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../backend/src/models/User');
const RescueTeam = require('../backend/src/models/RescueTeam');
const Incident = require('../backend/src/models/Incident');
const { USER_ROLES } = require('../backend/src/utils/constants/userConstants');
const { RESCUE_TEAM_STATUS } = require('../backend/src/utils/constants/rescueConstants');

const MONGO_URI = 'mongodb://localhost:27017/incident_db';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🚀 Đã kết nối MongoDB. Đang dọn dẹp dữ liệu cũ...');

        await Promise.all([
            User.deleteMany({}),
            RescueTeam.deleteMany({}),
            Incident.deleteMany({})
        ]);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('1', salt);

        // 1. TẠO CITIZEN & DISPATCHER
        await User.create([
            {
                username: 'citizen_vy',
                name: 'Lê Thanh Vy (Citizen)',
                email: 'vy.citizen@gmail.com',
                phone: '0912345678',
                passwordHash,
                role: USER_ROLES.CITIZEN
            },
            {
                username: 'dispatcher_01',
                name: 'Tổng Đài Điều Phối',
                email: 'dispatcher01@sos.vn',
                phone: '0988888888',
                passwordHash,
                role: USER_ROLES.DISPATCHER
            }
        ]);

        // 2. DANH SÁCH CÁC ĐỘI (Sóc Sơn có 2 đội để test tranh chấp)
        const teamConfigs = [
            { name: 'Sóc Sơn Đội 1', zone: 'Sóc Sơn', code: 'SS1', coords: [105.8242, 21.3215] },
            { name: 'Sóc Sơn Đội 2', zone: 'Sóc Sơn', code: 'SS2', coords: [105.8250, 21.3220] },
            { name: 'Cầu Giấy', zone: 'Cầu Giấy', code: 'CG', coords: [105.8048, 21.0285] },
            { name: 'Đống Đa', zone: 'Đống Đa', code: 'DD', coords: [105.8236, 21.0125] }
        ];

        for (let i = 0; i < teamConfigs.length; i++) {
            const config = teamConfigs[i];
            const teamMembersData = [];

            console.log(`🚛 Đang tạo ${config.name} (Zone: ${config.zone})...`);

            // Mỗi đội tạo 2 người thôi cho nhẹ máy (1 Đội trưởng + 1 Thành viên)
            for (let j = 1; j <= 2; j++) {
                const isLeader = j === 1;
                const username = `res_${config.code.toLowerCase()}_0${j}`;
                
                const u = await User.create({
                    username,
                    name: `NV ${config.name} - ${isLeader ? 'Đội trưởng' : 'Thành viên'}`,
                    email: `rescue.${config.code.toLowerCase()}${j}@sos.vn`,
                    phone: `09${i}${j}${Math.floor(Math.random() * 900000)}`,
                    passwordHash,
                    role: USER_ROLES.RESCUE
                });

                teamMembersData.push({
                    userId: u._id,
                    role: isLeader ? 'LEADER' : 'MEMBER'
                });
            }

            const newTeam = await RescueTeam.create({
                name: `Đội Cứu Hộ ${config.name}`,
                code: `TEAM-${config.code}-${Math.floor(Math.random() * 9000)}`,
                type: 'MULTI',
                status: RESCUE_TEAM_STATUS.AVAILABLE,
                currentLocation: {
                    type: 'Point',
                    coordinates: config.coords
                },
                zone: config.zone,
                members: teamMembersData,
                capabilities: ['Sơ cứu', 'Cẩu xe']
            });

            // Cập nhật ngược lại cho User
            await User.updateMany(
                { _id: { $in: teamMembersData.map(m => m.userId) } },
                { rescueTeam: newTeam._id }
            );
        }

        console.log('\n✨ DỮ LIỆU TEST TRANH CHẤP ĐÃ SẴN SÀNG! ✨');
        console.log('------------------------------------------');
        console.log('👉 Tài khoản test tranh chấp (Cùng vùng Sóc Sơn):');
        console.log('1. Đội trưởng 1: res_ss1_01 / mk: 1');
        console.log('2. Đội trưởng 2: res_ss2_01 / mk: 1');
        console.log('------------------------------------------');

        process.exit();
    } catch (err) {
        console.error('❌ Lỗi Seeding:', err);
        process.exit(1);
    }
};

seedData();