<template>
  <div class="flex h-[100vh]">
    <!-- Sidebar -->
    <div class="h-full w-[300px] rounded-xl flex flex-col justify-between py-3 drop-shadow-lg">
      <div class="flex flex-col gap-2">
        <NuxtLink to="/">
          <img src="/assets/images/Logo.png" class="w-[200px] h-auto mx-auto" alt="Logo" />
        </NuxtLink>
        <NuxtLink to="/profile" class="profile flex flex-col items-center py-2 mx-auto">
          <img
            class="profile-pic w-[70px] h-[70px] rounded-[50%] object-cover mb-[10px]"
            src="/assets/images/profile.jpeg"
            alt="Profile Picture"
          />
          <span class="username text-[16px] text-[#333] font-bold">{{ user.name }}</span>
        </NuxtLink>
        <div>
          <NuxtLink to="/" class="flex gap-3 sidebar-link">
            <Icon name="ph:house-bold" class="icon" />
            <span>Website</span>
          </NuxtLink>
          <NuxtLink to="/notification" class="flex gap-3 sidebar-link">
            <Icon name="ph:bell-bold" class="icon" />
            <span>Notification</span>
          </NuxtLink>
        </div>
      </div>
      <button
        class="text-blue-900 hover:text-blue-900 font-bold text-lg ps-5 py-4 pe-16 hover:bg-[#f0f7ff] rounded-full"
        @click="handleLogout"
      >
        <Icon name="material-symbols:logout" class="icon" />
        <span class="">Sign out</span>
      </button>
    </div>

    <!-- Main content area -->
    <main class="flex flex-col bg-[#EFEFF5] w-full p-8 overflow-auto">
      <div class="bg-white py-4 px-8 rounded-lg drop-shadow-lg">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Adjust the import path as needed

const authStore = useAuthStore();
const router = useRouter();

const user = ref({ name: '', email: '', role: '' });

const handleLogout = async () => {
  await authStore.logout(router);
};

// onMounted(async () => {
//   authStore.initializeStore();
//   if (authStore.token) {
//     await authStore.fetchUserData();
//     if (authStore.user) {
//       user.value = authStore.user;
//     }
//   } else {
//     router.push('/auth/login');
//   }
// });
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
