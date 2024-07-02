<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">Change Request</h1>
  <div class="flex flex-col gap-5">
    <div
      v-for="request in requests"
      :key="request.id"
      class="bg-white p-5 rounded-lg shadow flex justify-between">
      <div class="my-2">
        <h2 class="font-bold">{{ request.title }}</h2>
      </div>
      <div class="flex gap-5 my-auto">
        <button class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md" @click="openDialog(request)">
          Edit
        </button>
        <button class="my-auto px-5 py-2 bg-red-500 text-white rounded-md" @click="discardRequest(request.id)">
          Discard
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
            <label for="requestName" class="block text-gray-700 font-bold mb-2">Request Name</label>
            <input type="text" v-model="currentRequest.title" id="requestName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
          </div>
          <div class="mb-4">
            <label for="notifyApprover" class="block text-gray-700 font-bold mb-2">Notify Approver</label>
            <input type="checkbox" v-model="currentRequest.notifyApprover" id="notifyApprover" class="mr-2 leading-tight">
            <span class="text-sm text-gray-700">Yes</span>
          </div>
        </form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-4" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="blue-darken-4" text @click="updateChangeRequest">Save</v-btn>
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
import { ref } from 'vue';
import { useToast } from 'vue-toast-notification';

definePageMeta({
  layout: 'usersidebar'
})

const toast = useToast();
const requests = ref([
  {
    id: 1,
    title: "Updated computer science layout",
  },
  {
    id: 2,
    title: "Update Footer",
  },
  {
    id: 3,
    title: "Remove Button",
  },
]);

const isDialogOpen = ref(false);
const currentRequest = ref({
  id: null,
  title: '',
  notifyApprover: false,
});

const openDialog = (request) => {
  currentRequest.value = { ...request };
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
  currentRequest.value = {
    id: null,
    title: '',
    notifyApprover: false,
  };
};

const discardRequest = (id) => {
  requests.value = requests.value.filter(request => request.id !== id);
};

const updateChangeRequest = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`, // Ensure you have the token
      },
      body: JSON.stringify({
        id: currentRequest.value.id,
        request_name: currentRequest.value.title,
        notify_approver: currentRequest.value.notifyApprover,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update change request');
    }

    const result = await response.json();
    console.log('Change request updated:', result);

    // Update the request in the list
    const index = requests.value.findIndex(request => request.id === currentRequest.value.id);
    if (index !== -1) {
      requests.value[index] = { ...currentRequest.value };
    }

    toast.success('Change request updated successfully');
    closeDialog();
  } catch (error) {
    console.error('Error updating change request:', error);
    toast.error('Failed to update change request');
  }
};
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>
