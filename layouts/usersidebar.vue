<template>
  <div class="h-screen overflow-hidden">
    <div class="flex flex-col md:flex-row h-full">
      <!-- Sidebar -->
      <div
        :class="['fixed inset-0 z-40 transition-transform transform md:relative md:translate-x-0', isDrawerOpen ? 'translate-x-0' : '-translate-x-full']"
        class="w-full md:w-[300px] bg-white rounded-xl flex flex-col justify-between py-3 drop-shadow-lg md:relative md:translate-x-0"
      >
        <div class="flex flex-col gap-20">
          <NuxtLink to="/">
            <img src="/assets/images/Logo.png" class="w-[200px] h-auto mx-auto" alt="Logo" />
          </NuxtLink>
          <div>
            <NuxtLink to="/" class="flex gap-3 sidebar-link" @click="closeDrawer">
              <Icon name="ph:house-bold" class="icon" />
              <span>Websites</span>
            </NuxtLink>
            <NuxtLink to="/my-change-request" class="flex gap-3 sidebar-link" @click="closeDrawer">
              <Icon name="ph:git-pull-request-bold" class="icon" />
              <span>My Change Requests</span>
            </NuxtLink>
            <NuxtLink to="/view-change-request" class="flex gap-3 sidebar-link" @click="closeDrawer">
              <Icon name="ph:git-pull-request-bold" class="icon" />
              <span>Requests Assign to me</span>
            </NuxtLink> 
            <NuxtLink to="/profile" class="flex gap-3 sidebar-link" @click="closeDrawer">
              <Icon name="ph:user-bold" class="icon" />
              <span>Profile</span>
            </NuxtLink>
          </div>
        </div>
        <button @click="signOut" class="text-blue-900 hover:text-blue-900 font-bold text-lg gap-2 px-4 py-4 flex items-center hover:bg-[#f0f7ff]">
          <Icon name="material-symbols:logout" class="icon" />
          <span class="">Sign out</span>
        </button>
      </div>

      <!-- Drawer Toggle Button for Mobile -->
      <button
        class="fixed z-50 top-4 right-4 md:hidden"
        @click="toggleDrawer"
      >
        <Icon name="material-symbols:menu" class="text-3xl text-blue-900" />
      </button>

      <!-- Main content area -->
      <main class="flex flex-col bg-[#EFEFF5] w-full p-4 md:p-8 overflow-auto">
        <div class="bg-white py-4 px-4 md:px-8 rounded-lg drop-shadow-lg">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { useAuthStore } from '~/stores/auth';

const isDrawerOpen = ref(false);
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const signOut = async () => {
  try {
    console.log('Attempting to sign out...');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/log-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to log out');
    }

    console.log('Log out successful. Clearing user data...');
    // Clear user data from the store
    authStore.logout(router);
    toast.success('Successfully signed out');
    closeDrawer();
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error('Failed to sign out');
  }
};
</script>

<style scoped>
@import "@/assets/css/style.css";

.sidebar-link {
  list-style: none;
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #444444;
}

.sidebar-link:hover {
  background-color: #f0f7ff;
}

.sidebar-link .icon {
  font-size: 24px;
}

.sidebar-link li {
  font-weight: bold;
  font-size: 1.3rem;
  color: #f0f7ff;
  display: flex;
  align-items: flex-end;
}
</style>
