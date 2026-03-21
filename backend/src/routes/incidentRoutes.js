const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const upload = require('../middleware/upload');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect)

router.post('/', restrictTo('Citizen'), upload.array('image', 5),incidentController.createIncident)

router.get('/', restrictTo('Admin', 'Dispatcher'), incidentController.getAllIncidents)

module.exports = router;