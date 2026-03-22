const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const upload = require('../middleware/upload');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect)

router.post('/create', restrictTo('Citizen'), upload.array('image', 5),incidentController.createIncident)

router.patch('/update/:id', upload.array('image',5), incidentController.updateIncident)

router.delete('/delete/:id', incidentController.deleteIncident)

router.get('/', restrictTo('Admin', 'Dispatcher'), incidentController.getAllIncidents)

router.get('/:id', incidentController.getIncidentById)

module.exports = router;