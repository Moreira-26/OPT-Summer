import {reactive} from 'vue'
import { linesData } from './linesData'
import { pathsData } from './pathsData'
import { segmentsGeoJson } from './segmentsGeoJson' 
import { tracksGeoJson } from './tracksGeoJson'

export const glinesData = reactive({
    data:undefined,
    defineData(glines){
        this.data = new Map()
        for(const gline of glines){
            this.data.set(gline.id,gline)
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
    getGline(glineId){
        for(const gline of this.data){
            if(gline.id == glineId){
                return gline
            }
        }
    },
    getElements(glineId){
        const elements = {
            "segs" : [],
            "nodes" : [],
            "tracks" : [],
            "stops" : []
        }
        const setVisited = new Set([])
        let queue = []
        queue.push(`${glineId}`)
        while(queue.length != 0){
            let element = queue.shift();
            let type = parser.getType(element)
            switch(type){
                case 'gline':
                    let pathsOfGline = this.data.get(element).paths
                    let linesOfGline = this.data.get(element).lines
                    
                    if(pathsOfGline != undefined){
                        queue.push(...pathsOfGline)
                        setVisited.add(pathsOfGline)
                    }

                    if(linesOfGline != undefined){
                        queue.push(...linesOfGline)
                        setVisited.add(linesOfGline)
                    }
                    
                    break;
                case 'line':
                    let pathsOfLine = linesData.data.get(element).paths
                    if(pathsOfLine != undefined){
                        queue.push(...pathsOfLine)
                        setVisited.add(pathsOfLine)
                    }
                    break
                case 'path':
                    let path = pathsData.data.get(element)
                    for(const [segId, objectSeg] of path.segments.entries()){
                        elements.segs.push(segId)
                        elements.tracks.push(...objectSeg.tracks)
                    }
                    break;
            }
        }
        
        for(const seg of segmentsGeoJson.data.features){
            if(elements.segs.includes(seg.properties.id)){
                elements.nodes.push(seg.properties.start_node_id,seg.properties.end_node_id)
            }
        }

        for(const track of tracksGeoJson.data.features){
            if(elements.tracks.includes(track.properties.id)){
                elements.stops.push(track.properties.start_stop, track.properties.end_stop)
            }
        }

        console.log(elements)
        return elements
    }
})

const regex = /(\w*:\d*:)?(\w*):(\d*)/

/**
 * Match regex returns an array
 * 0 - entire string 
 * 1 - undefined if string hasnt net:{networkId}, net:{networkId} otherwise
 * 2 - type
 * 3 - id
*/
const parser = {
    parse (str){
        return str.match(regex)
    },
    isFromActive (str){
        return this.parse(str).at(1) == undefined
    },
    getType(str){
        return this.parse(str).at(2)
    },
    getId(str){
        return this.parse(str).at(3)
    },
    getOriginalId(str){
        return `${this.getType(str)}:${this.getId(str)}`
    }
}
