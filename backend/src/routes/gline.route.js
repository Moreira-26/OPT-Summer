const express = require('express');
const router = express.Router();
const glineController = require('../controllers/gline.controller');

router.get('/',glineController.getGlines);
router.get('/:id/lines',glineController.getLines);
router.get('/:id/schedules',glineController.getSchedules); 

module.exports = router;
