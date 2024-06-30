<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">
    Profile
  </h1>
  <div class="flex flex-col mb-5">
    <!-- Edit profile -->
    <div class="pa-4 text-end font-bold">
      <v-dialog v-model="dialog" max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            class="text-none font-weight-regular font-bold px-2"
            prepend-icon="mdi-account"
            text="Edit Name"
            variant="tonal"
            v-bind="activatorProps"
          ></v-btn>
        </template>

        <v-card title="Edit Name" class="font-bold">
          <v-card-text>
            <v-row dense>
              <v-col cols="8">
                <v-text-field
                  v-model="newName"
                  label="Name"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              text="Cancel"
              variant="plain"
              @click="dialog = false"
            ></v-btn>

            <v-btn
              color="primary"
              text="Save"
              variant="tonal"
              @click="updateName"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <span class="username text-[32px] text-[#172947] font-bold">{{ user.name }}</span>
    <span class="email text-[#172947]">{{ user.email }}</span>
  </div>
  <div>
    <span class="email my-5">{{ user.description }}</span>
    <div class="role">
      <h2 class="text-[#172947] text-lg font-bold my-5">Role</h2>
      <v-chip
        class="mb-5 w-auto h-[150px] p-6"
        color="blue-darken-4"
        size="x-large"
        label
      >
        <v-icon icon="mdi-account-circle-outline" start></v-icon>
        {{ formattedRole }}
      </v-chip>
    </div>

    <!-- Change password -->
    <div class="py-5 text-start font-bold">
      <v-dialog v-model="dialog1" max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            class="text-none font-weight-regular font-bold px-2"
            text="Change password"
            variant="tonal"
            v-bind="activatorProps"
          ></v-btn>
        </template>

        <v-card title="Change Password" class="font-bold">
          <v-card-text>
            <v-row dense>
              <v-col cols="8">
                <v-text-field
                  v-model="changePassword.old_password"
                  label="Current Password"
                  variant="outlined"
                  type="password"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="8">
                <v-text-field
                  v-model="changePassword.new_password"
                  label="New Password"
                  variant="outlined"
                  type="password"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="8">
                <v-text-field
                  v-model="changePassword.confirm_password"
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              text="Cancel"
              variant="plain"
              @click="dialog1 = false"
            ></v-btn>

            <v-btn
              color="primary"
              text="Save"
              variant="tonal"
              @click="changeUserPassword"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

definePageMeta({
  layout: "usersidebar",
});

const dialog = ref(false);
const dialog1 = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const user = ref({
  name: "",
  email: "",
  role: "",
});

const newName = ref(user.value.name);
const changePassword = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
});

const formattedRole = computed(() => {
  switch (user.value.role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "user":
      return "User";
    default:
      return user.value.role;
  }
});

const fetchProfile = async () => {
  try {
    if (!authStore.token) {
      throw new Error("Unauthorized: Token is missing");
    }

    const response = await fetch(`${API_BASE_URL}/get-my-profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized error
        console.error("Unauthorized: Please log in again.");
        router.push("/auth/login"); // Redirect to login page
      }
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    if (data && data.data && data.data.profile) {
      user.value.name = data.data.profile.name || "";
      user.value.email = data.data.profile.email || "";
      user.value.role = data.data.profile.user_level || ""; // Fetching user level
    } else {
      throw new Error("Invalid profile data");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

onMounted(() => {
  authStore.initializeStore();
  fetchProfile();
});

const updateName = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-my-name`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_name: newName.value }),
    });

    if (!response.ok) {
      throw new Error('Failed to update name');
    }

    const data = await response.json();
    if (!data || data.code !== 200) {
      throw new Error('Invalid response data');
    }

    // Refresh the profile to get the updated name
    await fetchProfile();
    dialog.value = false;
  } catch (error) {
    console.error('Error updating name:', error);
  }
};

const changeUserPassword = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changePassword.value),
    });

    if (!response.ok) {
      throw new Error('Failed to change password');
    }

    const data = await response.json();
    dialog1.value = false;
  } catch (error) {
    console.error('Error changing password:', error);
  }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
