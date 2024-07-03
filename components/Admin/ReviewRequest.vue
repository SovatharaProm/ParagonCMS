<template>
  <div class="w-full flex flex-col justify-between px-4 py-6 h-full">
    <div>
      <div class="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 class="text-xl font-bold text-start">
          Add Faculty contact info in CS Department
        </h1>
        <div class="creator flex items-center gap-2 mt-4 md:mt-0">
          <span class="font-medium">Created by</span>
          <div class="avatar rounded-full w-8 h-8 flex items-center justify-center">
            <img
              src="assets/images/roxy.jpeg"
              alt="avatar"
              class="h-10 w-10 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg py-6 flex flex-wrap justify-center gap-4 mb-4">
        <div class="h-[500px] w-full p-2 border border-gray-300 rounded-lg">
          <!-- Placeholder for dynamic content -->
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5">
      <div class="actions flex justify-end gap-4">
        <button
          @click="openRejectModal"
          class="bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Decline
        </button>
        <button
          @click="approveChangeRequest"
          class="bg-blue-900 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Approve
        </button>
      </div>
    </div>
  </div>

  <AdminRejectCommentDialog
    :show="showRejectModal"
    @close="closeRejectModal"
    @submit="handleRejectSubmit"
  />
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
const toast = useToast();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const changeRequestId = ref(route.query.id || 5); // Use the ID from the route query
const showRejectModal = ref(false);

const openRejectModal = () => {
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
};

const approveChangeRequest = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/approve-change-request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ change_request_id: changeRequestId.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve change request');
    }

    toast.success('Change request approved successfully');
    router.push('/admin/request/request'); 
  } catch (error) {
    toast.error(error.message || 'There was an error approving the change request');
  }
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
    router.push('/admin/request/request'); // Navigate to the review list page after rejection
  } catch (error) {
    toast.error(error.message || 'There was an error rejecting the change request');
  }
};
</script>

<style scoped>
.creator .avatar {
  font-size: 0.75rem; /* Adjust size as needed */
}

textarea {
  border: none;
  resize: none;
}

.actions button {
  width: 100px; /* Fixed width for buttons */
}
</style>
