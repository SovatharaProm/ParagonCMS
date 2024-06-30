<template>
    <div class="flex justify-start items-center mt-4 my-4">
      <button @click="goBack" class="w-10 h-10 p-2.5 bg-white rounded-full border border-stone-300 flex justify-center items-center">
        <Icon name="ph:caret-left-bold" color="grey" class="w-6 h-6" />
      </button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      goBack() {
        this.$router.go(-1);
      }
    }
  };
  </script>