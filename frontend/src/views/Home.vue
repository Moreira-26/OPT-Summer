<script setup>
    import {ref, computed} from 'vue'
    import socketIOService from '../socketIO/socketIO.service';
    import router from '../router/index';

    const authName = ref('')
    const hasInput = computed(() => {
        return authName.value.length > 0 ? true : false
    })

    function goToMap(){
        socketIOService.connectAuth(authName.value)

        socketIOService.getNetworks()
        socketIOService.getNetworkCurrenState(1)
        socketIOService.joinNetwork(1)
        router.push({ name: 'Map', params:{username :authName.value}})
    }

</script>

<template> 
    <div>
        <h1>Welcome to BabyGist</h1>
        <input v-model="authName" placeholder="User name">
        <!--V-if only renders the router link if 'hasInput' is true, :to redirects to page Map with the params-->
        <button v-if="hasInput" @click="goToMap">Go To Network Selection</button>

    </div>
</template>