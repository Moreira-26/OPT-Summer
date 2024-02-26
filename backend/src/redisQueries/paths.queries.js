const { WatchError } = require('redis');
const client = require('../configs/redis.config')
const { parser } = require('../utils/parserId.utils')
const  setOps = require('../utils/setOps.utils')
const { getPathsDB, getPathSegsDB, getPathSegTracksDB } = require('../dbQueries/path.queries')

const populateRedis = async () => {
    //Get paths from DB
    const pathsDB = await getPathsDB();
    if(pathsDB.resultsRows == undefined){
        console.log("Error fetching paths from DB" + pathsDB)
        return;
    }

    var maxID = 0;
    //Populate redis with path info
    pathsDB.resultsRows.forEach(async (path) => {
        if(path.id > maxID){maxID = path.id}
        await client.hSet(`path:${path.id}`, "id", `path:${path.id}`);
        await client.hSet(`path:${path.id}`, "name", path.name);
        await client.hSet(`path:${path.id}`, "empty", + path.empty);
        await client.sAdd(`path:index`, `path:${path.id}`)

        //Get segs of path 
        const segsOfPath = await getPathSegsDB(path.id);
        if(segsOfPath.resultsRows != undefined){
            //Add each seg to path:{pathId}:segs set AND add path to seg:{segID}:paths set
            segsOfPath.resultsRows.forEach(async (seg) => {
                await client.zAdd(`path:${path.id}:segs`,{score:seg.ptsg_order,value:`segment:${seg.id}`})
                await client.sAdd(`segment:${seg.id}:paths`, `path:${path.id}`)
                //Get tracks of path_seg
                const tracksOfPathSegs = await getPathSegTracksDB(path.id, seg.id);
                if(tracksOfPathSegs.resultsRows != undefined){
                    //Add each track to path:{pathId}:seg:{segId}.tracks
                    tracksOfPathSegs.resultsRows.forEach(async (track) => {
                        await client.sAdd(`path:${path.id}:segment:${seg.id}:tracks`, `track:${track.id}`)
                        await client.sAdd(`track:${track.id}:pathSegs`,`path:${path.id}:segment:${seg.id}` )
                    })  
                }
            })
        }
    });
    await client.set('path:maxKey', maxID)
}

const createPathRedis = async (path, networkId) => {
    let pathID
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch path maxKey for changes
            await isolatedClient.watch('path:maxKey')
            //Get path maxKey
            await isolatedClient.get("path:maxKey").then((result) => {
                if(result == null){
                    pathID = 0;
                }else{
                    pathID = parseInt(result) + 1
                }
            })
            const multi = isolatedClient
                .multi()
                .hSet(`${networkId}:path:${pathID}`,"id", `${networkId}:path:${pathID}`)
                .hSet(`${networkId}:path:${pathID}`,"name", path.name)
                .hSet(`${networkId}:path:${pathID}`,"empty", +path.empty)
                .sAdd(`${networkId}:paths`, `${networkId}:path:${pathID}`)
                .sAdd('path:index', `${networkId}:path:${pathID}`)
                .incr('path:maxKey')
            
            for(const seg of path.segs){
                //Check if version of seg:paths exist
                const segPathsVersion = await setOps.getVersion(networkId, `${parser.getOriginalId(seg.id)}:paths`)
                //If exists
                if(segPathsVersion !== null){
                    //Add create path to set of paths
                    multi.sAdd(`${networkId}:${parser.getOriginalId(seg.id)}:paths`, `${networkId}:path:${pathID}`)
                    //If empty remove relation from network:empty
                    if(segPathsVersion.length == 0){
                        multi.sRem(`${networkId}:empty`, `${networkId}:${parser.getOriginalId(seg.id)}:paths`)
                    }
                }else{
                    //Get paths from original seg
                    const pathsFromOriginal = await client.sMembers(`${parser.getOriginalId(seg.id)}:paths`)
                    //Add path created 
                    pathsFromOriginal.push(`${networkId}:path:${pathID}`)
                    //Add all paths to new relation set
                    multi.sAdd(`${networkId}:${parser.getOriginalId(seg.id)}:paths`, pathsFromOriginal)
                }

                //Add to ordered set
                multi.zAdd(`${networkId}:path:${pathID}:segs`, {score:seg.order, value:seg.id})
            }

            multi.exec()
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    path.id = `${networkId}:path:${pathID}`
    return path

}

