const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/node.controller')

router.get('/',nodeController.getNodes)
router.get('/geojson',nodeController.getNodesGeoJson)
router.get('/:id',nodeController.getNodeId)
router.post('/',nodeController.createNode)
router.delete('/:id',nodeController.deleteNode)
router.put('/:id',nodeController.updateNode)

module.exports = router;