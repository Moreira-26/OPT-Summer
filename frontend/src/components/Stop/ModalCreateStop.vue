<script setup>
    import { ref } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { modalsData } from '../../data/modalsData';

    const emit = defineEmits(['closeModal'])


    function closeModal(){
        modalsData.closeModal()
    }

    const stopName = ref("")
    const stopShortName = ref("")
    const stopLatitude = ref(modalsData.coords.at(1))
    const stopLongitude = ref(modalsData.coords.at(0))
    const stopLabelPos = ref("")
    const stopVisible = ref(false)
    const stopActive = ref(false)
    const stopCode = ref("")

    const errors = ref([])

    function checkForm(){
        //Verify if something is empty
        if(stopName.value === "" || stopShortName.value === ""){
            errors.value.push("Something is missing");
            return;
        }

        //Request payload, increment version
        var stopInfoPayload = {
            "name" : stopName.value,
            "short_name" : stopShortName.value,
            "latitude" : stopLatitude.value,
            "longitude" :stopLongitude.value,
            "label_pos" : stopLabelPos.value,
            "visible" : stopVisible.value,
            "active" : stopActive.value,
            "code" : stopCode.value,
        }
        console.log(stopInfoPayload)
        //Send request
        socketIOService.createStop(stopInfoPayload);
        closeModal();
    }

</script>

<template>
    <ModalTemplate  @closeModal="closeModal" >
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Create Stop</h2>
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
                <span>Name is: {{ stopName }}</span><br/>
                <input type="text" v-model="stopName" ><br/>
                <span>Short name is: {{ stopShortName }}</span><br/>
                <input type="text" v-model="stopShortName"><br/>
                <span>Latitude is: {{ stopLatitude }}</span><br/>
                <input type="number" v-model="stopLatitude"><br/>
                <span>Longitude is: {{ stopLongitude }}</span><br/>
                <input type="number" v-model="stopLongitude"><br/>
                <span>Label_Pos is: {{ stopLabelPos }}</span><br/>
                <input type="text" v-model="stopLabelPos"><br/>
                <span>Code: {{ stopCode }}</span><br/>
                <input type="text" v-model="stopCode"><br/>
                <span>Visible: {{ stopVisible }}</span><br/>
                <input type="checkbox" v-model="stopVisible"><br/>
                <span>Active: {{ stopActive }}</span><br/>
                <input type="checkbox" v-model="stopActive"><br/>
            </form>
        </template>

        <!--Footer node Modal-->
        <template v-slot:footer>
            <button type="button" @click="checkForm" class="btn-green" >Submit</button>
        </template>
        
    </ModalTemplate>
</template>