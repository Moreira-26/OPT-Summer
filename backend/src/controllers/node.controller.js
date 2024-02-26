const db = require('../configs/db.config')
const nodeQueries = require('../dbQueries/node.queries')
const convertToGeoJson = require('../utils/convertToGeoJson.utils')

const getNodesGeoJson = async (request, response) => {
    const resultQuery = await nodeQueries.getNodesDB();
    
    const dataGeonJson = convertToGeoJson.serializeNodesAsGeoJson({"nodes":resultQuery.resultsRows})

    response.status(200).json(
        dataGeonJson
    )

}

const getNodes = async (request, response) => {
    //Query database all nodes 
    const resultQuery = await nodeQueries.getNodesDB();
    
    if(resultQuery.resultsRows){
        response.status(200).json(
            {
                "nodes":resultQuery.resultsRows,
                "status" : "OK"
            }
        )
    }else if(resultQuery === "Nodes not found"){
        response.status(404).json(
            {
                "message": "Nodes not found" ,
                "status" : "Not found"
            }
        )
    }else{
        response.status(400).send(
            {
                "message":resultQuery,
                "status" : "Bad request"
            }
        )
    }
}

const getNodeId = async (request, response) => {
    const resultQuery = await nodeQueries.getNodeIdDB(request.params.id);

    if(resultQuery.resultsRows){
        response.status(200).json(
            {
                "nodeInfo" : resultQuery.resultsRows.at(0),
                "status" : "OK"
            }
        )
    }else if(resultQuery === "Node with id:" + request.params.id + " not found"){
        response.status(404).json(
            {
                "message": "Node with id:" + request.params.id + " not found" ,
                "status" : "Not found"
            }
        )
    }else{
        response.status(400).send(
            {
                "message":resultQuery,
                "status" : "Bad request"
            }
        )
    }
}

const createNode =  async (request, response) => {
    const {name, short_name, latitude, longitude, label_pos, visible, is_depot} = request.body;
    const resultQuery = await nodeQueries.createNodeDB(name, short_name, latitude, longitude, label_pos, visible, is_depot);
    if(resultQuery.nodeInfo){
        response.status(201).json(
            {
                "nodeInfo" : resultQuery.nodeInfo,
                "status" : "Created"
            }
        )
    }else{
        response.status(400).send(
            {
                "message":resultQuery,
                "status" : "Bad request"
            }
        )
    }
}

const deleteNode = async (request, response) => {
    const id = request.params.id;
    const resultQuery = await nodeQueries.deleteNodeDB(id);

    if(resultQuery === "Node with id:" + id + " deleted"){
        response.status(200).json(
            {
                "message": "Node with id:" + id + " deleted" ,
                "status" : "Deleted"
            }
        )
    }else if(resultQuery === "Node with id:" + id + " not found"){
        response.status(404).json(
            {
                "message": "Node with id:" + id + " not found" ,
                "status" : "Not found"
            }
        )
    }else{
        response.status(400).send(
            {
                "message":resultQuery,
                "status" : "Bad request"
            }
        )
    }
}

const updateNode = async (request, response) => {
    const id = parseInt(request.params.id)
    const {name, short_name, latitude, longitude, label_pos, visible, is_depot} = request.body;

    const resultQuery = await nodeQueries.updateNodeDB(id, name, short_name, latitude, longitude, label_pos, visible, is_depot);

    if(resultQuery.nodeInfo){
        response.status(200).json(
            {
                "nodeInfo" : resultQuery.nodeInfo,
                "status" : "Updated"
            }
        )
    }else if(resultQuery === "Node with id:" + id + " not found"){
        response.status(404).json(
            {
                "message": "Node with id:" + id + " not found" ,
                "status" : "Not found"
            }
        )
    }else{
        response.status(400).send(
            {
                "message":resultQuery,
                "status" : "Bad request"
            }
        )
    }
}

module.exports = {
    getNodes,
    getNodeId,
    createNode,
    deleteNode,
    updateNode,
    getNodesGeoJson
}