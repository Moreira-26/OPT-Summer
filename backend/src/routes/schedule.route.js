const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller')

router.get('/',scheduleController.getSchedules)
router.get('/:id',scheduleController.getScheduleId)
router.get('/:id/trips',scheduleController.getTrips)
router.get('/:id/workBlocks', scheduleController.getWorkBlocks)

module.exports = router;