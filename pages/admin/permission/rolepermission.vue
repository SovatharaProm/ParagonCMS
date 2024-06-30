<template>
  
    <AdminPermissionTable />
</template>

<script setup>
definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>

<style scoped>
/* Add your CSS styles here */
</style>