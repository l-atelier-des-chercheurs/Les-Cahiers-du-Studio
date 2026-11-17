import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import mkcert from "vite-plugin-mkcert";

// adc-core's index.pug loads, from _client/ :
// - build.js, an ES module, for the app
// - bundle.js, a single script, inlined in standalone HTML exports
// and, with `npm run debug-lr`, https://localhost:5173/src/main.js
// It has no <link> for CSS: styles are injected by the JS.
export default defineConfig({
  plugins: [vue(), vueDevTools(), cssInjectedByJsPlugin(), mkcert()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    // the page comes from adc-core (https://localhost:8080): asset URLs
    // (fonts…) must point to this server, not to the page's origin
    origin: "https://localhost:5173",
    host: true,
    cors: { origin: "*" },
  },
  build: {
    modulePreload: false,
    // inline the fonts (STVitry, ~16 kB each): the client is served from
    // /_client and copied next to standalone HTML exports, so no asset URL
    // would work in both
    assetsInlineLimit: 20 * 1024,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: "./src/main.js",
      output: [
        // an IIFE can't be split: keep components statically imported
        { format: "iife", entryFileNames: "bundle.js" },
        { format: "es", entryFileNames: "build.js" },
      ],
    },
  },
});
