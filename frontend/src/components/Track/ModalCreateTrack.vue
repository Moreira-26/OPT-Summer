<script setup>
    import { ref, computed } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { stopsGeoJson } from '../../data/stopsGeoJson';
    import { modalsData } from '../../data/modalsData';

    const trackName = ref("")
    const trackStartStop= ref(0)
    const trackEndStop = ref(0)
    const trackLength = ref(0)
    const trackVisible = ref(false)
    const searchStartStop = ref('')
    const searchEndStop = ref('')
    

    const filteredStartStops = computed(() => {
        const searchString = searchStartStop.value.toLowerCase();
        if(searchString === ''){
            return stopsGeoJson.data.features
        }
        return stopsGeoJson.data.features.filter(stop =>
            stop.properties.name.toLowerCase().includes(searchString)
        );
    })


    const filteredEndStops = computed(() => {
        const searchString = searchEndStop.value.toLowerCase();
        if(searchString === ''){
            return stopsGeoJson.data.features
        }
        return stopsGeoJson.data.features.filter(stop =>
            stop.properties.name.toLowerCase().includes(searchString)
        );
    })

    function closeModal(){
        modalsData.closeModal()
    }

    const errors = ref([])

    function checkForm(){
        if(trackName.value === ""){
            errors.value.push("Something is missing")
            return;
        }
        //const startStop = stopsGeoJson.findStop(trackStartStop.value)
        //const endStop = stopsGeoJson.findStop(trackEndStop.value)
        var trackInfoPayload = {
            "name" : trackName.value,
            "start_stop":trackStartStop.value,
            "end_stop":trackEndStop.value,
            "visible":trackVisible.value,
            "length":trackLength.value
        }

        socketIOService.createTrack(trackInfoPayload);
        closeModal()

    }
</script>


<template>
    <ModalTemplate  @closeModal="closeModal" >
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Track Create</h2>
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
                <span>Name is: {{ trackName }}</span><br/>
                <input type="text" v-model="trackName" ><br/>
                <span>Start Stop is: {{ trackStartStop }}</span><br/>
                <input type="text" v-model="searchStartStop" placeholder="Search Start Stop">
                <select v-model="trackStartStop">
                    <option v-for="stop in filteredStartStops" :value="stop.properties.id">{{ `${stop.properties.id} - ${stop.properties.name}` }}</option>
                </select><br/>
                <span>End stop  is: {{ trackEndStop }}</span><br/>
                <input type="text" v-model="searchEndStop" placeholder="Search Start Stop">
                <select v-model="trackEndStop">
                    <option v-for="stop in filteredEndStops" :value="stop.properties.id">{{ `${stop.properties.id} - ${stop.properties.name}` }}</option>
                </select><br/>
                <span>Length is: {{ trackLength }}</span><br/>
                <input type="number" v-model="trackLength"><br/>
                <span>Visible: {{ trackVisible }}</span><br/>
                <input type="checkbox" v-model="trackVisible"><br/>
            </form>
        </template>

        <!--Footer node Modal-->
        <template v-slot:footer>
            <button type="button" @click="checkForm" class="btn-green" >Submit</button>
        </template>
        
    </ModalTemplate>
</template>