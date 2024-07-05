<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">
    View Requests
  </h1>
  <div class="flex flex-col gap-5">
    <div
      v-for="request in requests"
      :key="request.id"
      class="bg-white p-5 rounded-lg shadow flex justify-between"
    >
      <div class="my-2">
        <h2 class="font-bold">{{ request.request_name }}</h2>
      </div>
      <div class="flex gap-5 my-auto">
        <v-btn icon @click="openResubmitDialog(request)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="viewRequest(request.id)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="isResubmitDialogOpen" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">Resubmit Change Request</v-card-title>
      <v-card-text>
        <form @submit.prevent="resubmitChangeRequest">
          <div class="mb-4">
            <label for="resubmitComments" class="block text-gray-700 font-bold mb-2">Comments</label>
            <textarea
              v-model="resubmitComments"
              id="resubmitComments"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            ></textarea>
          </div>
        </form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-4" text @click="closeResubmitDialog">Cancel</v-btn>
        <v-btn color="blue-darken-4" text @click="resubmitChangeRequest">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isViewDialogOpen" max-width="600px">
    <v-card>
      <v-card-title class="text-xl text-blue-900">View Change Request</v-card-title>
      <v-card-text>
        <div v-if="viewRequestDetails" class="space-y-4">
          <div>
            <p class="font-semibold">Request Name:</p>
            <p>{{ viewRequestDetails.request_name }}</p>
          </div>
          <div>
            <p class="font-semibold">Status:</p>
            <p :class="statusClass(viewRequestDetails.status)">{{ viewRequestDetails.status }}</p>
          </div>
        </div>
      </v-card-text>
      <v-card-title class="text-xl font-bold text-blue-900">Comments</v-card-title>
      <v-card-text>
        <div v-if="viewRequestDetails" class="space-y-4">
          <div>
            <p class="font-semibold">Comment:</p>
            <p v-if="viewRequestDetails.comments && viewRequestDetails.comments.length > 0">{{ viewRequestDetails.comments[0].comments }}</p>
            <p v-else>No comments</p>
          </div>
          <div>
            <p class="font-semibold">Date:</p>
            <p v-if="viewRequestDetails.comments && viewRequestDetails.comments.length > 0">{{ formatDate(viewRequestDetails.comments[0].created_at) }}</p>
            <p v-else>No date</p>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-4" text @click="closeViewDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <div class="my-10 text-end">
    <NuxtLink to="/">
      <v-btn class="text-none ms-4 px-8" color="blue-darken-4" variant="outlined">Cancel</v-btn>
    </NuxtLink>
    <NuxtLink to="/">
      <v-btn class="text-none ms-4 text-white px-8" color="blue-darken-4" variant="flat">Publish</v-btn>
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "vue-toast-notification";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: "usersidebar",
});

const toast = useToast();
const authStore = useAuthStore();

const requests = ref([]);
const isResubmitDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const currentRequest = ref({
  id: null,
  request_name: "",
  notify_approver: false,
});
const viewRequestDetails = ref(null);
const resubmitComments = ref("");

const fetchRequests = async () => {
  if (!authStore.token) {
    toast.error("Authentication token is missing");
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/list-change-request`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch change requests");
    }

    const data = await response.json();
    if (data.data && data.data.my_change_requests) {
      requests.value = data.data.my_change_requests;
    } else {
      toast.error("Unexpected response structure");
    }
  } catch (error) {
    console.error("Error fetching change requests:", error);
    toast.error("Failed to fetch change requests");
  }
};

const openResubmitDialog = (request) => {
  currentRequest.value = { ...request };
  isResubmitDialogOpen.value = true;
};

const closeResubmitDialog = () => {
  isResubmitDialogOpen.value = false;
  currentRequest.value = {
    id: null,
    request_name: "",
    notify_approver: false,
  };
  resubmitComments.value = "";
};

const openViewDialog = () => {
  isViewDialogOpen.value = true;
};

const closeViewDialog = () => {
  isViewDialogOpen.value = false;
};

const viewRequest = async (id) => {
  if (!authStore.token) {
    toast.error("Authentication token is missing");
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/view-change-request?change_request_id=${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch change request details");
    }

    const data = await response.json();
    viewRequestDetails.value = data.data.change_request;
    openViewDialog();
  } catch (error) {
    console.error("Error fetching change request details:", error);
    toast.error("Failed to fetch change request details");
  }
};

const resubmitChangeRequest = async () => {
  if (!authStore.token) {
    toast.error("Authentication token is missing");
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resubmit-change-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        change_request_id: currentRequest.value.id,
        comments: resubmitComments.value,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to resubmit change request");
    }

    const result = await response.json();
    toast.success("Change request resubmitted successfully");
    closeResubmitDialog();
    fetchRequests(); // Refresh the list
  } catch (error) {
    console.error("Error resubmitting change request:", error);
    toast.error("Failed to resubmit change request");
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "No date";
  }
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
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

onMounted(() => {
  authStore.initializeStore().then(() => {
    fetchRequests();
  });
});
</script>

<style scoped>
@import "@/assets/css/style.css";

.v-card-text p {
  margin-bottom: 8px;
}
</style>
