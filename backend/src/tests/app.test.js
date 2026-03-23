const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const geoService = require('../services/geoService');
const path = require('path');
const fs = require('fs');
const User = require('../models/Users');
const Incident = require('../models/Incident');

require('dotenv').config();

describe('🚀 TIMS - KIỂM THỬ TÍCH HỢP TOÀN DIỆN (SPRINT 1)', () => {

    let citizenToken = '';
    let adminToken = '';
    let dispatcherToken = '';
    let existId = '';
    let existCode = '';

    const mockAddress = "3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội, Vietnam";
    const fixturePath = path.join(__dirname, './fixtures/accident.jpg');

    const citizenUser = {
        username: `citizen_${Date.now()}`,
        password: 'Password123!',
        name: 'Nguyen Van A',
        email: `citizen_${Date.now()}@gmail.com`,
        phone: '0987654321',
        role: 'CITIZEN'
    };

    const adminUser = {
        username: `admin_${Date.now()}`,
        password: 'Password123!',
        name: 'Admin User',
        email: `admin_${Date.now()}@gmail.com`,
        phone: '0911111111',
        role: 'ADMIN'
    };

    const dispatcherUser = {
        username: `dispatcher_${Date.now()}`,
        password: 'Password123!',
        name: 'Dispatcher User',
        email: `dispatcher_${Date.now()}@gmail.com`,
        phone: '0922222222',
        role: 'DISPATCHER'
    };

    beforeAll(async () => {
        const testUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
        await mongoose.connect(testUri);

        app.set('io', {
            emit: jest.fn(),
            on: jest.fn()
        });

        // Đăng ký và lấy token cho từng role
        await request(app).post('/api/v1/auth/register').send(citizenUser);
        await request(app).post('/api/v1/auth/register').send(adminUser);
        await request(app).post('/api/v1/auth/register').send(dispatcherUser);

        const citizenRes = await request(app).post('/api/v1/auth/login').send({
            username: citizenUser.username,
            password: citizenUser.password
        });
        citizenToken = citizenRes.body.result.token;

        const adminRes = await request(app).post('/api/v1/auth/login').send({
            username: adminUser.username,
            password: adminUser.password
        });
        adminToken = adminRes.body.result.token;

        const dispatcherRes = await request(app).post('/api/v1/auth/login').send({
            username: dispatcherUser.username,
            password: dispatcherUser.password
        });
        dispatcherToken = dispatcherRes.body.result.token;
    });

    afterAll(async () => {
        const testIncidents = await Incident.find({ title: /Test|SOS|Cập nhật/ });
        for (const incident of testIncidents) {
            if (incident.photos) {
                incident.photos.forEach(imgName => {
                    const filePath = path.join(__dirname, '../../uploads', imgName);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            }
        }

        await Incident.deleteMany({});
        await User.deleteMany({ username: { $regex: /^(citizen_|admin_|dispatcher_)/ } });
        await mongoose.connection.close();
    });

    // ============================================================
    // 📁 HẠ TẦNG & TÀI LIỆU
    // ============================================================
    describe('📁 Nhóm: Hạ tầng & Tài liệu', () => {
        it('Swagger UI: Nên truy cập được trang tài liệu API', async () => {
            const res = await request(app).get('/api-docs/');
            expect([200, 301, 302]).toContain(res.statusCode);
        });

        it('Error Handling: Nên trả về JSON chuẩn 404 khi sai URL', async () => {
            const res = await request(app).get('/api/v1/unknown-route');
            expect(res.statusCode).toEqual(ErrorCodes.URL_NOT_FOUND.statusCode);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    // ============================================================
    // 🔐 XÁC THỰC
    // ============================================================
    describe('🔐 Nhóm: Xác thực', () => {
        it('Register: Nên đăng ký tài khoản thành công', async () => {
            const newUser = {
                username: `register_test_${Date.now()}`,
                password: 'Password123!',
                name: 'Register Test',
                email: `register_test_${Date.now()}@gmail.com`,
                phone: '0933333333',
                role: 'CITIZEN'
            };
            const res = await request(app).post('/api/v1/auth/register').send(newUser);
            expect(res.statusCode).toEqual(SuccessCodes.REGISTER_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('userId');
            expect(res.body.result).toHaveProperty('name', newUser.name);

            await User.deleteOne({ username: newUser.username });
        });

        it('Login: Nên trả về Token khi đăng nhập đúng', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                username: citizenUser.username,
                password: citizenUser.password
            });
            expect(res.statusCode).toEqual(SuccessCodes.LOGIN_SUCCESS.statusCode);
            expect(res.body.result).toHaveProperty('token');
        });
    });

    // ============================================================
    // 🚨 TẠO SỰ CỐ - POST /
    // ============================================================
    describe('🚨 POST / — Tạo sự cố mới', () => {
        it('✅ Tạo sự cố đầy đủ tất cả trường thành công', async () => {
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue(mockAddress);

            const res = await request(app)
                .post('/api/v1/incidents/')
                .set('Authorization', `Bearer ${citizenToken}`)
                .field('title', 'Test Tai nạn giao thông')
                .field('description', '3 xe ô tô va chạm tại ngã tư')
                .field('type', 'ACCIDENT')
                .field('severity', 'HIGH')
                .field('latitude', 21.029038)
                .field('longitude', 105.803421)
                .attach('photos', fixturePath);

            expect(res.statusCode).toEqual(SuccessCodes.DEFAULT_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('_id');
            expect(res.body.result).toHaveProperty('title', 'Test Tai nạn giao thông');
            expect(res.body.result).toHaveProperty('description', '3 xe ô tô va chạm tại ngã tư');
            expect(res.body.result).toHaveProperty('type', 'ACCIDENT');
            expect(res.body.result).toHaveProperty('severity', 'HIGH');
            expect(res.body.result).toHaveProperty('status', 'PENDING');
            expect(res.body.result.location).toMatchObject({
                type: 'Point',
                coordinates: [105.803421, 21.029038],
                address: mockAddress
            });
            expect(res.body.result.photos).toHaveLength(1);

            const uploadedPath = path.join(__dirname, '../../uploads', res.body.result.photos[0]);
            expect(fs.existsSync(uploadedPath)).toBe(true);

            existId = res.body.result._id;
            existCode = res.body.result.code;

            geoSpy.mockRestore();
        });

        it('✅ Tạo sự cố với type và severity mặc định khi không truyền', async () => {
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue(mockAddress);

            const res = await request(app)
                .post('/api/v1/incidents/')
                .set('Authorization', `Bearer ${citizenToken}`)
                .field('title', 'Test sự cố mặc định')
                .field('latitude', 21.029038)
                .field('longitude', 105.803421);

            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('type', 'OTHER');
            expect(res.body.result).toHaveProperty('severity', 'MEDIUM');
            expect(res.body.result.photos).toHaveLength(0);

            geoSpy.mockRestore();
        });

        it('❌ Thiếu latitude → lỗi INCIDENT_MISSING_COORDINATES', async () => {
            const res = await request(app)
                .post('/api/v1/incidents/')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({
                    title: 'Test thiếu tọa độ',
                    type: 'ACCIDENT',
                    longitude: 105.803421
                });

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_MISSING_COORDINATES.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app)
                .post('/api/v1/incidents/')
                .send({ title: 'Test no token', latitude: 21.0, longitude: 105.8 });

            expect(res.statusCode).toBe(401);
        });

        it('❌ Token của ADMIN (không phải CITIZEN) → 403', async () => {
            const res = await request(app)
                .post('/api/v1/incidents/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Test wrong role', latitude: 21.0, longitude: 105.8 });

            expect(res.statusCode).toBe(ErrorCodes.AUTH_FORBIDDEN.statusCode);
        });
    });

    // ============================================================
    // 🆘 TẠO SOS - POST /sos
    // ============================================================
    describe('🆘 POST /sos — Gửi tín hiệu SOS khẩn cấp', () => {
        it('✅ Gửi SOS thành công với đầy đủ tọa độ', async () => {
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue(mockAddress);

            const res = await request(app)
                .post('/api/v1/incidents/sos')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({
                    latitude: 21.029038,
                    longitude: 105.803421
                });

            expect(res.body.result).toHaveProperty('title', '🆘 YÊU CẦU CỨU HỘ KHẨN CẤP (SOS)');
            expect(res.body.result).toHaveProperty('severity', 'CRITICAL');
            expect(res.body.result).toHaveProperty('status', 'PENDING');
            expect(res.body.result.location).toMatchObject({
                type: 'Point',
                coordinates: [105.803421, 21.029038],
                address: mockAddress
            });

            geoSpy.mockRestore();
        });

        it('❌ Thiếu latitude → lỗi INCIDENT_MISSING_COORDINATES', async () => {
            const res = await request(app)
                .post('/api/v1/incidents/sos')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ longitude: 105.803421 });

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_MISSING_COORDINATES.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app)
                .post('/api/v1/incidents/sos')
                .send({ latitude: 21.0, longitude: 105.8 });

            expect(res.statusCode).toBe(401);
        });
    });

    // ============================================================
    // 🔍 LẤY CHI TIẾT THEO ID - GET /:id
    // ============================================================
    describe('🔍 GET /:id — Lấy chi tiết sự cố theo ID', () => {
        it('✅ Lấy sự cố thành công với ID hợp lệ', async () => {
            const res = await request(app)
                .get(`/api/v1/incidents/${existId}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(SuccessCodes.DEFAULT_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('_id', existId);
            expect(res.body.result).toHaveProperty('title');
            expect(res.body.result).toHaveProperty('type');
            expect(res.body.result).toHaveProperty('severity');
            expect(res.body.result).toHaveProperty('status');
            expect(res.body.result).toHaveProperty('location');
            expect(res.body.result).toHaveProperty('photos');
            expect(res.body.result.reportedBy).toHaveProperty('name');
            expect(res.body.result.reportedBy).toHaveProperty('phone');
            expect(res.body.result.reportedBy).toHaveProperty('email');
        });

        it('❌ ID sai định dạng ObjectId → lỗi INVALID_ID_FORMAT', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/not-a-valid-id')
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(ErrorCodes.INVALID_ID_FORMAT.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ ID không tồn tại → lỗi INCIDENT_NOT_FOUND', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/v1/incidents/${fakeId}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_NOT_FOUND.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app).get(`/api/v1/incidents/${existId}`);
            expect(res.statusCode).toBe(401);
        });
    });

    // ============================================================
    // 🔎 LẤY CHI TIẾT THEO CODE - GET /track/:code
    // ============================================================
    describe('🔎 GET /track/:code — Lấy chi tiết sự cố theo mã code', () => {
        it('✅ Lấy sự cố thành công với code hợp lệ', async () => {
            const res = await request(app)
                .get(`/api/v1/incidents/track/${existCode}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(SuccessCodes.DEFAULT_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('code', existCode);
            expect(res.body.result).toHaveProperty('title');
            expect(res.body.result).toHaveProperty('type');
            expect(res.body.result).toHaveProperty('severity');
            expect(res.body.result).toHaveProperty('status');
            expect(res.body.result).toHaveProperty('location');
            expect(res.body.result.reportedBy).toHaveProperty('name');
            expect(res.body.result.reportedBy).toHaveProperty('phone');
        });

        it('❌ Code sai định dạng (thiếu phần số cuối) → lỗi INCIDENT_INVALID_CODE_FORMAT', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/track/ACC-20240601')
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_INVALID_CODE_FORMAT.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Code sai định dạng (chữ thường) → lỗi INCIDENT_INVALID_CODE_FORMAT', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/track/acc-20240601-0001')
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_INVALID_CODE_FORMAT.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Code đúng định dạng nhưng không tồn tại → lỗi INCIDENT_NOT_FOUND', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/track/ACC-20240601-9999')
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_NOT_FOUND.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app).get(`/api/v1/incidents/track/${existCode}`);
            expect(res.statusCode).toBe(401);
        });
    });

    // ============================================================
    // 🔄 CẬP NHẬT TRẠNG THÁI - PATCH /:id/status
    // ============================================================
    describe('🔄 PATCH /:id/status — Cập nhật trạng thái sự cố', () => {
        it('✅ Cập nhật status thành ASSIGNED', async () => {
            const res = await request(app)
                .patch(`/api/v1/incidents/${existId}/status`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ status: 'ASSIGNED' });
            expect(res.body.result).toHaveProperty('status', 'ASSIGNED');
        });

        it('✅ Reset lại PENDING', async () => {
            const res = await request(app)
                .patch(`/api/v1/incidents/${existId}/status`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ status: 'PENDING' });
            expect(res.body.result).toHaveProperty('status', 'PENDING');
        });

        it('❌ ID không tồn tại → lỗi INCIDENT_NOT_FOUND', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/v1/incidents/${fakeId}/status`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ status: 'IN_PROGRESS' });

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_NOT_FOUND.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app)
                .patch(`/api/v1/incidents/${existId}/status`)
                .send({ status: 'IN_PROGRESS' });

            expect(res.statusCode).toBe(401);
        });
    });

    // ============================================================
    // ✏️ CẬP NHẬT THÔNG TIN - PATCH /:id/info
    // ============================================================
    describe('✏️ PATCH /:id/info — Cập nhật thông tin chi tiết sự cố', () => {
        it('✅ Cập nhật đầy đủ tất cả trường thành công', async () => {
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue('Địa chỉ mới');

            const res = await request(app)
                .patch(`/api/v1/incidents/${existId}/info`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .field('title', 'Test Cập nhật tiêu đề mới')
                .field('description', 'Mô tả đã được cập nhật')
                .field('type', 'FIRE')
                .field('severity', 'CRITICAL')
                .field('status', 'IN_PROGRESS')
                .field('latitude', 21.035)
                .field('longitude', 105.850)
                .attach('photos', fixturePath);

            expect(res.statusCode).toEqual(SuccessCodes.DEFAULT_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('title', 'Test Cập nhật tiêu đề mới');
            expect(res.body.result).toHaveProperty('description', 'Mô tả đã được cập nhật');
            expect(res.body.result).toHaveProperty('type', 'FIRE');
            expect(res.body.result).toHaveProperty('severity', 'CRITICAL');
            expect(res.body.result).toHaveProperty('status', 'IN_PROGRESS');
            expect(res.body.result.location.coordinates).toEqual([105.850, 21.035]);
            expect(res.body.result.location.address).toBe('Địa chỉ mới');
            expect(res.body.result.photos).toHaveLength(1);

            geoSpy.mockRestore();
        });

        it('✅ Không gửi ảnh mới → giữ nguyên ảnh cũ', async () => {
            const resBefore = await request(app)
                .get(`/api/v1/incidents/${existId}`)
                .set('Authorization', `Bearer ${citizenToken}`);
            const oldPhotos = resBefore.body.result.photos;

            const res = await request(app)
                .patch(`/api/v1/incidents/${existId}/info`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .field('title', 'Test giữ ảnh cũ')

            expect(res.body.success).toBe(true);
            expect(res.body.result.photos).toEqual(oldPhotos);
        });

        it('✅ Cập nhật tọa độ có truyền address thủ công (không gọi geoService)', async () => {
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode');

            const res = await request(app)
                .patch(`/api/v1/incidents/${existId}/info`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .field('latitude', 21.040)
                .field('longitude', 105.860)
                .field('address', 'Địa chỉ nhập tay');

            expect(res.body.success).toBe(true);
            expect(res.body.result.location.address).toBe('Địa chỉ nhập tay');
            expect(geoSpy).not.toHaveBeenCalled();

            geoSpy.mockRestore();
        });

        it('❌ ID không tồn tại → lỗi INCIDENT_NOT_FOUND', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/v1/incidents/${fakeId}/info`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .field('title', 'Test ID không tồn tại');

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_NOT_FOUND.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app)
                .patch(`/api/v1/incidents/${existId}/info`)
                .field('title', 'Test no token');

            expect(res.statusCode).toBe(401);
        });
    });

    // ============================================================
    // 📋 LẤY DANH SÁCH - GET /
    // ============================================================
    describe('📋 GET / — Lấy danh sách tất cả sự cố', () => {
        it('✅ Lấy danh sách thành công với ADMIN token (mặc định page=1, limit=5)', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(SuccessCodes.DEFAULT_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('pagination');
            const { pagination } = res.body.result;

            expect(pagination).toHaveProperty('total');    
            expect(pagination).toHaveProperty('totalPages'); 
            expect(pagination).toHaveProperty('currentPage', 1);
            expect(pagination).toHaveProperty('limit', 5);      

            expect(res.body.result).toHaveProperty('data');
            expect(Array.isArray(res.body.result.data)).toBe(true);

            expect(res.body.result.data.length).toBeLessThanOrEqual(5);
        });

        it('✅ Lấy danh sách thành công với DISPATCHER token', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${dispatcherToken}`);

            expect(res.statusCode).toEqual(SuccessCodes.DEFAULT_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
        });

        it('✅ Lọc theo type=ACCIDENT', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ type: 'ACCIDENT' });

            expect(res.body.success).toBe(true);
            res.body.result.data.forEach(incident => {
                expect(incident.type).toBe('ACCIDENT');
            });
        });

        it('✅ Lọc theo severity=HIGH', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ severity: 'HIGH' });

            expect(res.body.success).toBe(true);
            res.body.result.data.forEach(incident => {
                expect(incident.severity).toBe('HIGH');
            });
        });

        it('✅ Lọc theo status=PENDING', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ status: 'PENDING' });

            expect(res.body.success).toBe(true);
            res.body.result.data.forEach(incident => {
                expect(incident.status).toBe('PENDING');
            });
        });

        it('✅ Phân trang: page=1', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ page: 1 });

            expect(res.body.success).toBe(true);
            expect(res.body.result.data.length).toBeLessThanOrEqual(5);
            expect(res.body.result.pagination.currentPage).toBe(1);
            expect(res.body.result.pagination.limit).toBe(5);
        });

        it('✅ Lọc kết hợp type + severity + status + phân trang', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ type: 'ACCIDENT', severity: 'HIGH', status: 'PENDING', page: 2 });

            expect(res.body.success).toBe(true);
            res.body.result.data.forEach(incident => {
                expect(incident.type).toBe('ACCIDENT');
                expect(incident.severity).toBe('HIGH');
                expect(incident.status).toBe('PENDING');
            });
        });

        it('❌ CITIZEN token → 403', async () => {
            const res = await request(app)
                .get('/api/v1/incidents/')
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app).get('/api/v1/incidents/');
            expect(res.statusCode).toBe(401);
        });
    });

    // ============================================================
    // 🗑️ XÓA SỰ CỐ - DELETE /delete/:id
    // ============================================================
    describe('🗑️ DELETE /delete/:id — Xóa sự cố', () => {
        let deleteTargetId;
        let deleteTargetPhotos;

        beforeEach(async () => {
            // Tạo sự cố mới để xóa trong mỗi test
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue(mockAddress);

            const res = await request(app)
                .post('/api/v1/incidents/')
                .set('Authorization', `Bearer ${citizenToken}`)
                .field('title', 'Test sự cố cần xóa')
                .field('type', 'FIRE')
                .field('severity', 'LOW')
                .field('latitude', 21.029038)
                .field('longitude', 105.803421)
                .attach('photos', fixturePath);

            deleteTargetId = res.body.result._id;
            deleteTargetPhotos = res.body.result.photos;

            geoSpy.mockRestore();
        });

        it('✅ Xóa sự cố thành công với CITIZEN token', async () => {
            const res = await request(app)
                .delete(`/api/v1/incidents/delete/${deleteTargetId}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(SuccessCodes.DEFAULT_SUCCESS.statusCode);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('_id', deleteTargetId);

            // File vật lý phải bị xóa
            if (deleteTargetPhotos.length > 0) {
                const filePath = path.join(__dirname, '../../uploads', deleteTargetPhotos[0]);
                expect(fs.existsSync(filePath)).toBe(false);
            }
        });

        it('✅ Xóa sự cố không có ảnh — không lỗi khi photos rỗng', async () => {
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue(mockAddress);

            const createRes = await request(app)
                .post('/api/v1/incidents/')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ title: 'Test xóa không ảnh', type: 'OTHER', latitude: 21.0, longitude: 105.8 });

            geoSpy.mockRestore();

            const noPhotoId = createRes.body.result._id;

            const res = await request(app)
                .delete(`/api/v1/incidents/delete/${noPhotoId}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.body.success).toBe(true);
        });

        it('❌ ID không tồn tại → lỗi INCIDENT_NOT_FOUND', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/v1/incidents/delete/${fakeId}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.statusCode).toEqual(ErrorCodes.INCIDENT_NOT_FOUND.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('❌ DISPATCHER token → 403', async () => {
            const res = await request(app)
                .delete(`/api/v1/incidents/delete/${deleteTargetId}`)
                .set('Authorization', `Bearer ${dispatcherToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('❌ Không có Token → 401', async () => {
            const res = await request(app)
                .delete(`/api/v1/incidents/delete/${deleteTargetId}`);

            expect(res.statusCode).toBe(401);
        });
    });
});