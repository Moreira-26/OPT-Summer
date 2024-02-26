<script setup>
  import {ref, provide} from "vue";

  const emit = defineEmits(['changeGline'])

  const props = defineProps({
    glines: Object,
    layersVisibility: Object
  })

  const selectedGline = ref("-1")

  

  function toggleLayerVisibility(layerID) {
    props.layersVisibility[layerID] = !props.layersVisibility[layerID]
  }


</script>

<template>
    <div class="buttons-container">
        <button class ="filterButton" @click="toggleLayerVisibility('nodesLayer')">{{ !props.layersVisibility.nodesLayer ? "Show" : "Hide"}} Nodes</button>
        <button class ="filterButton" @click="toggleLayerVisibility('segmentsLayer')">{{ !props.layersVisibility.segmentsLayer ? "Show" : "Hide"}} Segments</button>
        <button class ="filterButton" @click="toggleLayerVisibility('stopsLayer')">{{ !props.layersVisibility.stopsLayer ? "Show" : "Hide"}} Stops</button>
        <button class ="filterButton" @click="toggleLayerVisibility('tracksLayer')">{{ !props.layersVisibility.tracksLayer ? "Show" :"Hide" }} Tracks</button>
    <select class="filterDropDown" v-if="glines.isLoaded()" v-model="selectedGline" @change="emit('changeGline', selectedGline)">
        <option :value="-1">All Glines</option>
        <option v-for="glineId in glines.data.keys()" :value="glineId">{{ `${glineId} - ${glines.data.get(glineId).name}` }}</option>
    </select>
    </div>
</template>
<style>
.buttons-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

/* Add some styling to the buttons for better visibility */
.filterButton {
  margin: 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.filterDropDown {
  margin: 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
