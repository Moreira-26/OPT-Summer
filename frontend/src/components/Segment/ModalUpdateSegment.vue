<script setup>
    import { ref } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { modalsData } from '../../data/modalsData';
    import { nodesGeoJson } from '../../data/nodesGeoJson';

    //Segment info to display received by props
    const segmentInfo = ref(modalsData.segmentInfo)

    //Function to emit closeModal event to parent
    function closeModal(){
        modalsData.closeModal()
    }

    const errors = ref([])

    
    function updateSubmit(){
        //Verify if something is empty
         if(segmentInfo.value.name === ""){
             errors.value.push("Something is missing");
             return;
        }

        //Request payload, increment version
        var segmentInfoPayload = {
            "id" : segmentInfo.value.id,
            "name" : segmentInfo.value.name,
            "start_node_id" : segmentInfo.value.start_node_id,
            "end_node_id" : segmentInfo.value.end_node_id,
            "segment_type" :segmentInfo.value.segment_type,
            "default_length" : segmentInfo.value.default_length,
            "average_duration" : segmentInfo.value.average_duration,
            "visible" : segmentInfo.value.visible,
            "version": parseInt(segmentInfo.value.version) + 1
        }

        console.log("UPDATE");
        console.log(segmentInfoPayload)
    
        //Send request
        socketIOService.updateSegment(segmentInfoPayload);
        closeModal();
    }

    function deleteSubmit(){
        //Send delete of node with nodeID and increment version
        socketIOService.deleteSegment(segmentInfo.value);
        closeModal();
    }

</script>

<template>
    <ModalTemplate  @closeModal="closeModal" >
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Segment Info</h2>
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
                <span>Id is: {{ segmentInfo.id  }}</span><br/>
                <span>Name is: {{ segmentInfo.name }}</span><br/>
                <input type="text" v-model="segmentInfo.name" ><br/>
                <span>Start Node ID is: {{ segmentInfo.start_node_id }}</span><br/>
                <select v-if="nodesGeoJson.data != undefined" v-model="segmentInfo.start_node_id" >
                    <option v-for="node in nodesGeoJson.data.features.sort((a, b) => a.properties.id - b.properties.id)" :value="node.properties.id">{{ `${node.properties.id} - ${node.properties.name}` }}</option>
                </select><br/>
                <span>End Node ID is: {{ segmentInfo.end_node_id }}</span><br/>
                <select v-if="nodesGeoJson.data != undefined" v-model="segmentInfo.end_node_id">
                    <option v-for="node in nodesGeoJson.data.features.sort((a, b) => a.properties.id - b.properties.id)" :value="node.properties.id">{{ `${node.properties.id} - ${node.properties.name}` }}</option>
                </select><br/>
                <!-- <span>Start Node ID is: {{ segmentInfo.start_node_id }}</span><br/>
                <input type="text" v-model="segmentInfo.start_node_id"><br/>
                <span>End Node ID is: {{ segmentInfo.end_node_id }}</span><br/>
                <input type="text" v-model="segmentInfo.end_node_id"><br/> -->
                <span>Default length is: {{ segmentInfo.default_length }}</span><br/>
                <input type="number" v-model="segmentInfo.default_length"><br/>
                <span>Average duration is: {{ segmentInfo.average_duration }}</span><br/>
                <input type="text" v-model="segmentInfo.average_duration"><br/>
                <span>Visible: {{ segmentInfo.visible }}</span><br/>
                <input type="checkbox" v-model="segmentInfo.visible"><br/>
                <span>Segment type: {{ segmentInfo.segment_type }}</span><br/>
                <input type="number" v-model="segmentInfo.segment_type"><br/>
                <span>Version: {{ segmentInfo.version }}</span><br/>
                <input type="number" v-model="segmentInfo.version"><br/>
                
            </form>
        </template>

        <!--Footer node Modal-->
        <template v-slot:footer>
            <button type="button"  @click="deleteSubmit">Delete</button>
            <button type="button" @click="updateSubmit" class="btn-green" >Submit</button>
        </template>
        
    </ModalTemplate>
</template>

<style>
#modalButtonDiv {z-index: 1;}
</style>

