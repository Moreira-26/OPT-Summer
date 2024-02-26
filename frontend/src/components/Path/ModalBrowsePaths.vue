<script setup>
    import { computed, ref } from 'vue'
    import CenterModalTemplate from '../CenterModalTemplate.vue';
    import { modalsData } from '../../data/modalsData';
    import { pathsData } from '../../data/pathsData';

    function closeModal(){
        modalsData.closeModal()
    }


    const selectedPathKey= ref(null)

    const searchPath = ref('')

    const filteredPaths = computed(() => {
        const searchString = searchPath.value.toLowerCase();
        if(searchString === ''){
            return Array.from(pathsData.data.keys())
        }
        return Array.from(pathsData.data.keys()).filter(pathKey =>
            pathsData.data.get(pathKey).name.toLowerCase().includes(searchString)
        );
    })

 </script>

<template>
    <div  id="modalButtonDiv">
        <CenterModalTemplate @closeModal="closeModal">
            <!--Header node Modal-->
            <template v-slot:header>
                <h2>Browse Paths</h2>
            </template>

            <!--Body node Modal-->
            <template v-slot:body>
            <input type="text" v-model="searchPath" placeholder="Search Path">
            <select id="PathsList" size="20" v-model="selectedPathKey">
                <option v-for="pathKey in filteredPaths" :key="pathKey" :value="pathKey" @click="modalsData.openModalUpdatePath(pathsData.data.get(pathKey))">
            {{ `${pathKey} - ${pathsData.data.get(pathKey).name}` }}
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

