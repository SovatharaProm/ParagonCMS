<template>
    <div class="flex flex-col w-1/2 items-start">
      <h1 class="text-2xl font-bold text-blue-900 text-start pt-4 pb-6 h-fit w-1/2">
        Footer
      </h1>
      <div v-if="footer !== null" class="flex gap-5 my-auto w-3/4 flex-col">
        <div class="flex justify-between m-1 p-2 px-5 shadow items-center rounded">
          <div class="my-2">
            <h3 class="font-medium">Footer</h3>
          </div>
          <div class="flex gap-5 my-auto">
            <NuxtLink :to="`/admin/buildfooter`" class="my-auto text-blue-900 text-lg flex items-center">
              <Icon name="ph:note-pencil-bold"></Icon>
            </NuxtLink>
            <v-menu>
              <template v-slot:activator="{ props }">
                <button icon v-bind="props" class="text-blue-900 text-lg flex items-center">
                  <v-icon>mdi-dots-vertical</v-icon>
                </button>
              </template>
              <v-list>
                <v-list-item @click="toggleFooter">
                  <v-list-item-title>{{ footer.isActive ? 'Unpublish' : 'Publish' }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="publishFooter">
                  <v-list-item-title>Apply Draft</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import { useAuthStore } from "@/stores/auth";
  import { useToast } from "vue-toast-notification";
  
  const toast = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const authStore = useAuthStore();
  const footer = ref(null); // Initialize with null
  
  const isAdmin = computed(
    () => authStore.userRole === "admin" || authStore.userRole === "super_admin"
  );
  
  onMounted(async () => {
    await authStore.initializeStore();
    await fetchFooter();
  });
  
  const fetchFooter = async () => {
  try {
    if (!authStore.token) {
      throw new Error("Token is missing");
    }

    const response = await fetch(`${API_BASE_URL}/list-footer`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    const data = await response.json();
    console.log('API response:', data);
    if (data.code === 200) {
      footer.value = data.data && data.data.footer
        ? {
            ...data.data.footer,
            isActive: data.data.footer.is_published, // Assuming 'is_published' indicates if the footer is active
          }
        : null; // Set to null if no footer is returned
      console.log('footer fetched:', footer.value);
    } else {
      console.error('Error fetching footer:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching footer:', error.message || error);
    toast.error('Error fetching footer: ' + (error.message || error));
  }
};

  
  const publishFooter = async () => {
    try {
      if (!authStore.token) {
        throw new Error("Token is missing");
      }
  
      const response = await fetch(`${API_BASE_URL}/publish-footer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({}), // Add necessary body content if required
      });
      const result = await response.json();
      if (result.code === 200) {
        toast.success(result.message);
      } else if (result.code === 400) {
        toast.error(result.message);
      } else {
        toast.error(result.message);
        console.error('Error publishing footer:', result.message);
      }
    } catch (error) {
      toast.error('Failed to publish footer state.');
      console.error('Error publishing footer state:', error.message || error);
    }
  };
  
  const toggleFooter = async () => {
    try {
      if (!authStore.token) {
        throw new Error("Token is missing");
      }
  
      const response = await fetch(`${API_BASE_URL}/toggle-footer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({}), // Add necessary body content if required
      });
      const result = await response.json();
      if (result.code === 200 || result.code === 201) {
        footer.value.isActive = !footer.value.isActive; // Toggle the local state
        toast.success(result.message);
      } else {
        toast.error(result.message);
        console.error('Error toggling footer:', result.message);
      }
    } catch (error) {
      toast.error('Failed to toggle footer state.');
      console.error('Error toggling footer state:', error.message || error);
    }
  };
  </script>
  
  <style scoped>
  @import "/assets/css/style.css";
  </style>
  