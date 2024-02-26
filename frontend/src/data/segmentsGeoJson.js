import { reactive } from 'vue'
import { nodesGeoJson } from './nodesGeoJson';
export const segmentsGeoJson = reactive({
    data: undefined,
    defineData(data){
        this.data = data;
    },
    clearData(){
        if(this.data != undefined){
            this.data.features = []
        }
    },
    isLoaded(){
        return this.data != undefined
    },
    matchCoords(nodes){
        if (nodes != undefined) {
            this.data.features.forEach((segment) => {
                let startNodeId = nodes.features.find(node => node.properties.id == segment.properties.start_node_id)
                let endNodeId = nodes.features.find(node => node.properties.id == segment.properties.end_node_id)
                segment.geometry.coordinates[0] = startNodeId.geometry.coordinates
                segment.geometry.coordinates[1] = endNodeId.geometry.coordinates
            })
        }
    },
    addSegment(segInfo){
        const segment = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [segInfo.start_node_coordinates, segInfo.end_node_coordinates]
            },
            "properties": {
                "id": segInfo.id,
                "name": segInfo.name,
                "start_node_id": segInfo.start_node_id,
                "end_node_id": segInfo.end_node_id,
                "segment_type": segInfo.segment_type,
                "default_length": parseInt(segInfo.default_length),
                "average_duration": parseInt(segInfo.average_duration),
                "visible": segInfo.visible,
                "version": 0
            }
        }
        this.data.features.push(segment)
    },
    updateSegment(segInfo){
        const segment = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [segInfo.start_node_coordinates, segInfo.end_node_coordinates]
            },
            "properties": {
                "id": segInfo.id,
                "name": segInfo.name,
                "start_node_id": segInfo.start_node_id,
                "end_node_id": segInfo.end_node_id,
                "segment_type": segInfo.segment_type,
                "default_length": parseInt(segInfo.default_length),
                "average_duration": parseInt(segInfo.average_duration),
                "visible": segInfo.visible,
                "version": 0
            }
        }
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == segInfo.id){
                this.data.features[i] = segment;
                return
            }
        }
    },
    deleteSegment(segID){
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == segID){
                this.data.features.splice(i,1) 
                return;
            }
        }
    },
    /**
     * Update segs affected by a node update
     * Update Start_node_id to version Id
     * Update End_node_id to version Id
     */
    updateSegsCoords(response){
        const nodeInfo = response.nodeInfo
        let nodeIdToCheck = nodeInfo.id
        //If node updated was an active Node
        if(response.activeNode){
            //Id to check is the id of the active Node
            nodeIdToCheck = response.activeNode
        }
        for(let i = 0; i < this.data.features.length; i++){
                
                if(this.data.features[i].properties.start_node_id == nodeIdToCheck){
                    this.data.features[i].properties.start_node_id = nodeInfo.id
                    this.data.features[i].geometry.coordinates[0] = [nodeInfo.longitude, nodeInfo.latitude];
                }
                
                if(this.data.features[i].properties.end_node_id == nodeIdToCheck){
                    this.data.features[i].properties.end_node_id = nodeInfo.id
                    this.data.features[i].geometry.coordinates[1] = [nodeInfo.longitude, nodeInfo.latitude];
                }
                // affectedSegs.splice(j,1);
        }
    },
    deleteSegments(affectedSegs){
        for(let i = 0; i < this.data.features.length; i++){
            if(affectedSegs.length == 0){
                return
            }
            for(let j= 0; j < affectedSegs.length;j++){
                if(this.data.features[i].properties.id == affectedSegs[j]){
                    this.data.features.splice(i,1)
                    affectedSegs.splice(j,1);
                    break;
                }
            }
        }
    },
    getSegment(segmentId) {
        for (const segment of this.data.features) {
            if (segmentId == segment.properties.id) {
                return segment
            }
        }
        return null
    }
})