
var usersConnected = []

function handleSetUsername(socket, io, username){
    console.log(`User ${username} connected with socket ${socket.id}`)
    socket.username = username;
    usersConnected.push(username)
    socket.emit("AUTH:currentState", usersConnected)
    socket.broadcast.emit("clientConnected", username)
}

function handleDisconnection(socket, io){
    const index = usersConnected.indexOf(socket.username)
    if(index > -1){
        usersConnected.splice(index, 1)
    }
    socket.broadcast.emit("clientDisconnected" ,socket.username)
}

module.exports = {
    handleSetUsername,
    handleDisconnection
}