const express = require('express');
const router = express.Router();
const segController = require('../controllers/seg.controller')

router.get('/',segController.getSegs);
router.get('/:id',segController.getSegId);

module.exports = router;