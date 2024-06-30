<template>
  <div class="wrapper h-auto p-8 rounded-lg">
    <h1 class="font-bold text-blue-900 text-2xl mb-10">Edit Account</h1>
    <v-container>
      <h2 class="font-bold text-blue-900 text-xl mt-6 mb-4">User Level</h2>
      <v-row class="flex-wrap mb-6">
        <v-col v-for="level in availableUserLevels" :key="level" class="w-1/2 md:w-1/3 lg:w-1/4 mb-4">
          <label class="flex items-center cursor-pointer custom-checkbox">
            <input
              type="radio"
              v-model="selectedUserLevel"
              :value="level.toLowerCase()"
              class="mr-2"
            />
            <span class="font-bold text-sm">{{ level }}</span>
          </label>
        </v-col>
      </v-row>

      <h2 class="font-bold text-blue-900 text-xl mt-6 mb-4">Roles</h2>
      <v-row class="flex-wrap mb-6">
        <v-col v-for="role in availableRoles" :key="role.id" class="w-1/2 md:w-1/3 lg:w-1/4 mb-4">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="selectedRoles"
              :value="role.id"
              class="mr-2"
            />
            <span class="font-bold text-sm">{{ role.role_name }}</span>
          </label>
        </v-col>
      </v-row>

      <h2 class="font-bold text-blue-900 text-xl mb-4">Permissions</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border-collapse border border-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">Permissions</th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-center text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">View</th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-center text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">Edit</th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-center text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">Publish</th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-center text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">Delete</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="page in pages" :key="page.id">
              <tr class="parent-permission bg-gray-50">
                <td class="px-6 py-4 border-b border-gray-200">{{ page.page_name }}</td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[page.id].View"
                    class="mx-auto"
                  />
                </td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[page.id].Edit"
                    class="mx-auto"
                  />
                </td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[page.id].Publish"
                    class="mx-auto"
                  />
                </td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[page.id].Delete"
                    class="mx-auto"
                  />
                </td>
              </tr>
              <tr v-for="child in page.children" :key="child.id" class="child-permission bg-gray-50">
                <td class="px-6 py-4 border-b border-gray-200 pl-10">{{ child.page_name }}</td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[child.id].View"
                    class="mx-auto"
                  />
                </td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[child.id].Edit"
                    class="mx-auto"
                  />
                </td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[child.id].Publish"
                    class="mx-auto"
                  />
                </td>
                <td class="px-6 py-4 border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    v-model="rolePermissions[child.id].Delete"
                    class="mx-auto"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end mt-6">
        <button class="bg-gray-500 text-white font-bold px-4 py-2 rounded-lg mr-4" @click="cancel">Cancel</button>
        <button class="bg-blue-900 text-white font-bold px-4 py-2 rounded-lg" @click="updateUserDetails">Save</button>
      </div>
    </v-container>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const toast = useToast();
const userId = ref(route.query.user_id);

const pages = ref([]);
const selectedRoles = ref([]); // Updated to multiple roles
const availableRoles = ref([]);
const availableUserLevels = ["User", "Admin"];
const selectedUserLevel = ref("user", "admin");
const permissionTypes = ["View", "Edit", "Publish", "Delete"];
const rolePermissions = ref({});

const isAdmin = computed(() => authStore.user?.user_level === "admin");

const fetchPages = async () => {
  try {
    const token = authStore.token;
    const response = await fetch(`${API_BASE_URL}/list-page`, {
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
      throw new Error(errorData.message || "Failed to fetch pages");
    }

    const data = await response.json();
    pages.value = data.data.Pages;

    pages.value.forEach((page) => {
      rolePermissions.value[page.id] = {
        View: false,
        Edit: false,
        Publish: false,
        Delete: false,
      };
      page.children.forEach((child) => {
        rolePermissions.value[child.id] = {
          View: false,
          Edit: false,
          Publish: false,
          Delete: false,
        };
      });
    });
  } catch (error) {
    console.error("Error fetching pages:", error.message);
  }
};

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
    availableRoles.value = result.data.roles;
  } catch (error) {
    console.error("Error fetching roles:", error.message);
  }
};

