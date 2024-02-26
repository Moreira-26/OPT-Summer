const { WatchError } = require('redis');
const client = require('../configs/redis.config')

const { getSegmentsDB } = require('../dbQueries/segment.queries')
const { parser } = require('../utils/parserId.utils')
const  setOps = require('../utils/setOps.utils')
//Get segments from postgreSQL and populates redis 
const populateRedis = async () => {
    const segmentsDB = await getSegmentsDB();

    if(segmentsDB.resultsRows == undefined) {
        console.log("Error fetching segments from DB " + segmentsDB)
        return;
    }
    var maxID = 0;
    segmentsDB.resultsRows.forEach(async (segment) => {
        if(segment.default_length == null){
            console.log("Segment length null")
        }
        if(segment.id > maxID){ maxID = segment.id}
        await client.hSet(`segment:${segment.id}`, "id", `segment:${segment.id}`);
        await client.hSet(`segment:${segment.id}`,"name", segment.name);
        await client.hSet(`segment:${segment.id}`,"start_node_id", `node:${segment.start_node_id}`);
        await client.hSet(`segment:${segment.id}`,"end_node_id", `node:${segment.end_node_id}`);
        await client.hSet(`segment:${segment.id}`,"segment_type", segment.segment_type);
        await client.hSet(`segment:${segment.id}`,"default_length", segment.default_length);
        await client.hSet(`segment:${segment.id}`,"average_duration", segment.average_duration);
        await client.hSet(`segment:${segment.id}`,"visible", + segment.visible);
        await client.hSet(`segment:${segment.id}`,"version", 0);
        await client.sAdd(`node:${segment.start_node_id}:segs`, `segment:${segment.id}`)
        await client.sAdd(`node:${segment.end_node_id}:segs`, `segment:${segment.id}`)
        await client.sAdd(`segment:index`, `segment:${segment.id}`)
    });
    await client.set('segment:maxKey', maxID)
}

