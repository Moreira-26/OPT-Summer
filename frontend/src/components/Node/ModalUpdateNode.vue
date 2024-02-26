<script setup>
    import { onMounted, ref, watch } from 'vue'
    import ModalTemplate from '../ModalTemplate.vue';
    import socketIOService from '../../socketIO/socketIO.service';
    import { modalsData } from '../../data/modalsData';


    //Node info to display received by props
    const nodeInfo = ref(modalsData.nodeInfo)

    //Function to emit closeModal event to parent
    function closeModal(){
        modalsData.closeModal()
    }

    const errors = ref([])

    
    function updateSubmit(){
        //Verify if something is empty
        if(nodeInfo.value.name === "" || nodeInfo.value.short_name === "" || nodeInfo.value.latitude === 0.0 || nodeInfo.value.longitude === 0.0){
            errors.value.push("Something is missing");
            return;
        }

        //Request payload, increment version
        var nodeInfoPayload = {
            "id" : nodeInfo.value.id,
            "name" : nodeInfo.value.name,
            "short_name" : nodeInfo.value.short_name,
            "latitude" : nodeInfo.value.latitude,
            "longitude" :nodeInfo.value.longitude,
            "label_pos" : nodeInfo.value.label_pos,
            "visible" : nodeInfo.value.visible,
            "is_depot" : nodeInfo.value.is_depot,
            "version": parseInt(nodeInfo.value.version) + 1
        }
    
        //Send request
        socketIOService.updateNode(nodeInfoPayload);
        closeModal();
    }

    function deleteSubmit(){
        //Send delete of node with nodeID and increment version
        socketIOService.deleteNode(nodeInfo.value.id, nodeInfo.value.version + 1);
        closeModal();
    }

</script>

<template>
    <ModalTemplate  @closeModal="closeModal">
        <!--Header node Modal-->
        <template v-slot:header>
            <h2>Node Info</h2>
        </template>

        <!--Body node Modal-->
        <template v-slot:body>
            <form class ="form">
                <div v-if="errors.length">
                    <p>Errors:</p>
                    <ul>
                        <li v-for="error in errors">{{ error }}</li>
                    </ul>
                </div>
                <span>Id is: {{ nodeInfo.id  }}</span><br/>
                <span>Name is: {{ nodeInfo.name }}</span><br/>
                <input type="text" v-model="nodeInfo.name" ><br/>
                <span>Short name is: {{ nodeInfo.short_name }}</span><br/>
                <input type="text" v-model="nodeInfo.short_name"><br/>
                <span>Latitude is: {{ nodeInfo.latitude }}</span><br/>
                <input type="number" v-model="nodeInfo.latitude"><br/>
                <span>Longitude is: {{ nodeInfo.longitude }}</span><br/>
                <input type="number" v-model="nodeInfo.longitude"><br/>
                <span>Label_Pos is: {{ nodeInfo.label_pos }}</span><br/>
                <input type="text" v-model="nodeInfo.label_pos"><br/>
                <span>Visible: {{ nodeInfo.visible }}</span><br/>
                <input type="checkbox" v-model="nodeInfo.visible"><br/>
                <span>Is depot: {{ nodeInfo.is_depot }}</span><br/>
                <input type="checkbox" v-model="nodeInfo.is_depot"><br/>
                <span>Version: {{ nodeInfo.version }}</span><br/>
                <input type="number" v-model="nodeInfo.version"><br/>
                
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
.form {
    color: white;
}

</style>

