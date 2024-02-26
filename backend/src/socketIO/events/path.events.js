const pathHandlers = require("../handlers/path.handlers");

function setupEvents(socket,io){
    socket.on("PATH:create",(pathInfo) => pathHandlers.handlePathCreate(socket,io,pathInfo));
    socket.on("PATH:delete",(pathInfo) => pathHandlers.handlePathDelete(socket,io,pathInfo))
    socket.on("PATH:update",(pathInfo) => pathHandlers.handlePathUpdate(socket,io,pathInfo))
}

module.exports = {
    setupEvents
}