const db = require('../../configs/db.config');
const nodeQueries = require('../../dbQueries/node.queries');
const nodeQueriesRedis = require('../../redisQueries/nodes.queries')
const convertToGeoJson =  require('../../utils/convertToGeoJson.utils');

async function handleNodeCreate(socket, io, nodeInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const nodeResponse = await nodeQueriesRedis.createNodeRedis(nodeInfo, socket.currentNetwork)
    if(nodeResponse === false){
        console.log("FAILL")
    }
    io.to(socket.currentNetwork).emit("NODE:createSuccess", nodeResponse);
}

async function handleNodeUpdate(socket, io, nodeInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const response = await nodeQueriesRedis.updateNodeRedis(nodeInfo, socket.currentNetwork)
    if(response === false){
        socket.emit("NODE:updateError", "FAILED transaction")
    }else{
        //Send to every socket update sucess
        io.to(socket.currentNetwork).emit("NODE:updateSuccess", response);
    }
}

async function handleNodeDelete(socket,io,nodeID){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }

    const response = await nodeQueriesRedis.deleteNodeRedis(nodeID, socket.currentNetwork)
    if(response.result == false){
        socket.emit("NODE:deleteError", `Node cannot be deleted`)
    }else{
        io.to(socket.currentNetwork).emit("NODE:deleteSuccess", response)
    }
}

async function handleNodeSetOpen(socket, io, nodeInfo){
    
    io.emit("NODE:setOpen", nodeInfo)
}

async function handleNodeSetClosed(socket, io, nodeInfo){
    io.emit("NODE:setClosed", nodeInfo)    
}

async function handleNodeSendCurrentState(socket,io){
    const nodesProto = []
    const nodes = await nodeQueriesRedis.getCurrentStateRedis();

    //Need to do this because redis returns in non Prototype (Refactor in future)
    // nodes.forEach((node) => {
    //     nodesProto.push({
    //         "id": parseInt(node.id),
    //         "name":node.name,
    //         "short_name":node.short_name,
    //         "latitude":node.latitude,
    //         "longitude":node.longitude,
    //         "label_pos":node.label_pos,
    //         "visible": node.visible === '1',
    //         "is_depot": node.is_depot === '1',
    //         "version": parseInt(node.version)
    //     })
    // })


    const nodesGeoJson = convertToGeoJson.serializeNodesAsGeoJson(nodes)
    socket.emit("NODE:sendCurrentState", nodesGeoJson)
}

async function updateDB(socket){
    const nodes = await nodeQueriesRedis.getCurrentStateRedis();
    const nodesProto = []
    nodes.forEach((node) => {
        nodesProto.push({
            "id": parseInt(node.id),
            "name":node.name,
            "short_name":node.short_name,
            "latitude":node.latitude,
            "longitude":node.longitude,
            "label_pos":node.label_pos,
            "visible": node.visible === '1',
            "is_depot": node.is_depot === '1',
            "version": parseInt(node.version)
        })
    })

    await nodeQueries.updateDB(nodesProto).then((result)=> {
        if(result === true){
            socket.emit("NODE:updateDBSuccess","")
        }else{
            socket.emit("NODE:updateDBError","")
        }
    })
}

async function getMaxKey(socket){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const maxKey = await nodeQueriesRedis.getMaxKey();
    socket.emit("NODE:sendMaxKey", maxKey)
}

module.exports = {
    handleNodeCreate,
    handleNodeDelete,
    handleNodeUpdate,
    handleNodeSetOpen,
    handleNodeSetClosed,
    handleNodeSendCurrentState,
    updateDB,
    getMaxKey
}