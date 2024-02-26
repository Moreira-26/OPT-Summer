import {reactive} from 'vue'
import {segmentsGeoJson} from './segmentsGeoJson'

export const pathsData = reactive({
    data:undefined,
    defineData(paths, pathSegs){
        this.data = new Map()
        for(const path of paths){
            let segments = []
            segments.push(...path.segments)
            path.segments = new Map()
            for(const seg of segments){
                path.segments.set(seg.value,{"order":seg.score,"tracks":[]})
            }
            this.data.set(path.id,path)
        }
        for(const pathSeg of pathSegs){
            let segObj = this.data.get(pathSeg.pathId).segments.get(pathSeg.segId)
            segObj.tracks = pathSeg.tracks
            this.data.get(pathSeg.pathId).segments.set(pathSeg.segId, segObj)
        }
    },
    clearData(){
        if(this.data!= undefined){
            this.data = undefined
        }
    },
    isLoaded(){
        return this.data != undefined
    },
    createPath(pathInfo){
        const newSegmetnsMap = new Map()
        for(const seg of pathInfo.segs){
            newSegmetnsMap.set(seg.id,{'order':seg.order})
        }
        const path  = {
            'id' : pathInfo.id,
            'name':pathInfo.name,
            'empty': pathInfo.empty,
            'segments': newSegmetnsMap
        }
        this.data.set(pathInfo.id, path)
    },
    updatePath(response){
        let pathIdToCheck = response.path.id
        if(response.activePath != undefined){
            pathIdToCheck = response.activePath;
        }
        const newSegmetnsMap = new Map()
        for(const seg of response.path.segs){
            newSegmetnsMap.set(seg.id,{'order':seg.order})
        }
        const path  = {
            'id' : response.path.id,
            'name':response.path.name,
            'empty': response.path.empty,
            'segments': newSegmetnsMap
        }
        this.data.delete(pathIdToCheck)
        this.data.set(path.id, path)

    },
    deletePath(response){
        let pathToDelete = response.pathId
        if(response.isFromActive){
            pathToDelete = response.activePath
        }
        this.data.delete(pathToDelete)

    },
    getPathSegs(path) {
        let segments = []
        for (const segment of segmentsGeoJson.data.features) {
            if (this.data.get(path).segments.has(segment.properties.id)) {
                segments.push({
                    id: segment.properties.id,
                    name: segment.properties.name,
                    order: this.data.get(path).segments.get(segment.properties.id).order
                })
            }
        }
        return segments.sort((a, b) => a.order - b.order)
    },
    getSegsFromNode(nodeId) {
        let segments = []
        for (const segment of segmentsGeoJson.data.features) {
            if (nodeId == segment.properties.start_node_id) {
                segments.push({
                    id: segment.properties.id,
                    name: segment.properties.name
                })
            }
        }
        return segments
    }
})