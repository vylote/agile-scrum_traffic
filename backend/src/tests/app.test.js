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
    
    let authToken = '';
    let existId = '';
    
    const testUser = {
        username: `testuser_${Date.now()}`,
        password: 'Password123!',
        name: 'Le Thanh Vy Test', 
        email: `test_${Date.now()}@gmail.com`, 
        phone: '0987654321', 
        role: 'CITIZEN' 
    };

    beforeAll(async () =>{
        const testUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
        await mongoose.connect(testUri);

        app.set('io', {
            emit: jest.fn(),
            on: jest.fn()
        });
    });

    afterAll(async () => {
        const testIncidents = await Incident.find({ title: /Test/ });
        for (const incident of testIncidents) {
            if (incident.photos) {
                incident.photos.forEach(imgName => {
                    const filePath = path.join(__dirname, '../../uploads', imgName);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            }
        }

        await Incident.deleteMany({});
        await User.deleteMany({ username: { $regex: /^testuser_/ } });
        await mongoose.connection.close();
    });

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

    describe('🔐 Nhóm: Xác thực (US-15)', () => {
        it('Register: Nên đăng ký tài khoản thành công', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(SuccessCodes.REGISTER_SUCCESS.statusCode); 
            expect(res.body.success).toBe(true);
            expect(res.body.result).toHaveProperty('userId');
            expect(res.body.result).toHaveProperty('name', testUser.name); // Check name mới
        });

        it('Login: Nên trả về Token khi đăng nhập đúng', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(SuccessCodes.LOGIN_SUCCESS.statusCode);
            expect(res.body.result).toHaveProperty('token');
            authToken = res.body.result.token;
        });
    });

    describe('🚨 Nhóm: Quản lý sự cố (US-01)', () => {
        
        it('Create Incident: Nên tạo sự cố thành công khi có Token', async () => {
            const mockAddress = "3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội, Vietnam";
            const geoSpy = jest.spyOn(geoService, 'reverseGeocode').mockResolvedValue(mockAddress);
            const filePath = path.join(__dirname, './fixtures/accident.jpg');
      
            const res = await request(app)
                .post('/api/v1/incidents/create')
                .set('Authorization', `Bearer ${authToken}`)
                .field('title', 'Test upload thực tế')
                .field('description', '3 xe ô tô va chạm')
                .field('type', 'ACCIDENT') 
                .field('latitude', 21.029038)
                .field('longitude', 105.803421)
                .attach('photos', filePath); 

            expect(res.body.success).toBe(true);
            expect(res.body.result.photos).toHaveLength(1); 
            
            // Kiểm tra file vật lý
            const uploadedPath = path.join(__dirname, '../../uploads', res.body.result.photos[0]);
            expect(fs.existsSync(uploadedPath)).toBe(true);

            existId = res.body.result._id;
            expect(res.body.result.location.address).toBe(mockAddress);
            geoSpy.mockRestore();
        });

        it('Update Incident: Cập nhật sự cố thành công', async () => {
            const filePath = path.join(__dirname, './fixtures/accident.jpg');
            const res = await request(app)
                .patch(`/api/v1/incidents/update/${existId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .field('title', 'Cập nhật tiêu đề test')
                .attach('photos', filePath); 

            expect(res.body.success).toBe(true);
            expect(res.body.result.photos).toBeDefined();
        });

        it('Delete Incident: Xóa sự cố thành công', async () => {
            const res = await request(app)
                .delete(`/api/v1/incidents/delete/${existId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.body.success).toBe(true);
            
            // Kiểm tra xem file đã bị xóa khỏi ổ cứng chưa
            const fileName = res.body.result.photos[0];
            const uploadedPath = path.join(__dirname, '../../uploads', fileName);
            expect(fs.existsSync(uploadedPath)).toBe(false);
        });
    });
});