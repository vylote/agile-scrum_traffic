const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes.js'); // Kết nối cho US-01
const globalExceptionHandler = require('./middleware/globalExceptionHandler');
const { swaggerUi, specs } = require('./config/swagger'); // Tài liệu API
const ErrorCodes = require('./utils/constants/errorCodes.js');
const AppError = require('./middleware/AppError.js')

const app = express();

// 1. Cấu hình Middleware cơ bản
app.use(cors());
app.use(express.json());

// 2. Cấu hình thư mục Static (Cực kỳ quan trọng cho US-01)
// Giúp Frontend có thể hiển thị ảnh sự cố qua URL: http://localhost:5000/uploads/ten-anh.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 3. Tài liệu API (Swagger Docs)
// Giúp bạn hoàn thành Task "Swagger docs" trong phần Technical (8 SP)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 4. Định tuyến (Routes)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/incidents', incidentRoutes); // Luồng báo cáo sự cố

app.all('*any', (req, res, next) => {
    next(new AppError(ErrorCodes.URL_NOT_FOUND));
});

// 5. Phễu hứng lỗi cuối cùng (Global Exception Handler)
app.use(globalExceptionHandler);

module.exports = app;