<script setup>
    import { ref } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { stopsGeoJson } from '../../data/stopsGeoJson';
    import { modalsData } from '../../data/modalsData';

    const trackInfo = ref(modalsData.trackInfo)

    //Function to emit closeModal event to parent
    function closeModal(){
        modalsData.closeModal()
    }

    const errors = ref([])


    function updateSubmit(){
        if(trackInfo.value.name === ""){
            errors.value.push("Something is missing")
            return
        }

        //Build track payload 
        var trackInfoPayload = {
            "id" : trackInfo.value.id,
            "name" : trackInfo.value.name,
            "start_stop":trackInfo.value.start_stop,
            "end_stop":trackInfo.value.end_stop,
            "visible":trackInfo.value.visible,
            "length":trackInfo.value.length,
        }

        socketIOService.updateTrack(trackInfoPayload);
        closeModal()
    }

    function deleteSubmit(){
        //Send delete of node with nodeID and increment version
        socketIOService.deleteTrack(trackInfo.value)
        closeModal();
    }

</script>

<template>
    <ModalTemplate  @closeModal="closeModal" >
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Track Info</h2>
        </template>

        <!--Body node Modal-->
        <template v-slot:body>
            <form>
                <div v-if="errors.length">
                    <p>Errors:</p>
                    <ul>
                        <li v-for="error in errors">{{ error }}</li>
                    </ul>
                </div>
                <span>Id is: {{ trackInfo.id  }}</span><br/>
                <span>Name is: {{ trackInfo.name }}</span><br/>
                <input type="text" v-model="trackInfo.name" ><br/>
                <span>Start Stop is: {{ trackInfo.start_stop }}</span><br/>
                <select v-if="stopsGeoJson.data != undefined" v-model="trackInfo.start_stop">
                    <option v-for="stop in stopsGeoJson.data.features.sort((a, b) => a.properties.id - b.properties.id)" :value="stop.properties.id">{{ `${stop.properties.id} - ${stop.properties.name}` }}</option>
                </select><br/>
                <span>End stop  is: {{ trackInfo.end_stop }}</span><br/>
                <select  v-if="stopsGeoJson.data != undefined" v-model="trackInfo.end_stop">
                    <option v-for="stop in stopsGeoJson.data.features.sort((a, b) => a.properties.id - b.properties.id)" :value="stop.properties.id">{{ `${stop.properties.id} - ${stop.properties.name}` }}</option>
                </select><br/>
                <span>Length is: {{ trackInfo.length }}</span><br/>
                <input type="number" v-model="trackInfo.length"><br/>
                <span>Visible: {{ trackInfo.visible }}</span><br/>
                <input type="checkbox" v-model="trackInfo.visible"><br/>
            </form>
        </template>

        <!--Footer node Modal-->
        <template v-slot:footer>
            <button type="button"  @click="deleteSubmit">Delete</button>
            <button type="button" @click="updateSubmit" class="btn-green" >Submit</button>
        </template>
        
    </ModalTemplate>
</template>
