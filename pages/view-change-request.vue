<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">
    Change Request
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
        <button
          class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md"
          @click="openDialog(request)"
        >
          Edit
        </button>
        <button
          class="my-auto px-5 py-2 bg-red-500 text-white rounded-md"
          @click="discardRequest(request.id)"
        >
          Discard
        </button>
        <button
          class="my-auto px-5 py-2 bg-green-500 text-white rounded-md"
          @click="viewRequest(request.id)"
        >
          View
        </button>
      </div>
    </div>
  </div>

  <v-dialog v-model="isDialogOpen" max-width="600px">
    <template #activator="{ on, attrs }"></template>
    <v-card>
      <v-card-title class="text-h5">Update Change Request</v-card-title>
      <v-card-text>
        <form @submit.prevent="updateChangeRequest">
          <div class="mb-4">
            <label for="requestName" class="block text-gray-700 font-bold mb-2"
              >Request Name</label
            >
            <input
              type="text"
              v-model="currentRequest.request_name"
              id="requestName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="notifyApprover"
              class="block text-gray-700 font-bold mb-2"
              >Notify Approver</label
            >
            <input
              type="checkbox"
              v-model="currentRequest.notify_approver"
              id="notifyApprover"
              class="mr-2 leading-tight"
            />
            <span class="text-sm text-gray-700">Yes</span>
          </div>
        </form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-4" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="blue-darken-4" text @click="updateChangeRequest"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isViewDialogOpen" max-width="600px">
    <template #activator="{ on, attrs }"></template>
    <v-card>
      <v-card-title class="text-xl text-blue-900"
        >View Change Request</v-card-title
      >
      <v-card-text>
        <div v-if="viewRequestDetails">
          <p>
            <strong>Request Name:</strong> {{ viewRequestDetails.request_name }}
          </p>
          <p><strong>Page ID:</strong> {{ viewRequestDetails.page_id }}</p>
          <p><strong>Status:</strong> {{ viewRequestDetails.status }}</p>
        </div>
      </v-card-text>
      <v-card-title class="text-xl text-blue-900">Comments</v-card-title>
      <div v-if="viewRequestDetails">
        <p>
          <strong>Comment:</strong>
          <span v-if="viewRequestDetails.comments.length > 0">{{ viewRequestDetails.comments[0].comments }}</span>
          <span v-else>No comments</span>
        </p>
        <p>
          <strong>Date:</strong>
          <span v-if="viewRequestDetails.comments.length > 0">{{ formatDate(viewRequestDetails.comments[0].created_at) }}</span>
          <span v-else>No date</span>
        </p>
      </div>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-4" text @click="closeViewDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <div class="my-10 text-end">
    <NuxtLink to="/">
      <v-btn
        class="text-none ms-4 px-8"
        color="blue-darken-4"
        variant="outlined"
        >Cancel</v-btn
      >
    </NuxtLink>
    <NuxtLink to="/">
      <v-btn
        class="text-none ms-4 text-white px-8"
        color="blue-darken-4"
        variant="flat"
        >Publish</v-btn
      >
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toast-notification";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: "usersidebar",
});

const toast = useToast();
const authStore = useAuthStore();
const route = useRoute();

const requests = ref([]);
const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const currentRequest = ref({
  id: null,
  request_name: "",
  notify_approver: false,
});
const viewRequestDetails = ref(null);

const fetchRequests = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/list-change-request`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    const data = await response.json();
    requests.value = data.data.change_requests;
  } catch (error) {
    console.error("Error fetching change requests:", error);
    toast.error("Failed to fetch change requests");
  }
};

const openDialog = (request) => {
  currentRequest.value = { ...request };
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
  currentRequest.value = {
    id: null,
    request_name: "",
    notify_approver: false,
  };
};

const openViewDialog = () => {
  isViewDialogOpen.value = true;
};

const closeViewDialog = () => {
  isViewDialogOpen.value = false;
};

const discardRequest = (id) => {
  requests.value = requests.value.filter((request) => request.id !== id);
};

const updateChangeRequest = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/update-change-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`, // Ensure you have the token
        },
        body: JSON.stringify({
          id: currentRequest.value.id,
          request_name: currentRequest.value.request_name,
          notify_approver: currentRequest.value.notify_approver,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update change request");
    }

    const result = await response.json();
    console.log("Change request updated:", result);

    // Update the request in the list
    const index = requests.value.findIndex(
      (request) => request.id === currentRequest.value.id
    );
    if (index !== -1) {
      requests.value[index] = { ...currentRequest.value };
    }

    toast.success("Change request updated successfully");
    closeDialog();
  } catch (error) {
    console.error("Error updating change request:", error);
    toast.error("Failed to update change request");
  }
};

const viewRequest = async (id) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/view-change-request?change_request_id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

fetchRequests();
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>
