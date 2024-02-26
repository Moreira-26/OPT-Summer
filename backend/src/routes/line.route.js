const express = require('express');
const router = express.Router();
const lineController = require('../controllers/line.controller')

router.get('/',lineController.getLines)
router.get('/:code',lineController.getLineCode)
router.get('/:id/paths',lineController.getPaths)

module.exports = router;