<template>
  <div class="h-screen overflow-hidden">
    <Header class="drop-shadow-md w-full"/>
    <div class="flex h-[89vh]">
      <!-- Sidebar -->
      <div
        :class="['fixed inset-0 z-40 transition-transform transform lg:relative lg:translate-x-0', isDrawerOpen ? 'translate-x-0' : 'translate-x-full']"
        class="w-full bg-white rounded-md flex flex-col justify-between py-8 drop-shadow-lg lg:relative lg:translate-x-0 lg:w-[300px] right-0 lg:right-auto"
      >
        <div class="font-lato flex flex-col gap-4 mt-8 lg:mt-0">
          <NuxtLink to="/admin/website" class="flex gap-2 sidebar-link" @click="closeDrawer">
            <Icon
              name="material-symbols:home-rounded"
              class="icon text-grey-200"
            />
            <span class="text-grey-200">Website</span>
          </NuxtLink>
          <NuxtLink to="/admin/request/request" class="flex gap-2 sidebar-link" @click="closeDrawer">
            <Icon name="material-symbols:book-4" class="icon text-grey-200" />
            <span class="text-grey-200">Requests</span>
          </NuxtLink>
          <NuxtLink
            to="/admin/roles/RoleManagement"
            class="flex gap-2 sidebar-link" @click="closeDrawer"
          >
            <Icon name="oui:app-users-roles" class="icon text-grey-200" />
            <span class="text-grey-200">Roles Management</span>
          </NuxtLink>
          <NuxtLink
            to="/admin/users/UserManagement"
            class="flex gap-2 sidebar-link" @click="closeDrawer"
          >
            <Icon name="mynaui:users-group" class="icon text-grey-400" />
            <span class="text-grey-200">Users Management</span>
          </NuxtLink>
        </div>
        <button
          class="text-blue-900 hover:text-blue-900 font-bold text-lg  gap-2 px-4 py-4 flex items-center hover:bg-[#f0f7ff]"
          @click="handleLogout"
        >
          <Icon name="material-symbols:logout" class="icon" />
          <span>Sign out</span>
        </button>
      </div>

      <!-- Drawer Toggle Button for Mobile -->
      <button
        class="fixed z-50 top-4 left-4 lg:hidden"
        @click="toggleDrawer"
      >
        <Icon name="material-symbols:menu" class="text-3xl text-blue-900" />
      </button>

      <!-- Main content area -->
      <main class="flex flex-col bg-[#EFEFF5] w-full p-8">
        <div
          class="bg-white py-4 px-8 rounded-lg h-full overflow-auto drop-shadow-lg"
        >
          <slot />
        </div>
        <!-- Additional content goes here -->
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from "@/components/Header";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const isDrawerOpen = ref(false);

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout(router);
  closeDrawer();
};
</script>

<style scoped>
@import "@/assets/css/style.css";

.icon {
  margin: auto 0;
  font-size: 1.5rem; /* Icon size, adjust as needed */
}

.sidebar-link {
  list-style: none;
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #444444;
  border-left: 5px solid #fff;
}

.sidebar-link:hover {
  background-color: #f0f7ff;
}

.sidebar-link .icon {
  margin-right: 0.5rem;
  font-size: 2rem;
}

.sidebar-link li {
  font-weight: bold;
  font-size: 1.3rem;
  color: #f0f7ff;
  display: flex;
  align-items: flex-end;
}

.active-link {
  background-color: #f0f7ff;
  color: #2b348f;
  border-left: 5px solid #2b348f;
}

@media (max-width: 1024px) {
  .lg\\:mt-0 {
    margin-top: 0 !important;
  }
}
</style>