const fetchUserDetails = async () => {
  try {
    const token = authStore.token;
    if (!userId.value) {
      throw new Error("User ID not provided");
    }
    console.log("Fetching user details for user_id:", userId.value);
    const response = await fetch(
      `${API_BASE_URL}/edit-user-access?user_id=${userId.value}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again.");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user details");
    }

    const data = await response.json();
    console.log("User details fetched:", data);

    if (!data.data || !data.data.user || !data.data.roles) {
      throw new Error("Invalid response structure");
    }

    selectedUserLevel.value = data.data.user.user_level.toLowerCase(); // Changed to 'user_level'
    selectedRoles.value = data.data.roles.map((role) => role.role_id); // Fetching roles for the user
    resetPermissions();

    if (data.data.permission && data.data.permission.pages) {
      data.data.permission.pages.forEach((page) => {
        page.permissions.forEach((permission) => {
          if (rolePermissions.value[page.id]) {
            rolePermissions.value[page.id][
              permissionTypes[permission - 1]
            ] = true;
          }
        });
        page.children.forEach((child) => {
          child.permissions.forEach((permission) => {
            if (rolePermissions.value[child.id]) {
              rolePermissions.value[child.id][
                permissionTypes[permission - 1]
              ] = true;
            }
          });
        });
      });
    } else {
      console.warn("No pages found in the response");
    }
  } catch (error) {
    console.error("Error fetching user details:", error.message);
  }
};

const updateUserDetails = async () => {
  try {
    await updateRole();
    await updatePermissions();
    toast.success("User details updated successfully!");
  } catch (error) {
    console.error("Error updating user details:", error.message);
    toast.error("Error updating user details.");
  }
};

const updateRole = async () => {
  try {
    const token = authStore.token;
    console.log("Assigning roles to user_id:", userId.value);
    console.log("Selected roles:", selectedRoles.value);

    const response = await fetch(`${API_BASE_URL}/update-user-access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId.value,
        user_level: selectedUserLevel.value,
        role_id: selectedRoles.value,
        pages: Object.entries(rolePermissions.value)
          .filter(([, permissions]) =>
            Object.values(permissions).some((value) => value)
          )
          .map(([pageId, permissions]) => ({
            page_id: parseInt(pageId),
            permission: Object.entries(permissions)
              .filter(([, value]) => value)
              .map(([type]) => permissionTypes.indexOf(type) + 1),
          })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      throw new Error(errorData.message || "Failed to assign roles");
    }

    console.log("Roles assigned successfully");
  } catch (error) {
    console.error("Error assigning roles:", error.message);
    throw new Error("Error assigning roles: " + error.message);
  }
};

const updatePermissions = async () => {
  const formattedPermissions = {
    user_id: userId.value,
    user_level: selectedUserLevel.value,
    role_id: selectedRoles.value, // Updated to multiple roles
    pages: Object.entries(rolePermissions.value)
      .filter(([, permissions]) =>
        Object.values(permissions).some((value) => value)
      )
      .map(([pageId, permissions]) => ({
        page_id: parseInt(pageId),
        permission: Object.entries(permissions)
          .filter(([, value]) => value)
          .map(([type]) => permissionTypes.indexOf(type) + 1),
      })),
  };

  try {
    const token = authStore.token;
    console.log(
      "Formatted permissions:",
      JSON.stringify(formattedPermissions)
    );
    const response = await fetch(`${API_BASE_URL}/update-user-access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(formattedPermissions),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to assign permissions");
    }

    console.log("Permissions assigned successfully");
    toast.success("Permissions assigned successfully!");
  } catch (error) {
    console.error("Error assigning permissions:", error.message);
    toast.error("Error assigning permissions.");
  }
};

const cancel = () => {
  // Implement your cancel logic here
};

const resetPermissions = () => {
  Object.keys(rolePermissions.value).forEach((pageId) => {
    Object.keys(rolePermissions.value[pageId]).forEach((permission) => {
      rolePermissions.value[pageId][permission] = false;
    });
  });
};

onMounted(() => {
  authStore.initializeStore();
  fetchRoles();
  fetchPages();
  fetchUserDetails();
});
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
</style>
