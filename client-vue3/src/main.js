// adc-core loads src/main.js in livereload mode (npm run debug-lr): keep it a .js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { connect } from "./adc/socket";
import { useSessionStore } from "./stores/session";
import { useContentStore } from "./stores/content";
import "./assets/main.scss";

const app = createApp(App);
app.use(createPinia());

useContentStore().init();

// check the stored token before anything asks the server for content
useSessionStore()
  .init()
  .catch((err) => console.error(err))
  .finally(() => {
    connect();
    app.mount("#app");
  });
