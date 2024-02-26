<script setup>
  import { watch, ref, reactive, inject, onMounted } from "vue";
  import { MapboxMap, MapboxSource, MapboxLayer } from '@studiometa/vue-mapbox-gl';
  import { nodesGeoJson } from "@/data/nodesGeoJson";
  import { segmentsGeoJson } from "@/data/segmentsGeoJson";
  import { stopsGeoJson } from "@/data/stopsGeoJson";
  import { tracksGeoJson } from "@/data/tracksGeoJson";
  import { glinesData } from "@/data/glinesData"
  import 'mapbox-gl/dist/mapbox-gl.css';

  const emit = defineEmits(['clickNode', 'clickSegment', 'clickStop', 'clickTrack', 'clickSingleFeature', 'clickMultiFeatures', 'rightClick'])

  const props = defineProps({
    glinesVisibility: Object,
    layersVisibility: Object
  })

  const glinesVisibility = ref(props.glinesVisibility)
  const layersVisibility = ref(props.layersVisibility) // From Map view

  var map, coordinates
  const mapCenter = ref([ -9.176445057844973,38.74011730389209]) // Map initial center position
  const mapMaxBounds = [ [-14.534044, 35.788488], [-5.351909, 42.089680] ]
  const layerIDS = ['nodesLayer', 'segmentsLayer', 'stopsLayer', 'tracksLayer']

  const nodesOptionsSource = reactive({
    type: 'geojson',
    data: nodesGeoJson.data
  })

  const segmentsOptionsSource = reactive({
    type: 'geojson',
    data: segmentsGeoJson.data,
    generateId: true
  })

  const stopsOptionsSource = reactive({
    type: 'geojson',
    data: stopsGeoJson.data
  })

  const tracksOptionsSource = reactive({
    type: 'geojson',
    data: tracksGeoJson.data
  })
  

  const nodesOptionsLayer = {
    type: 'circle',
    source: 'nodesSource',
    paint: {
        'circle-radius': 7,
        'circle-color': ['get', 'currentColor'],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 1,
    }
  }

  const stopsOptionsLayer = {
    type: 'circle',
    source: 'stopsSource',
    paint: {
      'circle-radius': 4,
      'circle-color': ['get', 'currentColor'],
      'circle-stroke-width': 0.5,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.6,
    }
  }

  const segmentsOptionsLayer = {
    type: 'line',
    source: 'segmentsSource',
    layout: {
      'line-cap': 'butt'
    },
    paint: {
      'line-color': ['get', 'mapboxColor'],
      'line-width': 2.0,
      'line-opacity': 0.5
    }
  }

  const tracksOptionsLayer = {
    type: 'line',
    source: 'tracksSource',
    layout: {
      'line-cap': 'butt'
    },
    paint: {
      'line-color': ['get', 'mapboxColor'],
      'line-width': 2.0,
      'line-opacity': 0.5
    }
  }

  //const selectedGline = ref("-1")

  // Watchers
  watch(glinesVisibility.value, () => {
      changeGline(glinesVisibility.value.glineId)
    }
  )

  watch(layersVisibility.value, () => {
      for (const layerID in layersVisibility.value) {
        map.setLayoutProperty(layerID, 'visibility', layersVisibility.value[layerID] ? 'visible' : 'none') 
      }
    }
  )
  //Watch nodesGeoJSON.data changes in deep Mode if something change use mapInstance to set data in source
  watch(nodesGeoJson, (currentValue) => {
      console.log('nodesGeoJson was updated...')
      let data = currentValue.data;
      const nodesSource = map.getSource('nodesSource')
      if(nodesSource != undefined){
        map.getSource('nodesSource').setData(data)
      }
    },
    {deep:true}
  )

  watch(segmentsGeoJson, (currentValue) => {
      console.log('segmentsGeoJson was updated...')
      let data = currentValue.data
      const segmentsSource = map.getSource('segmentsSource')
      if(segmentsSource != undefined){
        map.getSource('segmentsSource').setData(data)
      }
    },
    {deep:true}
  ) 

  watch(stopsGeoJson, (currentValue) => {
      console.log('stopsGeoJson was updated...')
      let data = currentValue.data;
      const stopsSource = map.getSource('stopsSource')
      if(stopsSource != undefined){
        map.getSource('stopsSource').setData(data)
      }
    },
    {deep:true}
  )

  watch(tracksGeoJson, (currentValue) => {
      console.log('tracksGeoJson was updated...')
      let data = currentValue.data;
      const tracksSource = map.getSource('tracksSource')
      if(tracksSource != undefined){
        map.getSource('tracksSource').setData(data)
      }
    },
    {deep:true}
  )
  
  function leftClick(e){
    const renderedFeatures = queryRenderedFeatures(e)
    switch (renderedFeatures.length) {
      case 0:
        break;
      case 1:
        emit('clickSingleFeature', renderedFeatures[0]);
        break;
      default:
        emit('clickMultipleFeatures', renderedFeatures);
    }
  };

  function rightClick(){
    emit('rightClick', coordinates)
  }

  function changeGline(e){
    if(e == -1){
      map.setFilter('nodesLayer',null)
      map.setFilter('segmentsLayer',null)
      map.setFilter('tracksLayer',null)
      map.setFilter('stopsLayer',null)
      return;   
    }
    const elementsFromGline = glinesData.getElements(e)
    map.setFilter('nodesLayer',['in', ['get', 'id'], ['literal', elementsFromGline.nodes]])
    map.setFilter('segmentsLayer',['in', ['get', 'id'], ['literal', elementsFromGline.segs]])
    map.setFilter('tracksLayer',['in', ['get', 'id'], ['literal', elementsFromGline.tracks]])
    map.setFilter('stopsLayer',['in', ['get', 'id'], ['literal', elementsFromGline.stops]])
  }

  function queryRenderedFeatures(e){
    const features = map.queryRenderedFeatures(e.point, { layers: layerIDS });
    const featureProperties = [
      'layer',
      'id',
      'type',
      'geometry',
      'properties'
    ];
    const renderedFeatures = features.map((feat) => {
      const renderedFeature = {};
      featureProperties.forEach((prop) => {
      renderedFeature[prop] = feat[prop];
      });
      return renderedFeature;
    });
    return renderedFeatures;
  };
