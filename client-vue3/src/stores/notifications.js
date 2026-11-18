import { defineStore } from "pinia";

// Short messages for the whole app (AppNotifications.vue, in App.vue):
//   useNotificationsStore().notify("…", { type: "error" })
// They go away by themselves after a few seconds, or when closed.

let next_id = 0;

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    // [{ id, message, type: "error" | "info" }]
    list: [],
  }),
  actions: {
    notify(message, { type = "info", duration = 6000 } = {}) {
      const id = ++next_id;
      this.list.push({ id, message, type });
      if (duration) setTimeout(() => this.dismiss(id), duration);
      return id;
    },
    dismiss(id) {
      this.list = this.list.filter((n) => n.id !== id);
    },
  },
});
