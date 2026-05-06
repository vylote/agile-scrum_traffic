const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth'); 
const { USER_ROLES} = require("../utils/constants/userConstants")

const { validate } = require('../middleware/validation/validator');
const { createUserSchema } = require('../middleware/validation/userValidation');

router.use(protect);

router.patch('/fcm-token', userController.updateFCMToken);

router.use(restrictTo(USER_ROLES.ADMIN));
router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/search-by-phone/:phone', userController.getUserByPhone);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;