const updatePathRedis = async (path, networkId) => {
    let response = {}
    let pathId = path.id
    const isActive = parser.isFromActive(path.id)
    if(isActive){
        response.activePath = path.id
        pathId = `${networkId}:${path.id}`
    }
    console.log(`PathId:${pathId}`)
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch path maxKey for changes
            await isolatedClient.watch(`${path.id}`)

            const multi = isolatedClient
                .multi()
                .hSet(pathId, "id", pathId)
                .hSet(pathId, "name", path.name)
                .hSet(pathId, "empty", +path.empty)

            
            //Get old segs 
            const oldSegs = await setOps.zget(networkId,`${parser.getOriginalId(path.id)}:segs`)
            for(const oldSeg of oldSegs){
                //Check if version of old seg:paths exist 
                const oldSegPathsVersion = await setOps.getVersion(networkId, `${parser.getOriginalId(oldSeg.value)}:paths`)

                //If old seg:paths version is not null
                if(oldSegPathsVersion !== null){
                    //Remove updated path from old seg set of paths
                    multi.sRem( `${parser.getOriginalId(oldSeg.value)}:paths`, pathId)
                    //If number paths of version is 1 -> set will become empty
                    if(oldSegPathsVersion.length == 1){
                        multi.sAdd(`${networkId}:empty`, `${networkId}:${parser.getOriginalId(oldSeg.value)}:paths`)
                    }
                }else{
                    //Get paths from original segs
                    const pathsFromOriginal = await client.sMembers(`${parser.getOriginalId(oldSeg.value)}:paths`)

                    //Remove path updated
                    const index = pathsFromOriginal.findIndex(id => id == `${parser.getOriginalId(pathId)}`)
                    if(index != -1){
                        pathsFromOriginal.splice(index,1)
                    }
                    if(pathsFromOriginal.length == 0){
                        multi.sAdd(`${networkId}:empty`, `${networkId}:${parser.getOriginalId(oldSeg.value)}:paths`)
                    }else{
                        //Add all paths to new relation set except the removed path
                        multi.sAdd(`${networkId}:${parser.getOriginalId(oldSeg.value)}:paths`, pathsFromOriginal)
                    }
                }
            }

            //If not active path
            if(!isActive){
                //Remove from relation version the old segs -> aka delete the key
                multi.del(`${pathId}:segs`)
            }
            
            

            for(const newSeg of path.segs){
                //Check if version of new seg paths exist
                const newSegPathsVersion  = await setOps.getVersion(networkId, `${parser.getOriginalId(newSeg.id)}:paths`)
               
                if(newSegPathsVersion !== null){
                    //Add updated path to set of paths
                    multi.sAdd(`${networkId}:${parser.getOriginalId(newSeg.id)}:paths`, pathId)
                    //Remove new seg paths from empty
                    if(newSegPathsVersion.length == 0){
                        multi.sRem(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(newSeg.id)}:paths`)
                    }
                }else{
                    //Get paths from original segment
                    const pathsFromOriginal  = await client.SMEMBERS(`${parser.getOriginalId(newSeg.id)}:paths`)
    
                    //Add path updated
                    pathsFromOriginal.push(pathId)
                    multi.sAdd(`${networkId}:${parser.getOriginalId(newSeg.id)}:paths`,pathsFromOriginal)
                }

                multi.zAdd(`${pathId}:segs`,  {score:newSeg.order, value:newSeg.id})
            }
            await multi.exec()
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction update")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    path.id = pathId
    response.path = path
    return response

}

const deletePathRedis = async (pathInfo, networkId) => {
    let response = {}

    let pathId
    const isActive = parser.isFromActive(pathInfo.id)
    response.isFromActive = isActive

    if(isActive){
        response.activePath = pathInfo.id
        pathId = `${networkId}:${pathInfo.id}`
    }else{
        pathId = pathInfo.id
    }

    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch path maxKey for changes
            await isolatedClient.watch(`${pathInfo.id}`)
            const lines = await setOps.get(networkId,`${parser.getOriginalId(pathId)}:lines`)
            const glines = await setOps.get(networkId,`${parser.getOriginalId(pathId)}:glines`)
            if(lines.length != 0 || glines.length != 0){
                response.result = false
                return 
            }

            const multi = isolatedClient.multi()
            if(isActive){
                multi.HSET(pathId, 'deleted', '1')
            }else{
                multi
                .del(pathId)
                .sRem('path:index', pathId)
                .sRem(`${networkId}:paths`, pathId)
            }

            const segsOfPath = await setOps.zget(networkId,`${parser.getOriginalId(pathId)}:segs`)
            for(const seg of segsOfPath){
                //Get seg paths version
                const segPathsVersion = await setOps.getVersion(networkId, `${parser.getOriginalId(seg.value)}:paths`)

                if(segPathsVersion !== null){
                    multi.sRem(`${networkId}:${parser.getOriginalId(seg.value)}:paths`, pathId)
                    if(segPathsVersion.length == 1){
                        multi.sAdd(`${networkId}:empty`, `${networkId}:${parser.getOriginalId(seg.value)}:paths`)
                        multi.sAdd(`${networkId}:segs`, `${networkId}:${parser.getOriginalId(seg.value)}`)
                    }
                }else{
                    const pathsFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(seg.value)}:paths`)
                    const index = pathsFromOriginal.findIndex(id => id == `${parser.getOriginalId(pathId)}`)
                    if(index != -1){
                        pathsFromOriginal.splice(index, 1)
                    }
                    if(pathsFromOriginal.length == 0){
                        multi.sAdd(`${networkId}:empty`, `${networkId}:${parser.getOriginalId(seg.value)}:paths`)
                        multi.sAdd(`${networkId}:segs`, `${networkId}:${parser.getOriginalId(seg.value)}`)
                    }else{
                        multi.sAdd(`${networkId}:${parser.getOriginalId(seg.value)}:paths`, pathsFromOriginal)
                    }
                }

                await multi.exec()
                response.result = true
            }
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("AQUI")
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    response.pathId = pathId
    return response

}


const getCurrentStateRedis = async () => {
    //Get path keys 
    const pathKeys = await client.sMembers('path:index')
    let requests = []

    pathKeys.forEach(async (key) => {
        //Get path info
        requests.push(client.HGETALL(key))
    })

    return await Promise.all(requests)
}


const getPathsRedis = async (pathIds) => {
    let requests = []
    pathIds.forEach(async (key) => {
        requests.push(client.HGETALL(`path:${key}`))
    })

    return await Promise.all(requests)
}


module.exports = {
    populateRedis,
    getCurrentStateRedis,
    getPathsRedis,
    createPathRedis,
    updatePathRedis,
    deletePathRedis
}