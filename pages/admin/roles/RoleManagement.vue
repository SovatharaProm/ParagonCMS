<template>
   <AdminRoleStatsCard/>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: "auth",
})
</script>