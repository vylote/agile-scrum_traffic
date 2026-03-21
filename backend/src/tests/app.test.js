const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const ErrorCodes = require('../utils/constants/errorCodes');
const SuccessCodes = require('../utils/constants/successCodes');
const geoService = require('../services/geoService')
const path = require('path');
const fs = require('fs');

// Nạp biến môi trường để có JWT_SECRET, MONGODB_URI...
require('dotenv').config();

describe('🚀 TIMS - KIỂM THỬ TÍCH HỢP TOÀN DIỆN (SPRINT 1)', () => {
    
    let authToken = '';
    const testUser = {
        username: `testuser_${Date.now()}`, // Dùng timestamp để không bị trùng khi chạy test nhiều lần
        password: 'Password123!',
        fullName: 'Le Thanh Vy Test',
        role: 'Citizen'
    };

    console.log(`Đang chạy test ở môi trường: ${process.env.NODE_ENV}`);
    //ket noi voi database kiểm thử->sau test xóa hết rác
    beforeAll(async () =>{
        const testUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
        await mongoose.connect(testUri);

        app.set('io', {
            emit: jest.fn(), // Tạo một hàm giả không làm gì cả
            on: jest.fn()
        });
    })

    afterAll(async () => {
        const User = require('../models/Users')
        await User.deleteMany({ username: {$regex: /^testuser_/} })
        await mongoose.connection.close()
    })

    // --- 1. KIỂM TRA HẠ TẦNG (INFRASTRUCTURE) ---
    describe('📁 Nhóm: Hạ tầng & Tài liệu', () => {
        it('Swagger UI: Nên truy cập được trang tài liệu API', async () => {
            const res = await request(app).get('/api-docs/');
            expect([200, 301, 302]).toContain(res.statusCode); // ma quy dinh trong lib swagger-ui-express
        });

        it('Error Handling: Nên trả về JSON chuẩn 404 khi sai URL', async () => {
            const res = await request(app).get('/api/v1/unknown-route');
            expect(res.statusCode).toEqual(ErrorCodes.URL_NOT_FOUND.statusCode);
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

            expect(res.statusCode).toEqual(SuccessCodes.REGISTER_SUCCESS.statusCode); 
            expect(res.body.success).toBe(true);
            expect(res.body.code).toEqual(SuccessCodes.REGISTER_SUCCESS.code);
            expect(res.body.result).toHaveProperty('userId');
            expect(res.body.result).toHaveProperty('username');
        });

        it('Register: Nên báo lỗi 1001 nếu trùng username', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(ErrorCodes.AUTH_USER_EXISTS.statusCode);
            expect(res.body.error.code).toEqual(ErrorCodes.AUTH_USER_EXISTS.code);
        });

        it('Login: Nên trả về Token khi đăng nhập đúng', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(SuccessCodes.LOGIN_SUCCESS.statusCode);
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

            expect(res.statusCode).toEqual(ErrorCodes.AUTH_INVALID_CREDENTIALS.statusCode);
            expect(res.body.error.code).toEqual(ErrorCodes.AUTH_INVALID_CREDENTIALS.code);
        });
        
        it('Login: từ chối (401) nếu không tồn tại tên đăng nhập', async() => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'wrong_username',
                    password: 'stupid_passwd'
                })

            expect(res.statusCode).toEqual(ErrorCodes.AUTH_INVALID_CREDENTIALS.statusCode);
            expect(res.body.error.code).toEqual(ErrorCodes.AUTH_INVALID_CREDENTIALS.code);
        });
    });

    // --- 3. KIỂM TRA NGHIỆP VỤ SỰ CỐ (INCIDENTS) ---
    describe('🚨 Nhóm: Quản lý sự cố (US-01)', () => {
        
        it('Security: Không có Token thì không được lấy danh sách sự cố', async () => {
            const res = await request(app)
                .get('/api/v1/incidents');

            expect(res.statusCode).toEqual(ErrorCodes.AUTH_UNAUTHORIZED.statusCode);
            expect(res.body.success).toBe(false);
        });

        it('Create Incident: Nên tạo sự cố thành công khi có Token', async () => {
            const mockAddress = "3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội, Vietnam";
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue(mockAddress);
            const filePath = path.join(__dirname, './fixtures/accident.jpg');
            // Lưu ý: Nếu có upload ảnh (Multer), test này cần dùng .attach()
            // Ở đây test gửi dữ liệu text cơ bản trước
            const res = await request(app)
                .post('/api/v1/incidents')
                .set('Authorization', `Bearer ${authToken}`)
                .field('title', 'Tai nạn liên hoàn')
                .field('description', '3 xe ô tô va chạm')
                .field('latitude', 21.029038230799788)
                .field('longitude', 105.80342178837539);

            // Kiểm chứng:
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('_id');
            expect(res.body.result.location.address).toBe(mockAddress);
            expect(geoSpy).toHaveBeenCalledTimes(1);
            geoSpy.mockRestore();
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