const createSegmentRedis = async (segment, networkId) => {
    let segmentID
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch segment maxKey for changes
            await isolatedClient.watch('segment:maxKey');
            //Get start end and end node
            /**
             * This ids can only be a version or an active that hasnt a version (Frontend only has access to this)
            */
            const startNode = await isolatedClient.HGETALL(`${segment.start_node_id}`);
            const endNode = await isolatedClient.HGETALL(`${segment.end_node_id}`);
            //Get segment maxKey
            await isolatedClient.get("segment:maxKey").then((result) => {
                if(result == null){
                    segmentID = 0;
                }else{
                    segmentID = parseInt(result) + 1
                }
            })
            //Define transaction : node Properties + increment node:maxKey
            const multi = isolatedClient
                .multi()
                .hSet(`${networkId}:segment:${segmentID}`,"id", `${networkId}:segment:${segmentID}`)
                .hSet(`${networkId}:segment:${segmentID}`,"name", segment.name)
                .hSet(`${networkId}:segment:${segmentID}`,"start_node_id", segment.start_node_id)
                .hSet(`${networkId}:segment:${segmentID}`,"end_node_id", segment.end_node_id)
                .hSet(`${networkId}:segment:${segmentID}`,"segment_type", segment.segment_type)
                .hSet(`${networkId}:segment:${segmentID}`,"default_length",  segment.default_length)
                .hSet(`${networkId}:segment:${segmentID}`,"visible", + segment.visible)
                .hSet(`${networkId}:segment:${segmentID}`,"average_duration", + segment.average_duration)
                .hSet(`${networkId}:segment:${segmentID}`,"version", 0)
                .sAdd(`${networkId}:segs`, `${networkId}:segment:${segmentID}`)
                .sAdd(`segment:index`, `${networkId}:segment:${segmentID}`)
                .incr('segment:maxKey');
            
            const nodeIds = [segment.start_node_id, segment.end_node_id]
            for(const nodeId of nodeIds){
                //Check if version of node:segs exist
                const nodeSegsVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(nodeId)}:segs`)
                //If exists 
                if(nodeSegsVersion !== null){
                    //Add created segment to set of segments
                    multi.sAdd(`${networkId}:${parser.getOriginalId(nodeId)}:segs`, `${networkId}:segment:${segmentID}`)
                    //If empty remove relation from network:empty
                    if(nodeSegsVersion.length == 0){
                        multi.sRem(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(nodeId)}:segs`)
                    }
                }else{
                    //Get segments from original node
                    const segsFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(nodeId)}:segs`)
                    //Add seg created
                    segsFromOriginal.push(`${networkId}:segment:${segmentID}`)
                    //Add all segments to new relation set 
                    multi.sAdd(`${networkId}:${parser.getOriginalId(nodeId)}:segs`, segsFromOriginal)
                }
            }
            //Execute transaction                
            await multi.exec();

            //Add nodes coordinates to return payload
            segment.start_node_coordinates = [parseFloat(startNode.longitude.replace(',', '.')), parseFloat(startNode.latitude.replace(',', '.'))]
            segment.end_node_coordinates = [parseFloat(endNode.longitude.replace(',', '.')), parseFloat(endNode.latitude.replace(',', '.'))]
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    segment.id = `${networkId}:segment:${segmentID}`
    return segment
}


const updateSegmentRedis = async (segment,networkId) => {
    let response = {}
    let segmentId = segment.id
    const isActive = parser.isFromActive(segment.id)
    //If is a segment from active Network
    if(isActive){
        response.activeSegment = segment.id
        //Create new id
        segmentId = `${networkId}:${segment.id}`
    }

    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch segment for changes
            await isolatedClient.watch(`${segment.id}`);
            //Get new start node and end node
            const startNode = await isolatedClient.HGETALL(`${segment.start_node_id}`);
            const endNode = await isolatedClient.HGETALL(`${segment.end_node_id}`);
            //Get old start node and end node ids
            const oldStartNodeID = await isolatedClient.HGET(`${segment.id}`, 'start_node_id');
            const oldEndNodeID = await isolatedClient.HGET(`${segment.id}`, 'end_node_id');
       

            //Define transaction : node Properties + add segment to start/end node segments
            const multi = isolatedClient
                .multi()
                .hSet(segmentId,"id", segmentId)
                .hSet(segmentId,"name", segment.name)
                .hSet(segmentId,"start_node_id", segment.start_node_id)
                .hSet(segmentId,"end_node_id", segment.end_node_id)
                .hSet(segmentId,"segment_type", segment.segment_type)
                .hSet(segmentId,"default_length",  segment.default_length)
                .hSet(segmentId,"visible", + segment.visible)
                .hSet(segmentId,"average_duration", + segment.average_duration)
                .hSet(segmentId,"version", segment.version)

            const newNodeIds = [startNode.id, endNode.id]
            const oldNodeIds = [oldStartNodeID, oldEndNodeID]

            for(let i = 0; i < newNodeIds.length; i++){
                let newNodeId = newNodeIds.at(i)
                let oldNodeId = oldNodeIds.at(i)
                if(newNodeId == oldNodeId){
                    continue;
                }
                
                //NEWNODE
                //Check if version of new node:segs exist
                const newNodeSegsVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(newNodeId)}:segs`)
                //If new node:segs version is not null
                if(newNodeSegsVersion !== null){
                    //Add updated segment to set of segments
                    multi.sAdd(`${networkId}:${parser.getOriginalId(newNodeId)}:segs`, segmentId)
                    //Remove new node segs from empty set
                    if(newNodeSegsVersion.length == 0){
                        multi.sRem(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(newNodeId)}:segs`)
                    }
                }else{
                    console.log("NEWNODE segs version not found")
                    //Get segments from original node
                    const segsFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(newNodeId)}:segs`)
                    //Add seg updated
                    segsFromOriginal.push(segmentId)
                    console.log("SegsFromOriginal new node")
                    console.log(segsFromOriginal)
                    //Add all segments to new relation set 
                    multi.sAdd(`${networkId}:${parser.getOriginalId(newNodeId)}:segs`, segsFromOriginal)
                }

                //OLDNODE
                //Check if version of old node:segs exist
                const oldNodeSegsVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(oldNodeId)}:segs`)
                //If old node:segs version is not null
                if(oldNodeSegsVersion !== null){
                    //Remove updated segment from old node set of segments
                    multi.sRem(`${networkId}:${parser.getOriginalId(oldNodeId)}:segs`, segmentId)
                    //If numebr segs of version is 1 -> set will become empty
                    if(oldNodeSegsVersion.length == 1){
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(oldNodeId)}:segs`)
                    }
                }else{
                    console.log("OLDNODE segs version not found")
                    //Get segments from original node
                    const segsFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(oldNodeId)}:segs`)
                    //Remove seg updated
                    const index = segsFromOriginal.findIndex(segId => segId == `${parser.getOriginalId(segmentId)}`)
                    if(index != -1){
                        segsFromOriginal.splice(index, 1)
                    }
                    console.log("SegsFromOriginal old node")
                    console.log(segsFromOriginal)
                    //If segs become empty
                    if(segsFromOriginal.length == 0){
                        //Add node segs to empty set
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(oldNodeId)}:segs`) 
                    }else{
                        //Add all segments to new relation set except the removed segment
                    multi.sAdd(`${networkId}:${parser.getOriginalId(oldNodeId)}:segs`, segsFromOriginal)
                    }
                    
                }

            }

            //Execute transaction                
            await multi.exec();
          
            segment.start_node_coordinates = [parseFloat(startNode.longitude.replace(',', '.')), parseFloat(startNode.latitude.replace(',', '.'))]
            segment.end_node_coordinates = [parseFloat(endNode.longitude.replace(',', '.')), parseFloat(endNode.latitude.replace(',', '.'))]
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log("AQUI")
            console.log(`Error: ${error}`)
        }
        return false;
    }


    return segment
}

