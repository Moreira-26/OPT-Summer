import { reactive } from 'vue'

export const stopsGeoJson = reactive({
    data:undefined,
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
    get stops() {
        return this.data.features
    },
    addStop(stopInfo){
        const stop = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [stopInfo.longitude,stopInfo.latitude]
            },
            "properties": {
                "id": stopInfo.id,
                "name": stopInfo.name,
                "short_name": stopInfo.short_name,
                "visible": stopInfo.visible,
                "label_pos": stopInfo.label_pos,
                "active": stopInfo.active,
                "code": stopInfo.code,
                "version":0,
                "mapbox_color": "#808080"
            }
        }
        this.data.features.push(stop)
    },
    updateStop(response){
        const stopInfo = response.stopInfo
        let stopIdToUpdate
        if(response.isFromActive){
            stopIdToUpdate = response.activeStop
        }else{
            stopIdToUpdate = stopInfo.id
        }
        const stop = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [stopInfo.longitude, stopInfo.latitude]
            },
            "properties": {
                "id": stopInfo.id,
                "name": stopInfo.name,
                "short_name": stopInfo.short_name,
                "visible": stopInfo.visible,
                "label_pos": stopInfo.label_pos,
                "active": stopInfo.active,
                "code": stopInfo.code,
                "version":0,
                "mapbox_color": "#808080"
            }
        }

        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == stopIdToUpdate){
                this.data.features[i] = stop;
            }
        }
    },
    updateFeatureStyle(stopID, isOpen){
        const stopIndex = this.data.features.findIndex(stop => stop.properties.id === stopID)
        if (stopIndex !== -1) {
            let entityColor = stopsGeoJson.data.features[stopIndex].properties.mapboxColor
            stopsGeoJson.data.features[stopIndex].properties.currentColor = isOpen ? "#000" : entityColor
    }},
    deleteStop(stopID){
         //Find index of the feature with property id nodeID SOMETHING IS WRONG!!
         for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == stopID){
                this.data.features.splice(i,1) 
                return
            }
        }
    },
    findStop(stopID){
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == stopID){
               return this.data.features[i]
            }
        }
    }
})