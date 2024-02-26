const pathQueriesRedis = require('../../redisQueries/paths.queries')


async function handlePathCreate(socket, io, pathInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const pathResponse = await pathQueriesRedis.createPathRedis(pathInfo, socket.currentNetwork)

    io.to(socket.currentNetwork).emit("PATH:createSuccess", pathResponse)
}

async function handlePathUpdate(socket, io, pathInfo){

    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return; 
    }
    const response = await pathQueriesRedis.updatePathRedis(pathInfo, socket.currentNetwork)
    io.to(socket.currentNetwork).emit("PATH:updateSuccess",response)

}


async function handlePathDelete(socket,io,pathInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const response = await pathQueriesRedis.deletePathRedis(pathInfo, socket.currentNetwork);
    console.log(response)
    if(response.result === false){
        socket.emit('PATH:deleteError', 'This path cannot be deleted')
        return;
    }
    io.to(socket.currentNetwork).emit("PATH:deleteSuccess", response)
}

module.exports = {
    handlePathCreate,
    handlePathUpdate,
    handlePathDelete
}