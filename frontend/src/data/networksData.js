import {reactive} from 'vue'

export const networksData = reactive({
    data:undefined,
    loading:false,
    defineData(data){
        this.data = data;
    },
    isLoaded(){
        return this.data != undefined
    },
    addNetwork(network){
        this.data.push(network)
    },
    loadingComplete(){
        this.loading = false;
    },
    loadingStart(){
        this.loading = true;
    }
})