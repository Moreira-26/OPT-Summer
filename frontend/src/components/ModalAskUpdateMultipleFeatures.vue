<script setup>
    import { ref } from 'vue'
    import ModalTemplate from './ModalTemplate.vue';
    import { modalsData } from '../data/modalsData';

    function closeModal(choice){
        modalsData.closeModal()
        modalsData.handleClickSingleFeature(choice)
    }
</script>

<template>
    <ModalTemplate @closeModal="closeModal(-1)">
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Multiple features here...</h2>
        </template>

        <!--Body node Modal-->
        <template v-slot:body>
            Which feature would you like to edit?
            <p v-for="feature in modalsData.features"><button @click="closeModal(feature)">{{ `${feature.properties.id} - ${feature.properties.name}` }}</button></p>
        </template>

        <!--Footer node Modal-->
        <template v-slot:footer>
            <p>babyGIST</p>
        </template>
        
    </ModalTemplate>
</template>

<style>
#modalButtonDiv {z-index: 1;}
</style>

