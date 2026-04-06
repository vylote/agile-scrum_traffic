const express = require('express');
const router = express.Router();
const rescueTeamController = require('../controllers/rescueTeamController');
const { protect, restrictTo } = require("../middleware/auth");
const { USER_ROLES} = require("../utils/constants/userConstants")

router.use(protect);
router.post('/', restrictTo(USER_ROLES.ADMIN), rescueTeamController.createRescueTeam);
router.get('/', restrictTo(USER_ROLES.DISPATCHER, USER_ROLES.ADMIN), rescueTeamController.getAllRescueTeam);
router.patch('/:id/location', restrictTo(USER_ROLES.RESCUE), rescueTeamController.updateLocation);
router.get('/:id/members',restrictTo(USER_ROLES.DISPATCHER, USER_ROLES.ADMIN, USER_ROLES.RESCUE), rescueTeamController.getRescueTeamMembers)

module.exports = router;