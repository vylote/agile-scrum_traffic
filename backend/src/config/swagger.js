const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Hệ thống Quản lý Sự cố API', //
            version: '1.0.0',
            description: 'Tài liệu hướng dẫn sử dụng các endpoint API cho hệ thống cứu hộ giao thông'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development Server'
            }
        ]
    },
    // LƯU Ý: Đường dẫn phải trỏ vào thư mục src vì chúng ta đã di chuyển code
    apis: ['./src/app.js', './src/routes/*.js', './src/server.js'] 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;