<template>
  <div class="flex h-[100vh]">
    <!-- Sidebar -->
    <div class="h-full w-[300px] rounded-xl flex flex-col justify-between py-3 drop-shadow-lg">
      <div class="flex flex-col gap-20">
        <NuxtLink to="/">
            <img src="/assets/images/Logo.png" class="w-[200px] h-auto mx-auto" alt="Logo">
        </NuxtLink>
        <div>
          <NuxtLink to="/" class="flex gap-3 sidebar-link">
            <Icon name="ph:house-bold" class="icon" />
            <span>Website</span>
          </NuxtLink>
          <NuxtLink to="/change-request" class="flex gap-3 sidebar-link">
            <Icon name="ph:git-pull-request-bold" class="icon" />
            <span>Change Request</span>
          </NuxtLink>
          <NuxtLink to="/profile" class="flex gap-3 sidebar-link">
            <Icon name="ph:user-bold" class="icon" />
            <span>Profile</span>
          </NuxtLink>
        </div>
      </div>
      <NuxtLink to="/auth/login" class="text-blue-900 hover:text-blue-900 font-bold text-lg gap-2 px-4 py-4 flex items-center hover:bg-[#f0f7ff]">
        <Icon name="material-symbols:logout" class="icon" />
        <span class="">Sign out</span>
      </NuxtLink>
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
const user = {
  name: 'Bunseng Tang'
}
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
  