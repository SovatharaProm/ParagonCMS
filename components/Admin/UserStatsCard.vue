<template>
  <div class="p-4">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-blue-900">User Management</h1>
      <NuxtLink
        to="/admin/users/invite"
        class="mt-4 md:mt-0 text-white bg-blue-900 hover:bg-blue-700 rounded float-right drop-shadow-md py-2 px-4 font-bold"
      >
        Invite User
      </NuxtLink>
    </div>

    <div class="relative w-full md:w-1/3 mb-4">
      <input
        type="text"
        placeholder="Search"
        v-model="search"
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

    <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
      <select v-model="selectedRole" class="border border-gray-300 rounded py-2 px-4" v-if="!isAdmin">
        <option value="" class="font-bold">All Levels</option>
        <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
      </select>
      <select v-model="selectedStatus" class="border border-gray-300 rounded py-2 px-4">
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-bold text-blue-900 uppercase tracking-wider">Name</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-sm font-bold text-blue-900 uppercase tracking-wider">Email</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-sm font-bold text-blue-900 uppercase tracking-wider">Roles</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-sm font-bold text-blue-900 uppercase tracking-wider text-center">Status</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-sm font-bold text-blue-900 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.email">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex items-center">
                <div class="ml-3">
                  <p class="text-gray-900 whitespace-no-wrap">{{ user.name }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap text-center">{{ user.email }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
              <div class="flex justify-center">
                <span class="relative inline-block px-3 py-1 font-semibold leading-tight" :class="getRoleClass(user.role)">
                  <span class="relative">{{ user.role }}</span>
                </span>
              </div>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
              <p class="text-white font-bold whitespace-no-wrap rounded-lg w-fit px-3 py-1 mx-auto" :class="{ 'bg-red-500': user.suspended, 'bg-green-500': !user.suspended }">
                {{ user.suspended ? "Suspended" : "Active" }}
              </p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
              <div class="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-2">
                <NuxtLink :to="{ path: '/admin/users/edituser', query: { user_id: user.id } }" class="text-blue-900 hover:text-blue-700" title="Edit User">
                  <Icon name="lucide:edit" class="text-2xl"></Icon>
                </NuxtLink>
                <button :class="['hover:text-green-700', user.suspended ? 'text-green-500' : 'text-red-500']" @click="toggleSuspendUser(user)" :title="user.suspended ? 'Unsuspend User' : 'Suspend User'">
                  <Icon name="mdi:ban" class="text-2xl"></Icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const users = ref([]);
const roles = ref(['Admin', 'User']);
const selectedRole = ref('');
const selectedStatus = ref('');

const search = ref('');

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch =
      !search.value ||
      user.name.toLowerCase().includes(search.value.toLowerCase()) ||
      user.email.toLowerCase().includes(search.value.toLowerCase());
    const matchesRole =
      !selectedRole.value || user.role === selectedRole.value;
    const matchesStatus =
      !selectedStatus.value ||
      (selectedStatus.value === 'Active' && !user.suspended) ||
      (selectedStatus.value === 'Suspended' && user.suspended);

    return matchesSearch && matchesRole && matchesStatus;
  });
});

const fetchUsers = async () => {
  try {
    await authStore.initializeStore();

    if (!authStore.token) {
      return router.push('/auth/login');
    }

    const response = await fetch(`${API_BASE_URL}/get-list-of-user`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    users.value = data.data.user.map((user) => ({
      id: user.id,
      name: user.name || 'N/A',
      email: user.email,
      role: user.level,
      suspended: user.status === 'deactivated', // Adjust to match backend's "deactivate" status
    }));
  } catch (error) {
    toast.error('Error fetching users');
  }
};

const toggleSuspendUser = async (user) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ban-user`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: user.id }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to suspend user');
    }

    // Ensure response data is as expected
    if (!responseData.data || typeof responseData.data.status === 'undefined') {
      throw new Error('Unexpected response format');
    }

    // Update the user's suspension status in the local state based on the response
    user.suspended = responseData.data.status === 'deactivated';

    // Show a toast notification
    if (user.suspended) {
      toast.success('User suspended successfully');

      // If the currently logged-in user is suspended, log them out
      if (authStore.userId === user.id) {
        authStore.nullToken();
        router.push('/auth/login?message=Your account has been suspended.');
      }
    } else {
      toast.success('User unsuspended successfully');
    }
  } catch (error) {

    toast.error(error.message || 'There was an error suspending the user');
  }
};



function getRoleClass(role) {
  switch (role) {
    case 'User':
      return 'text-green-700';
    case 'Admin':
      return 'text-red-500';
    default:
      return '';
  }
}

const createEventDialog = ref(false);

const cancel = () => {
  createEventDialog.value = false;
  router.push('/admin/users/usermanagement');
};

const isAdmin = computed(() => authStore.userRole === "admin");

onMounted(fetchUsers);
</script>

<style scoped>
@import '/assets/css/style.css';

.User {
  color: green;
}

.Admin {
  color: red;
}
</style>
