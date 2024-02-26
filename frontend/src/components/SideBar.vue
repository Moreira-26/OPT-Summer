<template>
    <div class="sidebar">
      <button @click="toggleSidebar">Toggle Sidebar</button>
      <transition name="slide">
        <div v-if="isOpen" class="sidebar-content">
         
          <ModalsContainer v-if="modalsData.isAnyModalOpen()"></ModalsContainer>
          <VerticalMenu v-else></VerticalMenu>
          <ListActiveUsers></ListActiveUsers>

        </div>
      </transition>
    </div>
  </template>
  
<script setup>
  import { ref } from 'vue';
  import ModalsContainer from './ModalsContainer.vue';
  import ListActiveUsers from './ListActiveUsers.vue';
  import { modalsData } from '../data/modalsData';
  import VerticalMenu from './VerticalMenu.vue';
  
  const isOpen = ref(true);
  
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };
</script>
  
<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 200px;
    height: 100%;
    padding: 0px;
    border-top-right-radius: 15px; /* Rounded top-right corner */
  border-bottom-right-radius: 15px; /* Rounded bottom-right corner */
    transition: all 0.3 ease;
    z-index: 2;
  }
  
  .sidebar-content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    color: black;
    background: linear-gradient(to bottom, #ff9900, #ff5500); /* Example gradient colors */
  }
  
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s;
  }
  
  .slide-enter,
  .slide-leave-to {
    transform: translateX(-100%);
  }
</style>
  