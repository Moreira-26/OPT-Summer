<script setup>
    import ModalAskCreateNodeStop from './ModalAskCreateNodeStop.vue';
    import ModalAskUpdateMultipleFeatures from './ModalAskUpdateMultipleFeatures.vue';
    import ModalCreateNode from './Node/ModalCreateNode.vue';
    import ModalCreateSegment from './Segment/ModalCreateSegment.vue';
    import ModalCreateStop from './Stop/ModalCreateStop.vue';
    import ModalCreateTrack from './Track/ModalCreateTrack.vue';
    import ModalUpdateNode from './Node/ModalUpdateNode.vue';
    import ModalUpdateSegment from './Segment/ModalUpdateSegment.vue';
    import ModalUpdateStop from './Stop/ModalUpdateStop.vue';
    import ModalUpdateTrack from './Track/ModalUpdateTrack.vue';
    import ModalUpdatePath from './Path/ModalUpdatePath.vue';
    import ModalCreateNetwork from './Network/ModalCreateNetwork.vue';
    import ModalBrowseNodes from './Node/ModalBrowseNodes.vue';
    import ModalBrowsePaths from './Path/ModalBrowsePaths.vue';
    import ModalCreatePath from './Path/ModalCreatePath.vue';
    import {modalsData} from '../data/modalsData'
    import socketIOService from '../socketIO/socketIO.service';
    import { nodesGeoJson } from '../data/nodesGeoJson';

    function closeModalUpdateNode() {
        socketIOService.setNodeClosed(nodeInfo.value.id)
        modalsData.closeModal()
    }

    function closeModalUpdateSegment() {
        modalsData.closeModal()
    }

    function closeModalUpdateStop() {
        socketIOService.setStopClosed(stopInfo.value.id)
        modalsData.closeModal()
    }

    function closeModalUpdateTrack() {
        //openModalUpdateTrack.value = false
        modalsData.closeModal()
    }

    
</script>

<template>
    <ModalAskUpdateMultipleFeatures v-if="modalsData.isAskUpdateFeaturesOpen()"/>
    <ModalUpdateNode v-if="modalsData.isUpdateNodeOpen()"  />
    <ModalUpdateSegment v-if="modalsData.isUpdateSegmentOpen()" />
    <ModalUpdateStop v-if="modalsData.isUpdateStopOpen()"  />
    <ModalUpdateTrack v-if="modalsData.isUpdateTrackOpen()" />
    <ModalUpdatePath v-if="modalsData.isUpdatePathOpen()" />
    <ModalAskCreateNodeStop v-if="modalsData.isCreateNodeStopOpen()"/>
    <ModalCreateNode v-if="modalsData.isCreateNodeOpen()"/>
    <ModalCreateStop v-if="modalsData.isCreateStopOpen()"/>
    <ModalCreateSegment v-if="modalsData.isCreateSegmentOpen()"/>
    <ModalCreateTrack v-if="modalsData.isCreateTrackOpen()"/>
    <ModalCreateNetwork v-if="modalsData.isCreateNetworkOpen()"/>
    <ModalBrowseNodes v-if="modalsData.isBrowseNodesOpen()"/>
    <ModalBrowsePaths v-if="modalsData.isBrowsePathsOpen()"/>
    <ModalCreatePath v-if="modalsData.isCreatePathOpen()"/> 
</template>