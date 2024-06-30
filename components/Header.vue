<template>
  <nav class="bg-white shadow-md flex justify-between items-center py-3 px-4 md:px-20">
    <div>
      <img src="@/assets/images/Logo.png" alt="Logo" class="h-12 md:h-20" />
    </div>
    <div class="flex gap-3 items-center">
      <!-- Role Badge -->
      <div v-if="userRole" class="hidden sm:flex items-center gap-2">
        <span class="font-medium text-sm md:text-lg">Role:</span>
        <span
          :class="roleBadgeClass"
          class="font-bold px-2 py-1 rounded-lg text-xs md:text-base"
        >
          {{ formattedUserRole }}
        </span>
      </div>
      <!-- User Name and Profile Icon -->
      <div v-if="userRole" class="flex items-center gap-2 relative">
        <span class="font-medium text-sm md:text-lg pr-5">{{ userName }}</span>
        <NuxtLink to="/profile" class="flex items-center">
          <Icon name="gg:profile" class="text-xl md:text-3xl cursor-pointer" />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
await authStore.initializeStore();

const userRole = computed(() => authStore.userRole);
const userName = computed(() => authStore.userName || 'User Name');

const formattedUserRole = computed(() => {
  switch (userRole.value) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'user':
      return 'User';
    default:
      return userRole.value;
  }
});

const roleBadgeClass = computed(() => {
  switch (userRole.value) {
    case 'super_admin':
      return 'bg-blue-100 text-blue-800';
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'user':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>
