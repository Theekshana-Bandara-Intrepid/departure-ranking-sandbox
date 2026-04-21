export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  typescript: {
    strict: true, // catch null/undefined errors at compile time
    typeCheck: true, // run tsc as part of the dev server
  },
});
