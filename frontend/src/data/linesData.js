import {reactive} from 'vue'

export const linesData = reactive({
    data:undefined,
    defineData(lines){
        this.data = new Map()
        for(const line of lines){
            this.data.set(line.id,line)
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
})