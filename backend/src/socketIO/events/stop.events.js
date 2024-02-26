const stopHandlers = require("../handlers/stop.handlers");


function setupEvents(socket,io){
    socket.on("STOP:create",(stopInfo) => stopHandlers.handleStopCreate(socket,io,stopInfo));
    socket.on("STOP:delete",(stopId) => stopHandlers.handleStopDelete(socket,io,stopId))
    socket.on("STOP:update",(stopInfo) => stopHandlers.handleStopUpdate(socket,io,stopInfo));
    socket.on("STOP:setOpen",(stopInfo) => stopHandlers.handleStopSetOpen(socket,io,stopInfo));
    socket.on("STOP:setClosed",(stopInfo) => stopHandlers.handleStopSetClosed(socket,io,stopInfo));
    /*socket.on("STOP:getCurrentState", () => stopHandlers.handleStopSendCurrentState(socket,io))
    socket.on("STOP:updateDB", () => stopHandlers.updateDB(socket))*/
}


module.exports = {
    setupEvents
}