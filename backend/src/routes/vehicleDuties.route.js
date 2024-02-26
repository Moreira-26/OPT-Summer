const express = require('express');
const router = express.Router();

const vehicleDutyController = require('../controllers/vehicleDuty.controller')

router.get('/',vehicleDutyController.getVehicleDuties)
router.get('/:id',vehicleDutyController.getVehicleDutyId)

module.exports = router;
