const { WatchError } = require('redis');
const client = require('../configs/redis.config');

const { getTracksDB } = require('../dbQueries/tracks.queries');
const { parser } = require('../utils/parserId.utils')
const  setOps = require('../utils/setOps.utils')

//Get tracks from postgreSQL and populates redis
const populateRedis = async () => {
    const tracksDB = await getTracksDB();

    if(tracksDB.resultsRows == undefined){
        console.log("Error fetching tracks from DB " + tracksDB)
        return;
    }

    var maxID = 0;

    tracksDB.resultsRows.forEach(async (track) => {
        if(track.id > maxID) {maxID = track.id}
        await client.hSet(`track:${track.id}`, "id", `track:${track.id}`);
        await client.hSet(`track:${track.id}`, "name", track.name);
        await client.hSet(`track:${track.id}`, "start_stop", `stop:${track.start_stop}`);
        await client.hSet(`track:${track.id}`, "end_stop", `stop:${track.end_stop}`);
        await client.hSet(`track:${track.id}`, "visible", + track.visible);
        await client.hSet(`track:${track.id}`, "length", track.length);
        await client.sAdd(`stop:${track.start_stop}:tracks`,  `track:${track.id}`);
        await client.sAdd(`stop:${track.end_stop}:tracks`, `track:${track.id}`)
        await client.sAdd(`track:index`, `track:${track.id}`)
    });

    await client.set('track:maxKey', maxID);
}


