import {reactive} from 'vue'

export const nodesGeoJson = reactive({
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
    getNodes() {
        return this.data.features
    },
    addNode(nodeInfo){
        const node = {
            "type":"Feature",
            "geometry":{
                "type":"Point",
                "coordinates":[nodeInfo.longitude, nodeInfo.latitude]
            },
            "properties": {
                "id":nodeInfo.id,
                "name":nodeInfo.name,
                "short_name":nodeInfo.short_name,
                "visible":nodeInfo.visible,
                "is_depot":nodeInfo.is_depot,
                "version":nodeInfo.version
            }
        }
        this.data.features.push(node);
    },
    deleteNode(nodeID){
        //Find index of the feature with property id nodeID
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == nodeID){
                this.data.features.splice(i,1) 
                return
            }
        }
    },
    updateNode(response){
        let nodeIdToUpdate
        const nodeInfo = response.nodeInfo
        //If the node updated was an active node, replace activeNode with version Node
        if(response.isFromActive){
            nodeIdToUpdate = response.activeNode;
        }else{
            nodeIdToUpdate = nodeInfo.id
        }
        const node = {
            "type":"Feature",
            "geometry":{
                "type":"Point",
                "coordinates":[nodeInfo.longitude, nodeInfo.latitude]
            },
            "properties": {
                "id":nodeInfo.id,
                "name":nodeInfo.name,
                "short_name":nodeInfo.short_name,
                "visible":nodeInfo.visible,
                "is_depot":nodeInfo.is_depot,
                "version":nodeInfo.version,
                "currentColor":nodeInfo.currentColor,
                "mapboxColor":nodeInfo.mapboxColor,
                "entityType":nodeInfo.entityType
            }
        }
        
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == nodeIdToUpdate){
                this.data.features[i] = node;
            }
        }
    },
    updateFeatureStyle(nodeID, isOpen){
        const nodeIndex = this.data.features.findIndex(node => node.properties.id === nodeID)
        if (nodeIndex !== -1) {
            let entityColor = nodesGeoJson.data.features[nodeIndex].properties.mapboxColor
            nodesGeoJson.data.features[nodeIndex].properties.currentColor = isOpen ? "#000" : entityColor
        }
    },
    findNode(nodeID){
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == nodeID){
                return this.data.features[i]
            }
        }
    }

})