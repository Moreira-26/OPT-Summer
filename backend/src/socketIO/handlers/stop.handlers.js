const stopQueriesRedis = require('../../redisQueries/stops.queries')

async function handleStopCreate(socket, io, stopInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const stopResponse = await stopQueriesRedis.createStopRedis(stopInfo,socket.currentNetwork)
    if(stopResponse === false){
        console.log("FAIL")
    }
    io.to(socket.currentNetwork).emit("STOP:createSuccess", stopResponse)
}

async function handleStopUpdate(socket, io, stopInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const response = await stopQueriesRedis.updateStopRedis(stopInfo, socket.currentNetwork)
    if(response === false){
        socket.emit("STOP:updateError", "Failed Transaction")
    }else{
        //Send to every socket update sucess
        io.to(socket.currentNetwork).emit("STOP:updateSuccess",response);    
    }
    
}

async function handleStopDelete(socket,io,stopID){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const response = await stopQueriesRedis.deleteStopRedis(stopID, socket.currentNetwork)
    if(response.result === false){
        socket.emit("STOP:deleteError", "Stop cannot be deleted")
    }else{
        //Send to every socket update sucess
        io.to(socket.currentNetwork).emit("STOP:deleteSuccess",response);    
    }
}

async function handleStopSetOpen(socket, io, stopInfo){
    io.emit("STOP:setOpen", stopInfo)
}

async function handleStopSetClosed(socket, io, stopInfo){
    io.emit("STOP:setClosed", stopInfo)    
}

module.exports = {
    handleStopCreate,
    handleStopUpdate,
    handleStopDelete,
    handleStopSetOpen,
    handleStopSetClosed
}