<template>
  <div class="relative min-h-screen flex flex-col">
    <div class="flex-grow p-4">
      <h1 class="text-2xl font-bold text-blue-900 text-start mb-8">
        {{ changeRequest?.request_name || "Loading..." }}
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div>
          <p class="text-lg font-semibold mb-2">
            <span class="font-bold">Request Name:</span>
            {{ changeRequest?.request_name || "Loading..." }}
          </p>
          <p class="text-lg font-semibold mb-2">
            <span class="font-bold">Requester:</span>
            {{ changeRequest?.requester || "Loading..." }}
          </p>
          <p class="text-lg font-semibold mb-2">
            <span class="font-bold">Page:</span>
            {{ changeRequest?.page || "Loading..." }}
          </p>
          <p class="text-lg font-semibold mb-2">
            <span class="font-bold">Status: </span>
            <span :class="statusClass(changeRequest?.status)">
              {{ changeRequest?.status || "Loading..." }}
            </span>
          </p>
          <p class="text-lg font-semibold mb-2">
            <span class="font-bold">Created Time:</span>
            {{ changeRequest?.created_time || "Loading..." }}
          </p>
          <p class="text-lg font-semibold mb-2">
            <span class="font-bold">Preview URL:</span>
            <a
              :href="changeRequest?.preview_url"
              target="_blank"
              class="text-blue-500 hover:underline"
            >
              {{ changeRequest?.preview_url || "Loading..." }}
            </a>
          </p>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="mt-8">
        <h2 class="text-xl font-bold mb-4">Comments</h2>
        <div v-if="changeRequest?.comments?.length">
          <div
            v-for="comment in changeRequest.comments"
            :key="comment.id"
            class="mb-4 p-4 border rounded-lg shadow"
          >
            <p class="text-lg font-medium"><strong>{{ comment.commenter_name }}</strong></p>
            <p class="text-gray-600 font-medium">{{ comment.created_time }}</p>
            <p class="mt-2 font-medium">{{ comment.comments }}</p>
          </div>
        </div>
        <div v-else>
          <p class="font-medium">No comments available.</p>
        </div>
      </div>
    </div>

    <!-- Sticky Footer -->
    <div class="sticky-footer flex justify-end p-4 bg-white border-t border-gray-200">
      <button
        @click="openRejectModal"
        class="bg-red-700 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-medium"
      >
        Decline
      </button>
      <button
        @click="approveChangeRequest"
        class="bg-blue-900 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
      >
        Approve
      </button>
    </div>

    <AdminRejectCommentDialog
      :show="showRejectModal"
      @close="closeRejectModal"
      @submit="handleRejectSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "vue-toast-notification";
import { useAuthStore } from "../stores/auth";
import { useRouter, useRoute } from "vue-router";
import AdminRejectCommentDialog from '@/components/AdminRejectCommentDialog.vue';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const changeRequestId = ref(route.query.id);
const showRejectModal = ref(false);
const changeRequest = ref(null);

const openRejectModal = () => {
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
};

const fetchChangeRequestDetails = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/view-change-request?change_request_id=${changeRequestId.value}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    const data = await response.json();
    if (response.ok) {
      changeRequest.value = data.data.change_request;
    } else {
      throw new Error(data.message || "Failed to fetch change request details");
    }
  } catch (error) {
    toast.error(
      error.message || "There was an error fetching the change request details"
    );
  }
};

const approveChangeRequest = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/approve-change-request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ change_request_id: changeRequestId.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to approve change request");
    }

    toast.success("Change request approved successfully");
    router.push("/admin/request/request");
  } catch (error) {
    toast.error(
      error.message || "There was an error approving the change request"
    );
  }
};

const handleRejectSubmit = async (comment) => {
  if (!comment.trim()) {
    toast.error("Please add your comment to the rejection");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reject-change-request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        change_request_id: changeRequestId.value,
        comments: comment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reject change request");
    }

    toast.success("Change request rejected successfully");
    router.push("/admin/request/request"); // Navigate to the review list page after rejection
  } catch (error) {
    toast.error(
      error.message || "There was an error rejecting the change request"
    );
  }
};

const statusClass = (status) => {
  switch (status) {
    case "Approved":
      return "text-green-500";
    case "Pending":
      return "text-orange-500";
    case "Rejected":
      return "text-red-500";
    default:
      return "";
  }
};

onMounted(async () => {
  await authStore.initializeStore();
  await fetchChangeRequestDetails();
});
</script>

<style scoped>
@import "@/assets/css/style.css";
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

.sticky-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
