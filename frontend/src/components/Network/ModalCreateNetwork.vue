<script setup>
    import { ref } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { modalsData } from '../../data/modalsData';

    function closeModal(){
        modalsData.closeModal()
    }

    const errors = ref([])

    const netName = ref("")
    const startFromActive = ref(false)
    
    function checkForm(){
        errors.value = []
        //Verification
        if(netName.value === ""){
            errors.value.push("Something is missing");
            return;
        }

        //Send Request
        var netInfo = {
            "name" : netName.value,
            "startFromActive":startFromActive.value
        }
        
        socketIOService.createNetwork(netInfo);
        closeModal();
    }

</script>

<template>
    <div  id="modalButtonDiv">
        <ModalTemplate @closeModal="closeModal" @submitForm="checkForm">
            <!--Header node Modal-->
            <template v-slot:header>
                <h2>Create Network</h2>
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
                    <span>Name is: {{ netName }}</span><br/>
                    <input type="text" v-model="netName" ><br/>
                    <span>Start From Active: {{ startFromActive  }}</span><br/>
                    <input type="checkbox" v-model="startFromActive"><br/>
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

