// dùng để tự động tạo ra một trang web hướng dẫn sử dụng API mà bạn không cần phải viết tay thủ công.

/* swagger-jsdoc (Người phiên dịch): Thư viện này có nhiệm vụ đi "lùng sục" khắp các file code của Vy
(theo đường dẫn trong mục apis). Nó tìm những đoạn chú thích có chữ @swagger, đọc chúng và chuyển 
đổi thành một file cấu hình khổng lồ dạng JSON/YAML theo chuẩn OpenAPI. */
const swaggerJsdoc = require('swagger-jsdoc');
/* Thư viện này nhận file cấu hình JSON từ swaggerJsdoc, sau đó "xây" thành một giao diện web đẹp mắt, 
có nút bấm, có form nhập liệu để Vy có thể tương tác được */
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hệ thống Cứu hộ Giao thông API',
      version: '1.0.0',
      description: 'Tài liệu API cho BTL Agile/Scrum - Sprint 1',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Đường dẫn đến các file chứa chú thích @swagger
  apis: ['./src/routes/*.js', './src/controllers/*.js'], 
};

const specs = swaggerJsdoc(options);
module.exports = { swaggerUi, specs };