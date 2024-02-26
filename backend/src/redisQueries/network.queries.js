const { WatchError } = require('redis');
const client = require('../configs/redis.config')
const { parser } = require('../utils/parserId.utils')
const  setOps = require('../utils/setOps.utils')

const populateRedis = async () => {
    client.HSET(`network:1`, `id`, `1`)
    client.HSET(`network:1`, `name`, `Network1`)
    client.HSET(`network:1`, `active`, `1`)
    client.sAdd(`network:index`, ['network:1'])
    client.set(`network:maxKey`, '1')
}

const getNetworks = async () => {
    const networkKeys = await client.sMembers('network:index');
    const result = []
    for (const key of networkKeys) {
        const network = await client.HGETALL(key);
        const networkObject = {
            "id": parseInt(network.id),
            "name": network.name,
            "active": +network.active
        };
        result.push(networkObject);
    }

    return result
}

const getCurrentStateRedis = async (networkId) => {
    /**
     * Glines array stores Gline objects with Gline properties, lineIds, pathIds, segIds, nodeIds, trackIds, stopIds.
     * All other arrays store all the ids of the element in the network
    */
    const result = {
        glines:[],
        lines:new Set(),
        paths:new Set(),
        segs:new Set(),
        nodes:new Set(),
        tracks:new Set(),
        stops:new Set()
    }
        

    //Get gline Keys
    const glineKeys = await client.sMembers(`network:${networkId}:glines`);

    //Get node Keys
    const nodeKeys = await client.sMembers(`network:${networkId}:nodes`);


    for (const key of glineKeys) {
        //Get info of each gline
        const gline = await client.HGETALL(`${key}`);


        const glineObject = {
            "id": gline.id,
            "name": gline.name,
            "active": +gline.active
        };
        //Get lines/paths/segs/nodes/tracks/stops from gline
        const glineMembers = await bfs(key,networkId)

        //Add to network elements
        glineMembers.lines.forEach((id) => result.lines.add(id))
        glineMembers.paths.forEach((id) => result.paths.add(id))
        glineMembers.segs.forEach((id) => result.segs.add(id))
        glineMembers.nodes.forEach((id) => result.nodes.add(id))
        glineMembers.tracks.forEach((id) => result.tracks.add(id))
        glineMembers.stops.forEach((id) => result.stops.add(id))

        //Add to gline elements
        glineObject.lines = glineMembers.lines
        glineObject.paths = glineMembers.paths
        glineObject.segs = glineMembers.segs
        glineObject.nodes = glineMembers.nodes
        glineObject.tracks = glineMembers.tracks
        glineObject.stops = glineMembers.stops

        result.glines.push(glineObject);

    }

    return result;
};



