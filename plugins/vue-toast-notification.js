import { defineNuxtPlugin } from '#app';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueToast, {
    // Optional configuration options
    position: 'top-right',
    duration: 5000,
    dismissible: true,
  });
});
