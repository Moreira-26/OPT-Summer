const trackQueriesRedis = require('../../redisQueries/tracks.queries')

const convertToGeoJson = require('../../utils/convertToGeoJson.utils')

async function handleTrackCreate(socket, io, trackInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const trackResponse = await trackQueriesRedis.createTrackRedis(trackInfo, socket.currentNetwork);

    io.emit("TRACK:createSuccess", trackInfo)
}

async function handleTrackUpdate(socket, io, trackInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const trackResponse = await trackQueriesRedis.updateTrackRedis(trackInfo, socket.currentNetwork)
    io.emit("TRACK:updateSuccess", trackResponse)
}

async function handleTrackDelete(socket, io,trackInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const trackResponse = await trackQueriesRedis.deleteTrackRedis(trackInfo, socket.currentNetwork);
    io.emit("TRACK:deleteSuccess", trackInfo.id)
}

module.exports = {
    handleTrackCreate,
    handleTrackUpdate,
    handleTrackDelete
}