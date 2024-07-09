<template>
    <div class="flex">
      <div class="flex-grow h-auto bg-white">
        <client-only>
          <HeaderBuilder />
        </client-only>
      </div>
    </div>
  </template>
    
      
  <script setup>
  
  definePageMeta({
    layout: 'custom'
  })
  </script>
      