const bfs = async (networkId) => {
    const glines = []
    const lines = []
    const paths = []
    const segs = []
    const nodes = []
    const tracks = []
    const stops = []
    const pathSegs = []
 
    const setVisited = new Set([])
    let queue = []
    queue.push(`${networkId}`)
    while(queue.length != 0){
        let nodeBFS = queue.shift();

        let element
        //If the element is not a version
        if(nodeBFS != `${networkId}` && parser.isFromActive(nodeBFS)){
            element = await client.HGETALL(`${networkId}:${nodeBFS}`)
            //If exists use the version
            if(Object.keys(element).length !== 0 ){
                nodeBFS = `${networkId}:${nodeBFS}`;
                //If element is deleted continue for the next iteration
                if(element.deleted == '1'){
                    continue
                }
            }else{
                element = await client.HGETALL(`${nodeBFS}`)
            }
        }else{
            element = await client.HGETALL(`${nodeBFS}`)
        }
        //Get type
        let type = parser.getType(nodeBFS)
        //Get id
        let id = parser.getId(nodeBFS)
        let originalId = `${type}:${id}`
        switch(type){
            case "network":
                //Get gline Keys
                const glineKeys = await setOps.get(networkId,`${originalId}:glines`);
                for(const gline of glineKeys){
                    if(!setVisited.has(gline)){
                        setVisited.add(gline)
                        queue.push(gline)
                    }
                }
                //Get node Keys
                const nodeKeys = await setOps.get(networkId,`${originalId}:nodes`);
                for(const node of nodeKeys){
                    if(!setVisited.has(node)){
                        setVisited.add(node)
                        queue.push(node)
                    }
                }
                //Get seg Keys
                const segKeys = await setOps.get(networkId,`${originalId}:segs`);
                for(const seg of segKeys){
                     if(!setVisited.has(seg)){
                         setVisited.add(seg)
                         queue.push(seg)
                     }
                }
                //Get track Keys
                const trackKeys = await setOps.get(networkId,`${originalId}:tracks`);
                for(const track of trackKeys){
                        if(!setVisited.has(track)){
                            setVisited.add(track)
                            queue.push(track)
                        }
                }
                //Get stop Keys
                const stopKeys = await setOps.get(networkId,`${originalId}:stops`);
                for(const stop of stopKeys){
                        if(!setVisited.has(stop)){
                            setVisited.add(stop)
                            queue.push(stop)
                        }
                }


                break;
            case "gline":
                //Get lines of gline
                const lineIds = await setOps.get(networkId,`${originalId}:lines`)
                for (const line of lineIds){
                    if(!setVisited.has(line)){
                        setVisited.add(line)
                        queue.push(line)
                    }
                }
                //Get paths of gline
                const pathGlineIds = await setOps.get(networkId,`${originalId}:paths`)
                for (const path of pathGlineIds){
                    if(!setVisited.has(path)){
                        setVisited.add(path)
                        queue.push(path)
                    }
                }

                glines.push({
                    "id": element.id,
                    "name": element.name,
                    "active": +element.active,
                    "lines": lineIds,
                    "paths": pathGlineIds
                })
                break;
            case "line":
                //Get paths of line
                const pathIds =await setOps.get(networkId,`${originalId}:paths`)
                for (const path of pathIds){
                    if(!setVisited.has(path)){
                        setVisited.add(path)
                        queue.push(path)
                    }
                }
                lines.push({
                    "id": element.id,
                    "name": element.name,
                    "active": +element.active,
                    "paths": pathIds
                })
                break;
            case "path":
                //Get segs of path -> zget Returns an array of objects with value(segId) and score(segOrder)
                const segIds = await setOps.zget(networkId,`${originalId}:segs`)
                for (const seg of segIds){
                    if(!setVisited.has(seg.value)){
                        setVisited.add(seg.value)
                        queue.push(seg.value)
                    }

                 
                    //Get tracks of path_seg
                    //TODO: CHECK THIS
                    //path:{id}:segment:{id}:tracks
                    const trackIds = await client.sMembers(`${nodeBFS}:${seg.value}:tracks`)
                    for(const track of trackIds ){
                        if(!setVisited.has(track)){
                            setVisited.add(track)
                            queue.push(track)
                        }
                    }
                    if(trackIds.length != 0){
                        pathSegs.push({
                            "id":`${nodeBFS}:${seg.value}`,
                            "pathId":nodeBFS,
                            "segId":seg.value,
                            "tracks":trackIds
                        })
                    }
                }
                paths.push({
                    "id": element.id,
                    "name": element.name, 
                    "empty": +element.empty,
                    "segments": segIds
                })
                break;
            case "segment":
                //Get nodes of segment
                const startNode = await client.hGet(`${nodeBFS}`,"start_node_id")
                const endNode = await client.hGet(`${nodeBFS}`,"end_node_id")
                if(!setVisited.has(startNode)){
                    setVisited.add(startNode)
                    queue.push(startNode)
                }
                if(!setVisited.has(endNode)){
                    setVisited.add(endNode)
                    queue.push(endNode)
                }

                var seg = {
                    "id": element.id,
                    "name": element.name,
                    "start_node_id":element.start_node_id,
                    "end_node_id":element.end_node_id,
                    "segment_type":element.segment_type,
                    "default_length":element.default_length,
                    "average_duration":element.average_duration,
                    "visible":+element.visible,
                    "version":element.version
                }

                const startNodeVersion = await client.HGETALL(`${networkId}:${element.start_node_id}`)
                //If exists use the version
                if(Object.keys(startNodeVersion).length !== 0 ){
                    seg.start_node_id = startNodeVersion.id
                }
                const endNodeVersion = await client.HGETALL(`${networkId}:${element.end_node_id}`)
                //If exists use the version
                if(Object.keys(endNodeVersion).length !== 0 ){
                    seg.end_node_id = endNodeVersion.id
                }
                segs.push(seg)
                
                break;
            case "node":
                nodes.push({
                    "id":element.id,
                    "name":element.name,
                    "short_name":element.short_name,
                    "latitude":element.latitude,
                    "longitude":element.longitude,
                    "label_pos":element.label_pos,
                    "visible":+element.visible,
                    "is_depot":+element.is_depot,
                    "version":element.version
                })
                break;
            case "track":
                //Get stops of track
                const startStop = element.start_stop
                const endStop = element.end_stop

                if(!setVisited.has(startStop)){
                    setVisited.add(startStop);
                    queue.push(startStop)
                }
                if(!setVisited.has(endStop)){
                    setVisited.add(endStop)
                    queue.push(endStop)
                }
                const track = {
                    "id":element.id,
                    "name":element.name,
                    "start_stop":element.start_stop,
                    "end_stop":element.end_stop,
                    "visible":+element.visible,
                    "length":element.length
                }

                const startStopVersion = await client.HGETALL(`${networkId}:${element.start_stop}`)
                //If exists use the version
                if(Object.keys(startStopVersion).length !== 0 ){
                    track.start_stop = startStopVersion.id
                }
                const endStopVersion = await client.HGETALL(`${networkId}:${element.end_stop}`)
                //If exists use the version
                if(Object.keys(endStopVersion).length !== 0 ){
                    track.end_stop = endStopVersion.id
                }
                tracks.push(track)
                break
            case "stop":
                stops.push({
                    "id":element.id,
                    "name":element.name,
                    "short_name":element.name,
                    "latitude":element.latitude,
                    "longitude":element.longitude,
                    "label_pos":element.label_pos,
                    "visible":+element.visible,
                    "active":element.active,
                    "code":element.code,
                    "version":element.version
                })
                break;
        }
    }

    const result = {
        "glines":glines,
        "lines":lines,
        "paths":paths,
        "segs":segs,
        "nodes":nodes,
        "stops":stops,
        "tracks":tracks,
        "pathSegs":pathSegs
    }


    return result
}

