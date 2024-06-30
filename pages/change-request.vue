<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">Change request</h1>
  <div class="flex flex-col gap-5">
    <div
      v-for="request in requests"
      :key="request.id"
      class="bg-white p-5 rounded-lg drop-shadow flex justify-between">
      <div class="my-2">
        <h2 class="font-bold">{{ request.title }}</h2>
      </div>
      <div class="flex gap-5 my-auto">
        <NuxtLink to="/" class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md">
          Discard
        </NuxtLink>
      </div>
    </div>
  </div>
  
  <div class="my-10 text-end">
    <NuxtLink to="/">
      <v-btn class="text-none ms-4 px-8"
            color="blue-darken-4"
            variant="outlined"
            >Cancel</v-btn>
    </NuxtLink>
    <NuxtLink to="/">
      <v-btn class="text-none ms-4 text-white px-8"
        color="blue-darken-4"
        variant="flat">Publish</v-btn>
    </NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'usersidebar'
})

const requests = [
  {
      id: 1,
      title: "Updated computer science layout",
  },
  {
      id: 2,
      title: "Update Footer",
  },
  {
      id: 3,
      title: "Remove Button",
  },
];
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>