<script setup>
    import { ref } from 'vue'
    import ModalTemplate from './ModalTemplate.vue';
    import { modalsData } from '../data/modalsData';

    function closeModal(choice){
        modalsData.closeModalAskCreateNodeStop(choice)
    }
</script>

<template>
    <ModalTemplate @closeModal="closeModal(-1)">
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Entity Creation</h2>
        </template>

        <!--Body node Modal-->
        <template v-slot:body>
            Would you like to create a Node or a Stop?
            <button @click="closeModal('node')">Node</button>
            <button @click="closeModal('stop')">Stop</button>
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

