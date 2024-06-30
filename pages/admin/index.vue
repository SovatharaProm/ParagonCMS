<template>
  <div class="flex flex-col items-center justify-center text-center pt-72">
    <h1 class="text-4xl font-bold mb-4">Welcome to the Admin Dashboard</h1>
    <p class="text-lg">
      This is your starting point to manage your application.
    </p>
  </div>
</template>

<script setup>
  definePageMeta({
    layout: "dashboard",
    middleware: "auth",
  });
</script>
