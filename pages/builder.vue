<template>
  <div class="flex">
    <div class="flex-grow h-auto bg-white">
      <client-only>
        <GrapesEditor />
      </client-only>
    </div>
  </div>
</template>

  
<script setup>
import GrapesEditor from '/components/GrapesEditor.vue';
definePageMeta({
  layout: 'custom'
})
</script>
  