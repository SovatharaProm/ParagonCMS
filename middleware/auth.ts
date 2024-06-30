import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log("Middleware running");
    const authStore = useAuthStore();

    // Initialize the auth store to ensure the token is loaded
    if (!authStore.token) {
        await authStore.initializeStore();
    }

    // Redirect to login page if token is not found
    if (!authStore.token) {
        console.error("No token found during initialization");
        if (to.fullPath !== "/auth/login") {
            return navigateTo("/auth/login");
        }
    } else {
        // Fetch user role if it's not set
        if (!authStore.userRole) {
            await authStore.fetchUserRole();
        }

        // Check if the user role is set properly
        if (!authStore.userRole) {
            console.error("User role not found after fetching");
            return navigateTo("/auth/login");
        }

        // If user is authenticated and tries to access the login page, redirect to home page
        if (to.fullPath === "/auth/login") {
            return navigateTo("/");
        }

        // Add any additional logic based on user level if needed
        if (authStore.userRole === "user" && to.fullPath.startsWith("/admin")) {
            return navigateTo("/");
        }
    }
});
