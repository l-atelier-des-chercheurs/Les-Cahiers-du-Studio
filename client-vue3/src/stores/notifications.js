import { defineStore } from "pinia";

// Short messages for the whole app (AppNotifications.vue, in App.vue):
//   useNotificationsStore().notify("…", { type: "error" })
// They go away by themselves after a few seconds, or when closed.
// With duration: 0, one stays until dismissed by whoever showed it; with
// closable: false, it can't be closed (a task under way). update() changes
// its message (a progress).

let next_id = 0;

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    // [{ id, message, type: "error" | "info", closable }]
    list: [],
  }),
  actions: {
    notify(message, { type = "info", duration = 6000, closable = true } = {}) {
      const id = ++next_id;
      this.list.push({ id, message, type, closable });
      if (duration) setTimeout(() => this.dismiss(id), duration);
      return id;
    },
    update(id, message) {
      const notification = this.list.find((n) => n.id === id);
      if (notification) notification.message = message;
    },
    dismiss(id) {
      this.list = this.list.filter((n) => n.id !== id);
    },
  },
});
