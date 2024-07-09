<template>
  <div class="flex flex-col w-1/2 items-start">
    <h1
      class="text-2xl font-bold text-blue-900 text-start pt-4 pb-6 h-fit w-1/2"
    >
      Headers
    </h1>
    <div
      class="flex gap-5 my-auto w-3/4 flex-col"
      v-for="header in headers"
      :key="header.id"
    >
      <div
        class="flex justify-between m-1 p-2 px-5 shadow items-center rounded"
      >
        <div class="my-2">
          <h3 class="font-medium">
            Header
            <span>{{ header.position }}</span>
          </h3>
        </div>
        <div class="flex gap-5 my-auto">
          <NuxtLink
            :to="`/admin/buildheader?id=${header.id}`"
            class="my-auto text-blue-900 text-lg flex items-center"
          >
            <Icon name="ph:note-pencil-bold"></Icon>
          </NuxtLink>
          <v-menu>
            <template v-slot:activator="{ props }">
              <button
                icon
                v-bind="props"
                class="text-blue-900 text-lg flex items-center"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </button>
            </template>
            <v-list>
              <v-list-item @click="toggleHeader(header.id)">
                <v-list-item-title>{{
                  header.isActive ? "Unpublish" : "Publish"
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="publishHeader(header.id)">
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
const headers = ref([]);
const isAdmin = computed(
  () => authStore.userRole === "admin" || authStore.userRole === "super_admin"
);
onMounted(async () => {
  await authStore.initializeStore();
  await fetchHeaders();
});
const fetchHeaders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/list-header`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    const data = await response.json();
    console.log("API response:", data);
    if (data.code === 200) {
      headers.value = data.data.headers.map((header) => ({
        ...header,
        isActive: header.is_published, // Assuming 'is_published' indicates if the header is active
      }));
      console.log("Headers fetched:", headers.value);
    } else {
      console.error("Error fetching headers:", data.message);
    }
  } catch (error) {
    console.error("Error fetching headers:", error);
  }
};
const publishHeader = async (headerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/publish-header`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ header_id: headerId }),
    });
    const result = await response.json();
    if (result.code === 200) {
      toast.success(result.message);
    } else if (result.code === 400) {
      toast.error(result.message);
    } else {
      toast.error(result.message);
      console.error("Error publishing header:", result.message);
    }
  } catch (error) {
    toast.error("Failed to publish header state.");
    console.error("Error publishing header state:", error);
  }
};
const toggleHeader = async (headerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/toggle-header`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ header_id: headerId }),
    });
    const result = await response.json();
    if (result.code === 200 || result.code === 201) {
      const header = headers.value.find((h) => h.id === headerId);
      if (result.code === 200) {
        header.isActive = true;
      } else if (result.code === 201) {
        header.isActive = false;
      }
      toast.success(result.message);
      console.log(result.message);
    } else {
      toast.error(result.message);
      console.error("Error toggling header:", result.message);
    }
  } catch (error) {
    toast.error("Failed to toggle header state.");
    console.error("Error toggling header state:", error);
  }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
