const request = require('supertest');
const app = require('../app'); // CHỈ TRỎ VỀ app.js, không trỏ về server.js

describe('Kiểm tra các Endpoint cơ bản', () => {
  
  // Test 1: Kiểm tra trang chủ
  it('Nên trả về thông báo chào mừng tại đường dẫn /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Backend API is running"); //
  });

  // Test 2: Kiểm tra Swagger API
  it('Nên trả về status 200 khi gọi /api/test', async () => {
    const res = await request(app).get('/api/test');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("API Swagger hoạt động!"); //
  });

});