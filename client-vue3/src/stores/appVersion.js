import { defineStore } from "pinia";
import { getServerVersion } from "@/adc/api";
import { onConnectionChange } from "@/adc/socket";
import { readJSON, writeJSON } from "@/adc/storage";
import { compareVersions } from "@/versions";

// The app was updated since this browser last ran it: the version it last
// saw, kept in this browser, is older than the page's (adc-core puts
// package.json's version in window.app_infos). Said at the bottom of the
// page (UpdateNotice.vue) until closed or its changelog opened. On a first
// visit, nothing to say: the version is only kept.
// And while a page is open: the server restarts when it is updated, the
// socket reconnects, the server's version is asked again. Not the page's:
// a reload is offered (UpdateNotice.vue).

const SEEN_KEY = "cahiers.seen_version";
let is_watching = false;

export const useAppVersionStore = defineStore("appVersion", {
  state: () => ({
    current: "",
    // the version last run in this browser, when older than current
    previous: "",
    // the server's version, once it differs from the page's
    server_version: "",
  }),

  getters: {
    is_updated: (state) => !!state.previous,
    needs_reload: (state) => !!state.server_version,
  },

  actions: {
    check() {
      const infos = window.app_infos;
      const current = infos?.version;
      // a standalone HTML export: no app to update
      if (!current || infos.page_is_standalone_html) return;
      this.current = current;

      const seen = readJSON(SEEN_KEY);
      if (typeof seen === "string" && compareVersions(current, seen) > 0)
        this.previous = seen;
      // first visit, same version, or back to an older one
      else writeJSON(SEEN_KEY, current);
    },
    // connected again after a cut: the server may have restarted
    watchServer() {
      if (!this.current || is_watching) return;
      is_watching = true;
      let was_cut = false;
      onConnectionChange(async (is_connected) => {
        if (!is_connected) {
          was_cut = true;
          return;
        }
        if (!was_cut) return;
        was_cut = false;
        const version = await getServerVersion();
        if (version && version !== this.current) this.server_version = version;
      });
    },
    dismissReload() {
      this.server_version = "";
    },
    markSeen() {
      if (!this.current) return;
      writeJSON(SEEN_KEY, this.current);
      this.previous = "";
    },
  },
});
