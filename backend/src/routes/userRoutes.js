const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth'); 
const { USER_ROLES} = require("../utils/constants/userConstants")

router.use(protect);

router.patch('/fcm-token', userController.updateFCMToken);

router.use(restrictTo(USER_ROLES.ADMIN));

router.get('/', userController.getAllUsers);
router.get('/search-by-phone/:phone', userController.getUserByPhone);
router.get('/:id', userController.getUser);

module.exports = router;