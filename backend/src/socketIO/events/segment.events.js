const segmentHandlers = require("../handlers/segment.handlers");

function setupEvents(socket,io){
    socket.on("SEG:create",(segmentInfo) => segmentHandlers.handleSegmentCreate(socket,io,segmentInfo));
    socket.on("SEG:delete",(segmentInfo) => segmentHandlers.handleSegmentDelete(socket,io,segmentInfo))
    socket.on("SEG:update",(segmentInfo) => segmentHandlers.handleSegmentUpdate(socket,io,segmentInfo));
    socket.on("SEG:getCurrentState", () => segmentHandlers.handleSegmentSendCurrentState(socket,io))
}

module.exports = {
    setupEvents
}