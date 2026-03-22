const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const upload = require("../middleware/upload");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.post(
    "/create",
    restrictTo("CITIZEN"),
    upload.array("photos", 5),
    incidentController.createIncident,
);

router.patch(
    "/update/:id",
    upload.array("photos", 5),
    incidentController.updateIncident,
);

router.delete(
    "/delete/:id",
    restrictTo("ADMIN", "CITIZEN"),
    incidentController.deleteIncident,
);

router.get(
    "/",
    restrictTo("ADMIN", "DISPATCHER"),
    incidentController.getAllIncidents,
);

router.get("/:id", incidentController.getIncidentById);

module.exports = router;
