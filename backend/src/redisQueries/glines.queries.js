const { WatchError } = require('redis');
const client = require('../configs/redis.config')

const { getGlinesDB, getGlineLinesDB, getGlinePathsDB } = require('../dbQueries/gline.queries')

const populateRedis = async () => {
    //Get Glines From DB
    const glinesDB = await getGlinesDB();
    if(glinesDB.resultsRows == undefined){
        console.log("Error fetching glines from DB" + glinesDB)
        return;
    }

    var maxID = 0;
    //Populate redis with Gline info
    glinesDB.resultsRows.forEach(async (gline) => {
        if(gline.id > maxID){maxID = gline.id}
        await client.hSet(`gline:${gline.id}`, "id", `gline:${gline.id}`);
        await client.hSet(`gline:${gline.id}`, "name", gline.name);
        await client.hSet(`gline:${gline.id}`, "active", + gline.active);
        await client.sAdd(`gline:index`, `gline:${gline.id}`)
        await client.sAdd(`network:1:glines`, `gline:${gline.id}`)

        //Getting lines of gline
        const linesOfGline = await getGlineLinesDB(gline.id);
        if(linesOfGline.resultsRows != undefined){
            //Add each line to gline:{id}:lines set AND add gline to line:{id}:glines set
            linesOfGline.resultsRows.forEach(async (line) => {
                await client.sAdd(`gline:${gline.id}:lines`, `line:${line.id}`)
                await client.sAdd(`line:${line.id}:glines`, `gline:${gline.id}`)
            })
        }

        //Getting paths of gline 
        const pathsOfGline = await getGlinePathsDB(gline.id);
        if(pathsOfGline.resultsRows != undefined){   
            //Add each path to gline:{id}:paths set
            pathsOfGline.resultsRows.forEach(async (path) => {
                await client.sAdd(`gline:${gline.id}:paths`, `path:${path.id}`)
            })
        }
    });
    await client.set('gline:maxKey', maxID)
}

const getCurrentStateRedis = async (networkId) => {
    //Get gline Keys
    const glineKeys = await client.sMembers(`network:${networkId}:glines`);
    const result = []
    
    for (const key of glineKeys) {
        //Get info of each gline
        const gline = await client.HGETALL(`${key}`);

        const glineObject = {
            "id": gline.id,
            "name": gline.name,
            "active": +gline.active
        };

        //Get lines/paths/segs/nodes/tracks/stops from gline
        const glineMembers = await bfs(gline.id)
        glineObject.lines = glineMembers.lines
        glineObject.paths = glineMembers.paths
        glineObject.segs = glineMembers.segs
        glineObject.nodes = glineMembers.nodes
        glineObject.tracks = glineMembers.tracks
        glineObject.stops = glineMembers.stops

        result.push(glineObject);
    
    }

    return result;
};

const bfs = async (glineId) => {
    const lines = []
    const paths = []
    const segs = []
    const nodes = []
    const tracks = []
    const stops = []


    const setVisited = new Set([])
    let queue = []
    queue.push(`gline:${glineId}`)
    while(queue.length != 0){
        let nodeBFS = queue.shift()
        let type = nodeBFS.substring(0,nodeBFS.indexOf(':'))
        let id = nodeBFS.substring(nodeBFS.indexOf(':') + 1)
        switch(type){
            case "gline":
                //Get lines of gline
                const lineIds = await client.sMembers(`gline:${id}:lines`)
                for (const lineId of lineIds){
                    const line = `line:${lineId}` 
                    if(!setVisited.has(line)){
                        setVisited.add(line)
                        lines.push(parseInt(lineId))
                        queue.push(line)
                    }
                }
                //Get paths of gline
                const pathGlineIds = await client.sMembers(`gline:${id}:paths`)
                for (const pathId of pathGlineIds){
                    const path = `path:${pathId}` 
                    if(!setVisited.has(path)){
                        setVisited.add(path)
                        paths.push(parseInt(pathId))
                        queue.push(path)
                    }
                }
                break;
            case "line":
                //Get paths of line
                const pathIds = await client.sMembers(`line:${id}:paths`)
                for (const pathId of pathIds){
                    const path = `path:${pathId}` 
                    if(!setVisited.has(path)){
                        setVisited.add(path)
                        paths.push(parseInt(pathId))
                        queue.push(path)
                    }
                }
                break;
            case "path":
                //Get segs of path
                const segIds = await client.sMembers(`path:${id}:segs`)
                for (const segId of segIds){
                    const seg = `segment:${segId}` 
                    if(!setVisited.has(seg)){
                        setVisited.add(seg)
                        segs.push(parseInt(segId))
                        queue.push(seg)
                        //Get tracks of path_seg
                        const trackIds = await client.sMembers(`path:${id}:seg:${segId}:tracks`)
                        for(const trackId of trackIds ){
                            const track = `track:${trackId}`
                            if(!setVisited.has(track)){
                                setVisited.add(track)
                                tracks.push(parseInt(trackId))
                                queue.push(track)
                            }
                        }
                    }
                }
                break;
            case "segment":
                //Get nodes of segment
                const startNodeId = await client.hGet(`segment:${id}`,"start_node_id")
                const endNodeId = await client.hGet(`segment:${id}`,"end_node_id")
                const startNode = `node:${startNodeId}`
                const endNode = `node:${endNodeId}`
                if(!setVisited.has(startNode)){
                    setVisited.add(startNode)
                    nodes.push(parseInt(startNodeId))
                }
                if(!setVisited.has(endNode)){
                    setVisited.add(endNode)
                    nodes.push(parseInt(endNodeId))
                }
                break;
            case "track":
                //Get stops of track
                const startStopId = await client.hGet(`track:${id}`, "start_stop")
                const endStopId = await client.hGet(`track:${id}`, "end_stop")
                const startStop = `stop:${startStopId}`
                const endStop = `stop:${endStopId}`

                if(!setVisited.has(startStop)){
                    setVisited.add(startStop);
                    stops.push(parseInt(startStopId))
                }
                if(!setVisited.has(endStop)){
                    setVisited.add(endStop)
                    stops.push(parseInt(endStopId))
                }
                break
        }
    }

    const result = {
        "lines":lines,
        "paths":paths,
        "segs":segs,
        "nodes":nodes,
        "stops":stops,
        "tracks":tracks
    }

    return result
}

module.exports = {
    populateRedis,
    getCurrentStateRedis
}