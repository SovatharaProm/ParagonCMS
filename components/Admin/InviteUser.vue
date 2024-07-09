<template>
  <div class="wrapper h-auto">
    <h1 class="font-bold text-blue-900 text-2xl mb-10">Invite User</h1>
    <v-container>
      <v-row>
        <v-col>
          <label for="email" class="block text-md font-bold mb-2 text-blue-900">Email:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            :class="{ 'border-red-500': emailError }"
            class="px-6 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-1/2"
            placeholder="Email"
            required
            @input="debounceEmail"
          />
        </v-col>
      </v-row>

      <h2 class="font-bold text-blue-900 text-xl mt-6 mb-4">User Level</h2>
      <v-row class="flex-wrap mb-6">
        <v-col v-for="level in displayedUserLevels" :key="level" class="w-1/2 md:w-1/3 lg:w-1/4 mb-4">
          <label class="flex items-center cursor-pointer custom-checkbox">
            <input type="radio" v-model="selectedUserLevel" :value="level" class="mr-2" />
            <span class="font-bold text-sm">{{ level }}</span>
          </label>
        </v-col>
      </v-row>

      <h2 class="font-bold text-blue-900 text-xl mt-6 mb-4">Roles</h2>
      <v-row class="flex-wrap mb-6">
        <v-col v-for="role in availableRoles" :key="role.id" class="w-1/2 md:w-1/3 lg:w-1/4 mb-4">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" :checked="selectedRole === role.id" @change="handleRoleChange(role.id)" class="mr-2" />
            <span class="font-bold text-sm">{{ role.role_name }}</span>
          </label>
        </v-col>
      </v-row>

      <template v-if="userRole !== 'admin'">
        <div class="overflow-x-auto">
          <h2 class="font-bold text-blue-900 text-xl mb-4">Permissions</h2>
          <table class="min-w-full bg-white border-collapse border border-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">Permissions</th>
                <th v-for="permission in permissionTypes" :key="permission" class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-center text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">{{ permission }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="page in pages" :key="page.id">
                <tr class="parent-permission">
                  <td class="px-6 py-4 border-b border-gray-200">{{ page.page_name }}</td>
                  <td v-for="permission in permissionTypes" :key="permission" class="px-6 py-4 border-b border-gray-200 text-center">
                    <input type="checkbox" v-model="rolePermissions[page.id][permission]" class="mx-auto" />
                  </td>
                </tr>
                <template v-if="page.children && page.children.length" v-for="child in page.children" :key="child.id">
                  <tr>
                    <td class="px-6 py-4 border-b border-gray-200 pl-10">{{ child.page_name }}</td>
                    <td v-for="permission in permissionTypes" :key="permission" class="px-6 py-4 border-b border-gray-200 text-center">
                      <input type="checkbox" v-model="rolePermissions[child.id][permission]" class="mx-auto" />
                    </td>
                  </tr>
                  <template v-if="child.children && child.children.length" v-for="grandchild in child.children" :key="grandchild.id">
                    <tr class="child-permission bg-gray-50">
                      <td class="px-6 py-4 border-b border-gray-200 pl-16">{{ grandchild.page_name }}</td>
                      <td v-for="permission in permissionTypes" :key="permission" class="px-6 py-4 border-b border-gray-200 text-center">
                        <input type="checkbox" v-model="rolePermissions[grandchild.id][permission]" class="mx-auto" />
                      </td>
                    </tr>
                  </template>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </template>
    </v-container>

    <!-- Sticky Footer Buttons -->
    <div class="sticky-footer flex justify-end p-4 bg-white border-t border-gray-200">
      <button class="bg-gray-500 text-white font-bold px-4 py-2 rounded-lg mr-4" @click="cancel">Cancel</button>
      <button class="bg-blue-900 text-white font-bold px-4 py-2 rounded-lg" @click="sendInvite" :disabled="isLoading">
        <span v-if="isLoading" class="flex items-center">
          <svg class="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Sending...
        </span>
        <span v-else>Send Invite</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';

