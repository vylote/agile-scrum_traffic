const request = require('supertest');
const app = require('../app');

describe('Kiểm tra Hạ tầng và Kiến trúc (Sprint 1)', () => {

  // Test 1: Kiểm tra Swagger UI (Task Technical - 8 SP)
  it('Nên truy cập được tài liệu API Swagger tại /api-docs', async () => {
    const res = await request(app).get('/api-docs/');
    // Swagger-ui-express thường trả về 200 hoặc 301 (redirect)
    expect([200, 301, 302]).toContain(res.statusCode);
  });

  // Test 2: Kiểm tra tiền tố API Auth (US-15)
  it('Nên trả về lỗi validation thay vì 404 khi gọi Register thiếu body', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});
    // Nếu route tồn tại, nó sẽ không trả về 404. 
    // Tùy vào xử lý của Vy, nó có thể là 400 hoặc 500 nhưng chắc chắn KHÔNG PHẢI 404.
    expect(res.statusCode).not.toEqual(404);
  });

  // Test 3: Kiểm tra tiền tố API Incident (US-01)
  it('Nên yêu cầu xác thực khi truy cập danh sách sự cố', async () => {
    const res = await request(app).get('/api/v1/incidents');
    // Vì Vy có middleware 'protect', nó sẽ trả về 401 (Unauthorized)
    expect(res.statusCode).toEqual(401);
  });

});