<template>
    <p>State: {{ connected }}</p>
</template>

<script setup>    
import {computed} from 'vue'
import socketIOService from '../socketIO/socketIO.service';

const connected = computed(()=>{
    return socketIOService.state.connected;
})

</script>