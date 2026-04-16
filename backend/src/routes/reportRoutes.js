const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');
const { USER_ROLES } = require('../utils/constants/userConstants');

router.use(protect);
router.use(restrictTo(USER_ROLES.ADMIN));

router.get('/', reportController.getAllReports);
router.post('/generate-incidents', reportController.generateIncidentReport);
router.delete('/:id', reportController.deleteReport);
router.get('/heatmap', reportController.getHeatmapData);

module.exports = router;