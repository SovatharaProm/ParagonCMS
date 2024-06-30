<template>
  <div>
    <BackButton class="ml-4 md:ml-28 py-5"/>
    <div class="flex justify-center items-center mt-16 px-4 md:px-8">
      <div class="bg-white p-6 w-full max-w-md mt-2">
        <h2 class="font-bold text-center text-3xl text-blue-900 mb-10">
          Enter New Password
        </h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4 relative">
            <div class="flex items-center">
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                :class="{'border-red-500': passwordError}"
                class="pl-5 pr-8 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-full"
                placeholder="Enter New Password"
                required
              />
            </div>
            <p v-if="passwordError" class="text-red-500 text-xs pt-2">{{ passwordError }}</p>
          </div>
          <div class="mb-4 relative">
            <div class="flex items-center">
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                :class="{'border-red-500': confirmPasswordError}"
                class="pl-5 pr-8 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-full"
                placeholder="Confirm Password"
                required
              />
            </div>
            <p v-if="confirmPasswordError" class="text-red-500 text-xs pt-2">{{ confirmPasswordError }}</p>
          </div>
          <button
            type="submit"
            class="w-full mt-10 bg-blue-900 text-white py-2 rounded-2xl shadow hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from 'vue-router';

definePageMeta({
  layout: 'custom'
})

const router = useRouter();
const route = useRoute();
const newPassword = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const forgetPasswordSecret = route.query.secret;

watch(newPassword, (newVal) => {
  if (!newVal) {
    passwordError.value = "Password is required";
  } else {
    passwordError.value = "";
  }
});

watch(confirmPassword, (newVal) => {
  if (!newVal) {
    confirmPasswordError.value = "Confirm password is required";
  } else if (newVal !== newPassword.value) {
    confirmPasswordError.value = "Passwords do not match";
  } else {
    confirmPasswordError.value = "";
  }
});

const handleLogin = async () => {
  if (!newPassword.value) {
    passwordError.value = "Password is required";
    return;
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = "Confirm password is required";
    return;
  }

  if (confirmPassword.value !== newPassword.value) {
    confirmPasswordError.value = "Passwords do not match";
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-new-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        password: newPassword.value, 
        confirm_password: confirmPassword.value, 
        forget_password_secrets: forgetPasswordSecret 
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update password");
    }

    console.log("Password updated successfully");
    // Redirect to login page or success page
    router.push({ path: '/auth/login' });
  } catch (error) {
    console.error("Failed to update password", error);
  }
};
</script>

<style scoped>
@import "assets/css/style.css";
</style>
