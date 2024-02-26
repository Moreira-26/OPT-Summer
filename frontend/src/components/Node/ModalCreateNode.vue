<script setup>
    import { ref } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { modalsData } from '../../data/modalsData';
    function closeModal(){
        modalsData.closeModal()
    }

    const errors = ref([])

    const nodeName = ref("")
    const nodeShortName = ref("")
    const nodeLatitude = ref(modalsData.coords.at(1))
    const nodeLongitude = ref(modalsData.coords.at(0))
    const nodeLabelPos = ref("")
    const nodeIsVisible = ref(false)
    const nodeIsDepot = ref(false)

    function checkForm(){
        errors.value = []
        //Verification
        if(nodeName.value === "" || nodeShortName.value === "" || nodeLatitude.value === 0.0 || nodeLongitude.value === 0.0){
            errors.value.push("Something is missing");
            return;
        }

        //Send Request
        var nodeInfo = {
            "name" : nodeName.value,
            "short_name" : nodeShortName.value,
            "latitude" : nodeLatitude.value,
            "longitude" : nodeLongitude.value,
            "label_pos" : nodeLabelPos.value,
            "visible" : nodeIsVisible.value,
            "is_depot" : nodeIsDepot.value,
            "version" : 0
        }
        
        socketIOService.createNode(nodeInfo);
        closeModal();
    }

</script>

<template>
    <div  id="modalButtonDiv">
        <ModalTemplate @closeModal="closeModal" @submitForm="checkForm">
            <!--Header node Modal-->
            <template v-slot:header>
                <h2>Node Info</h2>
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
                    <span>Name is: {{ nodeName }}</span><br/>
                    <input type="text" v-model="nodeName" ><br/>
                    <span>Short name is: {{ nodeShortName }}</span><br/>
                    <input type="text" v-model="nodeShortName" ><br/>
                    <span>Latitude is: {{ nodeLatitude }}</span><br/>
                    <input type="number" v-model="nodeLatitude" ><br/>
                    <span>Longitude is: {{ nodeLongitude }}</span><br/>
                    <input type="number" v-model="nodeLongitude" ><br/>
                    <span>Label_Pos is: {{ nodeLabelPos }}</span><br/>
                    <input type="text" v-model="nodeLabelPos" ><br/>
                    <span>Visible: {{ nodeIsVisible }}</span><br/>
                    <input type="checkbox" v-model="nodeIsVisible"><br/>
                    <span>Is depot: {{ nodeIsDepot }}</span><br/>
                    <input type="checkbox" v-model="nodeIsDepot"><br/>
                </form>
            </template>

            <!--Footer node Modal-->
            <template v-slot:footer>
                <button type="button" @click="checkForm" class="btn-green" >Submit</button>
            </template>
            
        </ModalTemplate>
    </div>
</template>

<style>
#modalButtonDiv {z-index: 1;}
</style>

