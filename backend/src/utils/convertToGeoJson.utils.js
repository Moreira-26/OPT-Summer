const entityColors = {
    regularNode:    "#E55B13",
    depotNode:      "#FF0080",
    regularSegment: "#0000FF",
    deadRunSegment: "#FF0000",
    stop:           "#808080",
    track:          "#023020"
}

const getPointsArrayAsMap = (points, type) => {

    let pointsCoordinates

    if (points != undefined) {
        pointsCoordinates = new Map()
        for (let i = 0; i < points.length; i++) {
            pointsCoordinates.set(`${points[i].id}`, [
                parseFloat(points[i].longitude.replace(',','.')),
                parseFloat(points[i].latitude.replace(',','.')) 
            ])
        }
    }
    else {
        pointsCoordinates = undefined
        console.error('Function getNodesAsObject received undefined.')
    }

    return pointsCoordinates

}

const serializeNodesAsGeoJson = (nodes) => {
    
    if (!nodes) return

    let nodesAsGeoJson = {
        name: "Nodes",
        type: "FeatureCollection",
        features: []
    }

    nodesAsGeoJson.features = nodes.map(node => (
        {
            type: "Feature",
            geometry: {
                type:           "Point",
                coordinates:    [parseFloat(node.longitude.replace(',', '.')), parseFloat(node.latitude.replace(',', '.'))]
            },
            properties: {
                id:             node.id,
                name:           node.name,
                short_name:     node.short_name,
                visible:        node.visible === '1',
                is_depot:       node.is_depot === '1',
                version:        parseInt(node.version),
                currentColor:   node.is_depot !== '1' ? entityColors.regularNode : entityColors.depotNode,
                mapboxColor:    node.is_depot !== '1' ? entityColors.regularNode : entityColors.depotNode,
                entityType:     "node"
            }
        }))  
    
    return nodesAsGeoJson 

}

const serializeStopsAsGeoJson = (stops) => {

    if (!stops) return

    let stopsAsGeoJson = {
        name: "Stops",
        type: "FeatureCollection",
        features: []
    }

    stopsAsGeoJson.features = stops.map(stop => (
        {
            type: "Feature",
            geometry: {
                type:           "Point",
                coordinates:    [parseFloat(stop.longitude.replace(',', '.')), parseFloat(stop.latitude.replace(',', '.'))]
            },
            properties: {
                id:             stop.id,
                name:           stop.name,
                short_name:     stop.short_name,
                visible:        stop.visible === '1',
                label_pos:      stop.label_pos,
                active:         stop.active === '1',
                code:           stop.code,
                version:        0,
                currentColor:   entityColors.stop,
                mapboxColor:    entityColors.stop,
                entityType:     "stop"
            }
        }
        )
    )

    return stopsAsGeoJson 

}

const serializeSegmentsAsGeoJson = (segments, nodes = undefined, networkId) => {

    if (!segments) return
    
    let nodesCoordinates = getPointsArrayAsMap(nodes, 'node')
    let segmentsAsGeoJson = {
        name: "Segments",
        type: "FeatureCollection",
        features: []
    }
    
    segmentsAsGeoJson.features = segments.map(segment => {
        let coordinatesStartNode = nodesCoordinates.get(segment.start_node_id)
        
        if( coordinatesStartNode == undefined){
            coordinatesStartNode = nodesCoordinates.get(`network:${networkId}:${segment.start_node_id}`)
        }

        let coordinatesEndNode = nodesCoordinates.get(segment.end_node_id)
        if( coordinatesEndNode == undefined){
            coordinatesEndNode = nodesCoordinates.get(`network:${networkId}:${segment.end_node_id}`)
        }

        return {
            type: "Feature",
            geometry: {
                type:               "LineString",
                coordinates:        nodes == undefined ? [ [0,0], [0,0] ] : [coordinatesStartNode, coordinatesEndNode]
            },
            properties: {
                id:                 segment.id,
                name:               segment.name,
                start_node_id:      segment.start_node_id,
                end_node_id:        segment.end_node_id,
                segment_type:       parseInt(segment.segment_type),
                default_length:     parseInt(segment.default_length),
                average_duration:   parseInt(segment.average_duration),
                visible:            segment.visible === '1',
                version:            0,
                mapboxColor:        parseInt(segment.segment_type) == 1 ? entityColors.regularSegment : entityColors.deadRunSegment,
                entityType:         "segment"
            }
        }})

    return segmentsAsGeoJson 
}

const getTypeAndId = (str) => {
    const regex  = /(\w*:\d*:)?(\w*):(\d*)/
    const result = str.match(regex)
    return {'id': result.at(3), 'type':result.at(2)}
}

const serializeTracksAsGeoJson = (tracks, stops = undefined) => {

    if (!tracks) return

    let stopsCoordinates = getPointsArrayAsMap(stops, 'stop')

    let tracksAsGeoJson = {
        name: "Tracks",
        type: "FeatureCollection",
        features: []
    }

    tracksAsGeoJson.features = tracks.map(track => (
        {
            type: "Feature",
            geometry: {
                type:           "LineString",
                coordinates:    stops == undefined ? [ [0,0], [0,0] ] : [stopsCoordinates.get(track.start_stop), stopsCoordinates.get(track.end_stop)]
            },
            properties: {
                id:             track.id,
                name:           track.name,
                start_stop:     track.start_stop,
                end_stop:       track.end_stop,
                length:         track.length,
                visible:        track.visible === '1',
                version:        0,
                mapboxColor:    entityColors.track,
                entityType:     "track"
            }
        }))

    return tracksAsGeoJson 
}

module.exports = { 
    serializeNodesAsGeoJson, 
    serializeSegmentsAsGeoJson,
    serializeStopsAsGeoJson,
    serializeTracksAsGeoJson 
}  