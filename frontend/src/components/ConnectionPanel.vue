<template>
    <h1>Username: {{ props.username }}</h1>
    <button @click='toggleConnection()'>{{ socketIOService.state.connected ? 'Disconnect' : 'Connect' }}</button>
    <button @click="updateDB">Update DB</button>
    <div>
    <h1>Choose a Network</h1>
        <ul v-if="networksData.isLoaded()">
            <li v-for="network in networksData.data">
                <button
                    class="buttonNetwork"
                    :class="{ 'clicked': network.clicked }"
                    @click="changeNetwork(network.id)"
                >
                    {{ network.name }}
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import socketIOService from '../socketIO/socketIO.service'
import { networksData } from '../data/networksData'

const props = defineProps({
    username: String
})

function toggleConnection() {
    if (socketIOService.state.connected) {
        socketIOService.disconnect() 
    } else {
        socketIOService.connectAuth(props.username)
        socketIOService.getNetworkCurrenState(1)
    }
}

function changeNetwork(networkId) {
    socketIOService.getNetworkCurrenState(networkId)
    socketIOService.joinNetwork(networkId)
    
    // Set the clicked state to true for the clicked network
    networksData.data.forEach(network => {
        network.clicked = network.id === networkId;
    });
}

function updateDB() {
    socketIOService.updateDB();
}
</script>

<style>
    .buttonNetwork {
        background-color: white;
        color: black;
    }
    
    .clicked {
        background-color: blue; /* Change this to the desired clicked color */
        color: white;
    }
</style>
