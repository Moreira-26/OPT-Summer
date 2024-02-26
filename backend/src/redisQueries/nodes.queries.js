const { WatchError } = require('redis');
const client = require('../configs/redis.config')
const  setOps = require('../utils/setOps.utils')

const { getNodesDB } = require('../dbQueries/node.queries')
const { parser } = require('../utils/parserId.utils')


//Get nodes from postgreSQL and populates redis, (+) operator in bool values to conver to 1/0
const populateRedis = async () =>  {
    const nodesDB = await getNodesDB();
    if(nodesDB.resultsRows == undefined) {
        console.log("Error fetching nodes from DB " + nodesDB)
        return;
    }

    var maxID = 0;
    nodesDB.resultsRows.forEach(async (node) => {
        if(node.id > maxID){ maxID = node.id}
        await client.hSet(`node:${node.id}`,"id", `node:${node.id}`);
        await client.hSet(`node:${node.id}`,"name", node.name);
        await client.hSet(`node:${node.id}`,"short_name", node.short_name);
        await client.hSet(`node:${node.id}`,"latitude", node.latitude);
        await client.hSet(`node:${node.id}`,"longitude", node.longitude);            
        await client.hSet(`node:${node.id}`,"label_pos",  node.label_pos);                        
        await client.hSet(`node:${node.id}`,"visible", + node.visible);
        await client.hSet(`node:${node.id}`,"is_depot", + node.is_depot);
        await client.sAdd(`node:index`, `node:${node.id}`)
    })
    await client.set('node:maxKey', maxID)
}


const createNodeRedis = async (node,networkId) => {
    let nodeID
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch node maxKey for changes 
            await isolatedClient.watch('node:maxKey');
            //Get node maxKey
            await isolatedClient.get('node:maxKey').then((result) => {
                if(result == null){
                    nodeID = 0;
                }else{
                    nodeID = parseInt(result) + 1
                }
            })
            /**
             * Define transaction:
             * Create version key with properties
             * Add key to network:nodes
             * Add key to index
             * Add node:segs to empty set 
             * Increment node:maxKey
             */
            const multi = isolatedClient
                .multi()
                .hSet(`${networkId}:node:${nodeID}`,"id", `${networkId}:node:${nodeID}` )
                .hSet(`${networkId}:node:${nodeID}`,"name", node.name)
                .hSet(`${networkId}:node:${nodeID}`,"short_name", node.short_name)
                .hSet(`${networkId}:node:${nodeID}`,"latitude", node.latitude)
                .hSet(`${networkId}:node:${nodeID}`,"longitude", node.longitude)
                .hSet(`${networkId}:node:${nodeID}`,"label_pos",  node.label_pos)
                .hSet(`${networkId}:node:${nodeID}`,"visible", + node.visible)
                .hSet(`${networkId}:node:${nodeID}`,"is_depot", + node.is_depot)
                .hSet(`${networkId}:node:${nodeID}`,"version",0)
                .sAdd(`${networkId}:nodes`,`${networkId}:node:${nodeID}`)
                .sAdd(`node:index`, `${networkId}:node:${nodeID}`)
                .sAdd(`${networkId}:empty`, `${networkId}:node:${nodeID}:segs`)
                .incr('node:maxKey');
            //Execute transaction                
            await multi.exec();
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    node.id = `${networkId}:node:${nodeID}`
    
    return node;
}

const updateNodeRedis = async (node, networkId) => {
    let response  = {}
    let nodeId
    const isActive = parser.isFromActive(node.id)
    response.isFromActive = isActive;
    //If is a node from active Network
    if(isActive){
        response.activeNode = node.id
        //Node id equals network:{id}:node:{id}
        nodeId = `${networkId}:${node.id}`
    }else{
        nodeId = node.id
    }

    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch node and segs from node for changes
            await isolatedClient.watch(`${node.id}`, `${node.id}:segs`);
            const affectedSegs = await isolatedClient.SMEMBERS(`${node.id}:segs`);
            //Define transaction : node Properties 
            const multi = isolatedClient
                .multi()
                .hSet(nodeId,"id", nodeId)
                .hSet(nodeId,"name", node.name)
                .hSet(nodeId,"short_name", node.short_name)
                .hSet(nodeId,"latitude", node.latitude)
                .hSet(nodeId,"longitude", node.longitude)
                .hSet(nodeId,"label_pos",  node.label_pos)
                .hSet(nodeId,"visible", + node.visible)
                .hSet(nodeId,"is_depot", + node.is_depot)

            //If is active add segs from active node to version node
            if(isActive){
                multi.sAdd(`${nodeId}:segs`, affectedSegs)
            }
            //Execute transaction                
            await multi.exec();
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log(`Failed transaction update node: ${node.id}`)
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    response.nodeInfo = node
    response.nodeInfo.id = nodeId
    return response;
}


//Delete node
const deleteNodeRedis = async (nodeToDelete, networkId) => {
    let response  = {}

    let nodeId
    const originalId = parser.getOriginalId(nodeToDelete)
    const isActive = parser.isFromActive(nodeToDelete)
    response.isFromActive = isActive;
    //If is a node from active Network
    if(isActive){
        //Node id equals network:{id}:node:{id}
        nodeId = `${networkId}:${nodeToDelete}`
    }else{
        nodeId = nodeToDelete
    }   
    //Delete node deletes associated Segs?
    try{
        await client.executeIsolated(async (isolatedClient) => {
            const affectedSegs = await setOps.get(networkId, `${originalId}:segs`)
            if(affectedSegs.length != 0){
                response.result = false;
                response.affectedSegs = affectedSegs
                return;
            }
            //Node to delete is either a version or an active node. In both cases we want to watch segs for changes
            isolatedClient.watch(`${nodeToDelete}`, `${nodeToDelete}:segs`);
            
            let multi
            /**
             * If node to delete is an active node, create a key network:{netId}:node:${nodeId} with deleted field true
             * Otherwise
             * Delete node from redis, remove node from node:index and remove from network:{netId}:nodes
             */
            if(isActive){
                multi = isolatedClient
                    .multi()
                    .HSET(nodeId, 'deleted', '1')
                    .sRem(`${networkId}:nodes`, nodeId)
            }else{
                multi = isolatedClient
                .multi()
                .del(nodeId)
                .sRem(`node:index`, nodeId)
                .sRem(`${networkId}:nodes`, nodeId)
            }
            //Execute transaction
            await multi.exec()
            response.result = true
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction delete")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    response.nodeID = nodeId
    return response;
}

const getNodeVersionRedis = async (nodeID) => {
    return await client.HGET(`node:${nodeID}`,"version").then((result) => {return parseInt(result)})
}

const getCurrentStateRedis = async () => {
    //Get all node keys
    const nodeKeys = await client.sMembers('node:index')
    let requests = []
    //iterate for each keys and get attributes
    nodeKeys.forEach(async (key) => {
        requests.push(client.HGETALL(key))
    })

    return await Promise.all(requests)

}

const getNodesRedis = async (nodeIds) => {
    let requests = []
    nodeIds.forEach(async (key) => {
        requests.push(client.HGETALL(`${key}`))
    })

    return await Promise.all(requests)
}

const getMaxKey = async () => {
    const maxKey = await client.get('node:maxKey')
    return parseInt(maxKey)
}
module.exports = {
    populateRedis, 
    createNodeRedis,
    updateNodeRedis,
    deleteNodeRedis,
    getNodeVersionRedis,
    getCurrentStateRedis,
    getMaxKey,
    getNodesRedis

}