const deleteSegmentRedis = async (segmentInfo, networkId) => {
    let response  = {}

    let segmentId
    const isActive = parser.isFromActive(segmentInfo.id)
    response.isFromActive = isActive;
    //If is a node from active Network
    if(isActive){
        //Node id equals network:{id}:node:{id}
        segmentId = `${networkId}:${segmentInfo.id}`
    }else{
        segmentId = segmentInfo.id
    }

    const nodeIds = [segmentInfo.start_node_id, segmentInfo.end_node_id]   
    //Delete node deletes associated Segs?
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Node to delete is either a version or an active node. In both cases we want to watch segs for changes
            isolatedClient.watch(`${segmentInfo.id}`);
            
            let multi
            /**
             * If segment to delete is an active node, create a key network:{netId}:segment:${segId} with deleted field true
             * Otherwise
             * Delete segment from redis, remove segment from node:index and remove from network:{netId}:segs
             */
            if(isActive){
                multi = isolatedClient
                    .multi()
                    .HSET(segmentId, 'deleted', '1')   
            }else{
                multi = isolatedClient
                .multi()
                .del(segmentId)
                .sRem(`segment:index`, segmentId)
                .sRem(`${networkId}:segs`, segmentId)
            }

            for(const nodeId of nodeIds){
                const nodeSegsVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(nodeId)}:segs`)
                if(nodeSegsVersion !== null){
                    //Remove deleted segment from old set of segments
                    multi.sRem(`${networkId}:${parser.getOriginalId(nodeId)}:segs`,segmentId)
                    //If number segs of version is 1 -> set will become empty
                    if(nodeSegsVersion.length == 1){
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(nodeId)}:segs`)
                    }
                }else{
                    //Get segments from original node
                    const segsFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(nodeId)}:segs`)
                    //Remove seg updated
                    const index = segsFromOriginal.findIndex(segId => segId == `${parser.getOriginalId(segmentId)}`)
                    if(index != -1){
                        segsFromOriginal.splice(index, 1)
                    }
                    //If segs become empty
                    if(segsFromOriginal.length == 0){
                        //Add node segs to empty set
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(nodeId)}:segs`) 
                    }
                    //Add all segments to new relation set except the removed segment
                    multi.sAdd(`${networkId}:${parser.getOriginalId(nodeId)}:segs`, segsFromOriginal)
                }
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
    response.segmentId = segmentId
    return response;
}


const getSegmentVersionRedis = async (segmentID) => {
    return await client.hGet(`segment:${segmentID}`, "version").then((result) => {return parseInt(result)})
}


const getCurrentStateRedis = async () => {
    //Get all keys from segment
    const segmentKeys = await client.sMembers('segment:index')
    let requests = []
    //iterate for each keys and get attributes
    segmentKeys.forEach(async (key) => {
        requests.push(client.HGETALL(key))
    })

    return await Promise.all(requests)
}

const getSegmentsRedis = async (segmentIds) => {
    let requests = []
    segmentIds.forEach(async (key) => {
        requests.push(client.HGETALL(`${key}`))
    })

    return await Promise.all(requests)
}


module.exports = {
    populateRedis,
    createSegmentRedis,
    updateSegmentRedis,
    deleteSegmentRedis,
    getSegmentVersionRedis,
    getCurrentStateRedis,
    getSegmentsRedis
}