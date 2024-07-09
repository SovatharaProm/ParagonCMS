<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-blue-900 text-start py-4">
      Request Management
    </h1>
    <div class="flex flex-col gap-5">
      <div class="relative w-full md:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Search"
          v-model="searchQuery"
          class="border border-gray-300 rounded py-2 pl-10 pr-4 w-full"
        />
        <svg
          class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <div class="relative w-full md:w-1/3 mb-4">
        <select v-model="statusFilter" class="border border-gray-300 rounded py-2 px-4">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="bg-white p-5 rounded-lg shadow-lg flex flex-col md:flex-row justify-between"
      >
        <div class="my-auto">
          <h2 class="font-bold text-lg">{{ request.request_name }}</h2>
          <p class="font-medium">Created By: <span class="font-semibold">{{ request.requester }}</span></p>
          <p :class="statusClass(request.status)">{{ request.status }}</p>
        </div>
        <div class="flex gap-4 mt-4 md:mt-0 my-auto">
          <NuxtLink
            :to="'/admin/review/review?id=' + request.id"
            class="text-blue-900 hover:text-blue-600"
            title="Review"
          >
            <Icon name="lets-icons:view" class="text-2xl" />
          </NuxtLink>
          <a
            @click.prevent="openPreviewUrl(request.id)"
            class="text-blue-900 hover:text-blue-600 flex items-center cursor-pointer"
            title="View Request"
          >
            <Icon name="carbon:new-tab" class="text-2xl"></Icon>
          </a>
        </div>
      </div>
    </div>
    <AdminRejectCommentDialog
      :show="showRejectModal"
      @close="closeRejectModal"
      @submit="handleRejectSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useToast } from "vue-toast-notification";

const authStore = useAuthStore();
const toast = useToast();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const requests = ref([]);
const searchQuery = ref('');
const statusFilter = ref('');
const showRejectModal = ref(false);
const changeRequestId = ref(null);

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

const statusClass = (status) => {
  switch (status) {
    case 'Approved':
      return 'text-green-500';
    case 'Pending':
      return 'text-orange-500';
    case 'Rejected':
      return 'text-red-500';
    default:
      return '';
  }
};

const filteredRequests = computed(() => {
  return requests.value.filter(request => {
    const matchesSearch = searchQuery.value.trim() === '' ||
      request.request_name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === '' ||
      request.status.toLowerCase() === statusFilter.value.toLowerCase();

    return matchesSearch && matchesStatus;
  });
});

const openRejectModal = (id) => {
  changeRequestId.value = id;
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
};

const handleRejectSubmit = async (comment) => {
  if (!comment.trim()) {
    toast.error('Please add your comment to the rejection');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/reject-change-request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        change_request_id: changeRequestId.value,
        comments: comment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject change request');
    }

    toast.success('Change request rejected successfully');
    fetchRequests(); // Refresh the list after rejection
    closeRejectModal(); // Close the rejection modal
  } catch (error) {
    toast.error(error.message || 'There was an error rejecting the change request');
  }
};

const openPreviewUrl = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/view-change-request?change_request_id=${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch change request details');
    }

    const data = await response.json();
    let previewUrl = data.data.change_request.preview_url;

    // Ensure the URL includes the protocol
    if (!/^https?:\/\//i.test(previewUrl)) {
      previewUrl = `http://${previewUrl}`;
    }

    window.open(previewUrl, '_blank');
  } catch (error) {
    console.error('Error fetching change request details:', error);
    toast.error('Failed to fetch change request details');
  }
};

onMounted(() => {
  authStore.initializeStore();
  fetchRequests();
});
</script>

<style scoped>
@import "assets/css/style.css";
.text-green-500 { color: green; }
.text-orange-500 { color: orange; }
.text-red-500 { color: red; }
</style>
