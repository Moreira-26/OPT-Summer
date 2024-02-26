<template>
  <LoadingOverlay :isLoading="networksData.loading"/>
  <Map :layersVisibility="layersVisibility" :glinesVisibility="glinesVisibility" v-if="isDataLoaded" 
  @right-click="rightClick"
  @click-single-feature="handleClickSingleFeature"
  @click-multiple-features="handleClickMultipleFeatures"
  @click-node="clickNode"
  @click-segment="clickSegment"
  @click-stop="clickStop"
  @click-track="clickTrack"
  ></Map>
  <div id="ui">
    <ConnectionPanel :username= this.$route.params.username></ConnectionPanel>
    <button @click="modalsData.openModalCreatePath()">Create Path</button>
    <button @click="modalsData.openModalCreateSegment()">Create Segment</button>
    <button @click="modalsData.openModalCreateTrack()">Create Track</button>
    <button @click="modalsData.openModalCreateNetwork()">Create Network</button>
    <Filters @changeGline="changeGline" :glines="glinesData" :layersVisibility="layersVisibility"/>
  </div>
  <SideBar></SideBar>
</template>

<style>
#app {margin: 0;}
#ui {z-index: 1; display:flex; flex-direction: column}
</style>

<script setup>
  import { ref, computed, provide } from 'vue'
  import Map from "../components/Map.vue"
  import ConnectionPanel from '../components/ConnectionPanel.vue'
  import { nodesGeoJson } from '../data/nodesGeoJson'
  import { segmentsGeoJson } from '../data/segmentsGeoJson'
  import { stopsGeoJson } from '../data/stopsGeoJson'
  import { tracksGeoJson } from '../data/tracksGeoJson'
  import { glinesData } from "@/data/glinesData"
  import socketIOService from '../socketIO/socketIO.service'
  import { modalsData } from '../data/modalsData'
  import Filters from '../components/Filters.vue'
  import SideBar from '../components/SideBar.vue'
  import LoadingOverlay from '../components/LoadingOverlay.vue'
  import { networksData } from '../data/networksData'

  /* Map-related variables and functions */

  let isDataLoaded = computed(() => {
    return (nodesGeoJson.isLoaded()
            && segmentsGeoJson.isLoaded()
            && stopsGeoJson.isLoaded()
            && tracksGeoJson.isLoaded())
  })

  const layersVisibility = ref({
    nodesLayer: true,
    segmentsLayer: true,
    stopsLayer: true,
    tracksLayer:true
  })

  let glinesVisibility = ref({
    glineId: -1
  })

  function changeGline(e) {
    glinesVisibility.value.glineId = e
  }



   //Triggered when node clicked: sets openModal to true and defines the info to display 
  function clickNode(e) {
    modalsData.openModalUpdateNode(e)
    socketIOService.setNodeOpen(nodeInfo.value.id)
  }

  function clickStop(e) {
    modalsData.openModalUpdateStop(e)
    socketIOService.setStopOpen(stopInfo.value.id)
  }

  //Triggered when node clicked: sets openModal to true and defines the info to display 
  function clickSegment(e) {
    modalsData.openModalUpdateSegment(e)
  }

  function clickTrack(e) {
    modalsData.openModalUpdateTrack(e)
  }

  function handleClickSingleFeature(feature) {
    modalsData.handleClickSingleFeature(feature)
  }

  function handleClickMultipleFeatures(features) {
    modalsData.openModalAskUpdateFeatures(features)
  }

  /* Modal-related variables and functions */

  const openModal = ref('')

  function setOpenModal(modalID) {
    openModal.value = modalID
  }

  //Default update Modal info
  const nodeInfo = ref({
    id: -1,
    is_depot: false,
    label_pos: "F",
    latitude: "",
    longitude: "",
    name: "",
    short_name: "",
    visible: true,
    version:0,
    get getInfo() {
      return this;
    },
    set setInfo(e) {
      this.id = e.properties.id
      this.name = e.properties.name
      this.latitude = e.geometry.coordinates.at(1)
      this.longitude = e.geometry.coordinates.at(0)
      this.short_name = e.properties.short_name
      this.visible = e.properties.visible
      this.is_depot = e.properties.is_depot
      this.version = e.properties.version
    }
  })


  const stopInfo = ref({
    id: -1,
    label_pos: "F",
    latitude: "",
    longitude: "",
    name: "",
    short_name: "",
    visible: true,
    active:false,
    code: "",
    version:0,
    get getInfo() {
      return this
    },
    set setInfo(e) {
      this.id = e.properties.id
      this.name = e.properties.name
      this.latitude = e.geometry.coordinates.at(1)
      this.longitude = e.geometry.coordinates.at(0)
      this.short_name = e.properties.short_name
      this.visible = e.properties.visible
      this.active = e.properties.active
      this.code = e.properties.code
      this.version = e.properties.version
    }
  })


  function rightClick(rxCoords) {
    modalsData.openModalCreateNodeStop(rxCoords);
  }
</script>