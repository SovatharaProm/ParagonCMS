<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-blue-900 text-center py-4">
      Update Request
    </h1>
    <div class="flex flex-col gap-5">
      <div
        v-for="request in requests"
        :key="request.id"
        class="bg-white p-5 rounded-lg shadow-lg flex flex-col md:flex-row justify-between"
      >
        <div class="my-auto">
          <h2 class="font-bold text-lg">{{ request.title }}</h2>
          <p>{{ request.description }}</p>
        </div>
        <div class="flex gap-4 mt-4 md:mt-0 my-auto">
          <NuxtLink
            to="/admin/review/review"
            class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-600"
            title="Review"
          >
            Review
          </NuxtLink>
          <NuxtLink
            :href="'/admin/review/review?id=' + request.id"
            target="_blank"
            class="px-4 py-2 bg-blue-900 text-white rounded-md flex items-center hover:bg-blue-600"
            title="View Request"
          >
            <Icon name="lets-icons:view" class="text-lg" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const requests = [
  { id: 1, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 2, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 3, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 4, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 5, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 6, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 7, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 8, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 9, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 10, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 11, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  { id: 12, title: "Add Faculty contact info in CS Department", description: "Requested by Bunseng Tang" },
  // Add more requests as needed
];
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>
