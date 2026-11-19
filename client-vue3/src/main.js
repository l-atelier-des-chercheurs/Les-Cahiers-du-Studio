// adc-core loads src/main.js in livereload mode (npm run debug-lr): keep it a .js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { i18n } from "./i18n";
import { router } from "./router";
import { connect } from "./adc/socket";
import { useSessionStore } from "./stores/session";
import { useContentStore } from "./stores/content";
import "./assets/main.scss";

// After an update, the parts loaded on demand (the media window, Quill…)
// have new file names and the old ones are gone: an open tab can't load
// them. Reload it, at most once a minute (no loop if the server restarts)
window.addEventListener("vite:preloadError", (event) => {
  try {
    if (Date.now() - (+sessionStorage.reloaded_at || 0) < 60000) return;
    sessionStorage.reloaded_at = Date.now();
  } catch {
    // no sessionStorage: reload all the same
  }
  event.preventDefault();
  window.location.reload();
});

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
