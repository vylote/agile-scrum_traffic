const request = require('supertest');
const app = require('../app');
const ErrorCodes = require('../config/errorCodes');
const SuccessCodes = require('../config/successCodes');

// Nạp biến môi trường để có JWT_SECRET, MONGODB_URI...
require('dotenv').config();

describe('🚀 TIMS - KIỂM THỬ TÍCH HỢP TOÀN DIỆN (SPRINT 1)', () => {
    
    // Biến dùng chung để lưu Token sau khi login thành công
    let authToken = '';
    const testUser = {
        username: `testuser_${Date.now()}`, // Dùng timestamp để không bị trùng khi chạy test nhiều lần
        password: 'Password123!',
        fullName: 'Le Thanh Vy Test',
        role: 'Citizen'
    };

    // --- 1. KIỂM TRA HẠ TẦNG (INFRASTRUCTURE) ---
    describe('📁 Nhóm: Hạ tầng & Tài liệu', () => {
        it('Swagger UI: Nên truy cập được trang tài liệu API', async () => {
            const res = await request(app).get('/api-docs/');
            expect([200, 301, 302]).toContain(res.statusCode);
        });

        it('Error Handling: Nên trả về JSON chuẩn 404 khi sai URL', async () => {
            const res = await request(app).get('/api/v1/unknown-route');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.error).toHaveProperty('code');
        });
    });

    // --- 2. KIỂM TRA XÁC THỰC (AUTHENTICATION) ---
    describe('🔐 Nhóm: Xác thực (US-15)', () => {
        
        it('Register: Nên đăng ký tài khoản thành công', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(200); // Hoặc 201 tùy config của Vy
            expect(res.body.success).toBe(true);
            expect(res.body.code).toEqual(SuccessCodes.REGISTER_SUCCESS.code);
            expect(res.body.result).toHaveProperty('userId');
        });

        it('Register: Nên báo lỗi 1001 nếu trùng username', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error.code).toEqual(ErrorCodes.AUTH_USER_EXISTS.code);
        });

        it('Login: Nên trả về Token khi đăng nhập đúng', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('token');
            
            // Lưu token lại để dùng cho các test bên dưới
            authToken = res.body.result.token;
        });

        it('Login: Nên từ chối (401) nếu sai mật khẩu', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: 'wrong_password'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.error.code).toEqual(ErrorCodes.AUTH_INVALID_CREDENTIALS.code);
        });
    });

    // --- 3. KIỂM TRA NGHIỆP VỤ SỰ CỐ (INCIDENTS) ---
    describe('🚨 Nhóm: Quản lý sự cố (US-01)', () => {
        
        it('Security: Không có Token thì không được lấy danh sách sự cố', async () => {
            const res = await request(app).get('/api/v1/incidents');
            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toBe(false);
        });

        it('Create Incident: Nên tạo sự cố thành công khi có Token', async () => {
            // Lưu ý: Nếu có upload ảnh (Multer), test này cần dùng .attach()
            // Ở đây test gửi dữ liệu text cơ bản trước
            const res = await request(app)
                .post('/api/v1/incidents')
                .set('Authorization', `Bearer ${authToken}`)
                .field('title', 'Tai nạn liên hoàn')
                .field('description', '3 xe ô tô va chạm')
                .field('latitude', 10.7769)
                .field('longitude', 106.6602);

            // Nếu Reverse Geocode hoạt động, success sẽ là true
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('_id');
            expect(res.body.result.location).toHaveProperty('address');
        });

        it('Validation: Nên báo lỗi nếu thiếu tọa độ (Lat/Lon)', async () => {
            const res = await request(app)
                .post('/api/v1/incidents')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: "Thiếu tọa độ" });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toContain('tọa độ');
        });
    });
});