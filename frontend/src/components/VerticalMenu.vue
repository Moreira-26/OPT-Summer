<template>
    <div class="vertical-menu">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        @click="toggleSubmenu(index)"
        :class="{ 'menu-item': true, active: item.open }" >
        {{ item.label }}
        <ul v-if="item.submenu && item.open" class="submenu">
          <li v-for="(subItem, subIndex) in item.submenu" :key="subIndex" @click="modalsData.openModalBrowse(subItem)">
            {{ subItem }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { modalsData } from '../data/modalsData';
  
  const menuItems = reactive([
    { label: 'Network', open: false, submenu: ['GLines', 'Lines', 'Paths', 'Segments', 'Nodes'] },
    { label: 'Planning', open: false, submenu: ['wip'] },
    { label: 'Rostering', open: false, submenu: ['wip'] },
  ]);
  
  const toggleSubmenu = (index) => {
    menuItems[index].open = !menuItems[index].open;
  };
  </script>
  
  <style>
  .vertical-menu {
    display: flex;
    flex-direction: column;
    width: 200px;
    border-right: 1px solid #ccc;
  }
  
  .menu-item {
    padding: 10px;
    cursor: pointer;
  }
  
  .active {
    background-color: #f0f0f0;
  }
  
  .submenu {
    list-style-type: none;
    margin: 0;
    padding: 0;
    background-color: #f8f8f8;
  }
  </style>
