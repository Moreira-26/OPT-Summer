const nodeHandlers = require("../handlers/node.handlers");


function setupEvents(socket,io){
    socket.on("NODE:create",(nodeInfo) => nodeHandlers.handleNodeCreate(socket,io,nodeInfo));
    socket.on("NODE:delete",(nodeID,version) => nodeHandlers.handleNodeDelete(socket,io,nodeID))
    socket.on("NODE:update",(nodeInfo) => nodeHandlers.handleNodeUpdate(socket,io,nodeInfo));
    socket.on("NODE:setOpen",(nodeInfo) => nodeHandlers.handleNodeSetOpen(socket,io,nodeInfo));
    socket.on("NODE:setClosed",(nodeInfo) => nodeHandlers.handleNodeSetClosed(socket,io,nodeInfo));
    socket.on("NODE:getCurrentState", () => nodeHandlers.handleNodeSendCurrentState(socket,io))
    socket.on("NODE:updateDB", () => nodeHandlers.updateDB(socket))
    socket.on("NODE:maxKey", () => nodeHandlers.getMaxKey(socket))
}


module.exports = {
    setupEvents
}