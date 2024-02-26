<script setup>
    import { ref } from 'vue'
    import CenterModalTemplate from '../CenterModalTemplate.vue';
    import { modalsData } from '../../data/modalsData';
    import { nodesGeoJson } from '../../data/nodesGeoJson';

    function closeModal(){
        modalsData.closeModal()
    }

    const selectedNodeIdx = ref(null)

 </script>

<template>
    <div  id="modalButtonDiv">
        <CenterModalTemplate @closeModal="closeModal">
            <!--Header node Modal-->
            <template v-slot:header>
                <h2>Browse Nodes</h2>
            </template>

            <!--Body node Modal-->
            <template v-slot:body>
            <select id="NodesList" size="20" v-model="selectedNodeIdx">
                <option v-for="(node, nodeIdx) in nodesGeoJson.data.features.sort((a, b) => a.properties.id - b.properties.id)" :key="node.properties.id" :value="nodeIdx" @click="modalsData.openModalUpdateNode(nodesGeoJson.data.features[selectedNodeIdx])">
            {{ `${node.properties.id} - ${node.properties.name}` }}
                </option>
            </select>
            </template>

            <!--Footer node Modal-->
            <template v-slot:footer>
                <!-- <button type="button" @click="modalsData.openModalUpdateNode(nodesGeoJson.data.features[selectedNodeIdx])" class="btn-green">View</button> -->
            </template>
            
        </CenterModalTemplate>
    </div>
</template>

<style>
#modalButtonDiv {z-index: 1;}
</style>

