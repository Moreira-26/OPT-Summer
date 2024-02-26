<script setup>
    import { computed, ref } from 'vue'
    import CenterModalTemplate from '../CenterModalTemplate.vue';
    import { modalsData } from '../../data/modalsData';
    import { pathsData } from '../../data/pathsData';
    import { segmentsGeoJson } from '../../data/segmentsGeoJson';
    import socketIOService from '../../socketIO/socketIO.service';

    function closeModal(){
        modalsData.closeModal()
    }

    const selectedPathKey = ref(modalsData.pathInfo.id)

    const selectedCandidateSegmentKey = ref(-1)
    const selectedSegmentKey = ref(-1)

    // const nodeId = computed(() => {
    //     let nodeId = null
    //     let lastPathSegId = pathsData.getPathSegs(modalsData.pathInfo.id).pop()
    //     for (const segment of segmentsGeoJson.data.features) {
    //         if (lastPathSegId == segment.properties.id) {
    //             nodeId = segment.properties.end_node_id
    //         }
    //     }
    //     return nodeId
    // })

    const availableSegments = computed(() => {
        if (selectedSegments.value.length != 0) {
            let nodeId = null
            let lastPathSeg = selectedSegments.value.at(-1)
            for (const segment of segmentsGeoJson.data.features) {
                if (lastPathSeg.id == segment.properties.id) {
                    nodeId = segment.properties.end_node_id
                }
            }
            let segsFromNode =  pathsData.getSegsFromNode(nodeId)
            const idsToRemove = new Set(selectedSegments.value.map(seg => seg.id));
            return segsFromNode.filter((seg) => !idsToRemove.has(seg.id)) // Prevents used segments
        }    
    })

    const selectedSegments = ref(pathsData.getPathSegs(selectedPathKey.value))

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

    
    function updateSubmit(){
        //Verify if something is empty
        //TODO in the future: only allow to edit start/end nodes if the path is orphan
        if(pathInfo.value.name === "" || selectedSegments.value.length == 0){
            errors.value.push("Something is missing");
            return;
        }
        
        // Request payload
        const pathInfoPayload = {
            "id": pathInfo.value.id,
            "name": pathInfo.value.name,
            "empty": pathInfo.value.empty,
            "segs": selectedSegments.value
        }

        //Send request
        socketIOService.updatePath(pathInfoPayload);
        //closeModal();
    }

    function deleteSubmit(){
        const pathInfoPayload = {
            "id": pathInfo.value.id
        }

        socketIOService.deletePath(pathInfoPayload)
        closeModal()
    }
 </script>

<template>
    <div id="modalButtonDiv">
        <CenterModalTemplate @closeModal="closeModal">
            <!--Header node Modal-->
            <template v-slot:header>
                <h2>Path Update</h2>
            </template>

            <!--Body node Modal-->
            <template v-slot:body>
                <span>Name is: {{ pathInfo.name }}</span><br/>
                <input type="text" v-model="pathInfo.name" ><br/>
                <span>Is empty: {{ pathInfo.empty }}</span><br/>
                <input type="checkbox" v-model="pathInfo.empty"><br/>
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
                <button type="button"  @click="deleteSubmit">Delete</button>
                <button type="button" @click="updateSubmit" class="btn-green" >Submit</button>
            </template>
            
        </CenterModalTemplate>
    </div>
</template>

<style>
#modalButtonDiv {z-index: 1;}
</style>

