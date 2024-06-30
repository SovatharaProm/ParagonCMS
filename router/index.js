// router/index.js or your router configuration file
import { createRouter, createWebHistory } from 'vue-router';
import ForgetPassword from '@/pages/auth/forgetpassword.vue';
import ForgetPasswordOtp from '@/pages/auth/forgetPasswordOTP.vue';
import NewPassword from '@/pages/auth/newPassword.vue';

const routes = [
  {
    path: '/forget-password',
    name: 'forgetPassword',
    component: ForgetPassword
  },
  {
    path: '/forget-password-otp',
    name: 'forgetPasswordOtp',
    component: ForgetPasswordOtp
  },
  {
    path: '/new-password',
    name: 'newPassword',
    component: NewPassword
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
