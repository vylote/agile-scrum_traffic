const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger'); // Import cấu hình Swagger

const app = express();

// Middleware cơ bản
app.use(cors());
app.use(express.json());

// Cấu hình Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Các Endpoint API
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "API Swagger hoạt động!" });
});

app.get('/', (req, res) => res.send("Backend API is running"));

// Export app để dùng cho server.js và chạy Unit Test (Jest)
module.exports = app;