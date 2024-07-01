import { defineNuxtPlugin } from '#app';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

export default defineNuxtPlugin((nuxtApp) => {
  // Check if VueToast has an install function, if not, create one
  if (!VueToast.install) {
    VueToast.install = (app) => {
      app.use(VueToast);
    };
  }
  nuxtApp.vueApp.use(VueToast);
});