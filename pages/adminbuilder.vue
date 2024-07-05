<template>
  <div class="flex">
    <div class="flex-grow h-auto bg-white">
        <HeaderBuilder />
        <FooterBuilder />
    </div>
  </div>
</template>
  
    
<script setup>
import HeaderBuilder from '/components/HeaderBuilder.vue';
import FooterBuilder from '/components/FooterBuilder.vue';

definePageMeta({
  layout: 'custom'
})
</script>
    