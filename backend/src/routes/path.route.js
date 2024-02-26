const express = require('express');
const router = express.Router();
const pathController = require('../controllers/path.controller')

router.get('/',pathController.getPaths)
router.get('/segs',pathController.getSegs)
router.get('/:id',pathController.getPathId)

module.exports = router;