const createTrackRedis = async (track, networkId) => {
    let trackID
    try{
        await client.executeIsolated(async (isolatedClient) => {
            //Watch track maxKey for changes
            await isolatedClient.watch('track:maxKey');
            //Get new start stop and end stop
            const startStop = await isolatedClient.HGETALL(`${track.start_stop}`);
            const endStop = await isolatedClient.HGETALL(`${track.end_stop}`);
            //Get track maxKey
            await isolatedClient.get("track:maxKey").then((result) => {
                if(result == null){
                    trackID = 0;
                }else{
                    trackID = parseInt(result) + 1
                }
            })
            //Define transaction : track Properties + increment track:maxKey + add track to Start/End stop tracks
            const multi = isolatedClient
                .multi()
                .hSet(`${networkId}:track:${trackID}`,"id", `${networkId}:track:${trackID}`)
                .hSet(`${networkId}:track:${trackID}`,"name", track.name)
                .hSet(`${networkId}:track:${trackID}`,"start_stop", track.start_stop)
                .hSet(`${networkId}:track:${trackID}`,"end_stop", track.end_stop)
                .hSet(`${networkId}:track:${trackID}`,"length",  track.length)
                .hSet(`${networkId}:track:${trackID}`,"visible", + track.visible)
                .sAdd(`${networkId}:tracks`, `${networkId}:track:${trackID}`)
                .sAdd(`track:index`, `${networkId}:track:${trackID}`)
                .incr('track:maxKey');

            const stopIds = [track.start_stop, track.end_stop]
            for(const stopId of stopIds){
                //Check if version of stop:tracks exist
                const stopTracksVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(stopId)}:tracks`)
                //If version exists
                if(stopTracksVersion !== null){
                    //Add created track to set of tracks
                    multi.sAdd(`${networkId}:${parser.getOriginalId(stopId)}:tracks`, `${networkId}:track:${trackID}`)
                    //If empty remove relation from network:empty
                    if(stopTracksVersion.length == 0){
                        multi.sRem(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(stopId)}:tracks`)
                    }
                }else{
                    //Get tracks from original stop
                    const tracksFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(stopId)}:tracks`)
                    //Add track created
                    tracksFromOriginal.push(`${networkId}:track:${trackID}`)
                    //Add all tracks to new relation set
                    multi.sAdd(`${networkId}:${parser.getOriginalId(stopId)}:tracks`, tracksFromOriginal)
                }
            }

            //Execute transaction                
            await multi.exec();

            //Add stops coordinates to return payload
            track.start_stop_coordinates = [parseFloat(startStop.longitude.replace(',', '.')), parseFloat(startStop.latitude.replace(',', '.'))]
            track.end_stop_coordinates = [parseFloat(endStop.longitude.replace(',', '.')), parseFloat(endStop.latitude.replace(',', '.'))]
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    track.id = `${networkId}:track:${trackID}`

    return track
}

const updateTrackRedis = async (track, networkId) => {
    let response = {}
    let trackId = track.id
    const isActive = parser.isFromActive(track.id)
    if(isActive){
        response.activeTrack = track.id
        //Create new track id
        trackId = `${networkId}:${track.id}`
    }
    try{
        await client.executeIsolated(async (isolatedClient) => {
            await isolatedClient.watch(`${track.id}`);
            //Get new start stop and end stop
            const startStop = await isolatedClient.HGETALL(`${track.start_stop}`);
            const endStop = await isolatedClient.HGETALL(`${track.end_stop}`);
            //Get old start stop and end stop ids
            const oldStartStopID = await isolatedClient.HGET(`${track.id}`, 'start_stop');
            const oldEndStopID = await isolatedClient.HGET(`${track.id}`, 'end_stop');
            //Define transaction : track Properties + add track to Start/End stop tracks
            const multi = isolatedClient
                .multi()
                .hSet(trackId,"id", trackId)
                .hSet(trackId,"name", track.name)
                .hSet(trackId,"start_stop", track.start_stop)
                .hSet(trackId,"end_stop", track.end_stop)
                .hSet(trackId,"length",  track.length)
                .hSet(trackId,"visible", + track.visible)

            const newStopIds = [startStop.id, endStop.id]
            const oldStopIds = [oldStartStopID, oldEndStopID]
            for(let i = 0; i < newStopIds.length; i++){
                let newStopId = newStopIds.at(i)
                let oldStopId = oldStopIds.at(i)
                if(newStopId == oldStopId){
                    continue;
                }
                //NEWSTOP
                //Check if version of new STOP:segs exist
                const newStopTracksVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(newStopId)}:tracks`)
                //If new stop:tracks version is not null
                if(newStopTracksVersion !== null){
                    //Add updated track to set of tracks
                    multi.sAdd(`${networkId}:${parser.getOriginalId(newStopId)}:tracks`, trackId)
                    //Remove new stop tracks from empty set
                    if(newStopTracksVersion.length == 0){
                        multi.sRem(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(newStopId)}:tracks`)
                    }
                }else{
                    //Get tracks from original stop
                    const tracksFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(newStopId)}:tracks`)
                    //Add seg updated
                    tracksFromOriginal.push(trackId)
                    //Add all tracks to new relation set 
                    multi.sAdd(`${networkId}:${parser.getOriginalId(newStopId)}:tracks`, tracksFromOriginal)
                }

                //OLDstop
                //Check if version of old stop:tracks exist
                const oldStopTracksVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(oldStopId)}:tracks`)
                //If old stop:tracks version is not null
                if(oldStopTracksVersion !== null){
                    //Remove updated track from old stop set of tracks
                    multi.sRem(`${networkId}:${parser.getOriginalId(oldStopId)}:tracks`, trackId)
                    //If numebr tracks of version is 1 -> set will become empty
                    if(oldStopTracksVersion.length == 1){
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(oldStopId)}:tracks`)
                    }
                }else{
                    //Get tracks from original stop
                    const tracksFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(oldStopId)}:tracks`)
                    //Remove seg updated
                    const index = tracksFromOriginal.findIndex(trackId => trackId == `${parser.getOriginalId(trackId)}`)
                    if(index != -1){
                        tracksFromOriginal.splice(index, 1)
                    }
                    //If tracks become empty
                    if(tracksFromOriginal.length == 0){
                        //Add stop tracks to empty set
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(oldStopId)}:tracks`) 
                    }
                    //Add all tracks to new relation set except the removed track
                    multi.sAdd(`${networkId}:${parser.getOriginalId(oldStopId)}:tracks`, tracksFromOriginal)
                }
            }


            //Execute transaction                
            await multi.exec();

            //Add stops coordinates to return payload
            track.start_stop_coordinates = [parseFloat(startStop.longitude.replace(',', '.')), parseFloat(startStop.latitude.replace(',', '.'))]
            track.end_stop_coordinates = [parseFloat(endStop.longitude.replace(',', '.')), parseFloat(endStop.latitude.replace(',', '.'))]
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }
    return track
}

