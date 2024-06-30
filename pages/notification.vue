<template>
    <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">Notification</h1>
    <div class="flex flex-col gap-5">
      <div
        v-for="request in requests"
        :key="request.id"
        class="bg-white p-5 rounded-lg drop-shadow flex justify-between">
        <div class="my-2">
          <h2 class="font-bold">{{ request.title }}</h2>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  definePageMeta({
    layout: 'usersidebar'
  })
  
  const requests = [
    {
        id: 1,
        title: "Home",
    },
    {
        id: 2,
        title: "About",
    },
    {
        id: 3,
        title: "Paragon Student",
    },
    {
        id: 4,
        title: "Perspective Student",
    },
    {
        id: 5,
        title: "Acedemics",
    },
    {
        id: 6,
        title: "Admission",
    },
    {
        id: 7,
        title: "Partnership",
    },
  ];
  </script>
  
  <style scoped>
  @import "@/assets/css/style.css";
  </style>
  