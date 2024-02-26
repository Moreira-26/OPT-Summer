import { reactive } from 'vue'

export const tracksGeoJson = reactive({
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
    matchCoords(stops){
        if (stops != undefined) {
            this.data.features.forEach((track) => {
                let startStopId = stops.features.find(stop => stop.properties.id == track.properties.start_stop)
                let endStopId = stops.features.find(stop => stop.properties.id == track.properties.end_stop)
                track.geometry.coordinates[0] = startStopId.geometry.coordinates
                track.geometry.coordinates[1] = endStopId.geometry.coordinates
            })
        }
    },
    addTrack(trackInfo){
        const track = {
            "type":"Feature",
            "geometry":{
                "type":"LineString",
                "coordinates":[trackInfo.start_stop_coordinates, trackInfo.end_stop_coordinates]
            },
            "properties":{
                "id":trackInfo.id,
                "name":trackInfo.name,
                "start_stop": trackInfo.start_stop,
                "end_stop": trackInfo.end_stop,
                "length": parseInt(trackInfo.length),
                "visible":trackInfo.visible === '1',
                "version":0,
                "mapboxColor" : "4CBB17"
            }

        }
        this.data.features.push(track)
    },
    updateTrack(trackInfo){
        const track = {
            "type":"Feature",
            "geometry":{
                "type":"LineString",
                "coordinates":[trackInfo.start_stop_coordinates, trackInfo.end_stop_coordinates]
            },
            "properties":{
                "id":trackInfo.id,
                "name":trackInfo.name,
                "start_stop": trackInfo.start_stop,
                "end_stop": trackInfo.end_stop,
                "length": parseInt(trackInfo.length),
                "visible":trackInfo.visible === '1',
                "version":0,
                "mapboxColor" : "4CBB17"
            }
        }
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == trackInfo.id){
                this.data.features[i] = track;
                return
            }
        }
    },
    deleteTrack(trackID){
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.id == trackID){
                this.data.features.splice(i,1) 
                return;
            }
        }
    },
    //Update Tracks affected by a stop update
    updateTracksCoords(response){
        const stopInfo = response.stopInfo
        let stopIdToCheck = stopInfo.id
        if(response.activeStop){
            stopIdToCheck = response.activeStop
        }
        for(let i = 0; i < this.data.features.length; i++){
            if(this.data.features[i].properties.start_stop == stopIdToCheck){
                this.data.features[i].properties.start_stop = stopInfo.id
                this.data.features[i].geometry.coordinates[0] = [stopInfo.longitude, stopInfo.latitude];
            }
            
            if(this.data.features[i].properties.end_stop == stopIdToCheck){
                this.data.features[i].properties.end_stop= stopInfo.id
                this.data.features[i].geometry.coordinates[1] = [stopInfo.longitude, stopInfo.latitude];
            }
        }
    }
})