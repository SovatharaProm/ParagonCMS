<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-blue-900 text-start py-4">
      My Change Requests
    </h1>
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
      <select
        v-model="statusFilter"
        class="border border-gray-300 rounded py-2 px-4"
      >
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>

    <div v-if="requests.length === 0" class="text-center text-gray-500">
      No data available
    </div>
    <div v-else class="flex flex-col gap-5">
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="bg-white p-5 rounded-lg shadow-lg flex justify-between"
      >
        <div>
          <h2 class="font-bold">{{ request.request_name }}</h2>
          <p :class="statusClass(request.status)">{{ request.status }}</p>
        </div>
        <div class="flex gap-5 my-auto">
          <Icon
            name="uil:file-redo-alt"
            medium
            @click="openResubmitDialog(request)"
            class="cursor-pointer text-blue-900 text-lg"
          ></Icon>
          <Icon
            name="mdi:eye"
            medium
            @click="viewRequest(request.id)"
            class="cursor-pointer text-blue-900 text-lg"
          ></Icon>
        </div>
      </div>
    </div>

    <v-dialog v-model="isResubmitDialogOpen" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 text-blue-900 font-bold"
          >Resubmit Change Request</v-card-title
        >
        <v-card-text>
          <form @submit.prevent="resubmitChangeRequest">
            <div class="mb-4">
              <label
                for="resubmitComments"
                class="block text-gray-700 font-bold mb-2"
                >Comments</label
              >
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
          <v-btn color="blue-darken-4" text @click="closeResubmitDialog"
            >Cancel</v-btn
          >
          <v-btn color="blue-darken-4" text @click="resubmitChangeRequest"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isViewDialogOpen" max-width="600px">
      <v-card class="font-bold">
        <v-card-title class="text-xl text-blue-900 font-bold"
          >View Change Request</v-card-title
        >
        <v-card-text>
          <div v-if="viewRequestDetails" class="space-y-4">
            <div>
              <p class="font-semibold">Request Name:</p>
              <p>{{ viewRequestDetails.request_name }}</p>
            </div>
            <div>
              <p class="font-semibold">Status:</p>
              <p :class="statusClass(viewRequestDetails.status)">
                {{ viewRequestDetails.status }}
              </p>
            </div>
            <div>
              <p class="font-semibold">Comment:</p>
              <div
                v-if="
                  viewRequestDetails.comments &&
                  viewRequestDetails.comments.length > 0
                "
              >
                <p>{{ viewRequestDetails.comments[0].comments }}</p>
                <p class="italic">
                  - {{ viewRequestDetails.comments[0].commenter_name }}
                </p>
              </div>
              <p v-else>No comments</p>
            </div>
            <div>
              <p class="font-semibold">Preview URL:</p>
              <a
                :href="viewRequestDetails.preview_url"
                target="_blank"
                class="text-blue-500 hover:underline"
                >{{ viewRequestDetails.preview_url }}</a
              >
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-4"
            text
            @click="closeViewDialog"
            class="font-bold"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useToast } from "vue-toast-notification";

definePageMeta({
  layout: "usersidebar",
  middleware: "auth",
});

const authStore = useAuthStore();
const toast = useToast();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const requests = ref([]); // Ensure requests is always an array
const searchQuery = ref("");
const statusFilter = ref("");
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
    requests.value = data.data.my_change_requests || []; // Ensure it is an array
  } catch (error) {
    console.error("Error fetching requests:", error.message);
    toast.error(error.message || "An unexpected error occurred", {
      timeout: 3000,
    });
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

const filteredRequests = computed(() => {
  return requests.value.filter((request) => {
    const matchesSearch =
      searchQuery.value.trim() === "" ||
      request.request_name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === "" ||
      request.status.toLowerCase() === statusFilter.value.toLowerCase();

    return matchesSearch && matchesStatus;
  });
});

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
    const response = await fetch(
      `${API_BASE_URL}/view-change-request?change_request_id=${id}`,
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
    let previewUrl = data.data.change_request.preview_url;

    // Ensure the URL includes the protocol
    if (!/^https?:\/\//i.test(previewUrl)) {
      previewUrl = `${import.meta.env.VITE_BASE_DOMAIN}${previewUrl}`;
    }

    viewRequestDetails.value = {
      ...data.data.change_request,
      preview_url: previewUrl,
    };
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
    const response = await fetch(`${API_BASE_URL}/resubmit-change-request`, {
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

onMounted(() => {
  authStore.initializeStore().then(() => {
    fetchRequests();
  });
});
</script>

<style scoped>
@import "@/assets/css/style.css";
.text-green-500 {
  color: green;
}
.text-orange-500 {
  color: orange;
}
.text-red-500 {
  color: red;
}
</style>
