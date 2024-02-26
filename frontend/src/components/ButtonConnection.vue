<template>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
</template>

<script setup>
import  socketIOService  from "../socketIO/socketIO.service.js"


const props = defineProps({
    username: String
})

function connect() {
    socketIOService.connectAuth(props.username)
}

function disconnect(){
    socketIOService.disconnect()
}

</script>