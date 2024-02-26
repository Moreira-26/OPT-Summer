<script setup>
    import { ref, watch } from 'vue'
    import socketIOService from '../socketIO/socketIO.service';
    const usersConnected = socketIOService.usersConnected;
    const usersConnectedNetwork = socketIOService.usersConnectedNetwork
</script>

<template>
     <div>
        <p>Users Connected:</p>
        <ul>
            <li v-for="user in usersConnected">{{ user }} : {{ usersConnectedNetwork[user]}}</li>
        </ul>
    </div>
</template>