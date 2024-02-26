const nodesQueriesRedis = require('../../redisQueries/nodes.queries')
const segmentsQueriesRedis = require('../../redisQueries/segments.queries')
const stopsQueriesRedis = require('../../redisQueries/stops.queries');
const trackQueriesRedis = require('../../redisQueries/tracks.queries')
const glineQueriesRedis = require('../../redisQueries/glines.queries')
const networkQueriesRedis = require('../../redisQueries/network.queries')
const convertToGeoJson =  require('../../utils/convertToGeoJson.utils');

var usersConnectedNetwork = {}

async function handleGetNetworks(socket){
    const networks = await networkQueriesRedis.getNetworks()
    socket.emit("NETWORK:sendCurrentNetworks", networks)

}

async function handleGetNetworkCurrentState(networkId,socket){
    //Get network glines + all elements ids
    const network = await networkQueriesRedis.bfs(`network:${networkId}`)
    const result = {}
    result.glines = network.glines
    result.lines = network.lines
    result.paths = network.paths
    result.pathSegs = network.pathSegs
    
    result.nodes = convertToGeoJson.serializeNodesAsGeoJson(network.nodes)
    result.segments = convertToGeoJson.serializeSegmentsAsGeoJson(network.segs, network.nodes, networkId)
    result.tracks = convertToGeoJson.serializeTracksAsGeoJson(network.tracks, network.stops)
    result.stops = convertToGeoJson.serializeStopsAsGeoJson(network.stops)

    socket.emit("NETWORK:sendCurrentState", result)
    // const nodes = nodesQueriesRedis.getNodesRedis(network.nodes)
    // const segments = segmentsQueriesRedis.getSegmentsRedis(network.segs)
    // const stops = stopsQueriesRedis.getStopsRedis(network.stops)
    // const tracks = trackQueriesRedis.getTracksRedis(network.tracks)
    // // Test with promises
    // Promise.all([nodes, segments, stops, tracks]).then((entities) => {
    //     const result = {
    //         "nodes": convertToGeoJson.serializeNodesAsGeoJson(entities[0]),
    //         "segments": convertToGeoJson.serializeSegmentsAsGeoJson(entities[1], entities[0]),
    //         "stops": convertToGeoJson.serializeStopsAsGeoJson(entities[2]),
    //         "tracks":convertToGeoJson.serializeTracksAsGeoJson(entities[3], entities[2]),
    //         //Future idea: network object with glines inside
    //         "glines": network.glines
    //     }
    //     socket.emit("NETWORK:sendCurrentState", result)
    // })
}

async function handleJoinNetwork(newNetworkId,oldNetworkId,socket,io){
    socket.leave(`network:${oldNetworkId}`)
    socket.join(`network:${newNetworkId}`)
    socket.currentNetwork = `network:${newNetworkId}`
    usersConnectedNetwork[socket.username] =  `network:${newNetworkId}`
    io.emit('NETWORK:userJoinedNetwork', usersConnectedNetwork )
}

function handleNetworkUsers(socket, io){
    socket.emit("NETWORK:sendCurrentUsers", usersConnectedNetwork)
}

async function handleNetworkCreate(socket, io, networkInfo){
    const networkResponse = await networkQueriesRedis.createNetworkRedis(networkInfo)
    if (networkResponse === false){
        console.log("FAIL")
    }
    io.emit("NETWORK:createSuccess", networkResponse)
}

module.exports = {
    handleGetNetworkCurrentState,
    handleGetNetworks,
    handleJoinNetwork,
    handleNetworkUsers,
    handleNetworkCreate
}