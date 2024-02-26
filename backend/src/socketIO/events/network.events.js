const networkHandlers = require('../handlers/network.handlers')

function setupEvents(socket, io) {
    socket.on("NETWORK:getNetworks", () => networkHandlers.handleGetNetworks(socket))
    socket.on("NETWORK:getCurrentState", (networkId) => networkHandlers.handleGetNetworkCurrentState(networkId,socket))
    socket.on("NETWORK:join", (newNetworkId, oldNetworkId) => networkHandlers.handleJoinNetwork(newNetworkId,oldNetworkId,socket,io))
    socket.on("NETWORK:create", (networkInfo) => networkHandlers.handleNetworkCreate(socket,io, networkInfo))
    socket.on("NETWORK:getNetworkUsers", () => networkHandlers.handleNetworkUsers(socket,io))

}

module.exports = { 
  setupEvents
}