<template>
  <Header/>
  <BackButton class="ml-4 md:ml-28 py-5"/>
  <div class="px-4 py-10">
    <div class="max-w-md mx-auto text-center">
      <h2 class="font-bold text-center text-3xl text-blue-900 mb-10">
        Enter OTP
      </h2>
      <OtpInput @update:modelValue="updateOtp" :length="6" />
      <button @click="confirm" class="mt-8 w-full md:w-[20%] py-2 px-4 bg-blue-900 text-white rounded-lg hover:bg-blue-700">
        Confirm
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import OtpInput from '~/components/OtpInput.vue';
import Header from '~/components/Header.vue';
import BackButton from '~/components/BackButton.vue';

const otp = ref(Array(6).fill(''));
const transactionId = ref('');
const route = useRoute();
const router = useRouter();
const toast = useToast();

const updateOtp = ({ index, value }) => {
  otp.value[index - 1] = value;
};

const resendOtp = () => {
  console.log('Resend OTP');
  // Implement resend OTP logic here
};

const confirm = async () => {
  const otpValue = otp.value.join('');
  const email = route.query.email;
  
  console.log('Email:', email);
  console.log('OTP:', otpValue);
  console.log('Transaction ID:', transactionId.value);
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/confirm-forget-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction_id: transactionId.value, otp_code: otpValue }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || "Failed to confirm OTP");
    }

    const data = await response.json();
    const secret = data.data.forget_password_secrets;

    // Navigate to new password page with the secret
    router.push({ path: '/auth/newPassword', query: { secret } });
  } catch (error) {
    console.error("Failed to confirm OTP", error);
    toast.error(error.message || 'Failed to confirm OTP');
  }
};

onMounted(() => {
  transactionId.value = route.query.transaction_id || '';
});
</script>

<style scoped>
@import "assets/css/style.css";
</style>
