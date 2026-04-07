const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const upload = require("../middleware/upload");
const { protect, restrictTo } = require("../middleware/auth");
const { USER_ROLES} = require("../utils/constants/userConstants")

router.get('/track/:code', incidentController.getIncidentByCode);

router.use(protect);

router.post('/',restrictTo(USER_ROLES.CITIZEN),upload.array("photos", 5),incidentController.createIncident);

router.post('/sos',restrictTo(USER_ROLES.CITIZEN),incidentController.createSOS);

router.get("/:id", incidentController.getIncidentById);

router.patch('/:id/status',restrictTo(USER_ROLES.ADMIN, USER_ROLES.DISPATCHER, USER_ROLES.RESCUE), incidentController.updateIncidentStatus)

router.patch("/:id/info",upload.array("photos", 3),incidentController.updateIncidentInfo);

router.get('/',incidentController.getAllIncidents);

router.delete("/delete/:id",restrictTo(USER_ROLES.CITIZEN),incidentController.deleteIncident);

module.exports = router;
