import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // Initialize the auth store to ensure the token is loaded
  if (!authStore.token) {
    await authStore.initializeStore();
  }

  // Redirect authenticated users to the home page if they try to access the login page
  if (to.fullPath === "/auth/login" && authStore.token) {
    return navigateTo("/");
  }
});
