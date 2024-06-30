<template>
  <div>
    <BackButton class="ml-4 md:ml-28 py-5" />
    <div class="flex justify-center items-center mt-10 md:mt-20 px-4">
      <div class="bg-white p-6 w-full max-w-md mt-2">
        <h2 class="font-bold text-center text-3xl text-blue-900 mb-10">
          Forget Password
        </h2>

        <form @submit.prevent="sendResetEmail" class="mt-8">
          <div class="mx-auto">
            <div class="relative mb-4">
              <Icon
                name="ph:envelope-simple-bold"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
              <input
                type="email"
                id="email"
                v-model="email"
                class="pl-10 pr-8 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-700 w-full"
                placeholder="Email"
                required
              />
            </div>

            <button
              type="submit"
              class="bg-blue-900 text-white p-2 rounded-2xl w-full mt-10 cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import BackButton from "@/components/BackButton.vue";

const router = useRouter();
const email = ref("");

const sendResetEmail = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forget-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.value }),
  });

  if (!response.ok) {
    console.error("Failed to send reset email");
    return;
  }

  const data = await response.json();
  const transactionId = data.data.Transaction_id;

  console.log(`Reset email sent to: ${email.value}`);
  // Navigate to the OTP page with the transaction_id
  router.push({ path: '/auth/forgetPasswordOTP', query: { email: email.value, transaction_id: transactionId } });
};
</script>

<style scoped>
@import "assets/css/style.css";
</style>
