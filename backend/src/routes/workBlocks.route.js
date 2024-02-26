const express = require('express');
const router = express.Router();
const workBlockController = require('../controllers/workBlock.controller')

router.get('/', workBlockController.getWorkBLocks)
router.get('/:id', workBlockController.getWorkBlockId)

module.exports = router;