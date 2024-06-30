<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">Pages</h1>
  <div class="flex flex-col gap-5">
    <div
      v-for="request in requests"
      :key="request.id"
      class="bg-white p-5 rounded-lg drop-shadow flex justify-between">
      <div class="my-4">
        <h2 class="font-bold">{{ request.title }}</h2>
      </div>
      <div class="flex gap-5 my-auto">
        <v-switch
          v-model="model"
          :label="`${model}`"
          false-value="Off"
          true-value="On"
          color="indigo-darken-4"
          hide-details
          inset
        ></v-switch>
        <NuxtLink to="/change-request" class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md">
          Change request
        </NuxtLink>
        <NuxtLink to="/builder" class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md">
          Edit
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'usersidebar',
  // middleware: 'auth',
});

const requests = [
  { id: 1, title: "Home" },
  { id: 2, title: "About" },
  { id: 3, title: "Paragon Student" },
  { id: 4, title: "Prospective Student" },
  { id: 5, title: "Academics" },
  { id: 6, title: "Admission" },
  { id: 7, title: "Partnership" },
];
</script>
<script>
export default {
  data() {
    return {
      model: 'On',
    };
  },
};</script>

<style scoped>
@import "@/assets/css/style.css";
</style>