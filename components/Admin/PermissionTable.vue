<template>
  <div class="p-4">
    <h1 class="font-bold text-blue-900 text-2xl mb-10">
      Edit Permission to Roles
    </h1>
    <div>
      <h2 class="font-bold text-blue-900 text-xl mb-4">Permission</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border-collapse border border-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                Pages
              </th>
              <th v-for="permission in permissionTypes" :key="permission" class="px-6 py-3 border-b border-gray-200 bg-gray-100 text-center text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                {{ permission }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="page in pages" :key="page.id">
              <tr class="parent-permission">
                <td class="px-6 py-4 border-b border-gray-200">
                  <span>{{ page.page_name }}</span>
                </td>
                <td v-for="permission in permissionTypes" :key="permission" class="px-6 py-4 border-b border-gray-200 text-center">
                  <input type="checkbox" v-model="rolePermissions[page.id][permission]" class="mx-auto" />
                </td>
              </tr>
              <template v-if="page.children && page.children.length" v-for="child in page.children" :key="child.id">
                <tr>
                  <td class="px-6 py-4 border-b border-gray-200 pl-10">
                    {{ child.page_name }}
                  </td>
                  <td v-for="permission in permissionTypes" :key="permission" class="px-6 py-4 border-b border-gray-200 text-center">
                    <input type="checkbox" v-model="rolePermissions[child.id][permission]" class="mx-auto" />
                  </td>
                </tr>
                <template v-if="child.children && child.children.length" v-for="grandchild in child.children" :key="grandchild.id">
                  <tr class="child-permission bg-gray-50">
                    <td class="px-6 py-4 border-b border-gray-200 pl-16">
                      {{ grandchild.page_name }}
                    </td>
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
      <!-- Sticky Footer -->
      <div class="sticky-footer flex justify-end p-4 bg-white border-t border-gray-200">
        <button class="bg-gray-500 text-white font-bold px-4 py-2 rounded-lg mr-4" @click="cancel">
          Cancel
        </button>
        <button class="bg-blue-900 text-white font-bold px-4 py-2 rounded-lg" @click="updatePermissions">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toast-notification";

const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const pages = ref([]);
const permissionTypes = ["Create", "Edit", "Publish", "Delete"];
const rolePermissions = ref({});

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

    // Initialize rolePermissions based on fetched pages
    pages.value.forEach((page) => {
      rolePermissions.value[page.id] = {
        View: false,
        Edit: false,
        Publish: false,
        Delete: false,
      };
      if (page.children && page.children.length) {
        page.children.forEach((child) => {
          rolePermissions.value[child.id] = {
            View: false,
            Edit: false,
            Publish: false,
            Delete: false,
          };
          if (child.children && child.children.length) {
            child.children.forEach((grandchild) => {
              rolePermissions.value[grandchild.id] = {
                View: false,
                Edit: false,
                Publish: false,
                Delete: false,
              };
            });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error fetching pages:", error.message);
    toast.error("Error fetching pages: " + error.message, {
      timeout: 3000,
    });
  }
};

const fetchRolePermissions = async () => {
  const roleId = route.query.role_id;
  if (!roleId) return;

  try {
    const token = authStore.token;
    const response = await fetch(
      `${API_BASE_URL}/get-permission-of-role?role_id=${roleId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again.");
      }
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch role permissions"
      );
    }

    const data = await response.json();
    const fetchedPermissions = data.pages || [];

    clearPermissions();

    fetchedPermissions.forEach((page) => {
      page.permissions.forEach((permission) => {
        if (rolePermissions.value[page.id]) {
          rolePermissions.value[page.id][
            permissionTypes[permission - 1]
          ] = true;
        }
      });
      if (page.children && page.children.length) {
        page.children.forEach((child) => {
          child.permissions.forEach((permission) => {
            if (rolePermissions.value[child.id]) {
              rolePermissions.value[child.id][
                permissionTypes[permission - 1]
              ] = true;
            }
          });
          if (child.children && child.children.length) {
            child.children.forEach((grandchild) => {
              grandchild.permissions.forEach((permission) => {
                if (rolePermissions.value[grandchild.id]) {
                  rolePermissions.value[grandchild.id][
                    permissionTypes[permission - 1]
                  ] = true;
                }
              });
            });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error.message);
    toast.error("Error fetching role permissions: " + error.message, {
      timeout: 3000,
    });
  }
};

const clearPermissions = () => {
  Object.keys(rolePermissions.value).forEach((pageId) => {
    Object.keys(rolePermissions.value[pageId]).forEach((permission) => {
      rolePermissions.value[pageId][permission] = false;
    });
  });
};

const updatePermissions = async () => {
  const roleId = route.query.role_id;
  if (!roleId) return;

  const formattedPermissions = {
    role_id: roleId,
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
    const response = await fetch(
      `${API_BASE_URL}/assign-permission-to-role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedPermissions),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error data:", data);
      throw new Error(data.message || "Failed to assign permissions");
    }

    toast.success("Permissions saved successfully!", {
      position: "top-right",
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: true,
      closeButton: "button",
      icon: true,
      rtl: false,
    });
    router.push("/admin/roles/RoleManagement");
  } catch (error) {
    console.error("Error assigning permissions:", error.message);
    toast.error("Failed to assign permissions: " + error.message, {
      position: "top-right",
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: true,
      closeButton: "button",
      icon: true,
      rtl: false,
    });
  }
};

const cancel = () => {
  router.push("/admin/roles/RoleManagement");
};

onMounted(() => {
  authStore.initializeStore();
  fetchPages();
  fetchRolePermissions();
});
</script>

<style scoped>
@import "@/assets/css/style.css";

.parent-permission td {
  background-color: #f0f0f0;
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
