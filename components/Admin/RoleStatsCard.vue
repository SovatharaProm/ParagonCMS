<template>
  <div class="p-4">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Roles Management</h1>
      <v-btn
        v-if="!isAdmin"
        @click="createEventDialog = true"
        color="#2F2F85"
        dark
        class="mt-4 md:mt-0 rounded float-right mb-4 drop-shadow-md px-4 font-bold"
      >
        <span class="text-white">Create Roles</span>
      </v-btn>
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

    <div class="overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-sm font-bold text-blue-900 uppercase tracking-wider text-left"
            >
              Name
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-sm font-bold text-blue-900 uppercase tracking-wider text-end pr-16"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in filteredRoles" :key="role.id">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex items-center">
                <div class="ml-3">
                  <p class="text-gray-900 whitespace-no-wrap">
                    {{ role.role_name }}
                  </p>
                </div>
              </div>
            </td>
            <td
              class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-end"
            >
              <div
                class="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2"
              >
                <NuxtLink
                  :to="{
                    path: '/admin/permission/rolepermission',
                    query: { role_id: role.id },
                  }"
                  class="text-blue-900 hover:text-blue-700"
                  title="Edit Permission"
                >
                  <Icon name="lucide:edit" class="text-2xl"></Icon>
                </NuxtLink>
                <button
                  @click="editRole(role)"
                  class="hover:text-green-700 text-green-500"
                  title="Assign Role to User"
                >
                  <Icon name="clarity:assign-user-line" class="text-2xl"></Icon>
                </button>
                <button
                  @click="openDeleteDialog(role)"
                  class="hover:text-red-700 text-red-500"
                  title="Delete Role"
                >
                  <Icon name="material-symbols:delete" class="text-2xl"></Icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Role Dialog -->
    <v-dialog v-model="createEventDialog" width="50%">
      <v-card flat>
        <v-card-title class="d-flex align-center pe-2 bg-[#2B348F] text-white">
          Create Roles
        </v-card-title>
        <v-divider></v-divider>
        <div class="p-[1rem] pb-0">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="newRoleName" label="Role Name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <p class="text-red-500" v-if="errorMessage">
                {{ errorMessage }}
              </p>
            </v-col>
          </v-row>
        </div>
        <div>
          <v-btn
            color="primary"
            class="m-[1rem] px-2 mt-0 bg-indigo-darken-4 text-white font-bold"
            @click="cancel"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            class="m-[1rem] px-2 mt-0 font-bold"
            @click="createRole"
          >
            Create
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Edit Role Dialog -->
    <v-dialog v-model="editEventDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 text-blue-900 font-bold">
          Assign Role to User
        </v-card-title>
        <v-card-text>
          <div class="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search Users"
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
          <v-list>
            <v-list-item
              v-for="(usersearch, index) in filteredUsers"
              :key="index"
              @click="toggleSelection(usersearch)"
            >
              <div class="flex items-center">
                <v-list-item-action>
                  <v-checkbox v-model="usersearch.inRole">
                    <template v-slot:label>
                      <v-list-item-content>
                        <v-list-item-title>{{
                          usersearch.email
                        }}</v-list-item-title>
                      </v-list-item-content>
                    </template>
                  </v-checkbox>
                </v-list-item-action>
              </div>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1 font-bold"
            text
            @click="editEventDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1 font-bold"
            text
            @click="confirmSaveRoleChanges"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Role Dialog -->
    <v-dialog v-model="deleteDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 font-bold">Delete Role</v-card-title>
        <v-card-text> Are you sure you want to delete this role? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1 font-bold"
            text
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="red darken-1 font-bold" text @click="deleteRole">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline font-bold">
          {{ confirmDialogTitle }}
        </v-card-title>
        <v-card-text class="font-bold">{{ confirmDialogText }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black darken-1" text @click="confirmDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-2"
            class="font-bold"
            text
            @click="executeSaveRoleChanges"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";
import { useToast } from "vue-toast-notification";

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const roles = ref([]);
const users = ref([]);
const search = ref("");
const searchQuery = ref("");
const selectedRole = ref(null);
const currentUser = ref(null);
const editEventDialog = ref(false);
const createEventDialog = ref(false);
const deleteDialog = ref(false);
const confirmDialog = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogText = ref("");
const newRoleName = ref("");
const errorMessage = ref("");

const isAdmin = computed(() => authStore.userRole === "admin");

const filteredRoles = computed(() => {
  return roles.value.filter((role) =>
    role.role_name.toLowerCase().includes(search.value.toLowerCase())
  );
});

const filteredUsers = computed(() => {
  return users.value.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const fetchRoles = async () => {
  try {
    const token = authStore.token;
    const response = await fetch(`${API_BASE_URL}/get-list-of-role`, {
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
      throw new Error(errorData.message || "Failed to fetch roles");
    }

    const result = await response.json();
    roles.value = result.data.roles;
  } catch (error) {
    console.error("Error fetching roles:", error.message);
    toast.error(error.message || "An unexpected error occurred", {
      timeout: 3000,
    });
  }
};

const fetchUsers = async () => {
  try {
    const token = authStore.token;

    const response = await fetch(`${API_BASE_URL}/get-list-of-user`, {
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
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const usersData = await response.json();
    users.value = usersData.data.user;

    const roleId = selectedRole.value?.id;
    if (roleId) {
      const membersResponse = await fetch(
        `${API_BASE_URL}/get-members-in-role?role_id=${roleId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (!membersResponse.ok) {
        const errorData = await membersResponse.json();
        throw new Error(errorData.message || "Failed to fetch members in role");
      }

      const membersData = await membersResponse.json();
      const membersInRole = membersData.data.role.members;
      currentUser.value = membersInRole;

      users.value.forEach((user) => {
        user.inRole = membersInRole.some((member) => member.id === user.id);
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error.message);
    toast.error(error.message || "An unexpected error occurred", {
      timeout: 3000,
    });
  }
};

const editRole = (role) => {
  selectedRole.value = { ...role };
  fetchUsers();
  editEventDialog.value = true;
};

const openDeleteDialog = (role) => {
  selectedRole.value = role;
  deleteDialog.value = true;
};

const deleteRole = async () => {
  try {
    const token = authStore.token;
    const response = await fetch(`${API_BASE_URL}/delete-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role_id: selectedRole.value.id,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again.");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete role");
    }

    const index = roles.value.indexOf(selectedRole.value);
    if (index !== -1) {
      roles.value.splice(index, 1);
    }
    deleteDialog.value = false;
    toast.success("Role deleted successfully", { timeout: 3000 });
  } catch (error) {
    console.error("Error deleting role:", error.message);
    toast.error(error.message || "An unexpected error occurred", {
      timeout: 3000,
    });
  }
};

const cancel = () => {
  createEventDialog.value = false;
  errorMessage.value = "";
};

const createRole = async () => {
  try {
    const token = authStore.token;
    const response = await fetch(`${API_BASE_URL}/create-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role_name: newRoleName.value,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again.");
      }
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (jsonError) {
        throw new Error("Failed to create role. Invalid response from server.");
      }
      throw new Error(errorData.message || "Failed to create role");
    }

    const result = await response.json();
    roles.value.push({
      id: result.data.role.id,
      role_name: result.data.role.role_name,
    });
    newRoleName.value = "";
    createEventDialog.value = false;
    errorMessage.value = "";
    toast.success("Role created successfully", { timeout: 3000 });
  } catch (error) {
    console.error("Error creating role:", error); // Log the error for debugging
    errorMessage.value = error.message || "An unexpected error occurred";
    toast.error(errorMessage.value, { timeout: 3000 });
  }
};

const toggleSelection = (user) => {
  user.inRole = !user.inRole;
};

const confirmSaveRoleChanges = () => {
  confirmDialogTitle.value = "Confirm Role Changes";
  confirmDialogText.value =
    "Are you sure you want to save the changes to the role?";
  confirmDialog.value = true;
};

const executeSaveRoleChanges = async () => {
  try {
    const usersToAdd = users.value
      .filter((user) => user.inRole && !currentUser.value.includes(user.id))
      .map((user) => user.id);

    await updateRoles(usersToAdd, "add");

    editEventDialog.value = false;
    confirmDialog.value = false;
    toast.success("Role changes saved successfully", { timeout: 3000 });
  } catch (error) {
    console.error("Error saving role changes:", error.message);
    toast.error(error.message || "An unexpected error occurred", {
      timeout: 3000,
    });
  }
};

const updateRoles = async (userIds, action) => {
  const token = authStore.token;
  const payload = {
    user_id: userIds,
    role_id: selectedRole.value.id,
  };

  const response = await fetch(`${API_BASE_URL}/assign-role-of-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to ${action} role to users`);
  }

  const result = await response.json();
  return result;
};

onMounted(() => {
  authStore.initializeStore();
  fetchRoles();
  // console.log("Auth Token:", authStore.token); // Ensure this is properly set
  // console.log("User Role:", authStore.userRole); // Ensure this is properly set
});
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>
