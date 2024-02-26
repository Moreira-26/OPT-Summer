const trackHandlers = require("../handlers/track.handlers.js")

function setupEvents(socket, io){
    socket.on("TRACK:create", (trackInfo) => trackHandlers.handleTrackCreate(socket, io, trackInfo))
    socket.on("TRACK:update", (trackInfo) => trackHandlers.handleTrackUpdate(socket, io, trackInfo))
    socket.on("TRACK:delete", (trackID) => trackHandlers.handleTrackDelete(socket, io, trackID))
}

module.exports = {
    setupEvents
}