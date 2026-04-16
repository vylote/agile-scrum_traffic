const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const { USER_ROLES} = require("../utils/constants/userConstants")

router.get('/dashboard-stats', protect, restrictTo(USER_ROLES.ADMIN), adminController.getDashboardStats);

module.exports = router;