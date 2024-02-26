const authHandlers = require("../handlers/auth.handlers")

function setupEvents(socket, io){
    socket.on("AUTH:setUsername", (username) => {authHandlers.handleSetUsername(socket, io, username)});
    socket.on("disconnect" , () => (authHandlers.handleDisconnection(socket, io)))
}

module.exports = {
    setupEvents
}