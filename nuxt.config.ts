export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  srcDir: "app",
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  typescript: {
    strict: true,
    typeCheck: false,
  },
});
