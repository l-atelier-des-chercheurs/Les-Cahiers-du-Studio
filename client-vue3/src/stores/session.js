import { defineStore } from "pinia";
import * as api from "@/adc/api";
import { setCredentials } from "@/adc/auth";
import { reconnect } from "@/adc/socket";
import { readJSON, writeJSON } from "@/adc/storage";

// Who is using the app: the author's token, and the instance's general
// password when there is one.
// The token is kept between visits. The general password too if the user
// asked to remember it, otherwise until the tab is closed.
// TODO adc-core: exchange the general password for an expiring token, accept
// an author's token instead, and revoke all tokens when it changes

const STORAGE_KEY = "cahiers.session";
const GENERAL_PASSWORD_KEY = "cahiers.general_password";

export const useSessionStore = defineStore("session", {
  state: () => ({
    token: undefined,
    // the author's folder, e.g. "authors/louis"
    token_path: undefined,
    remember_general_password: false,
    ...readJSON(STORAGE_KEY),
    general_password:
      readJSON(GENERAL_PASSWORD_KEY, "local") ??
      readJSON(GENERAL_PASSWORD_KEY, "session"),
  }),

  getters: {
    is_logged_in: (state) => !!state.token && !!state.token_path,
    author_slug: (state) => state.token_path?.split("/").pop(),
  },

  actions: {
    // once, before the app starts
    async init() {
      setCredentials(this.$state);
      // every change is saved, and used right away by the next requests
      this.$subscribe(
        (mutation, state) => {
          const { general_password, remember_general_password, ...rest } =
            state;
          writeJSON(STORAGE_KEY, { ...rest, remember_general_password });
          const where = remember_general_password ? "local" : "session";
          const other = remember_general_password ? "session" : "local";
          writeJSON(GENERAL_PASSWORD_KEY, general_password, where);
          writeJSON(GENERAL_PASSWORD_KEY, undefined, other);
          setCredentials(state);
        },
        { flush: "sync" }
      );

      if (this.token && !(await api.isTokenValid())) this.forgetToken();
    },

    async login(path_to_author, password) {
      const token = await api.login(path_to_author, password);
      this.$patch({ token, token_path: path_to_author });
      reconnect();
    },

    async logout() {
      if (!this.is_logged_in) return;
      // the token is forgotten here even if the server can't be reached
      await api.logout(this.token, this.token_path).catch(() => {});
      this.forgetToken();
      reconnect();
    },

    forgetToken() {
      this.$patch({ token: undefined, token_path: undefined });
    },

    // returns false if the server refuses it
    async setGeneralPassword(general_password, remember = false) {
      this.$patch({
        general_password,
        remember_general_password: remember,
      });
      const is_valid = await api.checkGeneralPassword();
      if (!is_valid) this.general_password = undefined;
      return is_valid;
    },
  },
});
