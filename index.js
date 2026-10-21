const path = require("path");

// adc-core checks the Node.js / Electron version, then reads package.json,
// settings_base.json and settings.json from appRoot
require("adc-core").start({
  appRoot: path.resolve(__dirname),
  // the Vue 3 client prototype builds here (empty for now)
  clientDist: path.join(__dirname, "client-vue3", "dist"),
  defaultContent: path.join(__dirname, "content"),
});
