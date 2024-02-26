<script setup>
    import { ref } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { modalsData } from '../../data/modalsData';
    import { nodesGeoJson } from '../../data/nodesGeoJson';
    
    const segName = ref("")
    const segStartNodeId = ref(0)
    const segEndNodeId = ref(0)
    const segType = ref(0)
    const segDefaultLength = ref(0)
    const segAverageDuration = ref(0)
    const segVisible = ref(false)

    function closeModal(){
        modalsData.closeModal()
    }
    
    const errors = ref([])

    function checkForm(){
         //Verify if something is empty
         if(segName.value === ""){
            errors.value.push("Something is missing");
            return;
        }


        //Request payload, increment version
        var segmentInfoPayload = {
            "name" : segName.value,
            "start_node_id" : segStartNodeId.value,
            "end_node_id" : segEndNodeId.value,
            "segment_type" : segType.value,
            "default_length" : segDefaultLength.value,
            "average_duration" : segAverageDuration.value,
            "visible" : segVisible.value,
            "version": 0
        }

        socketIOService.createSegment(segmentInfoPayload);
        closeModal()

    }
</script>


<template>
    <ModalTemplate @closeModal="closeModal" @submitForm="checkForm">
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Segment Create</h2>
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
                <span>Name is: {{ segName }}</span><br/>
                <input type="text" v-model="segName" ><br/>
                <span>Start Node ID is: {{ segStartNodeId }}</span><br/>
                <select v-model="segStartNodeId">
                    <option v-for="node in nodesGeoJson.data.features.sort((a, b) => a.properties.id - b.properties.id)" :value="node.properties.id">{{ `${node.properties.id} - ${node.properties.name}` }}</option>
                </select><br/>
                <span>End Node ID is: {{ segEndNodeId }}</span><br/>
                <select v-model="segEndNodeId">
                    <option v-for="node in nodesGeoJson.data.features.sort((a, b) => a.properties.id - b.properties.id)" :value="node.properties.id">{{ `${node.properties.id} - ${node.properties.name}` }}</option>
                </select><br/>
                <!-- <span>Start Node ID is: {{ segStartNodeId }}</span><br/>
                <input type="text" v-model="segStartNodeId"><br/> -->
                <!-- <span>End Node ID is: {{ segEndNodeId }}</span><br/>
                <input type="text" v-model="segEndNodeId"><br/> -->
                <span>Default length is: {{ segDefaultLength }}</span><br/>
                <input type="number" v-model="segDefaultLength"><br/>
                <span>Average duration is: {{ segAverageDuration }}</span><br/>
                <input type="text" v-model="segAverageDuration"><br/>
                <span>Visible: {{ segVisible }}</span><br/>
                <input type="checkbox" v-model="segVisible"><br/>
                <span>Segment type: {{ segType }}</span><br/>
                <input type="number" v-model="segType"><br/>
            </form>
        </template>

        <!--Footer node Modal-->
        <template v-slot:footer>
            <button type="button" @click="checkForm" class="btn-green" >Submit</button>
        </template>
        
    </ModalTemplate>
</template>