</script>

<template>
  <div id="map">
    <!--
      Mb-created returns a map instance of mapBox map
    -->
    <MapboxMap @mb-click="leftClick" @mb-contextmenu="rightClick"  @mb-mousemove="(e) => {coordinates = e.lngLat.wrap();}"  @mb-created="(mapInstance) => map = mapInstance"
    style="height: 100%"
    access-token="pk.eyJ1IjoidGhpYWdvc29icmFsIiwiYSI6ImNrNG0yYWdicDJuaGEzZW13ZXlheHVlNG8ifQ.VmZlMAr7OaQaL8fVahMSnQ"
    map-style="mapbox://styles/thiagosobral/cldt4v7e3002s01pbhdgl1frl"
    :center="mapCenter"
    :zoom="12"
    >
      <!--
        Refactor: Create source and Layer on other component and import.
        Better if we add more
      -->
      <MapboxSource id="nodesSource" :options="nodesOptionsSource"/>
      <MapboxSource id="segmentsSource" :options="segmentsOptionsSource"/> 
      <MapboxSource id="stopsSource" :options ="stopsOptionsSource"/>
      <MapboxSource id="tracksSource" :options = "tracksOptionsSource"/>


      <MapboxLayer id="segmentsLayer"  :options="segmentsOptionsLayer" />
      <MapboxLayer id="nodesLayer"  :options="nodesOptionsLayer" />
      <MapboxLayer id="tracksLayer"  :options="tracksOptionsLayer" />  
      <MapboxLayer id="stopsLayer" :options="stopsOptionsLayer" />    
    
    </MapboxMap>
   
   
  </div>
  <!-- <div id="test">
    <select v-model="selectedGline" @change="changeGline($event)">
        <option :value="-1">All</option>
        <option v-for="gline in glinesData.data.sort((a, b) => a.id - b.id)" :value="gline.id">{{ `${gline.id} - ${gline.name}` }}</option>
    </select><br/>
  </div> -->
  </template>
<style>
#map { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; }
#test { position: absolute; z-index: 1;}

</style>