const deleteTrackRedis = async (trackInfo, networkId) => {
    let response = {}

    let trackId
    const isActive = parser.isFromActive(trackInfo.id)
    response.isFromActive = isActive

    if(isActive){
        trackId = `${networkId}:${trackInfo.id}`
    }else{
        trackId = trackInfo.id
    }

    const stopIds = [trackInfo.start_stop, trackInfo.end_stop]
    try{
        await client.executeIsolated(async (isolatedClient) => {
            await isolatedClient.watch(`${trackInfo.id}`)
          
            let multi
            if(isActive){
                multi = isolatedClient
                    .multi()
                    .HSET(trackId, 'deleted', '1')   
            }else{
                multi = isolatedClient
                .multi()
                .del(trackId)
                .sRem(`track:index`, trackId)
                .sRem(`${networkId}:tracks`, trackId)
            }

            for(const stopId of stopIds){
                const stopTracksVersion = await setOps.getVersion(networkId,`${parser.getOriginalId(stopId)}:tracks`)
                if(stopTracksVersion !== null){
                    //Remove deleted track from old set of tracks
                    multi.sRem(`${networkId}:${parser.getOriginalId(stopId)}:tracks`,trackId)
                    //If number tracks of version is 1 -> set will become empty
                    if(stopTracksVersion.length == 1){
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(stopId)}:tracks`)
                    }
                }else{
                    //Get tracks from original stop
                    const tracksFromOriginal = await client.SMEMBERS(`${parser.getOriginalId(stopId)}:tracks`)
                    //Remove track updated
                    const index = tracksFromOriginal.findIndex(track => track == `${parser.getOriginalId(trackId)}`)
                    if(index != -1){
                        tracksFromOriginal.splice(index, 1)
                    }
                    //If tracks become empty
                    if(tracksFromOriginal.length == 0){
                        //Add stop tracks to empty set
                        multi.sAdd(`${networkId}:empty`,`${networkId}:${parser.getOriginalId(stopId)}:tracks`) 
                    }
                    //Add all tracks to new relation set except the removed track
                    multi.sAdd(`${networkId}:${parser.getOriginalId(stopId)}:tracks`, tracksFromOriginal)
                }
            }
            //Execute transaction
            await multi.exec()
            response.result = true
        })
    }catch(error){
        if(error instanceof WatchError){
            console.log("Failed transaction create")
        }else{
            console.log(`Error: ${error}`)
        }
        return false;
    }

    response.trackId = trackId
    return response
}


const getCurrentStateRedis = async () => {
    //Get all keys that matches stop:[1-9]*, In the future refactor this to not use keys
    const trackKeys = await client.sMembers('track:index')

    let requests = []
    //iterate for each keys and get attributes
    trackKeys.forEach(async (key) => {
        requests.push(client.HGETALL(key))
    })
    return await Promise.all(requests)
}

const getTracksRedis = async (trackIds) => {

    let requests = []
    trackIds.forEach(async (key) => {
        requests.push(client.HGETALL(`${key}`))
    })

    return await Promise.all(requests)
}


module.exports = {
    populateRedis,
    createTrackRedis,
    updateTrackRedis,
    deleteTrackRedis,
    getCurrentStateRedis,
    getTracksRedis
}