const createNetworkRedis = async (network) => {
    let networkID
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch node maxKey for changes 
            await isolatedClient.watch('network:maxKey');
            //Get node maxKey
            await isolatedClient.get('network:maxKey').then((result) => {
                if(result == null){
                    networkID = 0;
                }else{
                    networkID = parseInt(result) + 1
                }
                
            })
            //Define transaction : node Properties + increment node:maxKey
            const multi = isolatedClient
                .multi()
                .hSet(`network:${networkID}`,"id", networkID )
                .hSet(`network:${networkID}`,"name", network.name)
                .hSet(`network:${networkID}`,"active", '0')
                .sAdd(`network:index`, `network:${networkID}`)
                .incr('network:maxKey');
            //Execute transaction                
            await multi.exec();

            //If create network from active add glines from active (1) to this network Glines
            //TODO: ADD other elements not just glines
            if(network.startFromActive){
                await isolatedClient.watch('network:1:glines')
                const activeNetworkGlines = await isolatedClient.sMembers('network:1:glines')
                const multi1 = isolatedClient
                    .multi()
                    .sAdd(`network:${networkID}:glines`,activeNetworkGlines)
                await multi1.exec()
            }
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    network.id = networkID
    
    return network;
}

async function mergeDrafts(draftId1, draftId2) {
    // Get the data for the two drafts.
    const draft1 = await bfs(draftId1);
    const draft2 = await bfs(draftId2);
    // Create a map of all of the elements in the two drafts.
    const elementsMap1 = new Map();
    const elementsMap2 = new Map();
    
    draft1.glines.forEach((gline) => elementsMap1.set(gline.id, gline))
    draft1.lines.forEach((line) => elementsMap1.set(line.id, line))
    draft1.paths.forEach((path) => elementsMap1.set(path.id, path))
    draft1.segs.forEach((seg) => elementsMap1.set(seg.id, seg))
    draft1.nodes.forEach((node) => elementsMap1.set(node.id, node))

    draft2.glines.forEach((gline) => elementsMap2.set(gline.id, gline))
    draft2.lines.forEach((line) => elementsMap2.set(line.id, line))
    draft2.paths.forEach((path) => elementsMap2.set(path.id, path))
    draft2.segs.forEach((seg) => elementsMap2.set(seg.id, seg))
    draft2.nodes.forEach((node) => elementsMap2.set(node.id, node))

    let setUnion = new Set([...elementsMap1.keys(),...elementsMap2.keys()])

    // Find all of the conflicts.
    const conflicts = [];   
    for (const key of setUnion) {
      let originalId = parser.getOriginalId(key)
      let draf1Key = `${draftId1}:${originalId}`
      let draf2Key = `${draftId2}:${originalId}`
      let element1 = elementsMap1.get(draf1Key)
      let element2 = elementsMap2.get(draf2Key) 
      if(element1 == undefined && element2 == undefined){
        continue
      }

      if(element1 == undefined){
        element1 = elementsMap1.get(originalId)
      }
      if(element2 == undefined){
        element2 = elementsMap2.get(originalId)
      }
      if (element1 !== element2) {
        conflicts.push({
          key: key,
          [draftId1]: element1 != undefined ? element1 : 'undefined',
          [draftId2]: element2 != undefined ? element2 : 'undefined'
        });
      }
    }
  

    // Return the conflicts and non-conflicts.
    return {
       conflicts

    };
  }

module.exports = {
    getNetworks,
    getCurrentStateRedis,
    populateRedis,
    createNetworkRedis,
    bfs,
    mergeDrafts
}