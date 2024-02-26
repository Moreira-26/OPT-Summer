const { WatchError } = require('redis');
const client = require('../configs/redis.config')

const { getStopsDB } = require('../dbQueries/stop.queries')
const { parser } = require('../utils/parserId.utils')
const  setOps = require('../utils/setOps.utils')

//Get stops from postgreSQL and populates redis
const populateRedis = async () => {
    const stopsDB = await getStopsDB();
    if(stopsDB.resultsRows == undefined) {
        console.log("Error fetching stops from DB " + stopsDB)
        return;
    }

    var maxID = 0;

    stopsDB.resultsRows.forEach(async (stop) => {
        if(stop.id > maxID) {maxID = stop.id}
        await client.hSet(`stop:${stop.id}`, "id", `stop:${stop.id}`);
        await client.hSet(`stop:${stop.id}`, "name", stop.name);
        await client.hSet(`stop:${stop.id}`, "short_name", stop.short_name);
        await client.hSet(`stop:${stop.id}`, "latitude", stop.latitude);
        await client.hSet(`stop:${stop.id}`, "longitude", stop.longitude);
        await client.hSet(`stop:${stop.id}`, "label_pos", stop.label_pos);
        await client.hSet(`stop:${stop.id}`, "visible", +stop.visible);
        await client.hSet(`stop:${stop.id}`, "active", +stop.active);
        await client.hSet(`stop:${stop.id}`, "code", stop.code);
        await client.hSet(`stop:${stop.id}`, "version", 0);
        await client.sAdd(`stop:index`, `stop:${stop.id}`)
    })
    await client.set('stop:maxKey', maxID)
}


const createStopRedis = async (stop, networkId) => {
    console.log(stop)
    let stopID
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch stop maxKey for changes
            await isolatedClient.watch('stop:maxKey');
            //Get stop maxKey
            await isolatedClient.get('stop:maxKey').then((result) => {
                if(result == null){
                    stopID = 0;
                }else{
                    stopID = parseInt(result) + 1
                }
            })
            //Define transaction : stop Properties + increment stop:maxKey
            const multi = isolatedClient
                .multi()
                .hSet(`${networkId}:stop:${stopID}`,"id", `${networkId}:stop:${stopID}` )
                .hSet(`${networkId}:stop:${stopID}`,"name", stop.name)
                .hSet(`${networkId}:stop:${stopID}`,"short_name", stop.short_name)
                .hSet(`${networkId}:stop:${stopID}`,"latitude", stop.latitude)
                .hSet(`${networkId}:stop:${stopID}`,"longitude", stop.longitude)
                .hSet(`${networkId}:stop:${stopID}`,"label_pos",  stop.label_pos)
                .hSet(`${networkId}:stop:${stopID}`,"visible", + stop.visible)
                .hSet(`${networkId}:stop:${stopID}`, "active", +stop.active)
                .hSet(`${networkId}:stop:${stopID}`, "code", stop.code)
                .sAdd(`${networkId}:stops`, `${networkId}:stop:${stopID}`)
                .sAdd(`stop:index`, `${networkId}:stop:${stopID}`)
                .sAdd(`${networkId}:empty`, `${networkId}:stop:${stopID}:tracks`)
                .incr('stop:maxKey');
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
    stop.id = `${networkId}:stop:${stopID}`
    return stop;
}

const updateStopRedis = async (stop, networkId) => {
    let response = {};
    let stopId
    const isActive = parser.isFromActive(stop.id)
    response.isFromActive = isActive
    if(isActive){
        response.activeStop = stop.id;
        stopId = `${networkId}:${stop.id}`
    }else{
        stopId = stop.id
    }
    try{
        await client.executeIsolated(async (isolatedClient) => {
            await isolatedClient.watch(`${stop.id}`, `${stop.id}:tracks`);
            const affectedTracks = await isolatedClient.SMEMBERS(`${stop.id}:tracks`);
            //Define transaction : stop Properties
            const multi = isolatedClient
                .multi()
                .hSet(`${stopId}`,"id", stopId )
                .hSet(`${stopId}`,"name", stop.name)
                .hSet(`${stopId}`,"short_name", stop.short_name)
                .hSet(`${stopId}`,"latitude", stop.latitude)
                .hSet(`${stopId}`,"longitude", stop.longitude)
                .hSet(`${stopId}`,"label_pos",  stop.label_pos)
                .hSet(`${stopId}`,"visible", + stop.visible)
                .hSet(`${stopId}`, "active", +stop.active)
                .hSet(`${stopId}`, "code", stop.code)


            if(isActive){
                multi.sAdd(`${stopId}:tracks`, affectedTracks)
            }
            //Execute transaction                
            await multi.exec();
            response.affectedTracks = affectedTracks
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    response.stopInfo = stop
    response.stopInfo.id = stopId
    return response;
}


const deleteStopRedis = async (stopToDelete, networkId) => {
    console.log("STOPTODELETE")
    console.log(stopToDelete)
    let response = {}

    let stopId
    const originalId = parser.getOriginalId(stopToDelete)
    const isActive = parser.isFromActive(stopToDelete)
    response.isFromActive = isActive

    if(isActive){
        stopId = `${networkId}:${stopToDelete}`
    }else{
        stopId = stopToDelete
    }
    //Delete stop deletes associated tracks?
    try{
        await client.executeIsolated(async (isolatedClient) => {
            const affectedTracks = await setOps.get(networkId, `${originalId}:tracks`)
            if(affectedTracks.length != 0){
                response.result = false;
                response.affectedTracks = affectedTracks
                return;
            }
            isolatedClient.watch(`${stopToDelete}`, `${stopToDelete}:tracks`);
            
            let multi
            if(isActive){
                multi = isolatedClient
                    .multi()
                    .HSET(stopId, 'deleted', '1')
                    .sRem(`${networkId}:stops`, stopId)
            }else{
                multi = isolatedClient
                .multi()
                .del(stopId)
                .sRem(`stop:index`, stopId)
                .sRem(`${networkId}:stops`, stopId)
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
    response.stopID = stopId
    return response;
}

const getCurrentStateRedis = async () => {
    const stopsKeys = await client.sMembers('stop:index')
    let requests = []
    
    stopsKeys.forEach(async (key) => {
        requests.push(client.HGETALL(key))
    })

    return await Promise.all(requests)
}


const getStopsRedis = async (stopIds) => {
    let requests = []
    stopIds.forEach(async (key) => {
        requests.push(client.HGETALL(`${key}`))
    })

    return await Promise.all(requests)
}

module.exports = {
    populateRedis,
    getCurrentStateRedis,
    createStopRedis,
    updateStopRedis,
    deleteStopRedis,
    getStopsRedis
    
}