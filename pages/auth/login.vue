<template>
  <div>
    <Header/>
    <div class="flex justify-center items-center mt-16 px-8">
      <div class="bg-white p-6 w-full max-w-md mt-2">
        <h2 class="font-bold text-center text-3xl text-blue-900 mb-10">
          Log in
        </h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4 relative">
            <div class="flex items-center">
              <Icon
                name="ph:envelope-simple-bold"
                class="absolute left-3 h-5 w-5 text-gray-400"
              />
              <input
                type="email"
                id="email"
                v-model="email"
                :class="{ 'border-red-500': emailError }"
                class="pl-10 pr-8 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-full"
                placeholder="Email"
                required
              />
            </div>
            <p v-if="emailError" class="text-red-500 text-xs pt-2">
              {{ emailError }}
            </p>
          </div>
          <div class="mb-4 relative">
            <div class="flex items-center">
              <Icon
                name="mdi:password"
                class="absolute left-3 h-5 w-5 text-gray-400"
              />
              <Icon
                v-if="password"
                :name="showPassword ? 'ph:eye' : 'ph:eye-slash'"
                class="absolute right-3 h-5 w-5 text-gray-400 cursor-pointer"
                @mousedown="showPassword = true"
                @mouseup="showPassword = false"
                @mouseleave="showPassword = false"
              />
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="pl-10 pr-8 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-full"
                placeholder="Password"
                required
              />
            </div>
          </div>
          <p v-if="loginError" class="text-red-500 text-xs pt-2">
            {{ loginError }}
          </p>
          <button
            type="submit"
            class="w-full mt-10 bg-blue-900 text-white py-2 rounded-2xl shadow hover:bg-blue-600"
          >
            Log in
          </button>
        </form>
        <div class="mt-4 text-sm text-center">
          <NuxtLink
            to="/auth/forgetpassword"
            class="text-blue-900 hover:underline"
            >Forget Password?</NuxtLink
          >
        </div>
      </div>
    </div>
    <div class="mt-10 text-sm text-center px-8">
      By creating an account, you agree to
      <a href="#" class="text-blue-900 hover:underline">Terms & Conditions</a>
      and
      <a href="#" class="text-blue-900 hover:underline">Privacy Policy</a>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "login",
})
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { navigateTo } from "nuxt/app";

const email = ref("");
const password = ref("");
const emailError = ref("");
const loginError = ref("");
const showPassword = ref(false);
const authStore = useAuthStore();

const getCsrfToken = async () => {
  try {
    await fetch(
      `${import.meta.env.VITE_SANCTUM_BASE_URL}/sanctum/csrf-cookie`,
      {
        credentials: "include",
      }
    );
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
  }
};

const handleLogin = async () => {
  loginError.value = "";
  if (!email.value) {
    emailError.value = "Email is required";
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = "Invalid email format";
    return;
  }

  try {
    await getCsrfToken();

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 422) {
        emailError.value = "Invalid credentials";
        return;
      }
      loginError.value = "An error occurred. Please try again later.";
      return;
    }

    authStore.setToken(data.data.token);
    // console.log("Login successful. Token:", data.data.token);

    if (
      data.data.user_level === "super_admin" ||
      data.data.user_level === "admin"
    ) {
      navigateTo("/admin");
    } else if (data.data.user_level === "user") {
      navigateTo("/");
    } else {
      loginError.value = "Unknown user level";
    }
  } catch (error) {
    console.error("Login error:", error);
    loginError.value = "An error occurred. Please try again.";
  }
};
</script>

<style scoped>
@import "assets/css/style.css";
</style>
