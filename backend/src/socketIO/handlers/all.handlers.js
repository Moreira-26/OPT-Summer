const nodesQueriesRedis = require('../../redisQueries/nodes.queries')
const segmentsQueriesRedis = require('../../redisQueries/segments.queries')
const stopsQueriesRedis = require('../../redisQueries/stops.queries');
const trackQueriesRedis = require('../../redisQueries/tracks.queries')
const glineQueriesRedis = require('../../redisQueries/glines.queries')
const networkQueriesRedis = require('../../redisQueries/network.queries')
const convertToGeoJson =  require('../../utils/convertToGeoJson.utils');

/**
 * Sends (to a socket) the current state of all GIST entities
 * @param  {Socket} socket The socket that shall receive the state
 * @param  {Socket} io The io server
 * @return {undefined}
 */
async function handleGetAllCurrentState(socket){
    const nodes = nodesQueriesRedis.getCurrentStateRedis()
    const segments = segmentsQueriesRedis.getCurrentStateRedis()
    const stops = stopsQueriesRedis.getCurrentStateRedis()
    const tracks = trackQueriesRedis.getCurrentStateRedis()
    const glines = glineQueriesRedis.getCurrentStateRedis()
    // Test with promises
    Promise.all([nodes, segments, stops, tracks, glines]).then((entities) => {
        const result = {
            "nodes": convertToGeoJson.serializeNodesAsGeoJson(entities[0]),
            "segments": convertToGeoJson.serializeSegmentsAsGeoJson(entities[1], entities[0]),
            "stops": convertToGeoJson.serializeStopsAsGeoJson(entities[2]),
            "tracks":convertToGeoJson.serializeTracksAsGeoJson(entities[3], entities[2]),
            //Future idea: network object with glines inside
            "glines": entities[4]
        }
        socket.emit("ALL:sendCurrentState", result)
    })
}




/**
 * Handles the approval/rejection of an entity claim made by a socket
 * @param {Socket} socket
 * @param {Io} io
 * @param {Object} ownedEntities
 * @param {Object} entity
 * @returns {undefined}
 */
function handleClaimEntity(socket, io, ownedEntities, entity) {
    if (ownedEntities.hasEntity(entity)) {
        io.emit("ALL:denyClaimEntity", entity)
        console.log(`Socket ${socket.id} was denied ownership of entity ${entity}, as it belongs to ${ownedEntities.getOwner(entity)}.`)
    }
    else {
        ownedEntities.addOwnedEntity = { entity: entity, owner: socket.id }
        console.log(`Socket ${socket.id} owned entity ${entity}.`)
        io.emit("ALL:allowClaimEntity", entity) 
    }
}

/**
 * Handles the approval/rejection of an entity disclaim made by a socket,
 * usually after a entity update modal has been closed
 * @param {Socket} socket
 * @param {Io} io
 * @param {Object} ownedEntities
 * @param {Object} entity
 * @returns {undefined}
 */
function handleDisclaimEntity(socket, io, ownedEntities, entity) {
    if (!ownedEntities.hasEntity(entity)) {
        io.emit("ALL:denyDisclaimEntity", entity)
        console.log(`Socket ${socket.id} tried to disown the unowned entity ${entity}.`)
    }
    else if (ownedEntities.getOwner(entity) != socket.id) {
        io.emit("ALL:denyDisclaimEntity", entity)
        console.log(`Socket ${socket.id} tried to disown the entity ${entity}, which is owned by ${ownedEntities.getOwner(entity)}.`)        
    }
    else {
        ownedEntities.deleteOwnedEntity = entity
        io.emit("ALL:allowDisclaimEntity", entity) 
        console.log(`Socket ${socket.id} disowned entity ${entity}.`)
    }
}




module.exports = {
    handleGetAllCurrentState,
    handleClaimEntity,
    handleDisclaimEntity
}