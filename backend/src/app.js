const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/IncidentRoutes.js'); 
const rescueRoutes = require('./routes/rescueTeamRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const globalExceptionHandler = require('./middleware/globalExceptionHandler');
const { swaggerUi, specs } = require('./config/swagger'); 
const ErrorCodes = require('./utils/constants/errorCodes.js');
const AppError = require('./middleware/AppError.js')

const app = express();

// Cấu hình Middleware cơ bản
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true 
}));
app.use(express.json());

// Giúp Frontend có thể hiển thị ảnh sự cố qua URL: http://localhost:5000/uploads/ten-anh.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/incidents', incidentRoutes); 
app.use('/api/v1/rescue-teams', rescueRoutes); 
app.use('/api/v1/users', userRoutes); 

app.all('*any', (req, res, next) => {
    next(new AppError(ErrorCodes.URL_NOT_FOUND));
});

app.use(globalExceptionHandler);

module.exports = app;