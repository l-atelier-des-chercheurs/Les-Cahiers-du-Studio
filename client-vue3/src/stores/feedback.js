import { defineStore } from "pinia";
import * as api from "@/adc/api";
import { readJSON, writeJSON } from "@/adc/storage";

// Feedback on the app (a bug, an idea…): sent from the "Vos retours" panel
// (FeedbackPanel.vue) by anyone, read by the instance's admins
// (FeedbackListModal.vue). Kept by adc-core, out of the content, readable
// by admins only. For admins, those newer than the last time they opened
// the list are counted on its button (FeedbackButtons.vue), in this
// browser.

const SEEN_KEY = "cahiers.feedback_seen_until";

export const useFeedbackStore = defineStore("feedback", {
  state: () => ({
    // admins: every feedback, newest first
    list: [],
    is_loading: false,
    load_error: "",
    // the date of the newest one seen
    seen_until: readJSON(SEEN_KEY) || "",
  }),

  getters: {
    new_count: (state) =>
      state.list.filter((f) => String(f.date) > state.seen_until).length,
    isNew: (state) => (feedback) => String(feedback.date) > state.seen_until,
  },

  actions: {
    send(feedback) {
      return api.sendFeedback(feedback);
    },
    // admins only: the server refuses the others
    async load() {
      this.is_loading = true;
      this.load_error = "";
      try {
        const list = await api.getFeedback();
        this.list = Array.isArray(list) ? list : [];
      } catch (err) {
        this.load_error = err.code || err.message || "error";
      } finally {
        this.is_loading = false;
      }
    },
    markAllSeen() {
      const newest = this.list[0]?.date;
      if (!newest || String(newest) <= this.seen_until) return;
      this.seen_until = String(newest);
      writeJSON(SEEN_KEY, this.seen_until);
    },
  },
});
