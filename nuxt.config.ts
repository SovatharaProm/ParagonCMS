import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins = config.plugins ?? [];
        config.plugins.push(vuetify({ autoImport: true }));
      })
    },
    "@nuxtjs/tailwindcss",
    "nuxt-rating",
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    
  ],
  plugins: [
   '~/plugins/vue-toast-notification.js',
    '~/plugins/vuetify.ts',
  ],
  
  googleFonts: {
    families: {
      "Plus Jakarta Sans": true,
    },
    display: "swap",
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  app: {
    head: {
      title: 'My Press - Paragon.U',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Default Description' }
      ],
    }
  },
})
