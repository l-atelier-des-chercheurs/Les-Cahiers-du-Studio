// adc-core loads src/main.js in livereload mode (npm run debug-lr): keep it a .js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { i18n } from "./i18n";
import { router } from "./router";
import { connect } from "./adc/socket";
import { useSessionStore } from "./stores/session";
import { useContentStore } from "./stores/content";
import { getFont, setFont } from "./font";
import "./assets/main.scss";

// the typeface on trial, if chosen, on every page
setFont(getFont());

const app = createApp(App);
app.use(createPinia());
app.use(i18n);
app.use(router);

useContentStore().init();

// check the stored token before anything asks the server for content
useSessionStore()
  .init()
  .catch((err) => console.error(err))
  .finally(() => {
    connect();
    app.mount("#app");
  });
