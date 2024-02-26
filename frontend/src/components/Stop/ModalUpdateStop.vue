<script setup>
    import { ref } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { modalsData } from '../../data/modalsData';


    const stopInfo = ref(modalsData.stopInfo)

    function closeModal(){
        modalsData.closeModal()
    }

    const errors = ref([])

    function updateSubmit(){
        //Verify if something is empty
        if(stopInfo.value.name === "" || stopInfo.value.short_name === "" || stopInfo.value.latitude === 0.0 || stopInfo.value.longitude === 0.0){
            errors.value.push("Something is missing");
            return;
        }

        //Request payload, increment version
        var stopInfoPayload = {
            "id" : stopInfo.value.id,
            "name" : stopInfo.value.name,
            "short_name" : stopInfo.value.short_name,
            "latitude" : stopInfo.value.latitude,
            "longitude" :stopInfo.value.longitude,
            "label_pos" : stopInfo.value.label_pos,
            "visible" : stopInfo.value.visible,
            "active" : stopInfo.value.active,
            "code" : stopInfo.value.code,
            "version": parseInt(stopInfo.value.version) + 1
        }
        //Send request
        socketIOService.updateStop(stopInfoPayload);
        closeModal();
    }


    function deleteSubmit(){
        socketIOService.deleteStop(stopInfo.value.id,0);
        closeModal()
    }

</script>

<template>
    <ModalTemplate  @closeModal="closeModal" >
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Stop Info</h2>
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
                <span>Id is: {{ stopInfo.id  }}</span><br/>
                <span>Name is: {{ stopInfo.name }}</span><br/>
                <input type="text" v-model="stopInfo.name" ><br/>
                <span>Short name is: {{ stopInfo.short_name }}</span><br/>
                <input type="text" v-model="stopInfo.short_name"><br/>
                <span>Latitude is: {{ stopInfo.latitude }}</span><br/>
                <input type="number" v-model="stopInfo.latitude"><br/>
                <span>Longitude is: {{ stopInfo.longitude }}</span><br/>
                <input type="number" v-model="stopInfo.longitude"><br/>
                <span>Label_Pos is: {{ stopInfo.label_pos }}</span><br/>
                <input type="text" v-model="stopInfo.label_pos"><br/>
                <span>Code: {{ stopInfo.code }}</span><br/>
                <input type="text" v-model="stopInfo.code"><br/>
                <span>Visible: {{ stopInfo.visible }}</span><br/>
                <input type="checkbox" v-model="stopInfo.visible"><br/>
                <span>Active: {{ stopInfo.active }}</span><br/>
                <input type="checkbox" v-model="stopInfo.active"><br/>
            </form>
        </template>

        <!--Footer node Modal-->
        <template v-slot:footer>
            <button type="button"  @click="deleteSubmit">Delete</button>
            <button type="button" @click="updateSubmit" class="btn-green" >Submit</button>
        </template>
        
    </ModalTemplate>
</template>