const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const email = ref('');
const selectedUserLevel = ref('');
const selectedRole = ref(null);
const emailError = ref(false);
const pages = ref([]);
const availableRoles = ref([]);
const availableUserLevels = ['User', 'Admin'];
const permissionTypes = ref(['Create', 'Edit', 'Publish', 'Delete']);
const rolePermissions = ref({});
const isLoading = ref(false); // Add loading state

const userRole = computed(() => authStore.userRole);

const displayedUserLevels = computed(() => {
  return userRole.value === 'admin' ? ['User'] : availableUserLevels;
});

const debounceEmail = debounce(() => {
  email.value = email.value.trim();
}, 300);

const fetchPages = async () => {
  try {
    const token = authStore.token;
    const response = await fetch(`${API_BASE_URL}/list-page`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch pages');
    }

    const data = await response.json();
    pages.value = data.data.Pages;

    // Initialize rolePermissions based on fetched pages
    pages.value.forEach((page) => {
      rolePermissions.value[page.id] = {
        Create: false,
        Edit: false,
        Publish: false,
        Delete: false,
      };
      page.children.forEach((child) => {
        rolePermissions.value[child.id] = {
          Create: false,
          Edit: false,
          Publish: false,
          Delete: false,
        };
        if (child.children && child.children.length) {
          child.children.forEach((grandchild) => {
            rolePermissions.value[grandchild.id] = {
              Create: false,
              Edit: false,
              Publish: false,
              Delete: false,
            };
          });
        }
      });
    });
  } catch (error) {
    console.error('Error fetching pages:', error.message);
  }
};

const fetchRoles = async () => {
  try {
    const token = authStore.token;
    const response = await fetch(`${API_BASE_URL}/get-list-of-role`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch roles');
    }

    const result = await response.json();
    availableRoles.value = result.data.roles;
  } catch (error) {
    console.error('Error fetching roles:', error.message);
  }
};

const handleRoleChange = (roleId) => {
  selectedRole.value = selectedRole.value === roleId ? null : roleId;
};

const sendInvite = async () => {
  isLoading.value = true; // Set loading state to true
  const token = authStore.token;

  if (!token) {
    console.error('No token found, please login again.');
    isLoading.value = false; // Set loading state to false
    return;
  }

  const pagesPayload = [];
  for (const pageId in rolePermissions.value) {
    const permissions = [];
    for (const [permission, value] of Object.entries(rolePermissions.value[pageId])) {
      if (value) {
        permissions.push(permissionTypes.value.indexOf(permission) + 1);
      }
    }
    if (permissions.length > 0) {
      pagesPayload.push({
        page_id: parseInt(pageId),
        permission: permissions,
      });
    }
  }

  const payload = {
    email: email.value,
    user_level: selectedUserLevel.value.toLowerCase(),
    role_id: selectedRole.value ? [selectedRole.value] : [],
    pages: pagesPayload,
  };



  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();


    if (!response.ok) {
      console.error('Server response error:', responseData);
      throw new Error(responseData.message || 'Invalid request');
    }


    toast.success('Invite sent successfully!');
    router.push('/admin/users/usermanagement'); // Navigate to user management after successful invite
  } catch (error) {

    toast.error('There was an error sending the invite.');
  } finally {
    isLoading.value = false; // Set loading state to false
  }
};

const cancel = () => {
  email.value = '';
  selectedUserLevel.value = '';
  selectedRole.value = null;
  emailError.value = false;
  // Clear permissions
  for (const pageId in rolePermissions.value) {
    for (const permission in rolePermissions.value[pageId]) {
      rolePermissions.value[pageId][permission] = false;
    }
  }
  router.push('/admin/users/usermanagement');
};

onMounted(() => {
  authStore.initializeStore();
  fetchRoles();
  fetchPages();
});

function debounce(fn, delay) {
  let timeoutID;
  return function (...args) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
</script>

<style scoped>
@import "assets/css/style.css";

.parent-permission td {
  background-color: #f0f0f0;
}

.custom-checkbox {
  border: 1px solid #e2e8f0; /* Border color */
  border-radius: 0.375rem; /* Rounded corners */
  padding: 1rem; /* Padding */
}

.child-permission td {
  background-color: #f9f9f9; /* Light gray for children */
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
