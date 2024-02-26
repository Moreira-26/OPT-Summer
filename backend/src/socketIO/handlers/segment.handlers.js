const segmentQueries = require('../../dbQueries/segment.queries');
const segmentQueriesRedis = require('../../redisQueries/segments.queries')
const convertToGeoJson =  require('../../utils/convertToGeoJson.utils');


async function handleSegmentCreate(socket, io, segmentInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const segmentResponse = await segmentQueriesRedis.createSegmentRedis(segmentInfo, socket.currentNetwork)

    io.to(socket.currentNetwork).emit("SEG:createSuccess", segmentResponse)
}

async function handleSegmentUpdate(socket, io, segmentInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const response = await segmentQueriesRedis.updateSegmentRedis(segmentInfo, socket.currentNetwork)
    io.to(socket.currentNetwork).emit("SEG:updateSuccess",response)
}


async function handleSegmentDelete(socket,io,segmentInfo){
    if(socket.currentNetwork == 'network:1'){
        socket.emit('NETWORK:errorActiveNetwork')
        return;
    }
    const response = await segmentQueriesRedis.deleteSegmentRedis(segmentInfo, socket.currentNetwork);
    io.to(socket.currentNetwork).emit("SEG:deleteSuccess", segmentInfo.id)
}



async function handleSegmentSendCurrentState(socket,io){
    const segsProto = []
    const segs = await segmentQueriesRedis.getCurrentStateRedis();

    // segs.forEach((seg) => {
    //     segsProto.push({
    //         "id":parseInt(seg.id),
    //         "name":seg.name,
    //         "start_node_id":parseInt(seg.start_node_id),
    //         "end_node_id":parseInt(seg.end_node_id),
    //         "segment_type":parseInt(seg.segment_type),
    //         "default_length":parseInt(seg.default_length),
    //         "visible": seg.visible === '1',
    //         "average_duration": parseInt(seg.average_duration)
    //     })
    // })

    const segsGeoJson = convertToGeoJson.serializeSegmentsAsGeoJson(segs, undefined)
    socket.emit("SEG:sendCurrentState", segsGeoJson)
}

module.exports = {
    handleSegmentCreate,
    handleSegmentDelete,
    handleSegmentUpdate,
    handleSegmentSendCurrentState
}