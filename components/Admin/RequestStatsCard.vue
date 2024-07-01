<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-blue-900 text-center py-4">
      Update Request
    </h1>
    <div class="flex flex-col gap-5">
      <div
        v-for="request in requests"
        :key="request.id"
        class="bg-white p-5 rounded-lg shadow-lg flex flex-col md:flex-row justify-between"
      >
        <div class="my-auto">
          <h2 class="font-bold text-lg">{{ request.request_name }}</h2>
          <p>{{ request.page_id }}</p>
        </div>
        <div class="flex gap-4 mt-4 md:mt-0 my-auto">
          <NuxtLink
            :to="'/admin/review/review?id=' + request.id"
            class="text-blue-900 hover:text-blue-600"
            title="Review"
          >
            <Icon name="lets-icons:view" class="text-2xl" />
          </NuxtLink>
          <NuxtLink
            :href="'/admin/review/review?id=' + request.id"
            target="_blank"
            class="text-blue-900 hover:text-blue-600 flex items-center"
            title="View Request"
          >
            <Icon name="carbon:new-tab" class="text-2xl"></Icon>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useToast } from "vue-toast-notification";

const authStore = useAuthStore();
const toast = useToast();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const requests = ref([]);

const fetchRequests = async () => {
  try {
    const token = authStore.token;
    const response = await fetch(`${API_BASE_URL}/list-change-request`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again.");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch requests");
    }

    const data = await response.json();
    requests.value = data.data.all_change_requests;
  } catch (error) {
    console.error("Error fetching requests:", error.message);
    toast.error(error.message || "An unexpected error occurred", {
      timeout: 3000,
    });
  }
};

onMounted(() => {
  authStore.initializeStore();
  fetchRequests();
});
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>
