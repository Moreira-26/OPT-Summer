<script setup>
    import { computed, ref } from 'vue'
    import CenterModalTemplate from '../CenterModalTemplate.vue';
    import { modalsData } from '../../data/modalsData';
    import { pathsData } from '../../data/pathsData';
    import { segmentsGeoJson } from '../../data/segmentsGeoJson';
    import { nodesGeoJson } from '../../data/nodesGeoJson';
    import socketIOService from '../../socketIO/socketIO.service';

    function closeModal(){
        modalsData.closeModal()
    }

    const pathName = ref('')
    const pathEmpty = ref(false)

    const selectedCandidateSegmentKey = ref(-1)
    const selectedSegmentKey = ref(-1)
    const startNodeId = ref('')

    const availableSegments = computed(() => {
            let nodeId = null
            if(startNodeId.value !== '' && selectedSegments.value.length == 0){
                nodeId = startNodeId.value
            }else{
                let lastPathSeg = selectedSegments.value.at(-1)
                if(lastPathSeg == undefined){
                    return
                }
                for (const segment of segmentsGeoJson.data.features) {
                    if (lastPathSeg.id == segment.properties.id) {
                        nodeId = segment.properties.end_node_id
                    }
                }
            }
            
            let segsFromNode =  pathsData.getSegsFromNode(nodeId)
            const idsToRemove = new Set(selectedSegments.value.map(seg => seg.id));
            return segsFromNode.filter((seg) => !idsToRemove.has(seg.id)) // Prevents used segments
    })

    const selectedSegments = ref([])

    const pathInfo = ref(modalsData.pathInfo)

    function addSegment() {
        selectedSegments.value.push({
            id: selectedCandidateSegmentKey.value,
            name: segmentsGeoJson.getSegment(selectedCandidateSegmentKey.value).properties.name,
            order: selectedSegments.value.length + 1        
        })
    }

    function removeSegment() {
        let selectedSegmentIdx
        for(let i = 0; i < selectedSegments.value.length; i++){
            if(selectedSegments.value.at(i).id == selectedSegmentKey.value){
                selectedSegmentIdx = i;
                break;
            }
        }
        selectedSegments.value.splice(selectedSegmentIdx, selectedSegments.value.length - selectedSegmentIdx)
    }

    const errors = ref([])

    
    function createSubmit(){
        //Verify if something is empty
        if(pathName.value === "" ){
            errors.value.push("Something is missing");
            return;
        }
        
        // Request payload
        const pathInfoPayload = {
            "name": pathName.value,
            "empty": pathEmpty.value,
            "segs": selectedSegments.value
        }

        //Send request
        socketIOService.createPath(pathInfoPayload);
        //closeModal();
    }
 </script>

<template>
    <div id="modalButtonDiv">
        <CenterModalTemplate @closeModal="closeModal">
            <!--Header node Modal-->
            <template v-slot:header>
                <h2>Path Create</h2>
            </template>
         

            <!--Body node Modal-->
            <template v-slot:body>
                <span>Start Node</span><br>
                <select id="startNode" size="20" v-model="startNodeId">
                    <option v-for="node in nodesGeoJson.data.features" :key="node.properties.id" :value="node.properties.id">
                        {{ `${node.properties.name}` }}
                    </option>
                </select>
                <span>Name is: {{ pathName }}</span><br/>
                <input type="text" v-model="pathName" ><br/>
                <span>Is empty: {{ pathEmpty }}</span><br/>
                <input type="checkbox" v-model="pathEmpty"><br/>
                <select id="availableSegments" size="20" v-model="selectedCandidateSegmentKey">
                <option v-for="segment in availableSegments" :key="segment.id" :value="segment.id">
            {{ `${segment.name}` }}
                </option>
            </select>
            <button id="addSegment" @click="addSegment">Add</button>
            <button id="removeSegment" @click="removeSegment">Remove</button>
            <select id="selectedSegments" size="20" v-model="selectedSegmentKey">
                <option v-for="segment in selectedSegments" :key="segment.id" :value="segment.id">
            {{ `${segment.name}` }}
                </option>
            </select>

            </template>

            <!--Footer node Modal-->
            <template v-slot:footer>
                <!-- <button type="button" @click="modalsData.openModalUpdateNode(nodesGeoJson.data.features[selectedNodeIdx])" class="btn-green">View</button> -->
                <button type="button"  @click="createSubmit">Create</button>
            </template>
            
        </CenterModalTemplate>
    </div>
</template>

<style>
#modalButtonDiv {
    z-index: 1;
    color:white
}

</style>

