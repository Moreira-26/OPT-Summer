const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller')

router.get('/',tripController.getTrips)
router.get('/:id', tripController.getTripId)

module.exports = router