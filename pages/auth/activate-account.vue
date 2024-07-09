<template>
  <div>
    <Header />
    <div class="flex justify-center items-center mt-16 px-4 md:px-8">
      <div class="bg-white p-6 w-full max-w-md mt-2">
        <h2 class="font-bold text-center text-3xl text-blue-900 mb-10">
          Activate Account
        </h2>
        <form @submit.prevent="activateAccount">
          <div class="mb-4 relative">
            <div class="flex items-center">
              <Icon
                name="ph:user-bold"
                class="absolute left-3 h-5 w-5 text-gray-400"
              />
              <input
                type="text"
                id="name"
                v-model="name"
                class="pl-10 pr-8 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-full"
                placeholder="Name"
                required
              />
            </div>
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
                class="absolute right-3 h-5 w-5 text-gray-400"
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
          <div class="mb-4 relative">
            <div class="flex items-center">
              <Icon
                name="mdi:password"
                class="absolute left-3 h-5 w-5 text-gray-400"
              />
              <Icon
                v-if="confirmPassword"
                :name="showConfirmPassword ? 'ph:eye' : 'ph:eye-slash'"
                class="absolute right-3 h-5 w-5 text-gray-400"
                @mousedown="showConfirmPassword = true"
                @mouseup="showConfirmPassword = false"
                @mouseleave="showConfirmPassword = false"
              />
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                class="pl-10 pr-8 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-full"
                placeholder="Confirm Password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            class="w-full mt-10 bg-blue-900 text-white py-2 rounded-2xl shadow hover:bg-blue-600"
          >
            Activate
          </button>
        </form>
      </div>
    </div>
    <div class="mt-10 text-sm text-center">
      By creating an account, you agree to
      <a href="#" class="text-blue-900 hover:underline">Terms & Conditions</a>
      and
      <a href="#" class="text-blue-900 hover:underline">Privacy Policy</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const name = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const route = useRoute();
const router = useRouter();
const secrets = route.query.secrets || '';

const authStore = useAuthStore();

const activateAccount = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/activate-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.value,
        password: password.value,
        confirm_password: confirmPassword.value,
        secrets: secrets,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to activate account');
    }

    const data = await response.json();
    console.log('Account activated successfully', data);

    // Store the access token in the auth store
    authStore.setToken(data.data.token);

    // Redirect based on user level
    if (data.data.user_level === 'admin' || data.data.user_level === 'superadmin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Error activating account:', error);
    alert('Error activating account: ' + error.message);
  }
};
</script>

<style scoped>
@import "@/assets/css/style.css";
</style>