<template>
  
    <AdminHeader />
    <AdminFooter />

  <AdminWebsite />
  </template>
  
  <style scoped>
  /* Additional styles can go here */
  </style>
  
  <script setup>
  definePageMeta({
    layout: 'dashboard',
    middleware: "auth",
  })
  </script>
  
  
  
  